<?php
session_start();
require_once 'database.php';

if (isset($_COOKIE['remember_token'])) {
    $tokenHash = hash('sha256', $_COOKIE['remember_token']);
    try {
        $db = new PDO($dsn, $username, $db_password, $options);
        $stmt = $db->prepare('DELETE FROM remember_tokens WHERE token_hash = :hash');
        $stmt->execute([':hash' => $tokenHash]);
    } catch (PDOException $e) {
        // ignore errors when logging out
    }
    setcookie('remember_token', '', time() - 3600, '/', '', isset($_SERVER['HTTPS']), true);
}

session_destroy();
header('Location: index.html');
exit;
?>