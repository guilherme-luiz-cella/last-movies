<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TmdbService
{
    private ?string $bearerToken;

    private string $baseUrl;

    private string $imageBaseUrl;

    public function __construct()
    {
        $this->bearerToken = trim((string) config('services.tmdb.bearer_token'));
        $this->baseUrl = config('services.tmdb.base_url', 'https://api.themoviedb.org/3');
        $this->imageBaseUrl = config('services.tmdb.image_base_url', 'https://image.tmdb.org/t/p');
    }

    /**
     * Search for movies or TV series
     */
    public function search(string $query, string $type = 'movie', string $language = 'pt-BR'): array
    {
        if (empty($this->bearerToken)) {
            Log::warning('TMDB Bearer Token not configured');

            return [];
        }

        $mediaType = $type === 'series' ? 'tv' : 'movie';

        try {
            $response = Http::timeout(8)
                ->withToken($this->bearerToken)
                ->get("{$this->baseUrl}/search/{$mediaType}", [
                    'query' => $query,
                    'language' => $language,
                    'page' => 1,
                ]);

            if (! $response->ok()) {
                Log::error('TMDB Search failed with status: '.$response->status());

                return [];
            }

            $payload = $response->json();

            return collect($payload['results'] ?? [])
                ->take(6)
                ->map(function (array $item) use ($type) {
                    $title = $type === 'series'
                        ? ($item['name'] ?? $item['original_name'] ?? null)
                        : ($item['title'] ?? $item['original_title'] ?? null);

                    $year = null;
                    if ($type === 'series') {
                        $year = isset($item['first_air_date']) ? substr($item['first_air_date'], 0, 4) : null;
                    } else {
                        $year = isset($item['release_date']) ? substr($item['release_date'], 0, 4) : null;
                    }

                    $posterPath = $item['poster_path'] ?? null;
                    $poster = $posterPath ? "{$this->imageBaseUrl}/w500{$posterPath}" : null;

                    return [
                        'title' => $title,
                        'year' => $year,
                        'tmdb_id' => $item['id'] ?? null,
                        'type' => $type,
                        'poster' => $poster,
                        'overview' => $item['overview'] ?? null,
                    ];
                })
                ->filter(fn (array $item) => ! empty($item['title']))
                ->values()
                ->all();
        } catch (\Throwable $e) {
            Log::error('TMDB Search Error: '.$e->getMessage());

            return [];
        }
    }

    /**
     * Get detailed information about a movie or TV series
     */
    public function getDetails(int $tmdbId, string $type = 'movie', string $language = 'pt-BR'): ?array
    {
        if (empty($this->bearerToken)) {
            Log::warning('TMDB Bearer Token not configured');

            return null;
        }

        $mediaType = $type === 'series' ? 'tv' : 'movie';

        try {
            $response = Http::timeout(8)
                ->withToken($this->bearerToken)
                ->get("{$this->baseUrl}/{$mediaType}/{$tmdbId}", [
                    'language' => $language,
                ]);

            if (! $response->ok()) {
                Log::error('TMDB Details failed with status: '.$response->status());

                return null;
            }

            $data = $response->json();

            $title = $type === 'series'
                ? ($data['name'] ?? $data['original_name'] ?? null)
                : ($data['title'] ?? $data['original_title'] ?? null);

            $year = null;
            if ($type === 'series') {
                $year = isset($data['first_air_date']) ? substr($data['first_air_date'], 0, 4) : null;
            } else {
                $year = isset($data['release_date']) ? substr($data['release_date'], 0, 4) : null;
            }

            $posterPath = $data['poster_path'] ?? null;
            $poster = $posterPath ? "{$this->imageBaseUrl}/w500{$posterPath}" : null;

            $result = [
                'tmdb_id' => $data['id'] ?? null,
                'title' => $title,
                'year' => $year,
                'poster_url' => $poster,
                'overview' => $data['overview'] ?? null,
                'type' => $type,
            ];

            if ($type === 'series') {
                $result['seasons'] = $data['number_of_seasons'] ?? null;
                $result['episodes'] = $data['number_of_episodes'] ?? null;
            }

            return $result;
        } catch (\Throwable $e) {
            Log::error('TMDB Details Error: '.$e->getMessage());

            return null;
        }
    }
}
