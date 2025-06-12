<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../backend/database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Ikke innlogget']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$receiver = isset($input['id']) ? (int)$input['id'] : 0;
$sender = $_SESSION['user_id'];

if ($receiver <= 0 || $receiver === $sender) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Ugyldig ID']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (?, ?, 0)");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Databasefeil']);
    exit;
}
$stmt->bind_param('ii', $sender, $receiver);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['status' => 'success']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Kunne ikke sende forespørsel']);
}
