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
$sql = "SELECT u.id, u.firstname, u.lastname, u.avatar_url,
        u.company, u.location, u.shift, u.shift_date, u.info_hide
        FROM friends f
        JOIN users u ON (u.id = IF(f.user1 = ?, f.user2, f.user1))
        WHERE f.user1 = ? OR f.user2 = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('iii', $uid, $uid, $uid);
$stmt->execute();
$result = $stmt->get_result();
$list = [];
while ($row = $result->fetch_assoc()) {
    if ($row['info_hide']) {
        $row['company'] = null;
        $row['location'] = null;
        $row['shift'] = null;
        $row['shift_date'] = null;
    }
    $list[] = $row;
}

echo json_encode($list);
