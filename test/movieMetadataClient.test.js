import { describe, expect, it, vi } from "vitest";
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

    it("trims TMDB_BEARER_TOKEN before creating the TMDB client", async () => {
        const fetcher = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ results: [] }),
        });
        const client = makeMovieMetadataClient({
            TMDB_BEARER_TOKEN: " tmdb-token ",
        }, fetcher);

        await client.search("matrix");

        expect(fetcher).toHaveBeenCalledWith(
            "https://api.themoviedb.org/3/search/movie?query=matrix&language=pt-BR&page=1",
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: "Bearer tmdb-token",
                }),
            }),
        );
    });

    it("falls back to OMDb when TMDB_BEARER_TOKEN is missing", () => {
        const client = makeMovieMetadataClient({
            OMDB_API_KEY: "omdb-key",
        });

        expect(client).toBeInstanceOf(OmdbClient);
    });
});
