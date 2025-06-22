<?php
session_start();
require_once 'csrf.php';
header('Content-Type: application/json');
echo json_encode(['token' => get_csrf_token()]);
?>
