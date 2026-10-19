<?php
declare(strict_types=1);

namespace WhyWrong\Controllers;

use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class ReviewController
{
    private Connection $db;

    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    public function decide(Request $request, Response $response, array $params): void
    {
        $diagId = $params['id'] ?? '';
        $teacherId = $request->getUserId();
        $decision = (string)$request->get('decision', '');
        $comment = trim((string)$request->get('comment', ''));

        if (!in_array($decision, ['accepted', 'edited', 'rejected'], true)) {
            $response->error("Invalid decision: must be 'accepted', 'edited', or 'rejected'.", 'VALIDATION_ERROR', 422);
            return;
        }

        $diag = $this->db->fetchOne("SELECT * FROM diagnoses WHERE id = ?", [$diagId]);
        if (!$diag) {
            $response->error('Diagnosis not found.', 'NOT_FOUND', 404);
            return;
        }

        $newState = match ($decision) {
            'accepted' => 'confirmed',
            'rejected' => 'rejected',
            'edited'   => 'suspected',
        };

        $this->db->execute(
            "UPDATE diagnoses SET state = ?, reviewer_id = ? WHERE id = ?",
            [$newState, $teacherId, $diagId]
        );

        $this->db->execute(
            "INSERT INTO teacher_reviews (id, diagnosis_id, teacher_id, decision, comment) VALUES (UUID(), ?, ?, ?, ?)",
            [$diagId, $teacherId, $decision, $comment]
        );

        // Audit log
        $this->db->execute(
            "INSERT INTO audit_logs (id, actor_id, action, resource_type, resource_id, meta_json) VALUES (UUID(), ?, 'teacher_review', 'diagnosis', ?, ?)",
            [$teacherId, $diagId, json_encode(['decision' => $decision, 'comment' => $comment])]
        );

        $response->json([
            'status'   => 'success',
            'decision' => $decision,
            'state'    => $newState,
            'message'  => "Diagnosis {$decision} by teacher.",
        ]);
    }
}
