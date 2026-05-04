import { describe, expect, it } from "vitest";
import { handleRequest } from "../src/interface/http/router.js";

describe("worker router", () => {
    it("renders the index page from D1 data", async () => {
        const response = await handleRequest(new Request("https://movies.test/"), {
            DB: fakeD1(),
        });

        const html = await response.text();

        expect(response.status).toBe(200);
        expect(html).toContain("Last Movies");
        expect(html).toContain("Heat");
    });

    it("returns JSON validation errors for invalid search input", async () => {
        const response = await handleRequest(new Request("https://movies.test/movies/search?q=a"), {
            DB: fakeD1(),
        });

        expect(response.status).toBe(422);
        await expect(response.json()).resolves.toEqual({
            errors: ["Busca deve ter entre 2 e 255 caracteres."],
        });
    });

    it("wraps the runtime fetch before searching movie metadata", async () => {
        const fetcher = async function () {
            if (this !== undefined) {
                throw new Error("fetch should be called without a bound this value");
            }

            return {
                ok: true,
                json: async () => ({
                    results: [
                        {
                            id: 603,
                            title: "Matrix",
                            release_date: "1999-03-31",
                            poster_path: "/matrix.jpg",
                            overview: "A hacker discovers reality.",
                        },
                    ],
                }),
            };
        };

        const response = await handleRequest(new Request("https://movies.test/movies/search?q=matrix"), {
            DB: fakeD1(),
            TMDB_BEARER_TOKEN: "token",
            fetcher,
        });

        await expect(response.json()).resolves.toEqual([
            {
                title: "Matrix",
                year: "1999",
                tmdb_id: 603,
                type: "movie",
                poster: "https://image.tmdb.org/t/p/w500/matrix.jpg",
                overview: "A hacker discovers reality.",
            },
        ]);
    });
});

function fakeD1() {
    const movie = {
        id: 1,
        type: "movie",
        title: "Heat",
        year: "1995",
        seasons: null,
        episodes: null,
        imdb_id: null,
        tmdb_id: 949,
        poster_url: null,
        overview: "A professional thief and detective collide.",
        status: "pending",
        watched_at: null,
        created_at: "2026-04-30T00:00:00.000Z",
        updated_at: "2026-04-30T00:00:00.000Z",
    };

    return {
        prepare(sql) {
            return {
                bind() {
                    return this;
                },
                async all() {
                    if (sql.includes("from movies")) {
                        return { results: [movie] };
                    }

                    return { results: [] };
                },
                async first() {
                    if (sql.includes("movies_count")) {
                        return { movies_count: 1, series_count: 0 };
                    }

                    if (sql.includes("count(*) as total")) {
                        return { total: 1, pending: 1, watching: 0, watched: 0 };
                    }

                    return movie;
                },
                async run() {
                    return { success: true };
                },
            };
        },
    };
}
