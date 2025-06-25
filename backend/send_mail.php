<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
require_once 'csrf.php';
require_once __DIR__ . '/config.php';
validate_csrf();

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

$mail = new PHPMailer(true);
try {
    // Server settings
    $mail->isSMTP();                                      // Sett SMTP som e-post sendingens metode
    $mail->Host = 'cpanel02.dedia-server.no';             // SMTP-serverens host (fra bildet)
    $mail->SMTPAuth = true;                               // Aktiver SMTP-autentisering
    $mail->Username = $smtp_user;                        // SMTP-brukernavn fra config
    $mail->Password = $smtp_pass;                        // SMTP-passord fra config
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;      // Krypteringsmetode (bruk SSL/TLS)
    $mail->Port = 465;                                    // SMTP-port (465 for SSL fra bildet)

    // Mottaker og avsender
    $mail->setFrom('thomas@minturnus.no', 'MinTurnus'); // Avsenderens e-postadresse
    $mail->addAddress('thomas.rorvik@gmail.com');                // Mottakerens e-postadresse (du kan bytte med noe annet)

    // Innhold
    $mail->isHTML(false);                               // Sett formatet til plain text eller HTML
    $mail->Subject = $_POST['subject'];                 // Emnet fra kontaktskjemaet
    $mail->Body    = "Navn: {$_POST['name']}\nE-post: {$_POST['email']}\n\nMelding:\n{$_POST['message']}";

    $mail->send();
    echo 'Meldingen din har blitt sendt. Takk for at du kontaktet oss!';
} catch (Exception $e) {
    echo "Meldingen kunne ikke sendes. Mailer Error: {$mail->ErrorInfo}";
}
