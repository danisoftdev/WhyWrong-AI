<?php
declare(strict_types=1);

namespace WhyWrong\Controllers;

use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class StudentWorkController
{
    private Connection $db;

    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    public function list(Request $request, Response $response): void
    {
        $studentId = $request->getUserId();
        try {
            $rows = $this->db->fetchAll(
                "SELECT a.id, a.title, a.kind, a.subject_label, a.prompt, a.due_at, a.audience, c.name AS class_name
                 FROM assignments a
                 JOIN classes c ON a.class_id = c.id
                 JOIN class_members cm ON cm.class_id = c.id AND cm.student_id = ?
                 WHERE a.audience = 'class'
                    OR EXISTS (
                        SELECT 1 FROM group_members gm
                        WHERE gm.group_id = a.group_id AND gm.student_id = ?
                    )
                 ORDER BY a.created_at DESC",
                [$studentId, $studentId]
            );
        } catch (\Throwable $e) {
            $response->json(['status' => 'success', 'assignments' => []]);
            return;
        }

        $response->json(['status' => 'success', 'assignments' => $rows]);
    }

    public function respond(Request $request, Response $response, array $params): void
    {
        $studentId = $request->getUserId();
        $assignmentId = $params['id'] ?? '';
        $answer = trim((string)$request->get('answer_text', ''));
        $quote = trim((string)$request->get('evidence_quote', ''));

        if ($answer === '' || mb_strlen($answer) > 4000) {
            $response->error('Write an answer of 4,000 characters or fewer.', 'VALIDATION_ERROR', 422);
            return;
        }
        if ($quote === '' || !str_contains($answer, $quote)) {
            $response->error('The evidence quote must be taken from the answer.', 'VALIDATION_ERROR', 422);
            return;
        }

        $allowed = $this->visibleAssignment($studentId, $assignmentId);
        if (!$allowed) {
            $response->error('That work is not assigned to you.', 'NOT_FOUND', 404);
            return;
        }

        $id = 'rsp-' . bin2hex(random_bytes(8));
        try {
            $this->db->execute(
                "INSERT INTO assignment_responses (id, assignment_id, student_id, answer_text, evidence_quote, state, evidence_strength)
                 VALUES (?, ?, ?, ?, ?, 'suspected', 'low')",
                [$id, $assignmentId, $studentId, $answer, $quote]
            );
        } catch (\Throwable $e) {
            $response->error('The classroom tables are not installed yet. Import migrations/013_assignment_responses.sql.', 'MIGRATION_REQUIRED', 503);
            return;
        }

        $response->json([
            'status' => 'success',
            'response' => [
                'id' => $id,
                'state' => 'suspected',
                'evidence_strength' => 'low',
                'evidence_quote' => $quote,
            ],
        ], 201);
    }

    private function visibleAssignment(string $studentId, string $assignmentId): bool
    {
        if ($assignmentId === '') {
            return false;
        }
        try {
            $row = $this->db->fetchOne(
                "SELECT a.id
                 FROM assignments a
                 JOIN class_members cm ON cm.class_id = a.class_id AND cm.student_id = ?
                 WHERE a.id = ?
                   AND (
                     a.audience = 'class'
                     OR EXISTS (
                        SELECT 1 FROM group_members gm
                        WHERE gm.group_id = a.group_id AND gm.student_id = ?
                     )
                   )",
                [$studentId, $assignmentId, $studentId]
            );
        } catch (\Throwable $e) {
            return false;
        }
        return (bool)$row;
    }
}
