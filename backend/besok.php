<?php
require 'database.php'; // Koble til databasen

// Hent besøkstall fra databasen
$sql = "SELECT antall FROM besok WHERE id = 1";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $besok = $row["antall"] + 1;

    // Oppdater besøkstall
    $sql = "UPDATE besok SET antall = $besok WHERE id = 1";
    $conn->query($sql);
} else {
    // Hvis ingen rader finnes, opprett en
    $sql = "INSERT INTO besok (antall) VALUES (1)";
    $conn->query($sql);
    $besok = 1;
}

$conn->close();
?>

<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; text-align: center; font-size: 16px; font-weight: bold;">
    Antall besøkende: <strong><?php echo $besok; ?></strong>
</body>
</html>
