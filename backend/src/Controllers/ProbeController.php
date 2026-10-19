<?php
declare(strict_types=1);

namespace WhyWrong\Controllers;

use WhyWrong\AI\ProviderRouter;
use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class ProbeController
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

        // Check if probes already generated
        $existing = $this->db->fetchAll("SELECT * FROM probes WHERE diagnosis_id = ?", [$diagId]);
        if (!empty($existing)) {
            foreach ($existing as &$p) {
                $p['question'] = json_decode($p['question_json'], true);
            }
            $response->json(['status' => 'success', 'probes' => $existing]);
            return;
        }

        $aiRes = $this->aiRouter->generateJson('probe', [
            'misconception_id' => $diag['misconception_id'],
        ], []);

        $probesCreated = [];
        foreach ($aiRes['probes'] as $pData) {
            $probeId = 'prb-' . bin2hex(random_bytes(8));
            $this->db->execute(
                "INSERT INTO probes (id, diagnosis_id, question_json, predicted_wrong, rationale, result) VALUES (?, ?, ?, ?, ?, 'pending')",
                [
                    $probeId,
                    $diagId,
                    json_encode([
                        'prompt'  => $pData['prompt'] ?? $pData['question'] ?? 'Check your thinking',
                        'options' => $pData['options'] ?? [],
                    ]),
                    $pData['predicted_wrong'] ?? null,
                    $pData['rationale'] ?? null,
                ]
            );

            $probesCreated[] = [
                'id'              => $probeId,
                'diagnosis_id'    => $diagId,
                'question'        => [
                    'prompt'  => $pData['prompt'] ?? $pData['question'] ?? 'Check your thinking',
                    'options' => $pData['options'] ?? [],
                ],
                'predicted_wrong' => $pData['predicted_wrong'] ?? null,
                'rationale'       => $pData['rationale'] ?? null,
                'result'          => 'pending',
            ];
        }

        // Log agent event
        $this->db->execute(
            "INSERT INTO agent_events (id, diagnosis_id, stage, action, sanitized_payload, status) VALUES (UUID(), ?, 'probe', 'Generated discriminating probe questions to isolate thinking pattern', '{}', 'done')",
            [$diagId]
        );

        // Sanitize for student: question payloads NEVER contain is_correct, predicted_wrong, or rationale
        $clientProbes = [];
        foreach ($probesCreated as $p) {
            $cleanOptions = [];
            foreach ($p['question']['options'] as $opt) {
                $cleanOptions[] = [
                    'id'   => is_array($opt) ? ($opt['id'] ?? '') : '',
                    'text' => is_array($opt) ? ($opt['text'] ?? (string)$opt) : (string)$opt,
                ];
            }
            $clientProbes[] = [
                'id'           => $p['id'],
                'diagnosis_id' => $diagId,
                'question'     => [
                    'prompt'  => $p['question']['prompt'],
                    'options' => $cleanOptions,
                ],
                'result'       => 'pending',
            ];
        }

        $response->json(['status' => 'success', 'probes' => $clientProbes]);
    }

    public function respond(Request $request, Response $response, array $params): void
    {
        $probeId = $params['id'] ?? '';
        $studentId = $request->getUserId();
        $selectedText = (string)$request->get('selected_text', '');
        $selectedOptionId = (string)$request->get('selected_option_id', '');

        $probe = $this->db->fetchOne(
            "SELECT p.*, d.id as diag_id, d.misconception_id, a.student_id
             FROM probes p
             JOIN diagnoses d ON p.diagnosis_id = d.id
             JOIN attempts a ON d.attempt_id = a.id
             WHERE p.id = ?",
            [$probeId]
        );

        if (!$probe || $probe['student_id'] !== $studentId) {
            $response->error('Probe not found or unauthorized.', 'NOT_FOUND', 404);
            return;
        }

        $qData = json_decode($probe['question_json'], true) ?: [];
        $options = $qData['options'] ?? [];
        $isPredictedWrong = false;
        $isCorrect = false;

        foreach ($options as $opt) {
            $optText = is_array($opt) ? ($opt['text'] ?? '') : (string)$opt;
            $optId = is_array($opt) ? ($opt['id'] ?? '') : '';

            if ($optId === $selectedOptionId || $optText === $selectedText) {
                if (!empty($opt['is_predicted_wrong']) || (isset($probe['predicted_wrong']) && str_contains($optText, $probe['predicted_wrong']))) {
                    $isPredictedWrong = true;
                }
                if (!empty($opt['is_correct'])) {
                    $isCorrect = true;
                }
                break;
            }
        }

        $result = 'inconclusive';
        if ($isPredictedWrong) {
            $result = 'confirms';
        } elseif ($isCorrect) {
            $result = 'contradicts';
        }

        $this->db->execute(
            "UPDATE probes SET answer_json = ?, result = ?, answered_at = NOW() WHERE id = ?",
            [json_encode(['selected_option_id' => $selectedOptionId, 'selected_text' => $selectedText]), $result, $probeId]
        );

        // Fetch all probes for this diagnosis to compute cumulative evidence
        $allProbes = $this->db->fetchAll(
            "SELECT result FROM probes WHERE diagnosis_id = ?",
            [$probe['diag_id']]
        );

        $hasPredictedWrong = false;
        $allCorrect = true;
        $answeredCount = 0;

        foreach ($allProbes as $ap) {
            if ($ap['result'] === 'confirms') {
                $hasPredictedWrong = true;
                $allCorrect = false;
            } elseif ($ap['result'] !== 'contradicts') {
                $allCorrect = false;
            }
            if ($ap['result'] !== 'pending') {
                $answeredCount++;
            }
        }

        // Rule: Two predicted probes give Strong
        // Rule: One wrong answer with all probes correct gives slip and rejected. A rejected diagnosis (slip) shows no label to student.
        $isSlip = ($answeredCount >= count($allProbes)) && $allCorrect;
        if ($isSlip) {
            $diagState = 'rejected';
            $newStrength = 'low';
            $eventMsg = "All probes answered correctly. Initial error diagnosed as a momentary slip. Hypothesis rejected.";
        } elseif ($hasPredictedWrong) {
            $diagState = 'suspected';
            $newStrength = 'strong';
            $eventMsg = "Probe confirmed predicted misconception pattern. Evidence strength raised to strong.";
        } else {
            $diagState = 'probing';
            $newStrength = 'moderate';
            $eventMsg = "Probe recorded as inconclusive.";
        }

        $this->db->execute(
            "UPDATE diagnoses SET evidence_strength = ?, state = ? WHERE id = ?",
            [$newStrength, $diagState, $probe['diag_id']]
        );

        $this->db->execute(
            "INSERT INTO agent_events (id, diagnosis_id, stage, action, sanitized_payload, status) VALUES (UUID(), ?, 'probe', ?, '{}', 'done')",
            [$probe['diag_id'], $eventMsg]
        );

        $response->json([
            'status'            => 'success',
            'probe_id'          => $probeId,
            'result'            => $result,
            'evidence_strength' => $newStrength,
            'diagnosis_state'   => $diagState,
            'is_slip'           => $isSlip,
            'feedback'          => $isSlip ? "Great job! That was just a momentary slip. You've got this!" : $eventMsg,
            'message'           => $eventMsg,
        ]);
    }
}
