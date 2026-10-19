<?php
declare(strict_types=1);

namespace WhyWrong\Controllers;

use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class AuthController
{
    private Connection $db;

    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    public function login(Request $request, Response $response): void
    {
        $email = trim((string)$request->get('email', ''));
        $password = (string)$request->get('password', '');

        if ($email === '' || $password === '') {
            $response->error('Email and password are required.', 'VALIDATION_ERROR', 422);
            return;
        }

        $user = $this->db->fetchOne(
            "SELECT id, role, display_name, student_code, email, password_hash FROM users WHERE email = ? AND is_active = 1",
            [$email]
        );

        if (!$user || !password_verify($password, $user['password_hash'])) {
            $response->error('Invalid credentials.', 'UNAUTHORIZED', 401);
            return;
        }

        // Regenerate session ID for security
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['csrf_token'] = bin2hex(random_bytes(16));

        $response->json([
            'status' => 'success',
            'user' => [
                'id' => $user['id'],
                'role' => $user['role'],
                'display_name' => $user['display_name'],
                'student_code' => $user['student_code'],
                'email' => $user['email'],
            ],
            'csrf_token' => $_SESSION['csrf_token'],
        ]);
    }

    public function logout(Request $request, Response $response): void
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }
        session_destroy();

        $response->json(['status' => 'success', 'message' => 'Logged out successfully.']);
    }

    public function me(Request $request, Response $response): void
    {
        $user = $request->getUser();
        if (!$user) {
            $response->error('Not authenticated.', 'UNAUTHORIZED', 401);
            return;
        }

        $response->json([
            'status' => 'success',
            'user' => $user,
            'csrf_token' => $_SESSION['csrf_token'] ?? '',
        ]);
    }
}
