<?php
declare(strict_types=1);

/**
 * Local environment configuration.
 * Reads environment variables first, falling back to local defaults.
 */

return [
    'app_env'   => 'production',
    'demo_mode' => true,
    'app_key'   => 'ww-production-live-key-32chars!!',

    'db' => [
        'host'    => 'sql210.infinityfree.com',
        'port'    => 3306,
        'name'    => 'if0_43217123_whywrong',
        'user'    => 'if0_43217123',
        'pass'    => 'PVQiT0emxEjjcD',
        'charset' => 'utf8mb4',
    ],

    'ai' => [
        'provider'         => getenv('AI_PROVIDER') ?: 'hybrid',
        'timeout'          => 15,
        'user_daily_limit' => (int)(getenv('AI_USER_DAILY_LIMIT') ?: 40),
        'cache_ttl_hours'  => (int)(getenv('AI_CACHE_TTL_HOURS') ?: 168),
        'gemini_key'       => getenv('GEMINI_API_KEY') ?: '',
        'gemini_model'     => getenv('GEMINI_MODEL') ?: 'gemini-1.5-flash',
        'groq_key'         => getenv('GROQ_API_KEY') ?: '',
        'groq_model'       => getenv('GROQ_MODEL') ?: 'llama-3.1-8b-instant',
    ],

    'demo_password' => getenv('DEMO_PASSWORD') ?: 'DemoPass2026!',
];
