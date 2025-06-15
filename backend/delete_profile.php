<?php
session_start();
header('Content-Type: application/json');
require_once 'database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Ikke innlogget']);
    exit;
}

$userId = (int)$_SESSION['user_id'];

try {
    // Slett relasjoner i friend_requests
    $stmt = $conn->prepare('DELETE FROM friend_requests WHERE sender_id = ? OR receiver_id = ?');
    $stmt->bind_param('ii', $userId, $userId);
    $stmt->execute();
    $stmt->close();

    // Slett relasjoner i friends
    $stmt = $conn->prepare('DELETE FROM friends WHERE user1 = ? OR user2 = ?');
    $stmt->bind_param('ii', $userId, $userId);
    $stmt->execute();
    $stmt->close();

    // Slett brukeren
    $stmt = $conn->prepare('DELETE FROM users WHERE id = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $stmt->close();

    session_destroy();
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Databasefeil']);
}
