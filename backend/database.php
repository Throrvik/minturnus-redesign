<?php
// Load credentials
$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    die('Missing backend/config.php');
}
$config = require $configPath;

// Support both array style and variable style config
if (is_array($config)) {
    $servername  = $config['DB_HOST'] ?? 'localhost';
    $username    = $config['DB_USER'] ?? '';
    $db_password = $config['DB_PASS'] ?? '';
    $dbname      = $config['DB_NAME'] ?? '';
} else {
    $servername = $servername ?? 'localhost';
    $username = $username ?? '';
    $db_password = $db_password ?? '';
    $dbname = $dbname ?? '';
}

// Fjern all feilrapportering for produksjon
if (getenv('DEV_MODE')) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
}

// Definer tilkoblingsinformasjon for MySQL-databasen
// Config values override the defaults defined above
$servername = $servername ?: 'localhost';
$username = $username ?: '';
$db_password = $db_password ?: '';
$dbname = $dbname ?: '';

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
?>
