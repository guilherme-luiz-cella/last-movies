import { describe, expect, it, vi } from "vitest";
import { OmdbClient } from "../src/infrastructure/omdbClient.js";

describe("OmdbClient", () => {
    it("maps successful OMDb search results into movie metadata", async () => {
        const fetcher = vi.fn().mockResolvedValue(jsonResponse({
            Response: "True",
            Search: [
                {
                    Title: "Heat",
                    Year: "1995",
                    imdbID: "tt0113277",
                    Poster: "https://image.test/heat.jpg",
                },
            ],
        }));
        const client = new OmdbClient({ apiKey: "key", fetcher });

        const results = await client.search("heat", "movie");

        expect(results).toEqual([
            {
                title: "Heat",
                year: "1995",
                imdb_id: "tt0113277",
                tmdb_id: null,
                type: "movie",
                poster: "https://image.test/heat.jpg",
                overview: null,
            },
        ]);
    });

    it("extracts the api key when the env value was pasted as a full OMDb URL", async () => {
        const fetcher = vi.fn().mockResolvedValue(jsonResponse({
            Response: "True",
            Search: [],
        }));
        const client = new OmdbClient({
            apiKey: "https://www.omdbapi.com/?i=tt3896198&apikey=abc123",
            fetcher,
        });

        await client.search("guardians", "movie");

        const calledUrl = fetcher.mock.calls[0][0];
        expect(calledUrl.searchParams.get("apikey")).toBe("abc123");
    });

    it("returns null details for missing keys or OMDb failures", async () => {
        const withoutKey = new OmdbClient({ fetcher: vi.fn() });
        expect(await withoutKey.getDetails({ imdb_id: "tt0113277" })).toBeNull();

        const failed = new OmdbClient({
            apiKey: "key",
            fetcher: vi.fn().mockResolvedValue(jsonResponse({ Response: "False" })),
        });
        expect(await failed.getDetails({ imdb_id: "tt0113277" })).toBeNull();
    });
});

function jsonResponse(payload) {
    return {
        ok: true,
        json: async () => payload,
    };
}
