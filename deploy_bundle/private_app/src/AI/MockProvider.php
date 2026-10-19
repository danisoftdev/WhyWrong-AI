<?php
declare(strict_types=1);

namespace WhyWrong\AI;

/**
 * MockProvider — always available, deterministic, returns labelled demo responses.
 *
 * Every response includes is_demo: true and a visible demo_label.
 * Used when AI_PROVIDER=mock or as the last-resort fallback.
 */
class MockProvider implements AiProvider
{
    public function name(): string { return 'mock'; }
    public function isAvailable(): bool { return true; }

    public function generateJson(string $task, array $input, array $schema): array
    {
        $base = [
            'provider'   => $this->name(),
            'is_demo'    => true,
            'demo_label' => 'Demo response — not from a real AI call',
        ];

        return match($task) {
            'diagnose'  => $this->mockDiagnose($input, $base),
            'probe'     => $this->mockProbe($input, $base),
            'remediate' => $this->mockRemediate($input, $base),
            'report'    => $this->mockReport($input, $base),
            default     => array_merge($base, ['result' => 'mock_result_for_' . $task]),
        };
    }

    private function mockDiagnose(array $input, array $base): array
    {
        $answer = $input['answer_text'] ?? '2/7';
        return array_merge($base, [
            'hypothesis'        => 'adds_numerators_and_denominators',
            'evidence_quote'    => $answer,
            'status'            => 'suspected',
            'evidence_strength' => 'moderate',
            'next_action'       => 'probe',
            'misconception_label' => 'Add tops, add bottoms',
        ]);
    }

    private function mockProbe(array $input, array $base): array
    {
        return array_merge($base, [
            'probes' => [
                [
                    'id'             => 'probe_mock_1',
                    'question'       => 'What is 1/5 + 1/10?',
                    'options'        => ['2/15', '3/15', '2/10', "I'm not sure"],
                    'predicted_wrong' => '2/15',
                    'correct'        => '3/15',
                    'rationale'      => 'Confirms add-tops-add-bottoms if student picks 2/15.',
                ],
            ],
        ]);
    }

    private function mockRemediate(array $input, array $base): array
    {
        return array_merge($base, [
            'counterexample' => [
                'text'   => 'If you had half a pizza (1/2) and added another half (1/2), you get a whole pizza — not 2/4 (half a pizza). Adding fractions with the same denominator shows us pieces must be the same size.',
                'visual' => 'fraction_strip_halves',
            ],
            'worked_contrast' => [
                'wrong'       => '1/3 + 1/4 = (1+1)/(3+4) = 2/7',
                'right'       => '1/3 + 1/4 = 4/12 + 3/12 = 7/12',
                'explanation' => 'We need the same-sized pieces (common denominator) before we can add. Convert both fractions first.',
            ],
            'practice_ids' => ['prac_frac_add_1', 'prac_frac_add_2', 'prac_frac_add_3'],
        ]);
    }

    private function mockReport(array $input, array $base): array
    {
        return array_merge($base, [
            'summary'           => 'Kofi is working on one idea about fractions.',
            'ideas_fixed'       => 0,
            'practice_streak'   => 2,
            'next_retest_date'  => date('Y-m-d', strtotime('+7 days')),
            'help_at_home_tip'  => 'Try making paper fraction strips: fold a strip into thirds, another into quarters, and compare the pieces.',
        ]);
    }
}
