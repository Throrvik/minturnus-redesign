<?php
session_start();
require_once __DIR__ . '/../backend/database.php';
require_once __DIR__ . '/../backend/csrf.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit;
}

$uid = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT colleague_id, color FROM colleague_colors WHERE user_id=?');
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
    $del = $conn->prepare('DELETE FROM colleague_colors WHERE user_id=? AND color=?');
    $del->bind_param('is', $uid, $color);
    $del->execute();
    $stmt = $conn->prepare('REPLACE INTO colleague_colors (user_id, colleague_id, color) VALUES (?, ?, ?)');
    $stmt->bind_param('iis', $uid, $id, $color);
    $stmt->execute();
    $conn->commit();
    echo json_encode(['status' => 'success']);
} elseif ($method === 'DELETE') {
    $stmt = $conn->prepare('DELETE FROM colleague_colors WHERE user_id=? AND colleague_id=?');
    $stmt->bind_param('ii', $uid, $id);
    $stmt->execute();
    echo json_encode(['status' => 'success']);
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
