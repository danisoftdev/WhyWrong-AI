<?php
declare(strict_types=1);

namespace WhyWrong\Domain\Enums;

enum Role: string
{
    case STUDENT = 'student';
    case TEACHER = 'teacher';
    case PARENT  = 'parent';
    case ADMIN   = 'admin';
    case VISITOR = 'visitor';

    public static function all(): array
    {
        return array_map(fn($r) => $r->value, self::cases());
    }

    public static function isValid(string $role): bool
    {
        return self::tryFrom($role) !== null;
    }
}
