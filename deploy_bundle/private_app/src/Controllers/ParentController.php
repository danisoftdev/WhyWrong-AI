<?php
declare(strict_types=1);

namespace WhyWrong\Controllers;

use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class ParentController
{
    private Connection $db;

    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    public function link(Request $request, Response $response): void
    {
        $parentId = $request->getUserId();
        $code = strtoupper(trim((string)$request->get('code', '')));
        $consent = (bool)$request->get('consent', false);

        if ($code === '') {
            $response->error('Link code is required.', 'VALIDATION_ERROR', 422);
            return;
        }

        if (!$consent) {
            $response->error('Parent consent must be accepted before linking.', 'VALIDATION_ERROR', 422);
            return;
        }

        // Fetch candidate active link codes
        $candidates = $this->db->fetchAll(
            "SELECT * FROM link_codes WHERE used_at IS NULL AND revoked = 0 AND expires_at > NOW()"
        );

        $matchedCode = null;
        foreach ($candidates as $cand) {
            if (password_verify($code, $cand['code_hash'])) {
                $matchedCode = $cand;
                break;
            }
        }

        if (!$matchedCode || (int)($matchedCode['attempts'] ?? 0) >= 5) {
            $response->error('Invalid or expired link code. Please check with your child’s teacher.', 'NOT_FOUND', 404);
            return;
        }

        $studentId = $matchedCode['student_id'];

        // Mark code as used
        $this->db->execute(
            "UPDATE link_codes SET used_at = NOW() WHERE id = ?",
            [$matchedCode['id']]
        );

        // Upsert parent_students relationship
        $this->db->execute(
            "INSERT INTO parent_students (id, parent_id, student_id, status, consent_at, linked_at)
             VALUES (UUID(), ?, ?, 'active', NOW(), NOW())
             ON DUPLICATE KEY UPDATE status = 'active', consent_at = NOW(), linked_at = NOW()",
            [$parentId, $studentId]
        );

        // Record consent
        try {
            $this->db->execute(
                "INSERT INTO consents (id, user_id, subject_student_id, consent_type, version, granted_at)
                 VALUES (?, ?, ?, 'parent_access', '1.0', NOW())",
                ['cns-' . bin2hex(random_bytes(8)), $parentId, $studentId]
            );
        } catch (\Throwable $e) {}

        $student = $this->db->fetchOne("SELECT id, display_name, student_code FROM users WHERE id = ?", [$studentId]);

        $response->json([
            'status'  => 'success',
            'message' => "Successfully linked to {$student['display_name']} ({$student['student_code']}).",
            'student' => $student,
        ], 201);
    }

    public function children(Request $request, Response $response): void
    {
        $parentId = $request->getUserId();

        $children = $this->db->fetchAll(
            "SELECT u.id, u.display_name, u.student_code, ps.linked_at, ps.consent_at
             FROM parent_students ps
             JOIN users u ON ps.student_id = u.id
             WHERE ps.parent_id = ? AND ps.status = 'active'",
            [$parentId]
        );

        $response->json(['status' => 'success', 'children' => $children]);
    }

    public function revoke(Request $request, Response $response, array $params): void
    {
        $parentId = $request->getUserId();
        $studentId = $params['id'] ?? '';

        // Authorisation: verify parent is active linked
        $link = $this->db->fetchOne(
            "SELECT id FROM parent_students WHERE parent_id = ? AND student_id = ? AND status = 'active'",
            [$parentId, $studentId]
        );

        if (!$link) {
            $response->error('Student link not found.', 'NOT_FOUND', 404);
            return;
        }

        // F-14: Revoking a parent link marks consent withdrawn and stops digests
        $this->db->execute(
            "UPDATE parent_students SET status = 'revoked' WHERE parent_id = ? AND student_id = ?",
            [$parentId, $studentId]
        );

        try {
            $this->db->execute(
                "INSERT INTO consents (id, user_id, subject_student_id, consent_type, version, granted_at)
                 VALUES (UUID(), ?, ?, 'parent_access_withdrawn', '1.0', NOW())",
                [$parentId, $studentId]
            );
        } catch (\Throwable $e) {}

        $response->json([
            'status'  => 'success',
            'message' => 'Parent link revoked and consent withdrawn. Weekly digests have been stopped.',
        ]);
    }

    public function summary(Request $request, Response $response, array $params): void
    {
        $parentId = $request->getUserId();
        $studentId = $params['id'] ?? '';

        // Authorisation: verify parent is linked to this student (Rule: unlinked gets 404)
        $link = $this->db->fetchOne(
            "SELECT id FROM parent_students WHERE parent_id = ? AND student_id = ? AND status = 'active'",
            [$parentId, $studentId]
        );

        if (!$link) {
            $response->error('Student not found or unauthorized.', 'NOT_FOUND', 404);
            return;
        }

        $student = $this->db->fetchOne(
            "SELECT id, display_name, student_code FROM users WHERE id = ?",
            [$studentId]
        );

        $name = (string)($student['display_name'] ?? 'Your child');
        $accepted = [];
        try {
            $accepted = $this->db->fetchAll(
                "SELECT d.id, m.label AS misconception_label, t.name AS topic_name
                 FROM diagnoses d
                 JOIN attempts a ON d.attempt_id = a.id
                 LEFT JOIN misconceptions m ON d.misconception_id = m.id
                 LEFT JOIN topics t ON m.topic_id = t.id
                 WHERE a.student_id = ? AND d.state = 'confirmed'
                   AND NOT EXISTS (
                     SELECT 1 FROM teacher_reviews tr
                     WHERE tr.diagnosis_id = d.id AND tr.decision = 'rejected'
                   )
                 ORDER BY d.created_at DESC",
                [$studentId]
            );
        } catch (\Throwable $e) {
            $accepted = [];
        }

        $ideasWorkingOn = [];
        foreach ($accepted as $row) {
            $label = trim((string)($row['misconception_label'] ?? ''));
            if ($label === '') {
                continue;
            }
            $topic = trim((string)($row['topic_name'] ?? 'this subject'));
            $ideasWorkingOn[] = [
                'concept' => $label,
                'plain_explanation' => "{$name} is working on one idea about {$topic}.",
            ];
        }

        $nextRetest = null;
        try {
            $due = $this->db->fetchOne(
                "SELECT due_at FROM retests WHERE student_id = ? AND status = 'scheduled' ORDER BY due_at ASC LIMIT 1",
                [$studentId]
            );
            $nextRetest = $due['due_at'] ?? null;
        } catch (\Throwable $e) {}

        $fixedCount = 0;
        try {
            $fixed = $this->db->fetchOne(
                "SELECT COUNT(*) AS cnt FROM retests WHERE student_id = ? AND status = 'completed'",
                [$studentId]
            );
            $fixedCount = (int)($fixed['cnt'] ?? 0);
        } catch (\Throwable $e) {}

        if ($ideasWorkingOn === []) {
            $overview = "There is no accepted idea to share for {$name} yet.";
            $home = [
                'title' => 'Nothing to practise yet',
                'tip' => 'When the teacher accepts an idea, a short home activity will appear here.',
                'duration' => '',
            ];
        } else {
            $first = $ideasWorkingOn[0];
            $overview = $first['plain_explanation'];
            $home = [
                'title' => 'Five minutes at home',
                'tip' => "Ask {$name} to explain “{$first['concept']}” in their own words, then try one fresh example together.",
                'duration' => '5 minutes',
            ];
        }

        $summaryData = [
            'student' => [
                'id' => $student['id'],
                'display_name' => $name,
                'student_code' => $student['student_code'] ?? '',
            ],
            'week_overview' => $overview,
            'ideas_fixed_count' => $fixedCount,
            'practice_streak_days' => 0,
            'next_retest_date' => $nextRetest,
            'ideas_working_on' => $ideasWorkingOn,
            'help_at_home' => $home,
            'privacy_notice' => 'This note is only for your linked child. It uses accepted ideas, and it does not rank children.',
            'is_demo' => false,
        ];

        $weekStart = date('Y-m-d', strtotime('monday this week'));
        try {
            $existing = $this->db->fetchOne(
                "SELECT id FROM parent_digests WHERE student_id = ? AND week_start = ? LIMIT 1",
                [$studentId, $weekStart]
            );
            $payload = json_encode($summaryData, JSON_UNESCAPED_UNICODE);
            if ($existing) {
                $this->db->execute(
                    "UPDATE parent_digests SET summary_json = ?, generated_by = 'template' WHERE id = ?",
                    [$payload, $existing['id']]
                );
            } else {
                $this->db->execute(
                    "INSERT INTO parent_digests (id, student_id, week_start, summary_json, generated_by)
                     VALUES (?, ?, ?, ?, 'template')",
                    ['dig-' . bin2hex(random_bytes(8)), $studentId, $weekStart, $payload]
                );
            }
        } catch (\Throwable $e) {}

        $response->json(['status' => 'success', 'summary' => $summaryData]);
    }

    public function createChild(Request $request, Response $response): void
    {
        $parentId = $request->getUserId();
        $name = trim((string)$request->get('display_name', ''));
        $pin = trim((string)$request->get('pin', ''));

        if ($name === '') {
            $response->error('Child display name is required.', 'VALIDATION_ERROR', 422);
            return;
        }

        if ($pin === '' || strlen($pin) < 4) {
            $pin = (string)random_int(1000, 9999);
        }

        $studentId = 'usr-' . bin2hex(random_bytes(8));
        do {
            $studentCode = 'STU-' . random_int(2000, 99999);
        } while ($this->db->fetchOne("SELECT id FROM users WHERE student_code = ?", [$studentCode]));

        $email = strtolower($studentCode) . '@student.whywrong.ai';
        $hash = password_hash($pin, PASSWORD_BCRYPT);

        $this->db->execute(
            "INSERT INTO users (id, display_name, student_code, email, password_hash, role, created_at)
             VALUES (?, ?, ?, ?, ?, 'student', NOW())",
            [$studentId, $name, $studentCode, $email, $hash]
        );

        $this->db->execute(
            "INSERT INTO parent_students (id, parent_id, student_id, status, consent_at, linked_at)
             VALUES (UUID(), ?, ?, 'active', NOW(), NOW())",
            [$parentId, $studentId]
        );

        try {
            $this->db->execute(
                "INSERT INTO consents (id, user_id, subject_student_id, consent_type, version, granted_at)
                 VALUES (UUID(), ?, ?, 'parent_access', '1.0', NOW())",
                [$parentId, $studentId]
            );
        } catch (\Throwable $e) {}

        $response->json([
            'status'  => 'success',
            'message' => "Child {$name} created and linked successfully.",
            'child'   => [
                'id'           => $studentId,
                'display_name' => $name,
                'student_code' => $studentCode,
                'pin'          => $pin,
            ],
        ], 201);
    }
}

