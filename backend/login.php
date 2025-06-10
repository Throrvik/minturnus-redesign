<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
session_start();
require_once 'database.php';
$_SESSION['user_id'] = $user['id'];  // Antar du har bruker-ID tilgjengelig
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Hent input fra skjemaet
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    try {
        // Koble til databasen
        $db = new PDO($dsn, $username, $db_password, $options);

        // Finn brukeren basert på e-post
        $stmt = $db->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        if ($stmt->rowCount() == 1) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Sjekk passordet
            if (password_verify($password, $user['password'])) {
                // Opprett sesjon for brukeren
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['firstname'];

                // Etter at brukeren har logget inn, returner brukernavn
                echo json_encode(["success" => true, "message" => "Innlogging vellykket", "firstname" => $user['firstname']]);

                exit;
            } else {
                echo json_encode(["status" => "error", "message" => "Feil e-post eller passord"]);
                exit;
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Feil e-post eller passord"]);
            exit;
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Databasefeil: " . $e->getMessage()]);
        exit;
    }
}
?>