<?php
session_start();
require_once 'csrf.php';
validate_csrf();
header('Content-Type: application/json');
require_once 'database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Ikke innlogget']);
    exit;
}

$userId = (int)$_SESSION['user_id'];

try {
    $conn->begin_transaction();

    // Slett relasjoner i friend_requests
    $stmt = $conn->prepare('DELETE FROM friend_requests WHERE sender_id = ? OR receiver_id = ?');
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    $stmt->bind_param('ii', $userId, $userId);
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
    $stmt->close();

    // Slett relasjoner i friends
    $stmt = $conn->prepare('DELETE FROM friends WHERE user1 = ? OR user2 = ?');
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    $stmt->bind_param('ii', $userId, $userId);
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
    $stmt->close();

    // Slett brukeren
    $stmt = $conn->prepare('DELETE FROM users WHERE id = ?');
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    $stmt->bind_param('i', $userId);
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
    if ($stmt->affected_rows === 0) {
        throw new Exception('User not found');
    }
    $stmt->close();

    $conn->commit();
    session_destroy();
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
