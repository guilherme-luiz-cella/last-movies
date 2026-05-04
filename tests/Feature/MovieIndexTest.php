<?php

namespace Tests\Feature;

use App\Models\Movie;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MovieIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_default_index_lists_movies_and_series(): void
    {
        Movie::create([
            'type' => 'movie',
            'title' => 'Heat',
            'status' => 'pending',
        ]);
        Movie::create([
            'type' => 'series',
            'title' => 'Dark',
            'status' => 'watching',
        ]);

        $response = $this->get('/');

        $response
            ->assertOk()
            ->assertSee('Heat')
            ->assertSee('Dark')
            ->assertSee('Filmes')
            ->assertSee('Séries');
    }

    public function test_movies_filter_does_not_show_series(): void
    {
        Movie::create([
            'type' => 'movie',
            'title' => 'Heat',
            'status' => 'pending',
        ]);
        Movie::create([
            'type' => 'series',
            'title' => 'Dark',
            'status' => 'watching',
        ]);

        $response = $this->get('/?type=movies');

        $response
            ->assertOk()
            ->assertSee('Heat')
            ->assertDontSee('Dark');
    }

    public function test_invalid_type_filter_falls_back_to_all_titles(): void
    {
        Movie::create([
            'type' => 'movie',
            'title' => 'Heat',
            'status' => 'pending',
        ]);
        Movie::create([
            'type' => 'series',
            'title' => 'Dark',
            'status' => 'watching',
        ]);

        $response = $this->get('/?type=invalid');

        $response
            ->assertOk()
            ->assertSee('Heat')
            ->assertSee('Dark');
    }
}
