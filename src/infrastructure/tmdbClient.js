export class TmdbClient {
    constructor({ bearerToken, fetcher = fetch, baseUrl, imageBaseUrl } = {}) {
        this.bearerToken = String(bearerToken ?? "").trim();
        this.fetcher = fetcher;
        this.baseUrl = baseUrl ?? "https://api.themoviedb.org/3";
        this.imageBaseUrl = imageBaseUrl ?? "https://image.tmdb.org/t/p";
    }

    async search(query, type = "movie", language = "pt-BR") {
        if (!this.bearerToken) {
            return [];
        }

        const mediaType = type === "series" ? "tv" : "movie";
        const url = new URL(`${this.baseUrl}/search/${mediaType}`);
        url.searchParams.set("query", query);
        url.searchParams.set("language", language);
        url.searchParams.set("page", "1");

        try {
            const response = await this.fetcher(url.toString(), this.requestOptions());
            if (!response.ok) {
                console.warn("TMDB search failed.", { status: response.status });
                return [];
            }

            const payload = await response.json();
            return (payload.results ?? [])
                .slice(0, 6)
                .map((item) => this.mapSearchResult(item, type))
                .filter((item) => item.title);
        } catch (error) {
            console.warn("TMDB search request failed.", { message: error?.message });
            return [];
        }
    }

    async getDetails(movie, type = "movie", language = "pt-BR") {
        if (!this.bearerToken) {
            return null;
        }

        const tmdbId = typeof movie === "object" ? movie.tmdb_id : movie;
        if (!tmdbId) {
            return null;
        }

        const mediaType = type === "series" ? "tv" : "movie";
        const url = new URL(`${this.baseUrl}/${mediaType}/${tmdbId}`);
        url.searchParams.set("language", language);

        try {
            const response = await this.fetcher(url.toString(), this.requestOptions());
            if (!response.ok) {
                console.warn("TMDB details failed.", { status: response.status });
                return null;
            }

            return this.mapDetails(await response.json(), type);
        } catch (error) {
            console.warn("TMDB details request failed.", { message: error?.message });
            return null;
        }
    }

    requestOptions() {
        return {
            headers: {
                Authorization: `Bearer ${this.bearerToken}`,
                Accept: "application/json",
            },
        };
    }

    mapSearchResult(item, type) {
        const title = type === "series" ? (item.name ?? item.original_name) : (item.title ?? item.original_title);
        const date = type === "series" ? item.first_air_date : item.release_date;

        return {
            title,
            year: date ? String(date).slice(0, 4) : null,
            tmdb_id: item.id ?? null,
            type,
            poster: this.posterUrl(item.poster_path),
            overview: item.overview ?? null,
        };
    }

    mapDetails(item, type) {
        const title = type === "series" ? (item.name ?? item.original_name) : (item.title ?? item.original_title);
        const date = type === "series" ? item.first_air_date : item.release_date;
        const details = {
            tmdb_id: item.id ?? null,
            title,
            year: date ? String(date).slice(0, 4) : null,
            poster_url: this.posterUrl(item.poster_path),
            overview: item.overview ?? null,
            type,
        };

        if (type === "series") {
            details.seasons = item.number_of_seasons ?? null;
            details.episodes = item.number_of_episodes ?? null;
        }

        return details;
    }

    posterUrl(path) {
        return path ? `${this.imageBaseUrl}/w500${path}` : null;
    }
}
