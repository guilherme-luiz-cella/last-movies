<?php

namespace App\Components\Enum;

final class MovieTypeEnum
{
    public const MOVIE = 'movie';

    public const SERIES = 'series';

    public const FILTER_ALL = 'all';

    public const FILTER_MOVIES = 'movies';

    public const FILTER_SERIES = 'series';

    public static function values(): array
    {
        return [self::MOVIE, self::SERIES];
    }

    public static function filters(): array
    {
        return [self::FILTER_ALL, self::FILTER_MOVIES, self::FILTER_SERIES];
    }

    public static function normalizeFilter(?string $filter): string
    {
        return in_array($filter, self::filters(), true) ? $filter : self::FILTER_ALL;
    }

    public static function typeFromFilter(string $filter): ?string
    {
        return match (self::normalizeFilter($filter)) {
            self::FILTER_MOVIES => self::MOVIE,
            self::FILTER_SERIES => self::SERIES,
            default => null,
        };
    }

    public static function isMovie(string $type): bool
    {
        return $type === self::MOVIE;
    }

    public static function label(string $type): string
    {
        return $type === self::SERIES ? 'Série' : 'Filme';
    }
}
