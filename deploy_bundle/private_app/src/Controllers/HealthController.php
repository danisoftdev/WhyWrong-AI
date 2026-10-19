<?php
declare(strict_types=1);

namespace WhyWrong\Controllers;

use WhyWrong\Http\Request;
use WhyWrong\Http\Response;
use WhyWrong\Database\Connection;
use WhyWrong\AI\RulesEngineProvider;
use WhyWrong\AI\GeminiProvider;
use WhyWrong\AI\GroqProvider;
use WhyWrong\AI\MockProvider;

class HealthController
{
    private Connection $db;

    public function __construct(Connection $db)
    {
        $this->db = $db;
    }

    public function status(Request $request, Response $response): void
    {
        $dbOk = false;
        try {
            $row = $this->db->fetchOne("SELECT 1 AS alive");
            $dbOk = ($row !== null && isset($row['alive']));
        } catch (\Throwable $e) {
            $dbOk = false;
        }

        $rulesEngine = new RulesEngineProvider();
        $gemini = new GeminiProvider();
        $groq = new GroqProvider();
        $mock = new MockProvider();

        $providers = [
            'rules_engine' => $rulesEngine->isAvailable(),
            'mock'         => $mock->isAvailable(),
            'gemini'       => $gemini->isAvailable(),
            'groq'         => $groq->isAvailable(),
        ];

        $data = [
            'app'          => 'WhyWrong AI',
            'tagline'      => 'Fix the thinking, not just the answer.',
            'version'      => '1.0.0',
            'status'       => 'ok',
            'db'           => $dbOk,
            'php_version'  => PHP_VERSION,
            'ai_providers' => $providers,
            'environment'  => $_ENV['APP_ENV'] ?? 'production',
        ];

        $response->json([
            'ok'   => true,
            'data' => $data,
            'meta' => [
                'request_id' => $request->header('X-Request-Id') ?: bin2hex(random_bytes(8)),
                'timestamp'  => gmdate('Y-m-d\TH:i:s\Z'),
            ],
        ]);
    }
}
