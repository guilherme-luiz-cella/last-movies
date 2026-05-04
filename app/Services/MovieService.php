<?php

namespace App\Services;

use App\Components\Enum\MovieTypeEnum;
use App\Components\Enum\StatusTypeEnum;
use App\Models\Movie;
use Illuminate\Support\Collection;

class MovieService
{
    public function __construct(private readonly TmdbService $tmdb) {}

    public function list(string $typeFilter, ?string $statusFilter): array
    {
        $normalizedTypeFilter = MovieTypeEnum::normalizeFilter($typeFilter);
        $type = MovieTypeEnum::typeFromFilter($normalizedTypeFilter);
        $status = StatusTypeEnum::normalize($statusFilter);

        $movies = Movie::query()
            ->latest()
            ->ofType($type)
            ->status($status)
            ->get();

        $statsQuery = Movie::query()->ofType($type);

        $stats = [
            'total' => (clone $statsQuery)->count(),
            'pending' => (clone $statsQuery)->pending()->count(),
            'watching' => (clone $statsQuery)->watching()->count(),
            'watched' => (clone $statsQuery)->watched()->count(),
            'movies_count' => Movie::movies()->count(),
            'series_count' => Movie::series()->count(),
        ];

        return [
            'movies' => $movies,
            'sections' => $this->sections($movies, $normalizedTypeFilter, $stats),
            'stats' => $stats,
            'typeFilter' => $normalizedTypeFilter,
        ];
    }

    public function create(array $validated, string $language): array
    {
        $type = $validated['type'];
        $status = $validated['status'] ?? StatusTypeEnum::PENDING;

        $movieData = [
            'type' => $type,
            'title' => $validated['title'],
            'status' => $status,
            'year' => null,
            'seasons' => $type === MovieTypeEnum::SERIES ? ($validated['seasons'] ?? null) : null,
            'episodes' => $type === MovieTypeEnum::SERIES ? ($validated['episodes'] ?? null) : null,
            'tmdb_id' => $validated['tmdb_id'] ?? null,
            'poster_url' => null,
            'overview' => null,
            'watched_at' => $status === StatusTypeEnum::WATCHED ? now() : null,
        ];

        if (! empty($validated['tmdb_id'])) {
            $existing = Movie::where('tmdb_id', $validated['tmdb_id'])
                ->where('type', $type)
                ->first();

            if ($existing) {
                return [
                    'created' => false,
                    'movie' => $existing,
                    'message' => 'Este título já está na sua lista!',
                ];
            }

            $details = $this->tmdb->getDetails((int) $validated['tmdb_id'], $type, $language);
            if ($details) {
                $movieData = $this->mergeDetails($movieData, $details);
            }
        }

        $movie = Movie::create($movieData);

        return [
            'created' => true,
            'movie' => $movie,
            'message' => $type === MovieTypeEnum::SERIES ? 'Série adicionada com sucesso!' : 'Filme adicionado com sucesso!',
        ];
    }

    private function sections(Collection $movies, string $typeFilter, array $stats): array
    {
        if ($typeFilter === MovieTypeEnum::FILTER_ALL) {
            return array_values(array_filter([
                $this->typedSection('Filmes', 'movie-section', $stats['movies_count'], $movies->where('type', MovieTypeEnum::MOVIE)),
                $this->typedSection('Séries', 'series-section', $stats['series_count'], $movies->where('type', MovieTypeEnum::SERIES)),
            ]));
        }

        return $this->statusSections($movies);
    }

    private function typedSection(string $title, string $class, int $count, Collection $movies): ?array
    {
        if ($movies->isEmpty()) {
            return null;
        }

        return [
            'title' => $title,
            'class' => $class,
            'count' => $count,
            'groups' => $this->statusSections($movies),
        ];
    }

    private function statusSections(Collection $movies): array
    {
        return array_values(array_filter(array_map(
            fn (array $status) => $this->statusSection($status, $movies),
            [
                [StatusTypeEnum::PENDING, 'Para Assistir', 'pending-section'],
                [StatusTypeEnum::WATCHING, 'Assistindo', 'watching-section'],
                [StatusTypeEnum::WATCHED, 'Já Assistidos', 'watched-section'],
            ],
        )));
    }

    private function statusSection(array $status, Collection $movies): ?array
    {
        [$value, $title, $class] = $status;
        $items = $movies->where('status', $value);

        if ($items->isEmpty()) {
            return null;
        }

        return [
            'title' => $title,
            'class' => $class,
            'movies' => $items,
        ];
    }

    private function mergeDetails(array $movieData, array $details): array
    {
        $movieData = array_merge($movieData, [
            'title' => $details['title'] ?? $movieData['title'],
            'year' => $details['year'] ?? null,
            'poster_url' => $details['poster_url'] ?? null,
            'overview' => $details['overview'] ?? null,
        ]);

        if ($movieData['type'] === MovieTypeEnum::SERIES && isset($details['seasons'])) {
            $movieData['seasons'] = $details['seasons'];
            $movieData['episodes'] = $details['episodes'] ?? null;
        }

        return $movieData;
    }
}
