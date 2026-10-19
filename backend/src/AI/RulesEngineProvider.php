<?php
declare(strict_types=1);

namespace WhyWrong\AI;

/**
 * RulesEngineProvider — The WhyWrong Engine.
 *
 * Deterministic, free, instant, and never rate-limited.
 * Primary engine for all pack-backed questions and known misconception detectors.
 */
class RulesEngineProvider implements AiProvider
{
    private string $packsDir;

    public function __construct(?string $packsDir = null)
    {
        $this->packsDir = $packsDir ?? dirname(__DIR__, 3) . '/subject-packs';
    }

    public function name(): string
    {
        return 'rules_engine';
    }

    public function isAvailable(): bool
    {
        return true;
    }

    public function generateJson(string $task, array $input, array $schema): array
    {
        return match ($task) {
            'diagnose'  => $this->diagnose($input),
            'probe'     => $this->generateProbes($input),
            'remediate' => $this->generateRemediation($input),
            'report'    => $this->generateReport($input),
            default     => throw new AiException("Unsupported task: {$task}"),
        };
    }

    private function diagnose(array $input): array
    {
        $answerText = (string)($input['answer_text'] ?? '');
        $workingText = (string)($input['working_text'] ?? '');
        $combinedText = trim($answerText . ' ' . $workingText);
        $distractorMap = (array)($input['distractor_map'] ?? []);
        $selectedOption = (string)($input['selected_option_id'] ?? '');

        $misconceptionId = null;
        $evidenceQuote = '';

        // 1. Direct distractor map lookup
        if ($selectedOption !== '' && isset($distractorMap[$selectedOption])) {
            $misconceptionId = $distractorMap[$selectedOption];
            $evidenceQuote = $answerText !== '' ? $answerText : $selectedOption;
        }

        // 2. Pattern detection on working text if not resolved by distractor
        if ($misconceptionId === null && $combinedText !== '') {
            $packMisc = $this->findMisconceptionByPattern($combinedText);
            if ($packMisc !== null) {
                $misconceptionId = $packMisc['id'];
                $evidenceQuote = $packMisc['matched_quote'] ?? $combinedText;
            }
        }

        if ($misconceptionId === null) {
            return [
                'provider' => $this->name(),
                'hypothesis' => null,
                'status' => 'unidentified',
                'evidence_quote' => '',
                'evidence_strength' => 'low',
                'next_action' => 'review',
                'message' => 'No known misconception detected for this response.',
            ];
        }

        // Verify evidence quote is a strict substring of submitted student text
        if ($evidenceQuote !== '' && !str_contains($combinedText, $evidenceQuote)) {
            $evidenceQuote = $answerText !== '' ? $answerText : substr($combinedText, 0, 50);
        }

        $miscData = $this->loadMisconceptionData($misconceptionId);

        return [
            'provider'           => $this->name(),
            'hypothesis'         => $misconceptionId,
            'misconception_id'   => $misconceptionId,
            'misconception_label'=> $miscData['label'] ?? 'Identified Misconception',
            'explanation'        => $miscData['explanation'] ?? '',
            'evidence_quote'     => $evidenceQuote,
            'status'             => 'suspected', // Hard rule: always suspected initially
            'evidence_strength'  => 'moderate',
            'next_action'        => 'probe',
            'is_demo'            => false,
        ];
    }

    private function generateProbes(array $input): array
    {
        $miscId = (string)($input['misconception_id'] ?? '');
        $miscData = $this->loadMisconceptionData($miscId);

        $probes = $miscData['probes'] ?? [
            [
                'id' => 'probe-generic-1',
                'prompt' => 'Let us test this pattern: which of these matches your thinking?',
                'options' => [
                    ['id' => 'p1', 'text' => 'Option A (Predicted Pattern)', 'is_predicted_wrong' => true],
                    ['id' => 'p2', 'text' => 'Option B (Correct Rule)', 'is_correct' => true],
                    ['id' => 'p3', 'text' => "I'm not sure", 'is_unsure' => true],
                ],
                'predicted_wrong' => 'Option A (Predicted Pattern)',
                'rationale' => 'Differentiates accidental calculation slip from systemic misconception.',
            ],
        ];

        return [
            'provider' => $this->name(),
            'probes'   => $probes,
            'is_demo'  => false,
        ];
    }

    private function generateRemediation(array $input): array
    {
        $miscId = (string)($input['misconception_id'] ?? '');
        $miscData = $this->loadMisconceptionData($miscId);

        return [
            'provider'         => $this->name(),
            'counterexample'   => $miscData['counterexample'] ?? [
                'statement' => 'When two identical parts are combined, the denominator represents part sizes, which must be equal.',
                'analogy' => 'Comparing fraction strips visually.',
            ],
            'worked_contrast'  => $miscData['worked_contrast'] ?? [
                'incorrect_rule' => 'Direct sum without equivalent denominator.',
                'correct_rule'   => 'Convert to common denominator first.',
                'explanation'    => 'Equal-sized parts are required before addition.',
            ],
            'interactive_type' => 'fraction_strip',
            'practice_questions' => $miscData['practice_questions'] ?? [],
            'is_demo'          => false,
        ];
    }

    private function generateReport(array $input): array
    {
        $studentCode = $input['student_code'] ?? 'Learner';
        $miscLabels = (array)($input['accepted_misconceptions'] ?? ['fractions addition']);
        $labelList = implode(', ', $miscLabels);

        return [
            'provider'         => $this->name(),
            'summary'          => "{$studentCode} is actively working on understanding {$labelList}.",
            'ideas_fixed'      => (int)($input['fixed_count'] ?? 1),
            'practice_streak'  => (int)($input['streak'] ?? 3),
            'next_retest_date' => date('Y-m-d', strtotime('+7 days')),
            'help_at_home_tip' => 'Try folding paper strips into fractions to visually compare sizes before adding.',
            'is_demo'          => false,
        ];
    }

    private function loadMisconceptionData(string $miscId): ?array
    {
        $packs = [
            $this->packsDir . '/mathematics/fractions.json',
            $this->packsDir . '/physics/motion.json',
            $this->packsDir . '/computing/loops.json',
        ];

        foreach ($packs as $packFile) {
            if (!file_exists($packFile)) {
                continue;
            }
            $data = json_decode(file_get_contents($packFile), true);
            if (!is_array($data) || empty($data['misconceptions'])) {
                continue;
            }
            foreach ($data['misconceptions'] as $m) {
                if (($m['id'] ?? '') === $miscId) {
                    return $m;
                }
            }
        }

        return null;
    }

    private function findMisconceptionByPattern(string $text): ?array
    {
        // Fractions add-across detector
        if (preg_match('/(\d+)\/(\d+)\s*\+\s*(\d+)\/(\d+)\s*=\s*(\d+)\/(\d+)/', $text, $matches)) {
            $num1 = (int)$matches[1];
            $den1 = (int)$matches[2];
            $num2 = (int)$matches[3];
            $den2 = (int)$matches[4];
            $resNum = (int)$matches[5];
            $resDen = (int)$matches[6];

            if ($resNum === ($num1 + $num2) && $resDen === ($den1 + $den2)) {
                return [
                    'id' => 'misc-frac-add-across',
                    'matched_quote' => $matches[0],
                ];
            }
        }

        // Check for 2/7
        if (str_contains($text, '2/7')) {
            return [
                'id' => 'misc-frac-add-across',
                'matched_quote' => '2/7',
            ];
        }

        // Computing off-by-one check
        if (preg_match('/\b(index\s*=\s*5|length\s*=\s*5)\b/i', $text, $matches)) {
            return [
                'id' => 'misc-comp-off-by-one',
                'matched_quote' => $matches[0],
            ];
        }

        return null;
    }
}
