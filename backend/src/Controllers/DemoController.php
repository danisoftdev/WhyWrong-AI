<?php
declare(strict_types=1);

namespace WhyWrong\Controllers;

use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class DemoController
{
    private Connection $db;

    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    public function session(Request $request, Response $response): void
    {
        $role = (string)$request->get('role', 'student');
        if (!in_array($role, ['student', 'teacher', 'parent', 'admin'], true)) {
            $role = 'student';
        }

        $user = match ($role) {
            'teacher' => $this->db->fetchOne("SELECT * FROM users WHERE role = 'teacher' LIMIT 1"),
            'parent'  => $this->db->fetchOne("SELECT * FROM users WHERE role = 'parent' LIMIT 1"),
            'admin'   => $this->db->fetchOne("SELECT * FROM users WHERE role = 'admin' LIMIT 1"),
            default   => $this->db->fetchOne("SELECT * FROM users WHERE role = 'student' AND student_code = 'STU-1001' LIMIT 1"),
        };

        if (!$user) {
            $response->error('Demo user not found. Please run database seeds.', 'NOT_FOUND', 404);
            return;
        }

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
                'is_demo' => true,
            ],
            'csrf_token' => $_SESSION['csrf_token'],
            'demo_notice' => 'Switched to seeded demonstration session.',
        ]);
    }
}
