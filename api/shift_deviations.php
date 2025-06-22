<?php
session_start();
require_once __DIR__ . '/../backend/csrf.php';
validate_csrf();
header('Content-Type: application/json');
require_once __DIR__ . '/../backend/database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit;
}

$uid = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $conn->prepare('SELECT id, start_date, work_weeks, off_weeks, duration_days, keep_rhythm FROM shift_deviations WHERE user_id=? ORDER BY start_date');
    $stmt->bind_param('i', $uid);
    $stmt->execute();
    $res = $stmt->get_result();
    $data = [];
    while ($row = $res->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) { echo json_encode(['status' => 'error']); exit; }
    $start = $input['start_date'] ?? null;
    $w = $input['work_weeks'] ?? 0;
    $o = $input['off_weeks'] ?? 0;
    $dur = $input['duration_days'] ?? 0;
    $keep = !empty($input['keep_rhythm']) ? 1 : 0;
    $stmt = $conn->prepare('INSERT INTO shift_deviations (user_id,start_date,work_weeks,off_weeks,duration_days,keep_rhythm) VALUES (?,?,?,?,?,?)');
    $stmt->bind_param('isiiii', $uid, $start, $w, $o, $dur, $keep);
    $stmt->execute();
    echo json_encode(['status' => 'success', 'id' => $stmt->insert_id]);
} elseif ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? 0;
    $stmt = $conn->prepare('DELETE FROM shift_deviations WHERE id=? AND user_id=?');
    $stmt->bind_param('ii', $id, $uid);
    $stmt->execute();
    echo json_encode(['status' => 'success']);
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
