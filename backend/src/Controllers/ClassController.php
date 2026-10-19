<?php
declare(strict_types=1);

namespace WhyWrong\Controllers;

use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class ClassController
{
    private Connection $db;

    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    public function list(Request $request, Response $response): void
    {
        $teacherId = $request->getUserId();
        $classes = $this->db->fetchAll(
            "SELECT c.*, (SELECT COUNT(*) FROM class_members cm WHERE cm.class_id = c.id) as student_count
             FROM classes c WHERE c.teacher_id = ? ORDER BY c.created_at DESC",
            [$teacherId]
        );

        $response->json(['status' => 'success', 'classes' => $classes]);
    }

    public function store(Request $request, Response $response): void
    {
        $teacherId = $request->getUserId();
        $name = trim((string)$request->get('name', ''));
        $level = trim((string)$request->get('level', ''));

        if ($name === '') {
            $response->error('Class name is required.', 'VALIDATION_ERROR', 422);
            return;
        }

        $classId = 'cls-' . bin2hex(random_bytes(8));
        $this->db->execute(
            "INSERT INTO classes (id, teacher_id, name, level) VALUES (?, ?, ?, ?)",
            [$classId, $teacherId, $name, $level]
        );

        $response->json([
            'status' => 'success',
            'class' => ['id' => $classId, 'name' => $name, 'level' => $level],
        ], 201);
    }

    public function heatmap(Request $request, Response $response, array $params): void
    {
        $classId = $params['id'] ?? '';
        $teacherId = $request->getUserId();

        $class = $this->db->fetchOne("SELECT * FROM classes WHERE id = ? AND teacher_id = ?", [$classId, $teacherId]);
        if (!$class) {
            $response->error('Class not found or unauthorized.', 'NOT_FOUND', 404);
            return;
        }

        $students = $this->db->fetchAll(
            "SELECT u.id, u.display_name, u.student_code, u.email
             FROM class_members cm
             JOIN users u ON cm.student_id = u.id
             WHERE cm.class_id = ?",
            [$classId]
        );

        $totalStudents = count($students);

        // Fetch misconceptions active in this class
        $misconceptionsRanked = $this->db->fetchAll(
            "SELECT m.id, m.label, m.explanation, COUNT(d.id) as student_count
             FROM diagnoses d
             JOIN attempts a ON d.attempt_id = a.id
             JOIN class_members cm ON a.student_id = cm.student_id
             JOIN misconceptions m ON d.misconception_id = m.id
             WHERE cm.class_id = ? AND d.state IN ('suspected', 'confirmed')
             GROUP BY m.id, m.label, m.explanation
             ORDER BY student_count DESC",
            [$classId]
        );

        foreach ($misconceptionsRanked as &$mr) {
            $count = (int)$mr['student_count'];
            if ($count < 3) {
                // Rule: fewer than 3 students with a misconception: suppress percentages to protect privacy
                $mr['percentage'] = null;
                $mr['suppressed'] = true;
                $mr['suppressed_note'] = 'Suppressed (< 3 students to protect privacy)';
            } else {
                $pct = $totalStudents > 0 ? (int)round(($count / $totalStudents) * 100) : 0;
                $mr['percentage'] = $pct;
                $mr['suppressed'] = false;
            }
        }

        // Student diagnoses drill-down
        $studentDrilldown = [];
        foreach ($students as $stu) {
            $diags = $this->db->fetchAll(
                "SELECT d.id, d.state, d.evidence_quote, d.evidence_strength, d.created_at,
                        m.label as misconception_label, q.prompt
                 FROM diagnoses d
                 JOIN attempts a ON d.attempt_id = a.id
                 JOIN questions q ON a.question_id = q.id
                 LEFT JOIN misconceptions m ON d.misconception_id = m.id
                 WHERE a.student_id = ?
                 ORDER BY d.created_at DESC",
                [$stu['id']]
            );

            $studentDrilldown[] = [
                'id'            => $stu['id'],
                'student_code'  => $stu['student_code'],
                'display_name'  => $stu['display_name'],
                'active_count'  => count($diags),
                'diagnoses'     => $diags,
            ];
        }

        // Concept Mastery Heatmap Grid
        $heatmapGrid = [
            [
                'topic' => 'Fractions: Addition',
                'strong' => 14,
                'okay' => 6,
                'weak' => 4,
                'status' => 'Okay',
            ],
            [
                'topic' => 'Fractions: Comparison',
                'strong' => 18,
                'okay' => 4,
                'weak' => 2,
                'status' => 'Strong',
            ],
            [
                'topic' => 'Forces: Constant Motion',
                'strong' => 8,
                'okay' => 10,
                'weak' => 6,
                'status' => 'Weak',
            ],
            [
                'topic' => 'Computing: Loop Bounds',
                'strong' => 16,
                'okay' => 5,
                'weak' => 3,
                'status' => 'Strong',
            ],
        ];

        $kpis = [
            'total_students'             => $totalStudents,
            'active_misconceptions'      => count($misconceptionsRanked),
            'concept_mastery_pct'        => 74,
            'recommended_interventions'  => 2,
            'is_demo_data'               => true,
            'demo_label'                 => 'Demonstration data for class 2A',
        ];

        $response->json([
            'status'                 => 'success',
            'class'                  => $class,
            'kpis'                   => $kpis,
            'common_misconceptions'  => $misconceptionsRanked,
            'heatmap_grid'           => $heatmapGrid,
            'students'               => $studentDrilldown,
            'last_updated_at'        => date('Y-m-d H:i:s'),
            'freshness_interval_sec' => 600,
        ]);
    }

    public function roster(Request $request, Response $response, array $params): void
    {
        $classId = $params['id'] ?? (string)$request->get('class_id', '');
        $teacherId = $request->getUserId();

        $class = $this->db->fetchOne("SELECT * FROM classes WHERE id = ? AND teacher_id = ?", [$classId, $teacherId]);
        if (!$class) {
            $response->error('Class not found or unauthorized.', 'NOT_FOUND', 404);
            return;
        }

        $studentsInput = $request->get('students');
        $csvData = (string)$request->get('csv', '');

        $names = [];
        if (is_array($studentsInput)) {
            foreach ($studentsInput as $item) {
                $n = is_array($item) ? trim((string)($item['display_name'] ?? $item['name'] ?? '')) : trim((string)$item);
                if ($n !== '') $names[] = $n;
            }
        } elseif ($csvData !== '') {
            $lines = explode("\n", $csvData);
            foreach ($lines as $line) {
                $clean = trim($line, " \r\n\t,");
                if ($clean !== '' && !str_starts_with(strtolower($clean), 'name') && !str_starts_with(strtolower($clean), 'student')) {
                    $parts = str_getcsv($clean);
                    if (!empty($parts[0])) $names[] = trim($parts[0]);
                }
            }
        }

        if (empty($names)) {
            $response->error('At least one student name is required.', 'VALIDATION_ERROR', 422);
            return;
        }

        $created = [];
        $lastStudent = $this->db->fetchOne("SELECT student_code FROM users WHERE role = 'student' AND student_code LIKE 'STU-%' ORDER BY student_code DESC LIMIT 1");
        $nextNum = 1005;
        if ($lastStudent && preg_match('/STU-(\d+)/', $lastStudent['student_code'], $m)) {
            $nextNum = max($nextNum, ((int)$m[1]) + 1);
        }

        foreach ($names as $name) {
            $studentId = 'usr-' . bin2hex(random_bytes(8));
            $code = 'STU-' . $nextNum++;
            $pin = (string)random_int(1000, 9999);
            $hash = password_hash($pin, PASSWORD_BCRYPT);

            $email = strtolower($code) . '@student.whywrong.ai';
            $this->db->execute(
                "INSERT INTO users (id, display_name, student_code, email, password_hash, role, created_at)
                 VALUES (?, ?, ?, ?, ?, 'student', NOW())",
                [$studentId, $name, $code, $email, $hash]
            );

            $this->db->execute(
                "INSERT INTO class_members (id, class_id, student_id, joined_at)
                 VALUES (UUID(), ?, ?, NOW())",
                [$classId, $studentId]
            );

            $created[] = [
                'id'           => $studentId,
                'display_name' => $name,
                'student_code' => $code,
                'pin'          => $pin,
            ];
        }

        $response->json([
            'status'   => 'success',
            'message'  => count($created) . " students added to {$class['name']}.",
            'class_id' => $classId,
            'students' => $created,
        ], 201);
    }
}
