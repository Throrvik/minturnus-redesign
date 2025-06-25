<?php
require_once __DIR__ . '/config.php';

// Fjern all feilrapportering for produksjon
error_reporting(0);

// Lag tilkoblingen med MySQLi (denne brukes av andre skript ved behov)
$conn = new mysqli($servername, $username, $db_password, $dbname);

// Kontroller tilkoblingen
if ($conn->connect_error) {
    die("Databasetilkobling feilet: " . $conn->connect_error);
}

// Alternativt PDO, som kan brukes med try-catch i hovedskriptet
$dsn = "mysql:host=$servername;dbname=$dbname;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

// Merk at denne filen nå kun definerer tilkoblingen, og ingen output sendes.
