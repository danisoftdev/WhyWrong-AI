<?php
declare(strict_types=1);

namespace WhyWrong\Controllers;

use WhyWrong\AI\ProviderRouter;
use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class RemediationController
{
    private Connection $db;
    private ProviderRouter $aiRouter;

    public function __construct(Connection $db)
    {
        $this->db = $db;
        $this->aiRouter = new ProviderRouter($db->getPdo());
    }

    public function generate(Request $request, Response $response, array $params): void
    {
        $diagId = $params['id'] ?? '';
        $studentId = $request->getUserId();

        $diag = $this->db->fetchOne(
            "SELECT d.*, a.student_id FROM diagnoses d JOIN attempts a ON d.attempt_id = a.id WHERE d.id = ?",
            [$diagId]
        );

        if (!$diag || $diag['student_id'] !== $studentId) {
            $response->error('Diagnosis not found or unauthorized.', 'NOT_FOUND', 404);
            return;
        }

        $existing = $this->db->fetchOne("SELECT * FROM remediations WHERE diagnosis_id = ?", [$diagId]);
        if ($existing) {
            $response->json([
                'status'      => 'success',
                'remediation' => [
                    'id'          => $existing['id'],
                    'lesson'      => json_decode($existing['lesson_json'], true),
                    'worksheet'   => json_decode($existing['worksheet_json'] ?? '{}', true),
                ]
            ]);
            return;
        }

        $aiRes = $this->aiRouter->generateJson('remediate', [
            'misconception_id' => $diag['misconception_id'],
        ], []);

        $lesson = [
            'counterexample'     => $aiRes['counterexample'] ?? [],
            'worked_contrast'    => $aiRes['worked_contrast'] ?? [],
            'interactive_type'   => $aiRes['interactive_type'] ?? 'fraction_strip',
            'practice_questions' => $aiRes['practice_questions'] ?? [],
        ];

        $remId = 'rem-' . bin2hex(random_bytes(8));
        $this->db->execute(
            "INSERT INTO remediations (id, diagnosis_id, lesson_json, worksheet_json) VALUES (?, ?, ?, ?)",
            [$remId, $diagId, json_encode($lesson), json_encode(['title' => 'Personalised Practice'])]
        );

        // Log agent event
        $this->db->execute(
            "INSERT INTO agent_events (id, diagnosis_id, stage, action, sanitized_payload, status) VALUES (UUID(), ?, 'remediate', 'Prepared personalised learning path: counterexample and worked contrast', '{}', 'done')",
            [$diagId]
        );

        $response->json([
            'status'      => 'success',
            'remediation' => [
                'id'        => $remId,
                'lesson'    => $lesson,
                'worksheet' => ['title' => 'Personalised Practice'],
            ]
        ], 201);
    }
}
