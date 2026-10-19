<?php
declare(strict_types=1);

namespace WhyWrong\Controllers;

use WhyWrong\AI\GeminiProvider;
use WhyWrong\AI\GroqProvider;
use WhyWrong\AI\MockProvider;
use WhyWrong\AI\RulesEngineProvider;
use WhyWrong\Database\Connection;
use WhyWrong\Http\Request;
use WhyWrong\Http\Response;

class AiHealthController
{
    private Connection $db;

    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    public function status(Request $request, Response $response): void
    {
        $rules = new RulesEngineProvider();
        $gemini = new GeminiProvider();
        $groq = new GroqProvider();
        $mock = new MockProvider();

        $activeProvider = $_ENV['AI_PROVIDER'] ?? 'hybrid';

        $health = [
            'status'          => 'healthy',
            'configured_mode' => $activeProvider,
            'providers' => [
                'rules_engine' => [
                    'name'        => $rules->name(),
                    'available'   => $rules->isAvailable(),
                    'description' => 'Deterministic WhyWrong Engine (Subject Packs)',
                    'tier'        => 'Free & Local',
                ],
                'gemini_free' => [
                    'name'        => $gemini->name(),
                    'available'   => $gemini->isAvailable(),
                    'model'       => $_ENV['GEMINI_MODEL'] ?? 'gemini-1.5-flash',
                    'description' => 'Google AI Studio Flash Free Tier',
                    'tier'        => 'Free Tier',
                ],
                'groq_free' => [
                    'name'        => $groq->name(),
                    'available'   => $groq->isAvailable(),
                    'model'       => $_ENV['GROQ_MODEL'] ?? 'llama-3.1-8b-instant',
                    'description' => 'Groq Cloud High-Speed Inference Free Tier',
                    'tier'        => 'Free Tier',
                ],
                'mock_engine' => [
                    'name'        => $mock->name(),
                    'available'   => true,
                    'description' => 'Guaranteed Offline Demonstrator',
                    'tier'        => 'Free & Embedded',
                ],
            ],
            'policy' => [
                'non_free_apis'    => 'BANNED - Zero paid third-party dependencies',
                'privacy'          => 'Student names/PII anonymised before LLM calls',
                'authorisation'    => 'Strict object-level RBAC enforced',
            ],
            'timestamp' => date('c'),
        ];

        $response->json(['status' => 'success', 'health' => $health]);
    }
}
