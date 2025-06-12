<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../backend/database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([]);
    exit;
}

$uid = $_SESSION['user_id'];
$sql = "SELECT u.id, u.firstname AS fullname, u.company, u.location
        FROM friends f
        JOIN users u ON (u.id = IF(f.user1 = ?, f.user2, f.user1))
        WHERE f.user1 = ? OR f.user2 = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('iii', $uid, $uid, $uid);
$stmt->execute();
$result = $stmt->get_result();
$list = [];
while ($row = $result->fetch_assoc()) {
    $list[] = $row;
}

echo json_encode($list);
