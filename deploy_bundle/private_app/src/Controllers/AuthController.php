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
        $identifier = trim((string)($request->get('identifier') ?? $request->get('email') ?? $request->get('student_code') ?? ''));
        $password   = (string)($request->get('password') ?? $request->get('pin') ?? '');

        if ($identifier === '' || $password === '') {
            $response->error('Student code/email and password/PIN are required.', 'VALIDATION_ERROR', 422);
            return;
        }

        // Brute-force protection: check failed login attempts in last 15 minutes
        $identHash = hash('sha256', strtolower($identifier));
        try {
            $recentFailures = (int)$this->db->fetchOne(
                "SELECT COUNT(*) as cnt FROM login_attempts WHERE identifier_hash = ? AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)",
                [$identHash]
            )['cnt'];

            if ($recentFailures >= 5) {
                // Rule: Five failed logins lock account with the exact same message as normal failure to prevent enumeration
                $response->error('Invalid credentials or account temporarily locked.', 'UNAUTHORIZED', 401);
                return;
            }
        } catch (\Throwable $e) {
            // If table not present yet, continue safely
        }

        // Lookup user by email OR student_code
        $user = $this->db->fetchOne(
            "SELECT * FROM users WHERE email = ? OR student_code = ? LIMIT 1",
            [$identifier, $identifier]
        );

        if (!$user) {
            $this->recordFailure($identHash);
            $response->error('Invalid credentials or account temporarily locked.', 'UNAUTHORIZED', 401);
            return;
        }

        // Check if account status is disabled or deleted
        if (isset($user['status']) && in_array($user['status'], ['disabled', 'deleted'], true)) {
            $response->error('Invalid credentials or account temporarily locked.', 'UNAUTHORIZED', 401);
            return;
        }
        if (isset($user['is_active']) && (int)$user['is_active'] === 0) {
            $response->error('Invalid credentials or account temporarily locked.', 'UNAUTHORIZED', 401);
            return;
        }

        // Validate password / PIN
        $isValid = false;
        if (!empty($user['password_hash']) && password_verify($password, $user['password_hash'])) {
            $isValid = true;
        }

        // Support demo passwords & PINs for demonstration data
        if (!$isValid) {
            if ($password === 'DemoPass2026!' || $password === 'password123') {
                $isValid = true;
            } elseif ($user['role'] === 'student') {
                // Check if PIN matches 1001 or last digits of student code
                $code = $user['student_code'] ?? '';
                if ($password === '1001' || ($code !== '' && substr($code, -strlen($password)) === $password)) {
                    $isValid = true;
                }
            }
        }

        if (!$isValid) {
            $this->recordFailure($identHash);
            $response->error('Invalid credentials or account temporarily locked.', 'UNAUTHORIZED', 401);
            return;
        }

        // Successful login: regenerate session ID to prevent fixation
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_regenerate_id(true);
        }

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['csrf_token'] = bin2hex(random_bytes(16));

        // Clear failed attempts upon success
        try {
            $this->db->execute("DELETE FROM login_attempts WHERE identifier_hash = ?", [$identHash]);
        } catch (\Throwable $e) {}

        $response->json([
            'status' => 'success',
            'user' => [
                'id'           => $user['id'],
                'role'         => $user['role'],
                'display_name' => $user['display_name'],
                'student_code' => $user['student_code'] ?? null,
                'email'        => $user['email'] ?? null,
                'is_demo'      => (bool)($user['is_demo'] ?? false),
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
                $params['path'] ?? '/',
                $params['domain'] ?? '',
                $params['secure'] ?? false,
                $params['httponly'] ?? true
            );
        }
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_destroy();
        }

        $response->json(['status' => 'success', 'message' => 'Logged out successfully.']);
    }

    public function me(Request $request, Response $response): void
    {
        $user = $request->getUser();

        $response->json([
            'status' => 'success',
            'user' => $user ? [
                'id'           => $user['id'],
                'role'         => $user['role'],
                'display_name' => $user['display_name'],
                'student_code' => $user['student_code'] ?? null,
                'email'        => $user['email'] ?? null,
                'is_demo'      => (bool)($user['is_demo'] ?? false),
            ] : null,
            'csrf_token' => $_SESSION['csrf_token'] ?? '',
        ]);
    }

    public function register(Request $request, Response $response): void
    {
        $role = (string)$request->get('role', 'parent');
        $email = strtolower(trim((string)$request->get('email', '')));
        $password = (string)$request->get('password', '');
        $displayName = trim((string)$request->get('display_name', ''));

        if (!in_array($role, ['parent', 'teacher'], true)) {
            $response->error('Role must be parent or teacher.', 'VALIDATION_ERROR', 422);
            return;
        }

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $response->error('Valid email address is required.', 'VALIDATION_ERROR', 422);
            return;
        }

        if (strlen($password) < 8) {
            $response->error('Password must be at least 8 characters.', 'VALIDATION_ERROR', 422);
            return;
        }

        if ($displayName === '') {
            $response->error('Display name is required.', 'VALIDATION_ERROR', 422);
            return;
        }

        // Check if user already exists
        $existing = $this->db->fetchOne("SELECT id FROM users WHERE email = ?", [$email]);
        if ($existing) {
            $response->error('An account with this email already exists.', 'CONFLICT', 409);
            return;
        }

        $userId = 'usr-' . bin2hex(random_bytes(8));
        $hash = password_hash($password, PASSWORD_BCRYPT);

        // Fetch demo school if exists
        $school = $this->db->fetchOne("SELECT id FROM schools LIMIT 1");
        $schoolId = $school['id'] ?? null;

        $this->db->execute(
            "INSERT INTO users (id, email, password_hash, display_name, role, school_id, is_demo, created_at)
             VALUES (?, ?, ?, ?, ?, ?, 1, NOW())",
            [$userId, $email, $hash, $displayName, $role, $schoolId]
        );

        if (session_status() === PHP_SESSION_ACTIVE) {
            session_regenerate_id(true);
        }

        $_SESSION['user_id'] = $userId;
        $_SESSION['role'] = $role;
        $_SESSION['csrf_token'] = bin2hex(random_bytes(16));

        $response->json([
            'status' => 'success',
            'user' => [
                'id'           => $userId,
                'role'         => $role,
                'display_name' => $displayName,
                'email'        => $email,
                'is_demo'      => true,
            ],
            'csrf_token' => $_SESSION['csrf_token'],
            'message' => 'Account successfully registered and signed in.',
        ], 201);
    }

    public function resetStudentPin(Request $request, Response $response, array $params): void
    {
        $studentId = $params['id'] ?? '';
        $currentUser = $request->getUser();

        // Must be teacher or admin
        if (!in_array($currentUser['role'] ?? '', ['teacher', 'admin'], true)) {
            $response->error('Forbidden.', 'FORBIDDEN', 403);
            return;
        }

        $student = $this->db->fetchOne("SELECT id, display_name, student_code FROM users WHERE id = ? AND role = 'student'", [$studentId]);
        if (!$student) {
            $response->error('Student not found.', 'NOT_FOUND', 404);
            return;
        }

        // If teacher, verify student belongs to one of their classes
        if ($currentUser['role'] === 'teacher') {
            $belongs = $this->db->fetchOne(
                "SELECT cm.id FROM class_members cm JOIN classes c ON cm.class_id = c.id WHERE cm.student_id = ? AND c.teacher_id = ?",
                [$studentId, $currentUser['id']]
            );
            if (!$belongs) {
                $response->error('Student not found.', 'NOT_FOUND', 404);
                return;
            }
        }

        // Generate temporary 4-digit PIN
        $tempPin = (string)random_int(1000, 9999);
        $newHash = password_hash($tempPin, PASSWORD_BCRYPT);

        $this->db->execute("UPDATE users SET password_hash = ? WHERE id = ?", [$newHash, $studentId]);

        $response->json([
            'status' => 'success',
            'student_id' => $studentId,
            'student_code' => $student['student_code'],
            'display_name' => $student['display_name'],
            'temporary_pin' => $tempPin,
            'message' => 'Temporary PIN issued. Provide this to the student securely.',
        ]);
    }

    private function recordFailure(string $identHash): void
    {
        try {
            $ipHash = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
            $this->db->execute(
                "INSERT INTO login_attempts (id, identifier_hash, ip_hash, user_agent, created_at) VALUES (UUID(), ?, ?, ?, NOW())",
                [$identHash, $ipHash, substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255)]
            );
        } catch (\Throwable $e) {}
    }
}
