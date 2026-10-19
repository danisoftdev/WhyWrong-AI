<?php
declare(strict_types=1);

namespace WhyWrong\Middleware;

use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class RateLimiterMiddleware
{
    private Connection $db;

    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    public function handle(Request $request, Response $response): ?Response
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $path = $request->getPath();

        // Enforce light in-memory / session rate limiting for login & link codes
        if ($path === '/api/auth/login' || $path === '/api/parent/link') {
            $key = 'rate_' . md5($ip . ':' . $path);
            $window = 60; // 1 minute
            $maxAttempts = 15;

            $now = time();
            $history = $_SESSION[$key] ?? [];
            $history = array_filter($history, fn($t) => ($now - $t) < $window);

            if (count($history) >= $maxAttempts) {
                $response->error('Too many requests. Please wait a minute before trying again.', 'RATE_LIMITED', 429)->send();
                return $response;
            }

            $history[] = $now;
            $_SESSION[$key] = $history;
        }

        return null;
    }
}
