import { describe, expect, it } from "vitest";
import { OmdbClient } from "../src/infrastructure/omdbClient.js";
import { TmdbClient } from "../src/infrastructure/tmdbClient.js";
import { makeMovieMetadataClient } from "../src/infrastructure/movieMetadataClient.js";

describe("makeMovieMetadataClient", () => {
    it("prefers TMDB when TMDB_BEARER_TOKEN is configured", () => {
        const client = makeMovieMetadataClient({
            TMDB_BEARER_TOKEN: "tmdb-token",
            OMDB_API_KEY: "omdb-key",
        });

        expect(client).toBeInstanceOf(TmdbClient);
    });

    it("falls back to OMDb when TMDB_BEARER_TOKEN is missing", () => {
        const client = makeMovieMetadataClient({
            OMDB_API_KEY: "omdb-key",
        });

        expect(client).toBeInstanceOf(OmdbClient);
    });
});
