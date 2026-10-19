<?php
// backend/config/local.example.php
// Copy this file to local.php in private_app/config/ (outside web root on cPanel).
// Never commit local.php with real credentials.

return [
    'app_env'   => 'production',
    'demo_mode' => true,
    'app_key'   => 'CHANGE_ME_64_CHAR_RANDOM_SECRET_KEY_FOR_SECURITY',

    'db' => [
        'host'    => 'localhost',
        'port'    => 3306,
        'name'    => 'cpuser_whywrong',
        'user'    => 'cpuser_app',
        'pass'    => 'CHANGE_ME_STRONG_DATABASE_PASSWORD',
        'charset' => 'utf8mb4',
    ],

    'ai' => [
        'provider'         => 'hybrid', // hybrid | rules | gemini | groq | mock
        'timeout'          => 15,
        'user_daily_limit' => 40,
        'cache_ttl_hours'  => 168,

        // Optional free tier keys — system functions 100% offline on the Rules Engine without them
        'gemini_key'   => '',
        'gemini_model' => 'gemini-1.5-flash',
        'groq_key'     => '',
        'groq_model'   => 'llama-3.1-8b-instant',
    ],

    'demo_password' => 'CHANGE_ME_DEMO_PASSWORD',
];
