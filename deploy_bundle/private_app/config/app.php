<?php
declare(strict_types=1);

/**
 * WhyWrong AI — Application Configuration & Business Rules
 *
 * All business thresholds, limits, rate windows, retention periods,
 * and AI routing defaults are defined here as named constants.
 */

return [
    'app_name'    => 'WhyWrong AI',
    'app_env'     => getenv('APP_ENV') ?: 'production',
    'app_key'     => getenv('APP_KEY') ?: 'ww-default-insecure-key-change-me',
    'app_version' => '2.0.0',
    'demo_mode'   => filter_var(getenv('DEMO_MODE') ?: true, FILTER_VALIDATE_BOOLEAN),

    // Database Connection Defaults
    'db' => [
        'host'    => getenv('DB_HOST')    ?: 'localhost',
        'port'    => (int)(getenv('DB_PORT') ?: 3306),
        'name'    => getenv('DB_NAME')    ?: 'whywrong',
        'user'    => getenv('DB_USER')    ?: 'root',
        'pass'    => getenv('DB_PASS')    ?: '',
        'charset' => 'utf8mb4',
    ],

    // Security & Sessions
    'security' => [
        'session_cookie_name'      => 'ww_session',
        'session_lifetime_seconds' => 604800, // 7 days
        'admin_timeout_seconds'    => 1800,   // 30 minutes
        'auth_lockout_attempts'    => 5,
        'auth_lockout_minutes'     => 15,
        'link_code_expiry_days'    => 7,
        'link_code_max_attempts'   => 5,
        'link_code_prefix'         => 'WW-',
        'rate_limit_window'        => 60,     // 1 minute
        'rate_limit_max_requests'  => 15,     // 15 requests per minute
        'max_answer_chars'         => 500,
        'max_working_chars'        => 4000,
        'allowed_origins'          => ['*'],
    ],

    // Business Rules: Evidence Scoring & Strength Cut-offs
    'evidence' => [
        'distractor_match_score'     => 1.0,
        'pattern_detector_score'     => 0.8,
        'ai_provider_match_score'    => 0.5,
        'confidence_sure_bonus'      => 0.5,
        'confidence_guessing_penalty'=> -0.3,
        'probe_predicted_wrong_score'=> 1.0,
        'probe_correct_penalty'      => -1.5,
        'probe_unpredicted_penalty'  => -0.3,

        // Strength thresholds
        'threshold_moderate'         => 1.5, // 1.5 to 2.9 is moderate
        'threshold_strong'           => 3.0, // 3.0 and above is strong

        // Retest schedule
        'retest_interval_days'       => 7,
    ],

    // AI Provider Configuration (NO model names in code)
    'ai' => [
        'provider'         => getenv('AI_PROVIDER') ?: 'hybrid',
        'timeout'          => 15,
        'user_daily_limit' => (int)(getenv('AI_USER_DAILY_LIMIT') ?: 40),
        'cache_ttl_hours'  => (int)(getenv('AI_CACHE_TTL_HOURS') ?: 168), // 7 days

        'gemini' => [
            'api_key'  => getenv('GEMINI_API_KEY') ?: '',
            'model'    => getenv('GEMINI_MODEL') ?: 'gemini-1.5-flash',
            'endpoint' => 'https://generativelanguage.googleapis.com/v1beta/models',
        ],

        'groq' => [
            'api_key'  => getenv('GROQ_API_KEY') ?: '',
            'model'    => getenv('GROQ_MODEL') ?: 'llama-3.1-8b-instant',
            'endpoint' => 'https://api.groq.com/openai/v1/chat/completions',
        ],
    ],

    // Data Retention Periods (in days)
    'retention' => [
        'raw_answers_days'  => 365,
        'ai_usage_days'     => 90,
        'login_attempts_days'=> 90,
        'audit_logs_days'   => 730,
    ],
];
