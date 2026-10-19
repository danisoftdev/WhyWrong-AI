<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/vendor/autoload.php';

$envFile = dirname(__DIR__, 2);
if (file_exists($envFile . '/.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable($envFile);
    try {
        $dotenv->load();
    } catch (\Throwable $e) {}
}
