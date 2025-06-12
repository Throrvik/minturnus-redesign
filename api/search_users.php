<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../backend/database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Ikke innlogget']);
    exit;
}

$query = isset($_GET['query']) ? trim($_GET['query']) : '';
if ($query === '') {
    echo json_encode([]);
    exit;
}

$search = '%' . $conn->real_escape_string($query) . '%';
$sql = "SELECT id, firstname AS fullname, company, location FROM users WHERE firstname LIKE ? ORDER BY firstname LIMIT 10";
$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $search);
$stmt->execute();
$result = $stmt->get_result();
$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode($users);
