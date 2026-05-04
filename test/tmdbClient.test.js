import { describe, expect, it, vi } from "vitest";
import { TmdbClient } from "../src/infrastructure/tmdbClient.js";

describe("TmdbClient", () => {
    it("maps successful movie search results without leaking API shape to callers", async () => {
        const fetcher = vi.fn().mockResolvedValue(jsonResponse({
            results: [
                {
                    id: 1,
                    title: "Matrix",
                    release_date: "1999-03-31",
                    poster_path: "/matrix.jpg",
                    overview: "A hacker discovers reality.",
                },
            ],
        }));
        const client = new TmdbClient({ bearerToken: "token", fetcher });

        const results = await client.search("matrix", "movie", "en-US");

        expect(results).toEqual([
            {
                title: "Matrix",
                year: "1999",
                tmdb_id: 1,
                type: "movie",
                poster: "https://image.tmdb.org/t/p/w500/matrix.jpg",
                overview: "A hacker discovers reality.",
            },
        ]);
        expect(fetcher).toHaveBeenCalledOnce();
    });

    it("returns an empty result on missing token or failed TMDB response", async () => {
        const clientWithoutToken = new TmdbClient({ fetcher: vi.fn() });
        expect(await clientWithoutToken.search("matrix")).toEqual([]);

        const clientWithFailure = new TmdbClient({
            bearerToken: "token",
            fetcher: vi.fn().mockResolvedValue({ ok: false }),
        });
        expect(await clientWithFailure.search("matrix")).toEqual([]);
    });

    it("trims whitespace from bearer tokens", async () => {
        const fetcher = vi.fn().mockResolvedValue(jsonResponse({ results: [] }));
        const client = new TmdbClient({ bearerToken: " token ", fetcher });

        await client.search("matrix");

        expect(fetcher).toHaveBeenCalledWith(
            "https://api.themoviedb.org/3/search/movie?query=matrix&language=pt-BR&page=1",
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: "Bearer token",
                }),
            }),
        );
    });
});

function jsonResponse(payload) {
    return {
        ok: true,
        json: async () => payload,
    };
}
