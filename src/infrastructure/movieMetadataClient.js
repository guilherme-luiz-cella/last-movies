import { OmdbClient } from "./omdbClient.js";
import { TmdbClient } from "./tmdbClient.js";

export function makeMovieMetadataClient(env, fetcher = fetch) {
    if (env.TMDB_BEARER_TOKEN) {
        return new TmdbClient({
            bearerToken: env.TMDB_BEARER_TOKEN,
            fetcher,
        });
    }

    if (env.OMDB_API_KEY) {
        return new OmdbClient({
            apiKey: env.OMDB_API_KEY,
            fetcher,
        });
    }

    return new OmdbClient({ fetcher });
}
