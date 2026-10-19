<?php
declare(strict_types=1);

namespace WhyWrong\Domain\Enums;

enum DiagnosisState: string
{
    case SUSPECTED = 'suspected';
    case PROBING   = 'probing';
    case CONFIRMED = 'confirmed';
    case REJECTED  = 'rejected';
    case UNCLEAR   = 'unclear';
    case RESOLVED  = 'resolved';
}
