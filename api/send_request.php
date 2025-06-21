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

$check = $conn->prepare('SELECT 1 FROM friend_requests WHERE sender_id = ? AND receiver_id = ? AND status = 0');
$check->bind_param('ii', $sender, $receiver);
$check->execute();
$check->store_result();
if ($check->num_rows > 0) {
    echo json_encode(['status' => 'error', 'message' => 'Allerede sendt']);
    exit;
}

$friend = $conn->prepare('SELECT 1 FROM friends WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)');
$friend->bind_param('iiii', $sender, $receiver, $receiver, $sender);
$friend->execute();
$friend->store_result();
if ($friend->num_rows > 0) {
    echo json_encode(['status' => 'error', 'message' => 'Allerede kollegaer']);
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
        $senderStmt = $conn->prepare('SELECT firstname, lastname FROM users WHERE id = ?');
        $senderStmt->bind_param('i', $sender);
        $senderStmt->execute();
        $sres = $senderStmt->get_result();
        $senderRow = $sres->fetch_assoc();
        $fromName = trim($senderRow['firstname'] . ' ' . $senderRow['lastname']);
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

            // Sørg for korrekt tegnsett i emne og innhold
            $mail->CharSet = 'UTF-8';

            $mail->setFrom('noreply@minturnus.no', 'MinTurnus');
            $mail->addAddress($row['email']);

            $mail->isHTML(true);
            $mail->Subject = 'Ny kollegaforespørsel';
            $accept = 'https://minturnus.no/friends.html';
            $decline = 'https://minturnus.no/friends.html';
            $body  = '<div style="font-family:Arial,sans-serif;color:#333">';
            $body .= '<p>Hei ' . htmlspecialchars($row['firstname']) . ',</p>';
            $body .= '<p>' . htmlspecialchars($fromName) . ' har sendt deg en kollegaforespørsel i MinTurnus.</p>';
            $body .= '<p>';
            $body .= '<a href="' . $accept . '" style="background-color:#F4A300;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:4px;">Godta</a> ';
            $body .= '<a href="' . $decline . '" style="background-color:#F4A300;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:4px;margin-left:10px;">Avslå</a>';
            $body .= '</p>';
            $body .= '<p>Av sikkerhetsmessige grunner anbefaler vi å gå til <a href="https://minturnus.no" style="color:#F4A300;">MinTurnus.no</a> for å finne kollega-siden.</p>';
            $body .= '</div>';
            $mail->Body    = $body;
            $mail->AltBody = "Hei {$row['firstname']},\n{$fromName} har sendt deg en kollegaforespørsel. Gå til minside.no for å håndtere forespørselen.";
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

