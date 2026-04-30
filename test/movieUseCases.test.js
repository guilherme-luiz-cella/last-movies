import { describe, expect, it, vi } from "vitest";
import {
    createMovie,
    deleteMovie,
    listMovies,
    searchTmdb,
    toggleMovieStatus,
} from "../src/application/movieUseCases.js";
import { normalizeMovieInput, ValidationError } from "../src/domain/movie.js";

describe("movie domain rules", () => {
    it("normalizes valid series input", () => {
        const input = normalizeMovieInput({
            type: "series",
            title: "Dark",
            status: "watched",
            seasons: "3",
            episodes: "26",
        }, new Date("2026-04-30T12:00:00.000Z"));

        expect(input).toMatchObject({
            type: "series",
            title: "Dark",
            status: "watched",
            seasons: 3,
            episodes: 26,
            watched_at: "2026-04-30T12:00:00.000Z",
        });
    });

    it("rejects invalid type, title, and numeric fields", () => {
        expect(() => normalizeMovieInput({
            type: "book",
            title: "",
            seasons: "0",
            episodes: "abc",
        })).toThrow(ValidationError);
    });
});

describe("movie application use cases", () => {
    it("lists movies with scoped stats", async () => {
        const repository = {
            list: vi.fn().mockResolvedValue([{ id: 1, title: "Heat" }]),
            stats: vi.fn().mockResolvedValue({ total: 1, pending: 1 }),
        };

        const result = await listMovies(repository, { type: "movies" });

        expect(repository.list).toHaveBeenCalledWith({ type: "movie", status: null });
        expect(repository.stats).toHaveBeenCalledWith({ type: "movie" });
        expect(result.movies).toHaveLength(1);
    });

    it("creates a movie with TMDB details when a TMDB ID is provided", async () => {
        const repository = fakeRepository();
        repository.findByTmdbId.mockResolvedValue(null);
        repository.create.mockImplementation(async (movie) => ({ id: 10, ...movie }));
        const tmdbClient = {
            getDetails: vi.fn().mockResolvedValue({
                title: "Dune: Part Two",
                year: "2024",
                poster_url: "https://image.test/dune.jpg",
                overview: "Paul returns.",
            }),
        };

        const result = await createMovie(repository, tmdbClient, {
            type: "movie",
            title: "Dune 2",
            status: "pending",
            tmdb_id: "693134",
            language: "en-US",
        });

        expect(result.created).toBe(true);
        expect(tmdbClient.getDetails).toHaveBeenCalledWith(expect.objectContaining({ tmdb_id: 693134 }), "movie", "en-US");
        expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
            title: "Dune: Part Two",
            year: "2024",
            poster_url: "https://image.test/dune.jpg",
        }));
    });

    it("does not create a duplicate TMDB title", async () => {
        const existing = { id: 5, type: "movie", title: "Heat", tmdb_id: 949 };
        const repository = fakeRepository();
        repository.findByTmdbId.mockResolvedValue(existing);

        const result = await createMovie(repository, { getDetails: vi.fn() }, {
            type: "movie",
            title: "Heat",
            tmdb_id: "949",
        });

        expect(result).toMatchObject({ created: false, reason: "duplicate", movie: existing });
        expect(repository.create).not.toHaveBeenCalled();
    });

    it("cycles status and clears watched date when watched goes back to pending", async () => {
        const repository = fakeRepository();
        repository.findById.mockResolvedValue({ id: 7, status: "watched" });
        repository.updateStatus.mockResolvedValue({ id: 7, status: "pending", watched_at: null });

        const result = await toggleMovieStatus(repository, 7);

        expect(repository.updateStatus).toHaveBeenCalledWith(7, { status: "pending", watched_at: null });
        expect(result.status).toBe("pending");
    });

    it("deletes an existing movie and returns the user message", async () => {
        const repository = fakeRepository();
        repository.findById.mockResolvedValue({ id: 3, type: "series", title: "Dark" });

        const result = await deleteMovie(repository, 3);

        expect(repository.delete).toHaveBeenCalledWith(3);
        expect(result.message).toBe("Série removida com sucesso!");
    });

    it("rejects TMDB searches shorter than two characters", async () => {
        await expect(searchTmdb({ search: vi.fn() }, { q: "a" })).rejects.toThrow(ValidationError);
    });
});

function fakeRepository() {
    return {
        list: vi.fn(),
        stats: vi.fn(),
        findById: vi.fn(),
        findByTmdbId: vi.fn(),
        findByImdbId: vi.fn(),
        create: vi.fn(),
        updateStatus: vi.fn(),
        delete: vi.fn(),
    };
}
