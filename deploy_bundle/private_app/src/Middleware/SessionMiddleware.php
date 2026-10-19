<?php
declare(strict_types=1);

namespace WhyWrong\Middleware;

use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class SessionMiddleware
{
    public function handle(Request $request, Response $response): ?Response
    {
        if (session_status() === PHP_SESSION_NONE) {
            $isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
            session_set_cookie_params([
                'lifetime' => 86400 * 7,
                'path'     => '/',
                'domain'   => '',
                'secure'   => $isHttps,
                'httponly' => true,
                'samesite' => 'Lax',
            ]);
            session_name($_ENV['SESSION_NAME'] ?? 'ww_session');
            session_start();
        }

        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(16));
        }

        return null;
    }
}
