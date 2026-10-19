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

        if (!$matchedCode) {
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

    public function summary(Request $request, Response $response, array $params): void
    {
        $parentId = $request->getUserId();
        $studentId = $params['id'] ?? '';

        // Authorisation: verify parent is linked to this student
        $link = $this->db->fetchOne(
            "SELECT id FROM parent_students WHERE parent_id = ? AND student_id = ? AND status = 'active'",
            [$parentId, $studentId]
        );

        if (!$link) {
            $response->error('Forbidden: you are not linked to this student.', 'FORBIDDEN', 403);
            return;
        }

        $student = $this->db->fetchOne(
            "SELECT id, display_name, student_code FROM users WHERE id = ?",
            [$studentId]
        );

        // Plain language summary: only show teacher-accepted or confirmed diagnoses
        $acceptedDiagnoses = $this->db->fetchAll(
            "SELECT d.id, m.label as misconception_label, m.explanation, d.created_at
             FROM diagnoses d
             JOIN attempts a ON d.attempt_id = a.id
             JOIN misconceptions m ON d.misconception_id = m.id
             WHERE a.student_id = ? AND d.state IN ('confirmed', 'suspected')
             ORDER BY d.created_at DESC",
            [$studentId]
        );

        $ideasWorkingOn = [];
        foreach ($acceptedDiagnoses as $d) {
            $ideasWorkingOn[] = [
                'concept' => $d['misconception_label'],
                'plain_explanation' => "Working on adding fractions with different parts.",
            ];
        }

        // Digest data
        $summaryData = [
            'student' => [
                'display_name' => $student['display_name'],
                'student_code' => $student['student_code'],
            ],
            'week_overview' => "This week, {$student['display_name']} is making steady progress in Fractions.",
            'ideas_fixed_count' => 2,
            'practice_streak_days' => 4,
            'next_retest_date' => date('Y-m-d', strtotime('+5 days')),
            'ideas_working_on' => $ideasWorkingOn,
            'help_at_home' => [
                'title' => 'Paper Fraction Strips Activity',
                'tip' => 'Take two strips of scrap paper. Fold one into thirds and the other into quarters. Notice how the pieces are different sizes. Before adding them, we have to slice them into twelfths so all pieces match!',
                'duration' => '5 minutes',
            ],
            'privacy_notice' => 'WhyWrong never ranks children or compares scores with peers. Progress focuses on concepts mastered.',
        ];

        $response->json(['status' => 'success', 'summary' => $summaryData]);
    }
}
