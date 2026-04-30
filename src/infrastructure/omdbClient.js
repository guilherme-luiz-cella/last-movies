export class OmdbClient {
    constructor({ apiKey, fetcher = fetch, baseUrl } = {}) {
        this.apiKey = normalizeApiKey(apiKey);
        this.fetcher = fetcher;
        this.baseUrl = baseUrl ?? "https://www.omdbapi.com/";
    }

    async search(query, type = "movie") {
        if (!this.apiKey) {
            return [];
        }

        const url = new URL(this.baseUrl);
        url.searchParams.set("apikey", this.apiKey);
        url.searchParams.set("s", query);
        url.searchParams.set("type", type === "series" ? "series" : "movie");

        try {
            const response = await this.fetcher(url);
            if (!response.ok) {
                return [];
            }

            const payload = await response.json();
            if (payload.Response === "False") {
                return [];
            }

            return (payload.Search ?? []).slice(0, 6).map((item) => ({
                title: item.Title,
                year: item.Year,
                imdb_id: item.imdbID,
                tmdb_id: null,
                type,
                poster: item.Poster && item.Poster !== "N/A" ? item.Poster : null,
                overview: null,
            }));
        } catch {
            return [];
        }
    }

    async getDetails(movie, type = "movie") {
        if (!this.apiKey || !movie.imdb_id) {
            return null;
        }

        const url = new URL(this.baseUrl);
        url.searchParams.set("apikey", this.apiKey);
        url.searchParams.set("i", movie.imdb_id);
        url.searchParams.set("plot", "full");

        try {
            const response = await this.fetcher(url);
            if (!response.ok) {
                return null;
            }

            const payload = await response.json();
            if (payload.Response === "False") {
                return null;
            }

            return {
                imdb_id: payload.imdbID ?? movie.imdb_id,
                tmdb_id: null,
                title: payload.Title ?? null,
                year: payload.Year ?? null,
                poster_url: payload.Poster && payload.Poster !== "N/A" ? payload.Poster : null,
                overview: payload.Plot && payload.Plot !== "N/A" ? payload.Plot : null,
                type,
            };
        } catch {
            return null;
        }
    }
}

function normalizeApiKey(value) {
    const raw = String(value ?? "").trim();
    if (!raw) {
        return "";
    }

    try {
        const url = new URL(raw);
        return url.searchParams.get("apikey") ?? raw;
    } catch {
        return raw;
    }
}
