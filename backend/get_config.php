<?php
header('Content-Type: application/json');
$configPath = __DIR__ . '/config.php';
$config = file_exists($configPath) ? require $configPath : [];
$appId = $config['FACEBOOK_APP_ID'] ?? getenv('FACEBOOK_APP_ID') ?? '';
echo json_encode(['facebook_app_id' => $appId]);

