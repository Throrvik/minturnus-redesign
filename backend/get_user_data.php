<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Bruker ikke innlogget']);
    exit;
}

require 'database.php'; // Sørg for at tilkoblingen fungerer

$user_id = $_SESSION['user_id'];

// Test database-tilkoblingen
if (!$conn) {
    echo json_encode(['status' => 'error', 'message' => 'Database tilkobling feilet']);
    exit;
}

// Test SQL-spørringen
$query = "SELECT firstname, lastname, email, company, location, shift, shift_date, avatar_url, company_na, location_na, shift_na FROM users WHERE id = ?";
$stmt = $conn->prepare($query);

if (!$stmt) {
    echo json_encode(['status' => 'error', 'message' => 'Feil ved SQL forberedelse']);
    exit;
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    echo json_encode(['status' => 'success', 'user' => $user]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Bruker ikke funnet']);
}
?>
