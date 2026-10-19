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
        $newMiscId = trim((string)$request->get('misconception_id', ''));

        if (!in_array($decision, ['accepted', 'edited', 'rejected'], true)) {
            $response->error("Invalid decision: must be 'accepted', 'edited', or 'rejected'.", 'VALIDATION_ERROR', 422);
            return;
        }

        // Verify diagnosis exists and belongs to a student taught by this teacher
        $diag = $this->db->fetchOne(
            "SELECT d.*, a.student_id
             FROM diagnoses d
             JOIN attempts a ON d.attempt_id = a.id
             JOIN class_members cm ON a.student_id = cm.student_id
             JOIN classes c ON cm.class_id = c.id
             WHERE d.id = ? AND c.teacher_id = ?",
            [$diagId, $teacherId]
        );

        if (!$diag) {
            $response->error('Diagnosis not found or unauthorized.', 'NOT_FOUND', 404);
            return;
        }

        // F-12: Defined edit payload: needs valid misconception_id from verified pack
        if ($decision === 'edited') {
            if ($newMiscId === '') {
                $response->error('misconception_id is required for an edited decision.', 'VALIDATION_ERROR', 422);
                return;
            }
            $miscExists = $this->db->fetchOne("SELECT id FROM misconceptions WHERE id = ?", [$newMiscId]);
            if (!$miscExists) {
                $response->error('Invalid misconception_id: not found in verified pack.', 'VALIDATION_ERROR', 422);
                return;
            }
        }

        $newState = match ($decision) {
            'accepted' => 'confirmed',
            'rejected' => 'rejected',
            'edited'   => 'suspected',
        };

        if ($decision === 'edited') {
            $this->db->execute(
                "UPDATE diagnoses SET state = ?, misconception_id = ?, reviewer_id = ? WHERE id = ?",
                [$newState, $newMiscId, $teacherId, $diagId]
            );
        } else {
            $this->db->execute(
                "UPDATE diagnoses SET state = ?, reviewer_id = ? WHERE id = ?",
                [$newState, $teacherId, $diagId]
            );
        }

        $this->db->execute(
            "INSERT INTO teacher_reviews (id, diagnosis_id, teacher_id, decision, comment) VALUES (UUID(), ?, ?, ?, ?)",
            [$diagId, $teacherId, $decision, $comment]
        );

        // Audit log (writes both teacher_reviews and audit_logs)
        $this->db->execute(
            "INSERT INTO audit_logs (id, actor_id, action, resource_type, resource_id, meta_json) VALUES (UUID(), ?, 'teacher_review', 'diagnosis', ?, ?)",
            [$teacherId, $diagId, json_encode(['decision' => $decision, 'comment' => $comment, 'misconception_id' => $newMiscId ?: $diag['misconception_id']])]
        );

        $response->json([
            'status'           => 'success',
            'decision'         => $decision,
            'state'            => $newState,
            'misconception_id' => $newMiscId ?: $diag['misconception_id'],
            'message'          => "Diagnosis {$decision} by teacher.",
        ]);
    }
}
