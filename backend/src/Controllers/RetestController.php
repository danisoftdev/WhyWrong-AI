<?php
declare(strict_types=1);

namespace WhyWrong\Controllers;

use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class RetestController
{
    private Connection $db;

    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    public function schedule(Request $request, Response $response, array $params): void
    {
        $diagId = $params['id'] ?? '';
        $user = $request->getUser();

        $diag = $this->db->fetchOne(
            "SELECT d.*, a.student_id FROM diagnoses d JOIN attempts a ON d.attempt_id = a.id WHERE d.id = ?",
            [$diagId]
        );

        if (!$diag) {
            $response->error('Diagnosis not found.', 'NOT_FOUND', 404);
            return;
        }

        $studentId = $diag['student_id'];
        $isSimulated = (bool)$request->get('is_simulated', false);
        $dueDays = $isSimulated ? 0 : 7;
        $dueAt = date('Y-m-d H:i:s', strtotime("+{$dueDays} days"));

        $retestId = 'ret-' . bin2hex(random_bytes(8));
        $this->db->execute(
            "INSERT INTO retests (id, student_id, misconception_id, due_at, status, is_simulated) VALUES (?, ?, ?, ?, 'scheduled', ?)",
            [$retestId, $studentId, $diag['misconception_id'], $dueAt, $isSimulated ? 1 : 0]
        );

        $actionNote = $isSimulated
            ? "Retest scheduled (simulated time advance to due date)"
            : "Retest scheduled for {$dueAt} (+7 days retention check)";

        $this->db->execute(
            "INSERT INTO agent_events (id, diagnosis_id, stage, action, sanitized_payload, status) VALUES (UUID(), ?, 'retest', ?, '{}', 'done')",
            [$diagId, $actionNote]
        );

        $response->json([
            'status'       => 'success',
            'retest_id'    => $retestId,
            'due_at'       => $dueAt,
            'is_simulated' => $isSimulated,
            'message'      => $actionNote,
        ], 201);
    }
}
