<?php
session_start();
require_once __DIR__ . '/../backend/database.php';
require_once __DIR__ . '/../backend/csrf.php';

// Ensure the table exists so queries below don't fail on a new installation
$conn->query("CREATE TABLE IF NOT EXISTS colleague_colors (
    user_id INT NOT NULL,
    colleague_id INT NOT NULL,
    color VARCHAR(7) NOT NULL,
    PRIMARY KEY (user_id, colleague_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

function safe_stmt($conn, $sql)
{
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error']);
        exit;
    }
    return $stmt;
}

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit;
}

$uid = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = safe_stmt($conn, 'SELECT colleague_id, color FROM colleague_colors WHERE user_id=?');
    $stmt->bind_param('i', $uid);
    $stmt->execute();
    $res = $stmt->get_result();
    $prefs = [];
    while ($row = $res->fetch_assoc()) {
        $prefs[(int)$row['colleague_id']] = $row['color'];
    }
    echo json_encode($prefs);
    exit;
}

validate_csrf();

$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? 0;
if (!$id) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid id']);
    exit;
}

if ($method === 'POST') {
    $color = $input['color'] ?? '';
    if (!$color) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'No color']);
        exit;
    }
    $conn->begin_transaction();
    $del = safe_stmt($conn, 'DELETE FROM colleague_colors WHERE user_id=? AND color=?');
    $del->bind_param('is', $uid, $color);
    $del->execute();
    $stmt = safe_stmt($conn, 'REPLACE INTO colleague_colors (user_id, colleague_id, color) VALUES (?, ?, ?)');
    $stmt->bind_param('iis', $uid, $id, $color);
    $stmt->execute();
    $conn->commit();
    echo json_encode(['status' => 'success']);
} elseif ($method === 'DELETE') {
    $stmt = safe_stmt($conn, 'DELETE FROM colleague_colors WHERE user_id=? AND colleague_id=?');
    $stmt->bind_param('ii', $uid, $id);
    $stmt->execute();
    echo json_encode(['status' => 'success']);
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
