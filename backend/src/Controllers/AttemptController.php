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
        $confidence = trim((string)($request->get('confidence') ?? 'sure'));
        if (!in_array($confidence, ['sure', 'unsure', 'guessing'], true)) {
            $confidence = 'sure';
        }

        // Rule: Answer text is limited to 500 characters and working text to 4,000
        if (strlen($workingText) > 4000) {
            $response->error('Working text must not exceed 4,000 characters.', 'VALIDATION_ERROR', 422);
            return;
        }

        // Edge case: Double submit on a weak connection (Idempotency-Key)
        $idempotencyKey = $request->getHeader('idempotency-key');
        if (!empty($idempotencyKey) && isset($_SESSION['idempotency'][$idempotencyKey])) {
            $cached = $_SESSION['idempotency'][$idempotencyKey];
            $response->json($cached, 200);
            return;
        }

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

        if (strlen($selectedText) > 500) {
            $response->error('Answer text must not exceed 500 characters.', 'VALIDATION_ERROR', 422);
            return;
        }

        $isCorrect = ($selectedOptionId === $question['correct_answer']) ? 1 : 0;
        $attemptId = 'att-' . bin2hex(random_bytes(8));

        $answerData = [
            'selected_option_id' => $selectedOptionId,
            'selected_text'      => $selectedText,
            'confidence'         => $confidence,
        ];

        $this->db->execute(
            "INSERT INTO attempts (id, student_id, question_id, answer_json, working_text, is_correct) VALUES (?, ?, ?, ?, ?, ?)",
            [$attemptId, $studentId, $questionId, json_encode($answerData), $workingText, $isCorrect]
        );

        $resultPayload = [
            'status'             => 'success',
            'attempt_id'         => $attemptId,
            'is_correct'         => (bool)$isCorrect,
            'selected_option_id' => $selectedOptionId,
            'selected_text'      => $selectedText,
            'confidence'         => $confidence,
            'requires_diagnosis' => !$isCorrect,
        ];

        if (!empty($idempotencyKey)) {
            $_SESSION['idempotency'][$idempotencyKey] = $resultPayload;
        }

        $response->json($resultPayload, 201);
    }
}
