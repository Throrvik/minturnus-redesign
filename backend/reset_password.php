<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'database.php'; // Inkluder databasekonfigurasjon

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $input = json_decode(file_get_contents('php://input'), true);
    $token = $input['token'];
    $new_password = $input['new_password'];

    // Hash det nye passordet
    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

    try {
        $db = new PDO($dsn, $username, $db_password, $options);

        // Sjekk at tokenet eksisterer og at det ikke er utløpt
        $stmt = $db->prepare("SELECT * FROM users WHERE reset_token = :token AND reset_token_expiry > NOW()");
        $stmt->bindParam(':token', $token);
        $stmt->execute();

        if ($stmt->rowCount() == 1) {
            // Oppdater passordet
            $stmt = $db->prepare("UPDATE users SET password = :password, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = :token");
            $stmt->bindParam(':password', $hashed_password);
            $stmt->bindParam(':token', $token);
            $stmt->execute();

            if ($stmt->rowCount() == 1) {
                echo json_encode(["success" => true, "message" => "Passordet ditt har blitt tilbakestilt. Du kan nå logge inn med det nye passordet."]);
            } else {
                echo json_encode(["success" => false, "message" => "Kunne ikke oppdatere passordet."]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Ugyldig eller utløpt token."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Databasefeil: " . $e->getMessage()]);
    }
}
?>
