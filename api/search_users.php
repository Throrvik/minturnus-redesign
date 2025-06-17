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

// Split query into tokens for advanced matching and use the first token for SQL
$tokens = array_filter(preg_split('/[\s-]+/', mb_strtolower($query)), 'strlen');
$firstToken = $tokens[0];
$search = '%' . $conn->real_escape_string($firstToken) . '%';
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
        ORDER BY u.firstname LIMIT 50";
$stmt = $conn->prepare($sql);
$stmt->bind_param('iiiissi', $uid, $uid, $uid, $uid, $search, $search, $uid);
$stmt->execute();
$result = $stmt->get_result();
$users = [];
function matchesTokens($tokens, $firstname, $lastname) {
    $name = mb_strtolower(trim($firstname . ' ' . $lastname));
    $parts = preg_split('/[\\s-]+/', $name);
    foreach ($tokens as $token) {
        $found = false;
        foreach ($parts as $part) {
            if (strpos($part, $token) === 0 || levenshtein($token, $part) <= 1) {
                $found = true;
                break;
            }
        }
        if (!$found) {
            return false;
        }
    }
    return true;
}

while ($row = $result->fetch_assoc()) {
    if (matchesTokens($tokens, $row['firstname'], $row['lastname'])) {
        $users[] = $row;
    }
}


echo json_encode($users);
