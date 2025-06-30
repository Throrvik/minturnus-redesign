<?php
// Load configuration if present. If missing, return a useful error
$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Configuration file missing. Please create backend/config.php.'
    ]);
    exit;
}
// Include configuration. It can either define variables directly or
// return an array of settings (legacy format).
$config = include $configFile;

// If the config file returned an array, map it to variables expected below
if (is_array($config)) {
    $servername  = $config['DB_HOST'] ?? 'localhost';
    $username    = $config['DB_USER'] ?? '';
    $db_password = $config['DB_PASS'] ?? '';
    $dbname      = $config['DB_NAME'] ?? '';

    // Optional SMTP/other settings
    $smtp_user = $config['MAIL_USER'] ?? ($smtp_user ?? null);
    $smtp_pass = $config['MAIL_PASS'] ?? ($smtp_pass ?? null);
    if (isset($config['FACEBOOK_APP_ID'])) {
        $FACEBOOK_APP_ID = $config['FACEBOOK_APP_ID'];
    }
}

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
