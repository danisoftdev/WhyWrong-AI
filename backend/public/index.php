<?php
declare(strict_types=1);

// ============================================================
// WhyWrong AI — PHP REST API Front Controller
// All web requests go through this file via Apache .htaccess
// ============================================================

// Security: prevent direct file execution disclosure
if (php_sapi_name() === 'cli') {
    echo "This file is the web entry point and should not be run from CLI.\n";
    exit(1);
}

define('ROOT_PATH', dirname(__DIR__));
define('SRC_PATH', ROOT_PATH . '/src');
define('CONFIG_PATH', ROOT_PATH . '/config');
define('LOGS_PATH', ROOT_PATH . '/logs');
define('APP_START', microtime(true));

// ── Autoloader ────────────────────────────────────────────────
require_once ROOT_PATH . '/vendor/autoload.php';

// ── Environment ───────────────────────────────────────────────
$dotenv = Dotenv\Dotenv::createImmutable(ROOT_PATH . '/..');
try {
    $dotenv->load();
} catch (\Dotenv\Exception\InvalidPathException $e) {
    // .env not found — fall through to defaults / server env vars
}

// ── Error handling ────────────────────────────────────────────
$appEnv = $_ENV['APP_ENV'] ?? 'production';
if ($appEnv === 'production') {
    ini_set('display_errors', '0');
    ini_set('display_startup_errors', '0');
    error_reporting(0);
} else {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
}

set_exception_handler(function (\Throwable $e) {
    // Log internally, never expose internals
    error_log('[WhyWrong] Uncaught: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json');
    }
    echo json_encode([
        'status' => 'error',
        'code' => 'SERVER_ERROR',
        'message' => 'An unexpected error occurred. Please try again.',
    ]);
    exit;
});

// ── HTTPS redirect (production) ───────────────────────────────
if ($appEnv === 'production' && empty($_SERVER['HTTPS'])) {
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $uri  = $_SERVER['REQUEST_URI'] ?? '/';
    header("Location: https://{$host}{$uri}", true, 301);
    exit;
}

// ── Bootstrap application ─────────────────────────────────────
$app = new \WhyWrong\Application();
$app->run();
