<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use WhyWrong\Database\Connection;

$config = [];
$configFile = __DIR__ . '/../config/local.php';
if (file_exists($configFile)) {
    $config = require $configFile;
}

$demoPassword = getenv('DEMO_PASSWORD') ?: ($config['demo_password'] ?? 'DemoPass2026!');
$isReset = in_array('--reset', $argv, true);

echo "=== WhyWrong AI Demo Seeder ===\n";
echo "Password: [CONFIGURED]\n";

try {
    $db = Connection::getInstance()->getPdo();
} catch (\Throwable $e) {
    echo "ERROR: Could not connect to database: " . $e->getMessage() . "\n";
    exit(1);
}

// Check if tables exist
$hasUsers = $db->query("SHOW TABLES LIKE 'users'")->rowCount() > 0;
if (!$hasUsers) {
    echo "Tables do not exist yet. Please run php bin/migrate.php first.\n";
    exit(1);
}

if ($isReset) {
    echo "Resetting demo rows...\n";
    $db->exec("SET FOREIGN_KEY_CHECKS = 0;");
    // Safely delete demo data
    try {
        $db->exec("DELETE FROM users WHERE is_demo = 1");
    } catch (\Throwable $e) {}
    $db->exec("SET FOREIGN_KEY_CHECKS = 1;");
    echo "Demo rows cleared.\n";
}

// Also include backend/seeds/seed.php execution if requested or available
require_once __DIR__ . '/../seeds/seed.php';

echo "Demo seeding successfully completed!\n";
