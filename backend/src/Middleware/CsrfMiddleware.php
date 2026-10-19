<?php
declare(strict_types=1);

namespace WhyWrong\Middleware;

use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class CsrfMiddleware
{
    public function handle(Request $request, Response $response): ?Response
    {
        $method = $request->getMethod();
        // Safe read-only methods
        if (in_array($method, ['GET', 'HEAD', 'OPTIONS'], true)) {
            return null;
        }

        // Exempt public auth & demo endpoints
        $path = $request->getPath();
        if ($path === '/api/auth/login' || $path === '/api/demo/session' || $path === '/api/auth/register') {
            return null;
        }

        // If authenticated session, verify token if provided
        $clientToken = $request->getHeader('x-csrf-token') ?? $request->get('_csrf_token');
        $sessionToken = $_SESSION['csrf_token'] ?? '';

        if (!empty($sessionToken) && !empty($clientToken)) {
            if (!hash_equals($sessionToken, (string)$clientToken)) {
                $response->error('Invalid CSRF token.', 'CSRF_ERROR', 403)->send();
                return $response;
            }
        }

        return null;
    }
}
