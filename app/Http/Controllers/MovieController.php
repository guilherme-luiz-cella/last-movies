<?php

namespace App\Http\Controllers;

use App\Components\Enum\MovieTypeEnum;
use App\Components\Enum\StatusTypeEnum;
use App\Models\Movie;
use App\Services\MovieService;
use App\Services\TmdbService;
use Illuminate\Http\Request;

class MovieController extends Controller
{
    public function __construct(
        protected TmdbService $tmdb,
        protected MovieService $movies,
    ) {}

    public function index(Request $request)
    {
        return view('movies.index', $this->movies->list(
            $request->input('type', MovieTypeEnum::FILTER_ALL),
            $request->input('filter'),
        ));
    }

    public function create()
    {
        return view('movies.create');
    }

    public function show(Movie $movie)
    {
        return view('movies.show', compact('movie'));
    }

    public function search(Request $request)
    {
        $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:255'],
            'type' => ['nullable', 'in:'.implode(',', MovieTypeEnum::values())],
            'language' => ['nullable', 'in:pt-BR,en-US'],
        ]);

        $query = $request->string('q')->toString();
        $type = $request->input('type', 'movie');
        $language = $request->input('language', 'pt-BR');

        $results = $this->tmdb->search($query, $type, $language);

        return response()->json($results);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'in:'.implode(',', MovieTypeEnum::values())],
            'title' => ['required', 'string', 'max:255'],
            'status' => ['nullable', 'in:'.implode(',', StatusTypeEnum::values())],
            'tmdb_id' => ['nullable', 'integer'],
            'seasons' => ['nullable', 'integer', 'min:1'],
            'episodes' => ['nullable', 'integer', 'min:1'],
        ]);

        $result = $this->movies->create($validated, $request->input('language', 'pt-BR'));

        return redirect()
            ->route('movies.index', ['type' => $result['movie']->type === 'series' ? 'series' : 'movies'])
            ->with('status', $result['message']);
    }

    public function toggleStatus(Movie $movie)
    {
        $newStatus = StatusTypeEnum::next($movie->status);

        $movie->update([
            'status' => $newStatus,
            'watched_at' => $newStatus === 'watched' ? now() : null,
        ]);

        return redirect()->route('movies.index');
    }

    public function destroy(Movie $movie)
    {
        $type = $movie->type;
        $movie->delete();

        $message = $type === 'movie' ? 'Filme removido com sucesso!' : 'Série removida com sucesso!';

        return redirect()
            ->route('movies.index')
            ->with('status', $message);
    }
}
