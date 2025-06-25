<?php
header('Content-Type: application/json');
$configPath = __DIR__ . '/config.php';
$appId = getenv('FACEBOOK_APP_ID') ?: '';
if (file_exists($configPath)) {
    include $configPath;
    if (isset($FACEBOOK_APP_ID)) {
        $appId = $FACEBOOK_APP_ID;
    }
}
echo json_encode(['facebook_app_id' => $appId]);


