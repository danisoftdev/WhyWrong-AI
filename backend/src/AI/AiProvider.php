<?php
declare(strict_types=1);

namespace WhyWrong\AI;

/**
 * AiProvider — the single interface for all AI work in WhyWrong.
 *
 * All AI calls go through an implementation of this interface.
 * NO controller or service should ever make an HTTP call to an
 * AI provider directly.
 *
 * BANNED: Anthropic / Claude. Use RulesEngineProvider, GeminiProvider,
 * GroqProvider, or MockProvider only.
 */
interface AiProvider
{
    /**
     * Human-readable name for this provider (shown in logs and health endpoint).
     */
    public function name(): string;

    /**
     * Returns true if this provider is currently usable.
     * The circuit breaker sets this to false during cool-down.
     */
    public function isAvailable(): bool;

    /**
     * Generate a JSON response for the given task.
     *
     * @param string $task   One of: diagnose | probe | remediate | report | candidates
     * @param array  $input  Anonymised input (no names, emails, or school details).
     *                       Student text must be wrapped in <<<STUDENT_ANSWER>>> delimiters
     *                       by the caller before passing here.
     * @param array  $schema JSON Schema array the response must conform to.
     *
     * @return array Decoded, schema-validated response.
     *               Always contains 'provider' => $this->name().
     *               MockProvider always includes 'is_demo' => true.
     *
     * @throws AiException if the provider is unavailable, times out,
     *                     or the output fails schema/evidence validation.
     */
    public function generateJson(string $task, array $input, array $schema): array;
}
