<?php
declare(strict_types=1);

namespace WhyWrong\Controllers;

use WhyWrong\AI\ProviderRouter;
use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class DiagnosisController
{
    private Connection $db;
    private ProviderRouter $aiRouter;

    public function __construct(Connection $db)
    {
        $this->db = $db;
        $this->aiRouter = new ProviderRouter($db->getPdo());
    }

    public function store(Request $request, Response $response): void
    {
        $studentId = $request->getUserId();
        $attemptId = (string)$request->get('attempt_id', '');

        if ($attemptId === '') {
            $response->error('attempt_id is required.', 'VALIDATION_ERROR', 422);
            return;
        }

        $attempt = $this->db->fetchOne(
            "SELECT a.*, q.prompt, q.options_json, q.distractor_map, q.correct_answer, t.name as topic_name
             FROM attempts a
             JOIN questions q ON a.question_id = q.id
             JOIN topics t ON q.topic_id = t.id
             WHERE a.id = ? AND a.student_id = ?",
            [$attemptId, $studentId]
        );

        if (!$attempt) {
            $response->error('Attempt not found or unauthorized.', 'NOT_FOUND', 404);
            return;
        }

        $answerData = json_decode($attempt['answer_json'], true) ?: [];
        $distractorMap = json_decode($attempt['distractor_map'] ?? '{}', true) ?: [];

        // Log Ingest Event
        $this->logEvent($attemptId, 'ingest', "Answer submitted: {$answerData['selected_text']}");

        $aiInput = [
            'user_id'            => $studentId,
            'question_prompt'    => $attempt['prompt'],
            'selected_option_id' => $answerData['selected_option_id'] ?? '',
            'answer_text'        => $answerData['selected_text'] ?? '',
            'working_text'       => $attempt['working_text'] ?? '',
            'distractor_map'     => $distractorMap,
        ];

        $schema = [
            'type' => 'object',
            'required' => ['hypothesis', 'evidence_quote', 'status', 'evidence_strength'],
            'properties' => [
                'hypothesis'        => ['type' => 'string'],
                'evidence_quote'    => ['type' => 'string'],
                'status'            => ['type' => 'string', 'enum' => ['suspected', 'probing']],
                'evidence_strength' => ['type' => 'string', 'enum' => ['low', 'moderate', 'strong']],
                'next_action'       => ['type' => 'string'],
            ],
        ];

        $diagnosis = $this->aiRouter->generateJson('diagnose', $aiInput, $schema);

        // Enforce hard security rule: evidence_quote MUST be substring of submitted student text
        $submittedText = trim(($answerData['selected_text'] ?? '') . ' ' . ($attempt['working_text'] ?? ''));
        $quote = $diagnosis['evidence_quote'] ?? '';
        if ($quote !== '' && !str_contains($submittedText, $quote)) {
            $quote = $answerData['selected_text'] ?? '';
            $diagnosis['evidence_quote'] = $quote;
        }

        // Hard rule: single wrong answer is only suspected
        $state = 'suspected';
        $diagId = 'diag-' . bin2hex(random_bytes(8));
        $miscId = $diagnosis['misconception_id'] ?? null;
        $strength = in_array($diagnosis['evidence_strength'] ?? '', ['low', 'moderate', 'strong'], true)
            ? $diagnosis['evidence_strength']
            : 'moderate';
        $providerName = $diagnosis['provider'] ?? 'rules_engine';
        $isDemo = !empty($diagnosis['is_demo']) ? 1 : 0;

        $this->db->execute(
            "INSERT INTO diagnoses (id, attempt_id, misconception_id, state, evidence_quote, evidence_strength, provider, is_demo)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [$diagId, $attemptId, $miscId, $state, $quote, $strength, $providerName, $isDemo]
        );

        // Fetch detailed misconception info
        $miscInfo = null;
        if ($miscId) {
            $miscInfo = $this->db->fetchOne("SELECT id, label, explanation FROM misconceptions WHERE id = ?", [$miscId]);
        }

        // Log Diagnose Event
        $this->logEvent($diagId, 'diagnose', "Detected tentative hypothesis: " . ($miscInfo['label'] ?? 'Unknown pattern'));

        $response->json([
            'status'            => 'success',
            'id'                => $diagId,
            'attempt_id'        => $attemptId,
            'state'             => $state,
            'evidence_quote'    => $quote,
            'evidence_strength' => $strength,
            'provider'          => $providerName,
            'is_demo'           => (bool)$isDemo,
            'demo_label'        => $diagnosis['demo_label'] ?? null,
            'misconception'     => $miscInfo,
            'next_action'       => 'probe',
        ], 201);
    }

    public function show(Request $request, Response $response, array $params): void
    {
        $id = $params['id'] ?? '';
        $user = $request->getUser();

        $diag = $this->db->fetchOne(
            "SELECT d.*, a.student_id, a.working_text, a.answer_json, q.prompt, q.prompt_type,
                    m.label as misconception_label, m.explanation as misconception_explanation,
                    u.student_code, u.display_name as student_name
             FROM diagnoses d
             JOIN attempts a ON d.attempt_id = a.id
             JOIN questions q ON a.question_id = q.id
             JOIN users u ON a.student_id = u.id
             LEFT JOIN misconceptions m ON d.misconception_id = m.id
             WHERE d.id = ?",
            [$id]
        );

        if (!$diag) {
            $response->error('Diagnosis not found.', 'NOT_FOUND', 404);
            return;
        }

        // Authorisation: student can view own, teacher can view classroom, parent can view linked
        if ($user['role'] === 'student' && $diag['student_id'] !== $user['id']) {
            $response->error('Forbidden.', 'FORBIDDEN', 403);
            return;
        }

        if ($user['role'] === 'parent') {
            $isLinked = $this->db->fetchOne(
                "SELECT id FROM parent_students WHERE parent_id = ? AND student_id = ? AND status = 'active'",
                [$user['id'], $diag['student_id']]
            );
            if (!$isLinked) {
                $response->error('Forbidden: student not linked to this parent.', 'FORBIDDEN', 403);
                return;
            }
        }

        $diag['answer'] = json_decode($diag['answer_json'], true);
        $diag['is_demo'] = (bool)$diag['is_demo'];

        $response->json(['status' => 'success', 'diagnosis' => $diag]);
    }

    private function logEvent(string $refId, string $stage, string $action): void
    {
        try {
            $this->db->execute(
                "INSERT INTO agent_events (id, diagnosis_id, stage, action, sanitized_payload, status) VALUES (UUID(), ?, ?, ?, ?, 'done')",
                [$refId, $stage, $action, json_encode(['note' => $action])]
            );
        } catch (\Throwable $e) {}
    }
}
