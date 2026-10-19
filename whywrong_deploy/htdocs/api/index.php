<?php
declare(strict_types=1);

// Look for private_app either outside htdocs or inside
if (file_exists(__DIR__ . '/../../private_app/vendor/autoload.php')) {
    require_once __DIR__ . '/../../private_app/vendor/autoload.php';
    require_once __DIR__ . '/../../private_app/src/Application.php';
} else {
    require_once __DIR__ . '/../private_app/vendor/autoload.php';
    require_once __DIR__ . '/../private_app/src/Application.php';
}

 = new \WhyWrong\Application();
->run();
