<?php
session_start();
ob_clean();

header('Content-Type: application/json');
include 'database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Bruker ikke innlogget']);
    exit;
}

$userId = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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


        $sql = "UPDATE users SET firstname=?, email=?, company=?, company_hidden=?, company_na=?,
                location=?, location_hidden=?, location_na=?, shift=?, shift_hidden=?, shift_na=?";
        $params = [
            $firstname,
            $email,
            $company,
            $companyHide,
            $companyNa,
            $location,
            $locationHide,
            $locationNa,
            $shift,
            $shiftHide,
            $shiftNa,
        ];
        // types must mirror the params above: 11 values before id
        $types = "sssiisiisii";  // 11 columns (no id yet)

        if ($newPassword) {
            $sql .= ", password=?";
            $params[] = $newPassword;
            $types .= "s";
        }

        $sql .= " WHERE id=?";
        $params[] = $userId;
        $types .= "i";

        // Ensure parameters and type string lengths match
        if (strlen($types) !== count($params)) {
            throw new Exception('Parameter count does not match types length');
        }

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }

        $bindParams = [];
        $bindParams[] = $types;
        foreach ($params as $key => $val) {
            $bindParams[] = &$params[$key];
        }

        // 🔧 Bruk ReflectionMethod (riktig måte å binde variabel liste)
        $method = new ReflectionMethod('mysqli_stmt', 'bind_param');
        $bindResult = $method->invokeArgs($stmt, $bindParams);
        if ($bindResult === false) {
            throw new Exception('bind_param failed: ' . $stmt->error);
        }

        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => "Profilen ble oppdatert ({$stmt->affected_rows} rad(er))"]);
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