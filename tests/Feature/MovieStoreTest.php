<?php

namespace Tests\Feature;

use App\Models\Movie;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MovieStoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_creates_movie_without_external_details(): void
    {
        $response = $this->post('/movies', [
            'type' => 'movie',
            'title' => 'Heat',
            'status' => 'pending',
        ]);

        $response
            ->assertRedirect('/?type=movies')
            ->assertSessionHas('status', 'Filme adicionado com sucesso!');

        $this->assertDatabaseHas('movies', [
            'type' => 'movie',
            'title' => 'Heat',
            'status' => 'pending',
        ]);
    }

    public function test_store_rejects_invalid_type(): void
    {
        $response = $this->from('/movies/create')->post('/movies', [
            'type' => 'invalid',
            'title' => 'Heat',
            'status' => 'pending',
        ]);

        $response
            ->assertRedirect('/movies/create')
            ->assertSessionHasErrors('type');

        $this->assertDatabaseCount('movies', 0);
    }

    public function test_store_does_not_duplicate_existing_tmdb_title(): void
    {
        config(['services.tmdb.bearer_token' => 'test-token']);
        Http::fake();

        Movie::create([
            'type' => 'movie',
            'title' => 'Heat',
            'status' => 'pending',
            'tmdb_id' => 949,
        ]);

        $response = $this->post('/movies', [
            'type' => 'movie',
            'title' => 'Heat',
            'status' => 'pending',
            'tmdb_id' => 949,
        ]);

        $response
            ->assertRedirect('/?type=movies')
            ->assertSessionHas('status', 'Este título já está na sua lista!');

        $this->assertDatabaseCount('movies', 1);
        Http::assertNothingSent();
    }
}
