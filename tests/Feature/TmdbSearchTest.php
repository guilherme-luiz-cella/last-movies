<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TmdbSearchTest extends TestCase
{
    public function test_search_returns_tmdb_results_with_trimmed_bearer_token(): void
    {
        config(['services.tmdb.bearer_token' => ' test-token ']);

        Http::fake([
            'api.themoviedb.org/3/search/movie*' => Http::response([
                'results' => [
                    [
                        'id' => 603,
                        'title' => 'Matrix',
                        'release_date' => '1999-03-31',
                        'poster_path' => '/matrix.jpg',
                        'overview' => 'A hacker discovers the truth.',
                    ],
                ],
            ]),
        ]);

        $response = $this->getJson('/movies/search?q=matrix&type=movie&language=pt-BR');

        $response
            ->assertOk()
            ->assertJsonPath('0.title', 'Matrix')
            ->assertJsonPath('0.tmdb_id', 603)
            ->assertJsonPath('0.poster', 'https://image.tmdb.org/t/p/w500/matrix.jpg');

        Http::assertSent(fn ($request) => $request->hasHeader('Authorization', 'Bearer test-token'));
    }

    public function test_search_rejects_too_short_query(): void
    {
        $response = $this->getJson('/movies/search?q=a&type=movie');

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['q']);

        Http::assertNothingSent();
    }
}
