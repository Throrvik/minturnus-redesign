<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../backend/database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Ikke innlogget']);
    exit;
}

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Ugyldig ID']);
    exit;
}

$sql = "SELECT firstname, lastname, avatar_url, company, location, shift, shift_date, info_hide FROM users WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $id);
$stmt->execute();
$res = $stmt->get_result();
if ($row = $res->fetch_assoc()) {
    if ($row['info_hide']) {
        $row['company'] = null;
        $row['location'] = null;
        $row['shift'] = null;
        $row['shift_date'] = null;
    }
    unset($row['info_hide']);
    echo json_encode(['status' => 'success', 'user' => $row]);
} else {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Ikke funnet']);
}
