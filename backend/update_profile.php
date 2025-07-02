<?php
session_start();
require_once 'csrf.php';
validate_csrf();
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
        // Fetch existing avatar for potential deletion
        $currentAvatar = null;
        $checkStmt = $conn->prepare('SELECT avatar_url FROM users WHERE id=?');
        if ($checkStmt) {
            $checkStmt->bind_param('i', $userId);
            $checkStmt->execute();
            $checkStmt->bind_result($currentAvatar);
            $checkStmt->fetch();
            $checkStmt->close();
        }

        $firstname  = $_POST['firstname'] ?? '';
        $lastname   = $_POST['lastname'] ?? '';
        $email      = $_POST['email'] ?? '';
        $newPassword = !empty($_POST['new-password']) ? password_hash($_POST['new-password'], PASSWORD_DEFAULT) : null;
        $company = $_POST['company'] ?? '';
        $location = $_POST['location'] ?? '';
        $shift = $_POST['shift'] ?? '';
        // "info-hide" kommer alltid med i POST-data. Vi må derfor se på
        // verdien, ikke bare om feltet eksisterer, ellers blir verdien alltid 1.
        $infoHide = (isset($_POST['info-hide']) && $_POST['info-hide'] === '1') ? 1 : 0;
        $shiftDate = $_POST['shift_date'] ?? null;
        if ($shiftDate === '') {
            $shiftDate = null; // allow empty date field
        }

        $removeAvatar = isset($_POST['avatar_remove']) && $_POST['avatar_remove'] === '1';

        $avatarUrl = null;
        if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
            $maxFileSize = 2 * 1024 * 1024; // 2 MB
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($_FILES['avatar']['tmp_name']);
            if (!in_array($mimeType, $allowedTypes)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Ugyldig filtype for avatar']);
                exit;
            }

            if ($_FILES['avatar']['size'] > $maxFileSize) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Avatarfilen er for stor']);
                exit;
            }

            $uploadDir = __DIR__ . '/../uploads/avatars/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $ext = pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION);
            $fileName = uniqid('avatar_') . '.' . $ext;
            $destination = $uploadDir . $fileName;
            if (move_uploaded_file($_FILES['avatar']['tmp_name'], $destination)) {
                $avatarUrl = 'https://minturnus.no/uploads/avatars/' . $fileName;
            }
        }


        $sql = "UPDATE users SET firstname=?, lastname=?, email=?, company=?, location=?, shift=?, shift_date=?, info_hide=?";
        $params = [
            $firstname,
            $lastname,
            $email,
            $company,
            $location,
            $shift,
            $shiftDate,
            $infoHide,
        ];
        // types must mirror the params above
        $types = "sssssssi";

        $avatarChanged = false;
        if ($avatarUrl !== null || $removeAvatar) {
            $sql .= ", avatar_url=?";
            $params[] = $avatarUrl; // null if removing
            $types .= "s";
            $avatarChanged = true;
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
            if ($avatarChanged && $currentAvatar) {
                $oldPath = __DIR__ . '/../' . $currentAvatar;
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }
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
