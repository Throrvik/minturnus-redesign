<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../backend/database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Ikke innlogget']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$requestId = isset($data['id']) ? (int)$data['id'] : 0;
$uid = $_SESSION['user_id'];

$stmt = $conn->prepare('DELETE FROM friend_requests WHERE id = ? AND sender_id = ? AND status = 0');
$stmt->bind_param('ii', $requestId, $uid);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['status' => 'success']);
} else {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Forespørsel ikke funnet']);
}

