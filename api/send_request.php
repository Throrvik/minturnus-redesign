<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../backend/database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Ikke innlogget']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$receiver = isset($input['id']) ? (int)$input['id'] : 0;
$sender = $_SESSION['user_id'];

if ($receiver <= 0 || $receiver === $sender) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Ugyldig ID']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (?, ?, 0)");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Databasefeil']);
    exit;
}
$stmt->bind_param('ii', $sender, $receiver);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    // send e-post til mottakeren om ny forespørsel
    $userStmt = $conn->prepare('SELECT email, firstname FROM users WHERE id = ?');
    $userStmt->bind_param('i', $receiver);
    $userStmt->execute();
    $res = $userStmt->get_result();
    if ($row = $res->fetch_assoc()) {
        require_once __DIR__ . '/../backend/PHPMailer/src/Exception.php';
        require_once __DIR__ . '/../backend/PHPMailer/src/PHPMailer.php';
        require_once __DIR__ . '/../backend/PHPMailer/src/SMTP.php';
        $config = require __DIR__ . '/../backend/config.php';
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = 'cpanel02.dedia-server.no';
            $mail->SMTPAuth = true;
            $mail->Username = $config['MAIL_USER'];
            $mail->Password = $config['MAIL_PASS'];
            $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port = 465;

            $mail->setFrom('noreply@kalenderturnus.no', 'KalenderTurnus');
            $mail->addAddress($row['email']);

            $mail->isHTML(true);
            $mail->Subject = 'Ny kollegaforespørsel';
            $mail->Body    = '<p>Hei ' . htmlspecialchars($row['firstname']) . ',</p><p>Du har mottatt en ny kollegaforespørsel i KalenderTurnus.</p><p>Logg inn for å godta eller avslå forespørselen.</p>';
            $mail->AltBody = "Hei {$row['firstname']},\nDu har mottatt en ny kollegaforespørsel i KalenderTurnus. Logg inn for å godta eller avslå forespørselen.";
            $mail->send();
        } catch (Exception $e) {
            // ignore email errors
        }
    }
    echo json_encode(['status' => 'success']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Kunne ikke sende forespørsel']);
}

