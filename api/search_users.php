<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../backend/database.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Ikke innlogget']);
    exit;
}

$query = isset($_GET['query']) ? trim($_GET['query']) : '';
if ($query === '' || mb_strlen($query) < 2) {
    echo json_encode([]);
    exit;
}

$uid = $_SESSION['user_id'];
$search = '%' . $conn->real_escape_string($query) . '%';
$sql = "SELECT u.id, u.firstname, u.lastname, u.avatar_url,
        CASE
            WHEN f.user1 IS NOT NULL THEN 'colleague'
            WHEN fr1.id IS NOT NULL OR fr2.id IS NOT NULL THEN 'pending'
            ELSE 'none'
        END AS relation
        FROM users u
        LEFT JOIN friends f ON ((f.user1 = u.id AND f.user2 = ?) OR (f.user1 = ? AND f.user2 = u.id))
        LEFT JOIN friend_requests fr1 ON fr1.sender_id = ? AND fr1.receiver_id = u.id AND fr1.status = 0
        LEFT JOIN friend_requests fr2 ON fr2.sender_id = u.id AND fr2.receiver_id = ? AND fr2.status = 0
        WHERE (u.firstname LIKE ? OR u.lastname LIKE ?) AND u.id != ?
        ORDER BY u.firstname LIMIT 10";
$stmt = $conn->prepare($sql);
$stmt->bind_param('iiiissi', $uid, $uid, $uid, $uid, $search, $search, $uid);
$stmt->execute();
$result = $stmt->get_result();
$users = [];

function matches($q, $name) {
    $name = mb_strtolower($name);
    $parts = preg_split('/[\s-]+/', $name);
    foreach ($parts as $part) {
        if (strpos($part, $q) === 0 || levenshtein($q, $part) <= 1) {
            return true;
        }
    }
    // check the full name as well
    return strpos($name, $q) === 0 || levenshtein($q, $name) <= 1;
}

$q = mb_strtolower($query);
while ($row = $result->fetch_assoc()) {
    if (matches($q, $row['firstname']) || matches($q, $row['lastname'])) {
        $users[] = $row;
    }
}

echo json_encode($users);
