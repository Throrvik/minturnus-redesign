<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../backend/database.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode([]);
    exit;
}

$uid = $_SESSION['user_id'];
$sql = "SELECT id, firstname, lastname, company, location, shift FROM users WHERE id != ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $uid);
$stmt->execute();
$result = $stmt->get_result();
$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode($users);
?>
