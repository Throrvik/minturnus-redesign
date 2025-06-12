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
$other = isset($data['id']) ? (int)$data['id'] : 0;
$uid = $_SESSION['user_id'];

$stmt = $conn->prepare("DELETE FROM friends WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)");
$stmt->bind_param('iiii', $uid, $other, $other, $uid);
$stmt->execute();

echo json_encode(['status' => 'success']);
