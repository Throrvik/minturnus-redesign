<?php
session_start();
header('Content-Type: application/json');

include 'database.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Bruker ikke innlogget']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = $_SESSION['user_id'];

    // Try catch for debugging
    try {
        $firstname = $_POST['firstname'] ?? '';
        $email = $_POST['email'] ?? '';
        $newPassword = !empty($_POST['new-password']) ? password_hash($_POST['new-password'], PASSWORD_DEFAULT) : null;
        $company = $_POST['company'] ?? '';
        $companyHide = isset($_POST['company-hide']) ? 1 : 0;
        $companyNa = isset($_POST['company-na']) ? 1 : 0;
        $location = $_POST['location'] ?? '';
        $locationHide = isset($_POST['location-hide']) ? 1 : 0;
        $locationNa = isset($_POST['location-na']) ? 1 : 0;
        $shift = $_POST['shift'] ?? '';
        $shiftHide = isset($_POST['shift-hide']) ? 1 : 0;
        $shiftNa = isset($_POST['shift-na']) ? 1 : 0;

        $conn = openDatabaseConnection();

        $sql = "UPDATE users SET firstname=?, email=?, company=?, company_hidden=?, company_na=?, 
                location=?, location_hidden=?, location_na=?, shift=?, shift_hidden=?, shift_na=?";
        $params = [$firstname, $email, $company, $companyHide, $companyNa,
                   $location, $locationHide, $locationNa, $shift, $shiftHide, $shiftNa];
        $types = "sssiiisiisi";

        if ($newPassword) {
            $sql .= ", password=?";
            $params[] = $newPassword;
            $types .= "s";
        }

        $sql .= " WHERE id=?";
        $params[] = $userId;
        $types .= "i";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }

        $bindNames = [];
        $bindNames[] = $types;
        foreach ($params as $key => $value) {
            $bindNames[] = &$params[$key];
        }

        call_user_func_array([$stmt, 'bind_param'], $bindNames);

        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Profilen ble oppdatert']);
        } else {
            throw new Exception("Execute failed: " . $stmt->error);
        }

        $stmt->close();
        $conn->close();
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Ugyldig forespørsel']);
}
