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
$accept = !empty($data['accept']);
$uid = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT sender_id, receiver_id FROM friend_requests WHERE id = ? AND receiver_id = ? AND status = 0");
$stmt->bind_param('ii', $requestId, $uid);
$stmt->execute();
$result = $stmt->get_result();
if (!$row = $result->fetch_assoc()) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Forespørsel ikke funnet']);
    exit;
}

if ($accept) {
    $update = $conn->prepare("UPDATE friend_requests SET status = 1 WHERE id = ?");
    $update->bind_param('i', $requestId);
    $update->execute();

    $u1 = min($uid, $row['sender_id']);
    $u2 = max($uid, $row['sender_id']);
    $add = $conn->prepare("INSERT IGNORE INTO friends (user1, user2) VALUES (?, ?)");
    $add->bind_param('ii', $u1, $u2);
    $add->execute();
} else {
    $update = $conn->prepare("UPDATE friend_requests SET status = 2 WHERE id = ?");
    $update->bind_param('i', $requestId);
    $update->execute();
}

echo json_encode(['status' => 'success']);
