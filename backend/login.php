<?php
// Enable verbose error output only in development mode
$devMode = getenv('DEV_MODE') === 'true';
if ($devMode) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(0);
}
session_start();
require_once 'csrf.php';
validate_csrf();
require_once 'database.php';

// Start session variables only after the user has been authenticated
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Hent input fra skjemaet
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);
    $remember = isset($_POST['rememberMe']);

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

                if ($remember) {
                    // Generer token og lagre hash i databasen
                    $token = bin2hex(random_bytes(32));
                    $tokenHash = hash('sha256', $token);
                    $expires = date('Y-m-d H:i:s', time() + 60 * 60 * 24 * 30);

                    $insert = $db->prepare("INSERT INTO remember_tokens (user_id, token_hash, expires_at) VALUES (:uid, :hash, :exp)");
                    $insert->execute([':uid' => $user['id'], ':hash' => $tokenHash, ':exp' => $expires]);

                    setcookie('remember_token', $token, time() + 60 * 60 * 24 * 30, '/', '', isset($_SERVER['HTTPS']), true);
                }

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