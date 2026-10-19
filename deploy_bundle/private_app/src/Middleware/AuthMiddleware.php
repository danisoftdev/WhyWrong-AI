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
            $user = $this->db->fetchOne(
                "SELECT id, role, display_name, student_code, email FROM users WHERE id = ? AND is_active = 1",
                [$userId]
            );
            if ($user) {
                $request->setUser($user);
            } else {
                unset($_SESSION['user_id']);
            }
        }

        return null;
    }
}
