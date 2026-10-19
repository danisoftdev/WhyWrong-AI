<?php
declare(strict_types=1);

namespace WhyWrong\Middleware;

use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class AuthMiddleware
{
    private Connection $db;

    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    public function handle(Request $request, Response $response): ?Response
    {
        $userId = $_SESSION['user_id'] ?? null;
        if (!empty($userId)) {
            $user = $this->db->fetchOne("SELECT * FROM users WHERE id = ?", [$userId]);
            if ($user) {
                // If account is disabled or deleted, log out
                if (isset($user['status']) && in_array($user['status'], ['disabled', 'deleted'], true)) {
                    unset($_SESSION['user_id']);
                } elseif (isset($user['is_active']) && (int)$user['is_active'] === 0) {
                    unset($_SESSION['user_id']);
                } else {
                    $request->setUser([
                        'id'           => $user['id'],
                        'role'         => $user['role'],
                        'display_name' => $user['display_name'],
                        'student_code' => $user['student_code'] ?? null,
                        'email'        => $user['email'] ?? null,
                        'is_demo'      => (bool)($user['is_demo'] ?? false),
                    ]);
                }
            } else {
                unset($_SESSION['user_id']);
            }
        }

        return null;
    }
}
