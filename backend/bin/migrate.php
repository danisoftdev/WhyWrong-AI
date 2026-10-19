<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use WhyWrong\Database\Connection;

echo "=== WhyWrong AI Database Migration Runner ===\n";

try {
    $db = Connection::getInstance();
    $pdo = $db->getPdo();
} catch (\Throwable $e) {
    echo "ERROR: Could not connect to database: " . $e->getMessage() . "\n";
    exit(1);
}

// Ensure schema_migrations exists
$pdo->exec("
    CREATE TABLE IF NOT EXISTS schema_migrations (
        version     VARCHAR(60) NOT NULL PRIMARY KEY,
        applied_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

// Fetch applied migrations
$stmt = $pdo->query("SELECT version FROM schema_migrations ORDER BY version ASC");
$applied = $stmt->fetchAll(PDO::FETCH_COLUMN);
$appliedSet = array_flip($applied);

$migrationsDir = __DIR__ . '/../migrations';
$files = glob($migrationsDir . '/[0-9][0-9][0-9]_*.sql');
$files = array_filter($files, function($f) {
    return basename($f) !== '001_init.sql' && basename($f) !== 'full_schema.sql';
});
sort($files);

$isStatusOnly = in_array('--status', $argv, true);

if ($isStatusOnly) {
    echo "Migration Status:\n";
    foreach ($files as $file) {
        $base = basename($file);
        $status = isset($appliedSet[$base]) ? "[APPLIED]" : "[PENDING]";
        echo "  $status $base\n";
    }
    exit(0);
}

$appliedCount = 0;
foreach ($files as $file) {
    $base = basename($file);
    if (isset($appliedSet[$base])) {
        continue;
    }

    echo "Applying $base... ";
    $sql = file_get_contents($file);
    if ($sql === false || trim($sql) === '') {
        echo "SKIPPED (empty)\n";
        continue;
    }

    try {
        $pdo->exec($sql);
        $ins = $pdo->prepare("INSERT INTO schema_migrations (version) VALUES (?)");
        $ins->execute([$base]);
        echo "OK\n";
        $appliedCount++;
    } catch (\Throwable $e) {
        echo "FAILED!\n";
        echo "Error: " . $e->getMessage() . "\n";
        exit(1);
    }
}

if ($appliedCount === 0) {
    echo "Database is already up to date.\n";
} else {
    echo "Successfully applied $appliedCount migration(s).\n";
}
