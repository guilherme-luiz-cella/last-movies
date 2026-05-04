import {
    createMovie,
    deleteMovie,
    getMovie,
    listMovies,
    searchTmdb,
    toggleMovieStatus,
} from "../../application/movieUseCases.js";
import { ValidationError } from "../../domain/movie.js";
import { D1MovieRepository } from "../../infrastructure/d1MovieRepository.js";
import { makeMovieMetadataClient } from "../../infrastructure/movieMetadataClient.js";
import { APP_CSS, APP_JS } from "../views/assets.generated.js";
import {
    htmlResponse,
    jsonResponse,
    redirect,
    renderCreatePage,
    renderIndexPage,
    renderShowPage,
} from "../views/html.js";

export async function handleRequest(request, env) {
    const url = new URL(request.url);
    const method = request.method === "HEAD" ? "GET" : request.method;
    const repository = new D1MovieRepository(env.DB);
    const runtimeFetch = env.fetcher ?? fetch;
    const fetcher = (...args) => runtimeFetch(...args);
    const metadataClient = () => makeMovieMetadataClient(env, fetcher);

    try {
        if (method === "GET" && isAsset(url) && env.ASSETS) {
            return env.ASSETS.fetch(request);
        }

        if (method === "GET" && url.pathname === "/build/assets/app.css") {
            return new Response(APP_CSS, { headers: { "content-type": "text/css; charset=utf-8" } });
        }

        if (method === "GET" && url.pathname === "/build/assets/app.js") {
            return new Response(APP_JS, { headers: { "content-type": "application/javascript; charset=utf-8" } });
        }

        if (method === "GET" && url.pathname === "/") {
            const typeFilter = url.searchParams.get("type") || "all";
            const statusFilter = url.searchParams.get("filter") || null;
            const result = await listMovies(repository, { type: typeFilter, status: statusFilter });

            return htmlResponse(
                renderIndexPage({
                    ...result,
                    statusFilter,
                    typeFilter,
                    statusMessage: url.searchParams.get("status"),
                }),
            );
        }

        if (method === "GET" && url.pathname === "/movies/create") {
            return htmlResponse(renderCreatePage());
        }

        if (method === "GET" && url.pathname === "/movies/search") {
            const results = await searchTmdb(metadataClient(), Object.fromEntries(url.searchParams));
            return jsonResponse(results);
        }

        if (method === "POST" && url.pathname === "/movies") {
            const input = await readForm(request);
            const result = await createMovie(repository, metadataClient(), input);
            const typeFilter = result.movie.type === "series" ? "series" : "movies";

            return redirect(`/?type=${typeFilter}`, result.message);
        }

        const movieRoute = matchMovieAction(url.pathname);
        if (movieRoute && method === "GET" && movieRoute.action === "show") {
            return htmlResponse(renderShowPage(await getMovie(repository, movieRoute.id)));
        }

        if (movieRoute && method === "POST" && movieRoute.action === "toggle-status") {
            await toggleMovieStatus(repository, movieRoute.id);
            return redirect("/");
        }

        if (movieRoute && method === "POST" && movieRoute.action === "delete") {
            const result = await deleteMovie(repository, movieRoute.id);
            return redirect("/", result.message);
        }

        if (env.ASSETS) {
            return env.ASSETS.fetch(request);
        }

        return new Response("Not found", { status: 404 });
    } catch (error) {
        if (error instanceof ValidationError) {
            if (method === "POST") {
                return htmlResponse(renderCreatePage({ errors: error.errors }), 422);
            }

            return jsonResponse({ errors: error.errors }, 422);
        }

        if (error instanceof Response) {
            return error;
        }

        console.error(error);
        return new Response("Internal server error", { status: 500 });
    }
}

async function readForm(request) {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
        return request.json();
    }

    const form = await request.formData();
    return Object.fromEntries(form.entries());
}

function matchMovieAction(pathname) {
    const match = pathname.match(/^\/movies\/(\d+)(?:\/([a-z-]+))?$/);
    if (!match) {
        return null;
    }

    return {
        id: Number(match[1]),
        action: match[2] ?? "show",
    };
}

function isAsset(url) {
    return url.pathname.startsWith("/build/") || url.pathname === "/favicon.ico" || url.pathname === "/robots.txt";
}
