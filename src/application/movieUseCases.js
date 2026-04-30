import {
    normalizeMovieInput,
    nextWatchingStatus,
    typeFilterToMovieType,
    ValidationError,
    watchedAtFor,
} from "../domain/movie.js";

export async function listMovies(repository, filters = {}) {
    const movieType = typeFilterToMovieType(filters.type ?? "all");
    const status = filters.status || null;
    const movies = await repository.list({ type: movieType, status });
    const stats = await repository.stats({ type: movieType });

    return { movies, stats };
}

export async function getMovie(repository, id) {
    const movie = await repository.findById(id);

    if (!movie) {
        throw new Response("Not found", { status: 404 });
    }

    return movie;
}

export async function createMovie(repository, tmdbClient, input, now = new Date()) {
    let movieData = normalizeMovieInput(input, now);

    if (movieData.tmdb_id !== null || movieData.imdb_id !== null) {
        const existing = movieData.tmdb_id !== null
            ? await repository.findByTmdbId(movieData.tmdb_id, movieData.type)
            : await repository.findByImdbId(movieData.imdb_id, movieData.type);

        if (existing) {
            return {
                created: false,
                reason: "duplicate",
                movie: existing,
                message: "Este título já está na sua lista!",
            };
        }

        const details = await tmdbClient.getDetails(movieData, movieData.type, input.language);
        if (details) {
            movieData = mergeTmdbDetails(movieData, details);
        }
    }

    const movie = await repository.create(movieData);
    const message = movie.type === "series" ? "Série adicionada com sucesso!" : "Filme adicionado com sucesso!";

    return { created: true, movie, message };
}

export async function toggleMovieStatus(repository, id, now = new Date()) {
    const movie = await getMovie(repository, id);
    const status = nextWatchingStatus(movie.status);

    return repository.updateStatus(movie.id, {
        status,
        watched_at: watchedAtFor(status, now),
    });
}

export async function deleteMovie(repository, id) {
    const movie = await getMovie(repository, id);
    await repository.delete(movie.id);

    return {
        movie,
        message: movie.type === "series" ? "Série removida com sucesso!" : "Filme removido com sucesso!",
    };
}

export async function searchTmdb(tmdbClient, input) {
    const query = String(input.q ?? "").trim();

    if (query.length < 2 || query.length > 255) {
        throw new ValidationError(["Busca deve ter entre 2 e 255 caracteres."]);
    }

    return tmdbClient.search(query, input.type || "movie", input.language || "pt-BR");
}

function mergeTmdbDetails(movieData, details) {
    return {
        ...movieData,
        title: details.title ?? movieData.title,
        year: details.year ?? movieData.year,
        imdb_id: details.imdb_id ?? movieData.imdb_id,
        tmdb_id: details.tmdb_id ?? movieData.tmdb_id,
        poster_url: details.poster_url ?? movieData.poster_url,
        overview: details.overview ?? movieData.overview,
        seasons: movieData.type === "series" ? (details.seasons ?? movieData.seasons) : null,
        episodes: movieData.type === "series" ? (details.episodes ?? movieData.episodes) : null,
    };
}
