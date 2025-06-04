<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
header('Content-Type: application/json');

// Sjekk om brukeren er logget inn
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
$query = "SELECT firstname, email, company, location, shift FROM users WHERE id = ?";
$stmt = $conn->prepare($query);

if (!$stmt) {
    echo json_encode(['status' => 'error', 'message' => 'Feil ved SQL forberedelse']);
    exit;
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    die(json_encode(['status' => 'error', 'message' => 'Kunne ikke koble til databasen']));
}

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    echo json_encode(['status' => 'success', 'user' => $user]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Bruker ikke funnet']);
}
?>
