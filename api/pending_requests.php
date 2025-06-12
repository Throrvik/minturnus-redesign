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
$sql = "SELECT fr.id, u.id AS user_id, u.firstname AS fullname, u.company, u.location FROM friend_requests fr JOIN users u ON fr.sender_id = u.id WHERE fr.receiver_id = ? AND fr.status = 0";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $uid);
$stmt->execute();
$result = $stmt->get_result();
$requests = [];
while ($row = $result->fetch_assoc()) {
    $requests[] = [
        'id' => $row['id'],
        'user' => [
            'id' => $row['user_id'],
            'fullname' => $row['fullname'],
            'company' => $row['company'],
            'location' => $row['location'],
        ]
    ];
}

echo json_encode($requests);
