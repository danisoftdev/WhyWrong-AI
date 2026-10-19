<?php
declare(strict_types=1);

namespace WhyWrong\Controllers;

use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class LinkCodeController
{
    private Connection $db;

    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    public function generate(Request $request, Response $response, array $params): void
    {
        $studentId = $params['id'] ?? '';
        $teacherId = $request->getUserId();

        // Verify student belongs to a class taught by this teacher
        $membership = $this->db->fetchOne(
            "SELECT cm.id FROM class_members cm
             JOIN classes c ON cm.class_id = c.id
             WHERE cm.student_id = ? AND c.teacher_id = ?",
            [$studentId, $teacherId]
        );

        if (!$membership) {
            $response->error('Student not found or unauthorized.', 'NOT_FOUND', 404);
            return;
        }

        // Revoke any pending active codes for this student
        $this->db->execute(
            "UPDATE link_codes SET revoked = 1 WHERE student_id = ? AND used_at IS NULL",
            [$studentId]
        );

        // Generate 6-character memorable code: WW-XXXX
        $plainCode = 'WW-' . str_pad((string)random_int(1000, 9999), 4, '0', STR_PAD_LEFT);
        $codeHash = password_hash($plainCode, PASSWORD_BCRYPT);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+7 days'));

        $linkId = 'lc-' . bin2hex(random_bytes(8));
        $this->db->execute(
            "INSERT INTO link_codes (id, student_id, code_hash, expires_at, created_by) VALUES (?, ?, ?, ?, ?)",
            [$linkId, $studentId, $codeHash, $expiresAt, $teacherId]
        );

        $response->json([
            'status'     => 'success',
            'code'       => $plainCode,
            'student_id' => $studentId,
            'expires_at' => $expiresAt,
            'message'    => 'One-time link code generated. Share with the parent; valid for 7 days.',
        ], 201);
    }
}
