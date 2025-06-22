<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
require_once 'csrf.php';
validate_csrf();

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
$config = require __DIR__ . '/config.php';
require_once 'database.php'; // Databasekonfigurasjon

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = trim($input['email']);
    
    try {
        $db = new PDO($dsn, $username, $db_password, $options);
        
        // Finn brukeren basert på e-post
        $stmt = $db->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        if ($stmt->rowCount() == 1) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            $token = bin2hex(random_bytes(50)); // Generer en sikker token

            // Sett tidssone for tokenutløp (for eksempel bruk Europe/Oslo)
            $date = new DateTime("now", new DateTimeZone('Europe/Oslo'));
            $date->add(new DateInterval('PT1H')); // Legg til 1 time
            $token_expiry = $date->format('Y-m-d H:i:s');

            // Lagre token i databasen for denne brukeren
            $stmt = $db->prepare("UPDATE users SET reset_token = :token, reset_token_expiry = :expiry WHERE email = :email");
            $stmt->bindParam(':token', $token);
            $stmt->bindParam(':expiry', $token_expiry);
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            // Lag tilbakestillingslenken
            $reset_link = "https://minturnus.no/reset_password.html?token=" . $token;

            // Bruk PHPMailer til å sende e-post med tilbakestillingslenken
            $mail = new PHPMailer(true);
            try {
                // Server settings
                $mail->isSMTP();                                    
                $mail->Host = 'cpanel02.dedia-server.no';          
                $mail->SMTPAuth = true;                             
                $mail->Username = $config['MAIL_USER'];
                $mail->Password = $config['MAIL_PASS'];
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;    
                $mail->Port = 465;                                  

                // Mottaker og avsender
                $mail->setFrom('noreply@minturnus.no', 'MinTurnus');
                $mail->addAddress($email); // Send e-post til brukeren som ønsker tilbakestilling

                // Innhold i e-posten
                $mail->isHTML(true);                                 
                $mail->Subject = 'Tilbakestill passord - MinTurnus';
                $mail->Body    = "
                    <p>Hei,</p>
                    <p>Klikk på lenken nedenfor for å tilbakestille passordet ditt:</p>
                    <p><a href='" . $reset_link . "'>Tilbakestill passord</a></p>
                    <p>Lenken utløper om 1 time.</p>
                    <p>Hvis du ikke ba om denne tilbakestillingen, vennligst se bort fra denne e-posten.</p>
                ";
                $mail->AltBody = "Hei,\n\nKlikk på lenken nedenfor for å tilbakestille passordet ditt:\n\n" . $reset_link . "\n\nLenken utløper om 1 time.\nHvis du ikke ba om denne tilbakestillingen, vennligst se bort fra denne e-posten.";

                // Send e-posten
                if ($mail->send()) {
                    echo json_encode(["success" => true, "message" => "En tilbakestillingslenke er sendt til e-postadressen din."]);
                } else {
                    echo json_encode(["success" => false, "message" => "Kunne ikke sende e-post. Prøv igjen senere."]);
                }
            } catch (Exception $e) {
                echo json_encode(["success" => false, "message" => "E-post kunne ikke sendes. Mailer Error: " . $mail->ErrorInfo]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "E-postadressen finnes ikke i våre systemer."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Databasefeil: " . $e->getMessage()]);
    }
}
?>