<?php
session_start();
require_once __DIR__ . '/../backend/csrf.php';
validate_csrf();
header('Content-Type: application/json');
require_once __DIR__ . '/../backend/database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit;
}

$uid = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT colleague_id FROM close_colleagues WHERE user_id=?');
    $stmt->bind_param('i', $uid);
    $stmt->execute();
    $res = $stmt->get_result();
    $ids = [];
    while ($row = $res->fetch_assoc()) {
        $ids[] = (int)$row['colleague_id'];
    }
    echo json_encode($ids);
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? 0;
    if ($id) {
        $stmt = $conn->prepare('REPLACE INTO close_colleagues (user_id, colleague_id) VALUES (?, ?)');
        $stmt->bind_param('ii', $uid, $id);
        $stmt->execute();
    }
    echo json_encode(['status' => 'success']);
} elseif ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? 0;
    if ($id) {
        $stmt = $conn->prepare('DELETE FROM close_colleagues WHERE user_id=? AND colleague_id=?');
        $stmt->bind_param('ii', $uid, $id);
        $stmt->execute();
    }
    echo json_encode(['status' => 'success']);
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
