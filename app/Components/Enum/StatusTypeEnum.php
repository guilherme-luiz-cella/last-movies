<?php

namespace App\Components\Enum;

final class StatusTypeEnum
{
    public const PENDING = 'pending';

    public const WATCHING = 'watching';

    public const WATCHED = 'watched';

    public static function values(): array
    {
        return [self::PENDING, self::WATCHING, self::WATCHED];
    }

    public static function normalize(?string $value): ?string
    {
        return in_array($value, self::values(), true) ? $value : null;
    }

    public static function label(string $status): string
    {
        return match ($status) {
            self::WATCHING => 'Assistindo',
            self::WATCHED => 'Assistido',
            default => 'Para Assistir',
        };
    }

    public static function icon(string $status): string
    {
        return match ($status) {
            self::WATCHING => '▶',
            self::WATCHED => '✓',
            default => '+',
        };
    }

    public static function next(string $status): string
    {
        return match ($status) {
            self::PENDING => self::WATCHING,
            self::WATCHING => self::WATCHED,
            default => self::PENDING,
        };
    }
}
