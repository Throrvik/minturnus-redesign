<?php
session_start();
require_once 'database.php';

if (!isset($_SESSION['user_id']) && isset($_COOKIE['remember_token'])) {
    $tokenHash = hash('sha256', $_COOKIE['remember_token']);

    try {
        $db = new PDO($dsn, $username, $db_password, $options);
        $stmt = $db->prepare('SELECT user_id FROM remember_tokens WHERE token_hash = :hash AND expires_at > NOW()');
        $stmt->execute([':hash' => $tokenHash]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $userStmt = $db->prepare('SELECT firstname FROM users WHERE id = :id');
            $userStmt->execute([':id' => $row['user_id']]);
            $user = $userStmt->fetch(PDO::FETCH_ASSOC);
            if ($user) {
                $_SESSION['user_id'] = $row['user_id'];
                $_SESSION['user_name'] = $user['firstname'];

                $newExpiry = date('Y-m-d H:i:s', time() + 60 * 60 * 24 * 30);
                $update = $db->prepare('UPDATE remember_tokens SET expires_at = :exp WHERE token_hash = :hash');
                $update->execute([':exp' => $newExpiry, ':hash' => $tokenHash]);

                setcookie('remember_token', $_COOKIE['remember_token'], time() + 60 * 60 * 24 * 30, '/', '', isset($_SERVER['HTTPS']), true);
            }
        } else {
            setcookie('remember_token', '', time() - 3600, '/', '', isset($_SERVER['HTTPS']), true);
        }
    } catch (PDOException $e) {
        // ignore database errors here
    }
}

if (isset($_SESSION['user_id'])) {
    echo json_encode(["loggedIn" => true, "userName" => $_SESSION['user_name']]);
} else {
    echo json_encode(["loggedIn" => false]);
}
?>