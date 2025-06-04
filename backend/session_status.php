<?php
session_start();
echo '<pre>';
print_r($_SESSION);
echo '</pre>';


if (isset($_SESSION['user_id'])) {
    // Hvis brukeren er innlogget, returner brukernavn og status
    echo json_encode(["loggedIn" => true, "userName" => $_SESSION['user_name']]);
} else {
    // Hvis brukeren ikke er innlogget, returner status som false
    echo json_encode(["loggedIn" => false]);
}
?>