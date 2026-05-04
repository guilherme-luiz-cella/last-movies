import { OmdbClient } from "./omdbClient.js";
import { TmdbClient } from "./tmdbClient.js";

export function makeMovieMetadataClient(env, fetcher = fetch) {
    const tmdbBearerToken = String(env.TMDB_BEARER_TOKEN ?? "").trim();

    if (tmdbBearerToken) {
        return new TmdbClient({
            bearerToken: tmdbBearerToken,
            fetcher,
        });
    }

    if (env.OMDB_API_KEY) {
        return new OmdbClient({
            apiKey: env.OMDB_API_KEY,
            fetcher,
        });
    }

    console.warn("Movie metadata provider is not configured.");

    return new OmdbClient({ fetcher });
}
