<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../backend/database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['count' => 0]);
    exit;
}

$uid = $_SESSION['user_id'];
$stmt = $conn->prepare('SELECT COUNT(*) AS cnt FROM friend_requests WHERE receiver_id = ? AND status = 0');
$stmt->bind_param('i', $uid);
$stmt->execute();
$res = $stmt->get_result();
$row = $res->fetch_assoc();
$count = $row ? (int)$row['cnt'] : 0;

echo json_encode(['count' => $count]);

