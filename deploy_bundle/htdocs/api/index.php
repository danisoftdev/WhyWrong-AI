<?php
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');

// Look for private_app either inside htdocs or outside htdocs
if (file_exists(__DIR__ . '/../../private_app/vendor/autoload.php')) {
    require_once __DIR__ . '/../../private_app/vendor/autoload.php';
    require_once __DIR__ . '/../../private_app/src/Application.php';
} elseif (file_exists(__DIR__ . '/../private_app/vendor/autoload.php')) {
    require_once __DIR__ . '/../private_app/vendor/autoload.php';
    require_once __DIR__ . '/../private_app/src/Application.php';
} else {
    header('Content-Type: application/json', true, 500);
    echo json_encode([
        'ok' => false,
        'error' => 'private_app directory not found. Ensure private_app is uploaded into htdocs/.'
    ]);
    exit;
}

$app = new \WhyWrong\Application();
$app->run();
