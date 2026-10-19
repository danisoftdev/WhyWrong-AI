<?php
declare(strict_types=1);

namespace WhyWrong\Middleware;

use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class CorsMiddleware
{
    public function handle(Request $request, Response $response): ?Response
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        $response->setHeader('Access-Control-Allow-Origin', $origin);
        $response->setHeader('Access-Control-Allow-Credentials', 'true');
        $response->setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
        $response->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With');

        if ($request->getMethod() === 'OPTIONS') {
            $response->setStatusCode(204)->send();
            return $response;
        }

        return null;
    }
}
