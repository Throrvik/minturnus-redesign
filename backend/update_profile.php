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
        $firstname  = $_POST['firstname'] ?? '';
        $lastname   = $_POST['lastname'] ?? '';
        $email      = $_POST['email'] ?? '';
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
        $shiftDate = $_POST['shift_date'] ?? null;
        if ($shiftDate === '') {
            $shiftDate = null; // allow empty date field
        }

        $avatarUrl = null;
        if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../uploads/avatars/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $ext = pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION);
            $fileName = uniqid('avatar_') . '.' . $ext;
            $destination = $uploadDir . $fileName;
            if (move_uploaded_file($_FILES['avatar']['tmp_name'], $destination)) {
                $avatarUrl = 'uploads/avatars/' . $fileName;
            }
        }


        $sql = "UPDATE users SET firstname=?, lastname=?, email=?, company=?, company_hidden=?, company_na=?,
                location=?, location_hidden=?, location_na=?, shift=?, shift_hidden=?, shift_na=?, shift_date=?";
        $params = [
            $firstname,
            $lastname,
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
            $shiftDate,
        ];
        // types must mirror the params above
        $types = "ssssiisiisiis";  // 13 columns (no id yet)

        if ($avatarUrl !== null) {
            $sql .= ", avatar_url=?";
            $params[] = $avatarUrl;
            $types .= "s";
        }

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
