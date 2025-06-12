<?php
session_start();
header('Content-Type: application/json');
require_once 'database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Ikke innlogget']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$current = $input['current'] ?? '';
$new = $input['new'] ?? '';

if ($current === '' || $new === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Manglende felt']);
    exit;
}

try {
    $db = new PDO($dsn, $username, $db_password, $options);
    $stmt = $db->prepare('SELECT password FROM users WHERE id = :id');
    $stmt->bindParam(':id', $_SESSION['user_id'], PDO::PARAM_INT);
    $stmt->execute();
    $user = $stmt->fetch();
    if (!$user || !password_verify($current, $user['password'])) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Feil nåværende passord']);
        exit;
    }

    $hashed = password_hash($new, PASSWORD_DEFAULT);
    $stmt = $db->prepare('UPDATE users SET password = :pw WHERE id = :id');
    $stmt->bindParam(':pw', $hashed);
    $stmt->bindParam(':id', $_SESSION['user_id'], PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode(['status' => 'success']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Databasefeil']);
}
