<?php
declare(strict_types=1);

namespace WhyWrong\Controllers;

use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class AttemptController
{
    private Connection $db;

    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    public function store(Request $request, Response $response): void
    {
        $studentId = $request->getUserId();
        $questionId = (string)$request->get('question_id', '');
        $selectedOptionId = (string)$request->get('selected_option_id', '');
        $workingText = trim((string)$request->get('working_text', ''));

        if ($questionId === '' || $selectedOptionId === '') {
            $response->error('question_id and selected_option_id are required.', 'VALIDATION_ERROR', 422);
            return;
        }

        $question = $this->db->fetchOne("SELECT * FROM questions WHERE id = ?", [$questionId]);
        if (!$question) {
            $response->error('Question not found.', 'NOT_FOUND', 404);
            return;
        }

        $options = json_decode($question['options_json'], true) ?: [];
        $selectedText = '';
        foreach ($options as $opt) {
            if ($opt['id'] === $selectedOptionId) {
                $selectedText = $opt['text'] ?? '';
                break;
            }
        }

        $isCorrect = ($selectedOptionId === $question['correct_answer']) ? 1 : 0;
        $attemptId = 'att-' . bin2hex(random_bytes(8));

        $answerData = [
            'selected_option_id' => $selectedOptionId,
            'selected_text'      => $selectedText,
        ];

        $this->db->execute(
            "INSERT INTO attempts (id, student_id, question_id, answer_json, working_text, is_correct) VALUES (?, ?, ?, ?, ?, ?)",
            [$attemptId, $studentId, $questionId, json_encode($answerData), $workingText, $isCorrect]
        );

        $response->json([
            'status' => 'success',
            'attempt_id' => $attemptId,
            'is_correct' => (bool)$isCorrect,
            'selected_option_id' => $selectedOptionId,
            'selected_text' => $selectedText,
            'requires_diagnosis' => !$isCorrect,
        ], 201);
    }
}
