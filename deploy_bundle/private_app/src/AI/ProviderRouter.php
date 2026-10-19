<?php
declare(strict_types=1);

namespace WhyWrong\AI;

use PDO;
use WhyWrong\Database\Connection;

/**
 * ProviderRouter — Coordinates AI requests, caching, quotas, and fallback ordering.
 */
class ProviderRouter implements AiProvider
{
    private string $mode;
    private array $providers = [];
    private ?PDO $db;
    private int $cacheTtlHours;
    private int $dailyLimit;

    public function __construct(?PDO $db = null)
    {
        $this->db = $db ?? Connection::getInstance()->getPdo();
        $this->mode = (string)($_ENV['AI_PROVIDER'] ?? 'hybrid');
        $this->cacheTtlHours = (int)($_ENV['AI_CACHE_TTL_HOURS'] ?? 168);
        $this->dailyLimit = (int)($_ENV['AI_USER_DAILY_LIMIT'] ?? 40);

        $this->providers = [
            'rules'  => new RulesEngineProvider(),
            'gemini' => new GeminiProvider(),
            'groq'   => new GroqProvider(),
            'mock'   => new MockProvider(),
        ];
    }

    public function name(): string
    {
        return 'router_' . $this->mode;
    }

    public function isAvailable(): bool
    {
        return true;
    }

    public function generateJson(string $task, array $input, array $schema): array
    {
        $userId = $input['user_id'] ?? null;
        $cacheKey = hash('sha256', $task . ':' . json_encode($input));

        // 1. Check cache
        $cached = $this->getCached($cacheKey);
        if ($cached !== null) {
            $this->logUsage($userId, $cached['provider'] ?? 'cache', $task, 'cache_hit', 0);
            return $cached;
        }

        // 2. Check quota
        if ($userId && $this->isQuotaExceeded($userId)) {
            // Fall back to deterministic rules or mock
            return $this->providers['rules']->generateJson($task, $input, $schema);
        }

        $startTime = microtime(true);

        // 3. Determine provider sequence
        $sequence = match ($this->mode) {
            'rules'  => ['rules', 'mock'],
            'gemini' => ['gemini', 'rules', 'mock'],
            'groq'   => ['groq', 'rules', 'mock'],
            'mock'   => ['mock'],
            default  => $this->getHybridSequence($task, $input), // hybrid
        };

        $lastException = null;
        foreach ($sequence as $providerKey) {
            $provider = $this->providers[$providerKey] ?? null;
            if (!$provider || !$provider->isAvailable()) {
                continue;
            }

            try {
                $result = $provider->generateJson($task, $input, $schema);
                $latencyMs = (int)((microtime(true) - $startTime) * 1000);

                // Set cache
                $this->setCache($cacheKey, $task, $result, $provider->name());
                $this->logUsage($userId, $provider->name(), $task, 'success', $latencyMs);

                return $result;
            } catch (AiException $e) {
                $lastException = $e;
                $this->logUsage($userId, $providerKey, $task, 'error', null);
                // Continue to next provider in fallback sequence
            }
        }

        // All configured providers failed, return guaranteed deterministic mock
        return $this->providers['mock']->generateJson($task, $input, $schema);
    }

    private function getHybridSequence(string $task, array $input): array
    {
        // If known pack or distractor matched, Engine is faster and superior
        if (!empty($input['distractor_map']) || !empty($input['selected_option_id'])) {
            return ['rules', 'gemini', 'groq', 'mock'];
        }

        // For open-ended text without distractor match, prefer LLM
        return ['gemini', 'groq', 'rules', 'mock'];
    }

    private function getCached(string $cacheKey): ?array
    {
        if (!$this->db) return null;
        try {
            $stmt = $this->db->prepare("SELECT response_json FROM ai_cache WHERE cache_key = ? AND expires_at > NOW() LIMIT 1");
            $stmt->execute([$cacheKey]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                return json_decode($row['response_json'], true);
            }
        } catch (\Throwable $e) {
            // Non-blocking cache failure
        }
        return null;
    }

    private function setCache(string $cacheKey, string $task, array $response, string $provider): void
    {
        if (!$this->db) return;
        try {
            $expiresAt = date('Y-m-d H:i:s', time() + ($this->cacheTtlHours * 3600));
            $stmt = $this->db->prepare("INSERT INTO ai_cache (id, cache_key, task, response_json, provider, expires_at)
                VALUES (UUID(), ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE response_json = VALUES(response_json), expires_at = VALUES(expires_at)");
            $stmt->execute([$cacheKey, $task, json_encode($response), $provider, $expiresAt]);
        } catch (\Throwable $e) {
            // Non-blocking cache write failure
        }
    }

    private function isQuotaExceeded(string $userId): bool
    {
        if (!$this->db) return false;
        try {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM ai_usage WHERE user_id = ? AND created_at >= CURDATE() AND status != 'cache_hit'");
            $stmt->execute([$userId]);
            $count = (int)$stmt->fetchColumn();
            return $count >= $this->dailyLimit;
        } catch (\Throwable $e) {
            return false;
        }
    }

    private function logUsage(?string $userId, string $provider, string $task, string $status, ?int $latencyMs): void
    {
        if (!$this->db) return;
        try {
            $stmt = $this->db->prepare("INSERT INTO ai_usage (id, user_id, provider, task, status, latency_ms) VALUES (UUID(), ?, ?, ?, ?, ?)");
            $stmt->execute([$userId, $provider, $task, $status, $latencyMs]);
        } catch (\Throwable $e) {
            // Non-blocking log failure
        }
    }
}
