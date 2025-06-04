<?php
// Start sesjonen for å få tilgang til brukerdata (f.eks. bruker-ID)
session_start();
echo '<pre>';
print_r($_SESSION);
echo '</pre>';
include 'database.php'; // Legger til filen som kobler til databasen

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Hent bruker-ID fra sesjonen (forutsetter at brukeren er logget inn)
    $userId = $_SESSION['user_id'];

    // Hent data fra POST-forespørselen
    $firstname = $_POST['firstname'];
    $email = $_POST['email'];
    $newPassword = !empty($_POST['new-password']) ? password_hash($_POST['new-password'], PASSWORD_DEFAULT) : null;
    $company = $_POST['company'];
    $companyHide = isset($_POST['company-hide']) ? 1 : 0;
    $companyNa = isset($_POST['company-na']) ? 1 : 0;
    $location = $_POST['location'];
    $locationHide = isset($_POST['location-hide']) ? 1 : 0;
    $locationNa = isset($_POST['location-na']) ? 1 : 0;
    $shift = $_POST['shift'];
    $shiftHide = isset($_POST['shift-hide']) ? 1 : 0;
    $shiftNa = isset($_POST['shift-na']) ? 1 : 0;

    // Koble til databasen
    $conn = openDatabaseConnection();

    // Forbered SQL-spørring for å oppdatere brukeren
    $sql = "UPDATE users SET firstname=?, email=?, company=?, company_hidden=?, company_na=?, 
            location=?, location_hidden=?, location_na=?, shift=?, shift_hidden=?, shift_na=?";
    
    // Hvis passordfeltet er fylt ut, legg til oppdatering av passord
    if ($newPassword) {
        $sql .= ", password=?";
    }

    $sql .= " WHERE id=?";

    $stmt = $conn->prepare($sql);
    if ($newPassword) {
        $stmt->bind_param("sssiiisiisi", $firstname, $email, $company, $companyHide, $companyNa, $location, $locationHide, $locationNa, $shift, $shiftHide, $shiftNa, $newPassword, $userId);
    } else {
        $stmt->bind_param("sssiiisiisi", $firstname, $email, $company, $companyHide, $companyNa, $location, $locationHide, $locationNa, $shift, $shiftHide, $shiftNa, $userId);
    }

    // Utfør spørringen
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Profilen ble oppdatert']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Feil ved oppdatering av profilen']);
    }

    $stmt->close();
    $conn->close();
}
?>