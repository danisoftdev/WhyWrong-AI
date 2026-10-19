<?php
declare(strict_types=1);

namespace WhyWrong\Tests;

use PHPUnit\Framework\TestCase;
use WhyWrong\AI\MockProvider;
use WhyWrong\AI\RulesEngineProvider;

class AiProviderTest extends TestCase
{
    public function testMockProviderReturnsLabelledDemoResponse(): void
    {
        $mock = new MockProvider();
        $this->assertTrue($mock->isAvailable());
        $this->assertEquals('mock', $mock->name());

        $res = $mock->generateJson('diagnose', ['answer_text' => '2/7'], []);
        $this->assertTrue($res['is_demo']);
        $this->assertEquals('suspected', $res['status']);
        $this->assertNotEmpty($res['evidence_quote']);
    }

    public function testRulesEngineDetectsAddAcrossMisconception(): void
    {
        $engine = new RulesEngineProvider();
        $this->assertTrue($engine->isAvailable());

        $input = [
            'selected_option_id' => 'opt-b',
            'distractor_map'     => ['opt-b' => 'misc-frac-add-across'],
            'answer_text'        => '2/7',
            'working_text'       => '1/3 + 1/4 = 2/7',
        ];

        $diag = $engine->generateJson('diagnose', $input, []);
        $this->assertEquals('misc-frac-add-across', $diag['hypothesis']);
        $this->assertEquals('suspected', $diag['status']);
        $this->assertStringContainsString('2/7', $diag['evidence_quote']);
        $this->assertEquals('moderate', $diag['evidence_strength']);
    }

    public function testEvidenceQuoteMustBeSubstring(): void
    {
        $engine = new RulesEngineProvider();
        $input = [
            'selected_option_id' => 'opt-b',
            'distractor_map'     => ['opt-b' => 'misc-frac-add-across'],
            'answer_text'        => '2/7',
            'working_text'       => '1/3 + 1/4 = 2/7',
        ];

        $diag = $engine->generateJson('diagnose', $input, []);
        $combined = $input['answer_text'] . ' ' . $input['working_text'];
        $this->assertStringContainsString($diag['evidence_quote'], $combined);
    }
}
