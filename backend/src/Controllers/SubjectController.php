<?php
declare(strict_types=1);

namespace WhyWrong\Controllers;

use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class SubjectController
{
    private Connection $db;

    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    public function list(Request $request, Response $response): void
    {
        $subjects = $this->db->fetchAll("SELECT * FROM subjects ORDER BY sort_order ASC");

        foreach ($subjects as &$s) {
            $topics = $this->db->fetchAll(
                "SELECT t.*, (SELECT COUNT(*) FROM questions q WHERE q.topic_id = t.id) as question_count
                 FROM topics t WHERE t.subject_id = ? ORDER BY t.sort_order ASC",
                [$s['id']]
            );

            foreach ($topics as &$t) {
                $questions = $this->db->fetchAll("SELECT * FROM questions WHERE topic_id = ?", [$t['id']]);
                foreach ($questions as &$q) {
                    $q['options'] = json_decode($q['options_json'], true) ?: [];
                    // Sanitize for students and visitors: never leak correct_answer, distractor_map, or misconception ids
                    if (!in_array($request->getUserRole(), ['teacher', 'admin'], true)) {
                        unset($q['correct_answer'], $q['distractor_map']);
                        foreach ($q['options'] as &$opt) {
                            unset($opt['is_correct'], $opt['misconception_id']);
                        }
                    }
                }
                $t['questions'] = $questions;
            }
            $s['topics'] = $topics;
        }

        $response->json([
            'status' => 'success',
            'subjects' => $subjects,
        ]);
    }
}
