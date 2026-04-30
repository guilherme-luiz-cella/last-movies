export const MOVIE_TYPES = {
    MOVIE: "movie",
    SERIES: "series",
};

export const WATCHING_STATUSES = {
    PENDING: "pending",
    WATCHING: "watching",
    WATCHED: "watched",
};

export const TYPE_FILTERS = {
    ALL: "all",
    MOVIES: "movies",
    SERIES: "series",
};

export const STATUS_LABELS = {
    [WATCHING_STATUSES.PENDING]: "Para Assistir",
    [WATCHING_STATUSES.WATCHING]: "Assistindo",
    [WATCHING_STATUSES.WATCHED]: "Assistido",
};

export const STATUS_ICONS = {
    [WATCHING_STATUSES.PENDING]: "📋",
    [WATCHING_STATUSES.WATCHING]: "▶️",
    [WATCHING_STATUSES.WATCHED]: "✓",
};

const STATUS_FLOW = {
    [WATCHING_STATUSES.PENDING]: WATCHING_STATUSES.WATCHING,
    [WATCHING_STATUSES.WATCHING]: WATCHING_STATUSES.WATCHED,
    [WATCHING_STATUSES.WATCHED]: WATCHING_STATUSES.PENDING,
};

export class ValidationError extends Error {
    constructor(errors) {
        super("Invalid movie input");
        this.name = "ValidationError";
        this.errors = errors;
    }
}

export function nextWatchingStatus(status) {
    return STATUS_FLOW[status] ?? WATCHING_STATUSES.PENDING;
}

export function watchedAtFor(status, now = new Date()) {
    return status === WATCHING_STATUSES.WATCHED ? now.toISOString() : null;
}

export function typeFilterToMovieType(typeFilter) {
    if (typeFilter === TYPE_FILTERS.MOVIES) {
        return MOVIE_TYPES.MOVIE;
    }

    if (typeFilter === TYPE_FILTERS.SERIES) {
        return MOVIE_TYPES.SERIES;
    }

    return null;
}

export function typeLabel(type) {
    return type === MOVIE_TYPES.SERIES ? "Série" : "Filme";
}

export function normalizeMovieInput(input, now = new Date()) {
    const errors = [];
    const type = String(input.type ?? "").trim();
    const title = String(input.title ?? "").trim();
    const status = String(input.status || WATCHING_STATUSES.PENDING).trim();

    if (!Object.values(MOVIE_TYPES).includes(type)) {
        errors.push("Tipo deve ser filme ou série.");
    }

    if (title.length === 0 || title.length > 255) {
        errors.push("Título é obrigatório e deve ter no máximo 255 caracteres.");
    }

    if (!Object.values(WATCHING_STATUSES).includes(status)) {
        errors.push("Status inicial inválido.");
    }

    const seasons = optionalPositiveInteger(input.seasons, "Temporadas", errors);
    const episodes = optionalPositiveInteger(input.episodes, "Episódios", errors);
    const tmdbId = optionalInteger(input.tmdb_id, "TMDB ID", errors);

    if (errors.length > 0) {
        throw new ValidationError(errors);
    }

    return {
        type,
        title,
        status,
        tmdb_id: tmdbId,
        seasons: type === MOVIE_TYPES.SERIES ? seasons : null,
        episodes: type === MOVIE_TYPES.SERIES ? episodes : null,
        year: nullableString(input.year),
        imdb_id: nullableString(input.imdb_id),
        poster_url: nullableString(input.poster_url),
        overview: nullableString(input.overview),
        watched_at: watchedAtFor(status, now),
    };
}

function nullableString(value) {
    const normalized = String(value ?? "").trim();
    return normalized.length > 0 ? normalized : null;
}

function optionalInteger(value, label, errors) {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
        errors.push(`${label} deve ser um número inteiro.`);
        return null;
    }

    return parsed;
}

function optionalPositiveInteger(value, label, errors) {
    const parsed = optionalInteger(value, label, errors);
    if (parsed !== null && parsed < 1) {
        errors.push(`${label} deve ser maior que zero.`);
    }

    return parsed;
}
