<?php
declare(strict_types=1);

namespace WhyWrong\Domain\Enums;

enum EvidenceStrength: string
{
    case LOW      = 'low';
    case MODERATE = 'moderate';
    case STRONG   = 'strong';

    public static function fromScore(float $score): self
    {
        if ($score >= 3.0) {
            return self::STRONG;
        }
        if ($score >= 1.5) {
            return self::MODERATE;
        }
        return self::LOW;
    }
}
