import { STATUS_LABELS, typeLabel, WATCHING_STATUSES } from "../../domain/movie.js";

export function renderIndexPage({ movies, stats, typeFilter, statusFilter = null, statusMessage }) {
    const heroMovie = movies[0] ?? null;
    const progress = stats.total > 0 ? Math.round((stats.watched / stats.total) * 100) : 0;

    return layout({
        title: "Meus Filmes",
        description: "Organize seus filmes para assistir e acompanhe o que já assistiu",
        body: `
            ${header({ typeFilter })}
            <section class="hero-section relative">
                <div class="hero-overlay-left"></div>
                <div class="hero-overlay-bottom"></div>
                ${
                    heroMovie?.poster_url
                        ? `<img src="${escapeHtml(heroMovie.poster_url)}" alt="${escapeHtml(heroMovie.title)}" class="hero-image">`
                        : `<div class="hero-gradient-bg h-full w-full"></div>`
                }
                <div class="absolute inset-0 flex items-center">
                    <div class="container-netflix">
                        <div class="hero-copy max-w-2xl pt-24">
                            ${
                                heroMovie
                                    ? `
                                        <div class="hero-kicker mb-5">${heroMovie.type === "series" ? "Série em destaque" : "Filme em destaque"}${heroMovie.year ? ` <span>${escapeHtml(heroMovie.year)}</span>` : ""}</div>
                                        <h2 class="mb-5 text-5xl font-black leading-none sm:text-6xl lg:text-7xl">${escapeHtml(heroMovie.title)}</h2>
                                        ${heroMovie.overview ? `<p class="mb-7 line-clamp-3 max-w-xl text-base leading-7 text-zinc-200 sm:text-lg">${escapeHtml(heroMovie.overview)}</p>` : ""}
                                        <div class="flex flex-wrap gap-3">
                                            ${postButton(`/movies/${heroMovie.id}/toggle-status`, heroMovie.status === WATCHING_STATUSES.WATCHED ? "Assistido" : "Assistir", "flex min-h-11 items-center gap-2 rounded-md bg-white px-6 py-3 font-bold text-black transition hover:bg-zinc-200")}
                                            <a href="/movies/${heroMovie.id}" class="btn-secondary flex items-center gap-2 px-6 py-3 font-bold">Mais informações</a>
                                        </div>
                                    `
                                    : `
                                        <div class="hero-kicker mb-5">Sua watchlist pessoal</div>
                                        <h2 class="mb-5 text-5xl font-black leading-none sm:text-6xl lg:text-7xl">Monte sua fila perfeita</h2>
                                        <p class="mb-7 max-w-xl text-lg leading-7 text-zinc-300">Adicione filmes e séries, acompanhe o status e encontre tudo com pôster, sinopse e dados automáticos.</p>
                                        <a href="/movies/create" class="btn-primary inline-flex items-center gap-2 px-6 py-3 font-bold">Adicionar Título</a>
                                    `
                            }
                        </div>
                    </div>
                </div>
            </section>
            <section class="stats-bar">
                <div class="container-netflix">
                    <div class="stats-panel grid grid-cols-2 overflow-hidden sm:grid-cols-5">
                        ${stat(stats.total, typeFilter === "movies" ? "Filmes" : typeFilter === "series" ? "Séries" : "Total")}
                        ${stat(stats.pending, "Para Assistir")}
                        ${stat(stats.watching, "Assistindo")}
                        ${stat(stats.watched, "Já Assistidos")}
                        ${typeFilter === "all" ? stat(stats.series_count, "Séries") : stat(`${progress}%`, "Progresso")}
                    </div>
                </div>
            </section>
            ${
                statusMessage
                    ? `<div class="container-netflix py-4"><div class="alert-success">${escapeHtml(statusMessage)}</div></div>`
                    : ""
            }
            <main class="container-netflix pb-12 pt-8">
                ${filterBar(typeFilter, statusFilter)}
                ${renderMovieSections(movies, stats, typeFilter)}
                ${movies.length === 0 ? emptyState(typeFilter) : ""}
            </main>
            ${footer()}
        `,
    });
}

export function renderCreatePage({ errors = [] } = {}) {
    return layout({
        title: "Adicionar Filme",
        description: "Adicione um novo filme à sua lista",
        body: `
            ${simpleHeader()}
            <main class="form-shell">
                <div class="container-netflix grid gap-10 py-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:py-16">
                    <div class="pt-4 lg:pt-12">
                        <div class="eyebrow mb-5">Adicionar título</div>
                        <h2 class="max-w-xl text-4xl font-black leading-tight sm:text-5xl">Busque, escolha e salve em poucos segundos.</h2>
                        <p class="mt-5 max-w-lg text-base leading-7 text-zinc-400">A busca preenche pôster, ano e sinopse automaticamente. Depois você só escolhe o status inicial da sua watchlist.</p>
                        <div class="info-panel mt-8 rounded-xl p-5">
                            <p class="text-sm font-bold text-white">Dica de fluxo</p>
                            <p class="mt-2 text-sm leading-6 text-zinc-400">Digite ao menos duas letras, selecione uma sugestão e deixe os metadados virem do TMDB.</p>
                        </div>
                    </div>
                    <div>
                    ${errors.length > 0 ? errorList(errors) : ""}
                    <div class="form-card overflow-hidden rounded-xl">
                        <form action="/movies" method="POST" class="p-6 sm:p-8" id="movieForm">
                            <div class="mb-6">
                                <label class="mb-2 block text-sm font-semibold text-gray-300">Tipo</label>
                                <div class="grid grid-cols-2 gap-3">
                                    ${typeRadio("movie", "01", "Filme", true)}
                                    ${typeRadio("series", "02", "Série", false)}
                                </div>
                            </div>
                            <div class="mb-6">
                                <label for="language" class="mb-2 block text-sm font-semibold text-gray-300">Idioma de Busca</label>
                                <select id="language" name="language" class="input-field w-full rounded-lg px-4 py-3 text-white outline-none">
                                    <option value="pt-BR" selected>Português (Brasil)</option>
                                    <option value="en-US">English (USA)</option>
                                </select>
                            </div>
                            <div class="mb-6">
                                <label for="title" class="mb-2 block text-sm font-semibold text-gray-300">Título <span id="titleType">do Filme</span></label>
                                <div class="relative">
                                    <input type="text" id="title" name="title" placeholder="Ex: Interestelar, Matrix, Duna..." required autocomplete="off" class="input-field w-full rounded-lg px-4 py-3 text-white outline-none">
                                    <div id="searchLoader" class="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 text-red-500">...</div>
                                </div>
                                <div id="suggestions" class="suggestions-container mt-2 hidden overflow-hidden rounded-lg border border-gray-700 bg-zinc-950 shadow-2xl"></div>
                            </div>
                            <div id="seriesFields" class="mb-6 hidden space-y-4">
                                <div class="grid grid-cols-2 gap-4">
                                    ${numberInput("seasons", "Temporadas", "Ex: 3")}
                                    ${numberInput("episodes", "Episódios (Total)", "Ex: 24")}
                                </div>
                            </div>
                            <div class="mb-8">
                                <label for="status" class="mb-2 block text-sm font-semibold text-gray-300">Status Inicial</label>
                                <select id="status" name="status" class="input-field w-full rounded-lg px-4 py-3 text-white outline-none">
                                    <option value="pending">Para Assistir</option>
                                    <option value="watching">Assistindo</option>
                                    <option value="watched">Já Assistido</option>
                                </select>
                            </div>
                            <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <a href="/" class="btn-ghost inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold">Cancelar</a>
                                <button type="submit" class="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold"><span id="submitText">Adicionar Filme</span></button>
                            </div>
                        </form>
                    </div>
                    </div>
                </div>
            </main>
        `,
    });
}

export function renderShowPage(movie) {
    return layout({
        title: movie.title,
        description: movie.overview ?? "Detalhes do filme",
        body: `
            ${simpleHeader()}
            <section class="detail-hero relative">
                <div class="absolute inset-0">
                    ${
                        movie.poster_url
                            ? `<img src="${escapeHtml(movie.poster_url)}" alt="${escapeHtml(movie.title)}" class="detail-backdrop h-full w-full object-cover object-center">`
                            : `<div class="h-full w-full bg-gradient-to-br from-zinc-900 to-black"></div>`
                    }
                    <div class="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20"></div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                </div>
                <div class="relative flex h-full items-end">
                    <div class="container-netflix pb-16">
                        <div class="max-w-2xl">
                            <div class="mb-4 flex items-center gap-3">
                                <span class="eyebrow">${typeLabel(movie.type)}</span>
                                <span class="eyebrow">${statusLabel(movie.status)}</span>
                            </div>
                            <h1 class="mb-5 text-5xl font-black leading-none sm:text-6xl lg:text-7xl">${escapeHtml(movie.title)}</h1>
                            <div class="mb-6 flex flex-wrap items-center gap-3 text-base text-gray-300">${movieFacts(movie)}</div>
                            ${movie.overview ? `<p class="mb-8 line-clamp-3 max-w-xl text-lg leading-8 text-gray-200">${escapeHtml(movie.overview)}</p>` : ""}
                            <div class="flex flex-wrap gap-3">
                                ${postButton(`/movies/${movie.id}/toggle-status`, actionLabel(movie.status), "rounded-md bg-white px-8 py-3 font-bold text-black transition hover:bg-gray-200")}
                                ${postButton(`/movies/${movie.id}/delete`, "Remover", "btn-danger px-8 py-3 font-bold")}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section class="detail-grid py-16">
                <div class="container-netflix">
                    <div class="mx-auto max-w-6xl">
                        <h2 class="mb-8 text-3xl font-black">Mais Informações</h2>
                        <div class="grid gap-8 lg:grid-cols-3">
                            <div class="space-y-8 lg:col-span-2">
                                ${movie.overview ? `<div><h3 class="mb-3 text-xl font-bold text-gray-200">Sinopse</h3><p class="text-lg leading-8 text-gray-400">${escapeHtml(movie.overview)}</p></div>` : ""}
                                <div class="grid gap-6 sm:grid-cols-2">
                                    ${detail("Título", movie.title)}
                                    ${movie.year ? detail("Ano de Lançamento", movie.year) : ""}
                                    ${detail("Tipo", typeLabel(movie.type))}
                                    ${detail("Status", statusLabel(movie.status))}
                                    ${movie.type === "series" && movie.seasons ? detail("Temporadas", movie.seasons) : ""}
                                    ${movie.type === "series" && movie.episodes ? detail("Total de Episódios", movie.episodes) : ""}
                                    ${movie.watched_at ? detail("Assistido em", formatDate(movie.watched_at)) : ""}
                                </div>
                            </div>
                            <div class="space-y-6">
                                ${movie.poster_url ? `<div class="overflow-hidden rounded-lg border border-white/10"><img src="${escapeHtml(movie.poster_url)}" alt="${escapeHtml(movie.title)}" class="w-full"></div>` : ""}
                                ${externalMovieLink(movie)}
                                ${detail("Adicionado em", formatDate(movie.created_at))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            ${footer()}
        `,
    });
}

export function redirect(location, statusMessage = null) {
    const target = new URL(location, "https://last-movies.local");
    if (statusMessage) {
        target.searchParams.set("status", statusMessage);
    }

    return new Response(null, {
        status: 303,
        headers: { Location: target.pathname + target.search },
    });
}

export function htmlResponse(html, status = 200) {
    return new Response(html, {
        status,
        headers: { "content-type": "text/html; charset=utf-8" },
    });
}

export function jsonResponse(payload, status = 200) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: { "content-type": "application/json; charset=utf-8" },
    });
}

function layout({ title, description, body }) {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} • Last Movies</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="stylesheet" href="/build/assets/app.css">
    <script type="module" src="/build/assets/app.js"></script>
</head>
<body class="min-h-screen text-white">
${body}
</body>
</html>`;
}

function header({ typeFilter }) {
    const nav = [
        ["/", "Todos", "all"],
        ["/?type=movies", "Filmes", "movies"],
        ["/?type=series", "Séries", "series"],
    ];

    return `<header class="fixed top-0 z-50 w-full header-container transition-all duration-300" id="header">
        <div class="container-netflix flex items-center justify-between py-4">
            <div class="flex items-center gap-8">
                <h1 class="brand-mark text-xl font-black text-red-600 sm:text-2xl">Last Movies</h1>
                <nav class="hidden items-center gap-6 md:flex">
                    ${nav.map(([href, label, key]) => `<a href="${href}" class="nav-link text-sm font-medium ${typeFilter === key ? "is-active" : ""}">${label}</a>`).join("")}
                </nav>
            </div>
            <a href="/movies/create" class="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-semibold">Adicionar</a>
        </div>
    </header>`;
}

function simpleHeader() {
    return `<header class="simple-header">
        <div class="container-netflix flex items-center justify-between py-4">
            <div class="flex items-center gap-4">
                <a href="/" class="btn-ghost inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold">Voltar</a>
                <h1 class="brand-mark text-xl font-black text-red-600 sm:text-2xl">Last Movies</h1>
            </div>
        </div>
    </header>`;
}

function renderMovieSections(movies, stats, typeFilter) {
    if (typeFilter === "all") {
        return [
            renderTypedSections("Filmes", stats.movies_count, movies.filter((movie) => movie.type === "movie")),
            renderTypedSections("Séries", stats.series_count, movies.filter((movie) => movie.type === "series")),
        ].join("");
    }

    return renderStatusGroups(movies);
}

function renderTypedSections(title, count, movies) {
    if (movies.length === 0) {
        return "";
    }

    return `<section class="content-row">
        <div class="row-heading">
            <h2>${title}</h2>
            <span>${count}</span>
        </div>
        ${renderStatusGroups(movies)}
    </section>`;
}

function renderStatusGroups(movies) {
    return [
        [WATCHING_STATUSES.PENDING, "Para Assistir", "pending-section"],
        [WATCHING_STATUSES.WATCHING, "Assistindo", "watching-section"],
        [WATCHING_STATUSES.WATCHED, "Já Assistidos", "watched-section"],
    ]
        .map(([status, title, className]) => {
            const scoped = movies.filter((movie) => movie.status === status);
            if (scoped.length === 0) {
                return "";
            }

            return `<section class="content-row ${className}"><div class="row-heading row-heading-small"><h3>${title}</h3></div><div class="movies-grid">${scoped.map(movieCard).join("")}</div></section>`;
        })
        .join("");
}

function movieCard(movie) {
    return `<div class="movie-card group relative overflow-hidden rounded-md transition-all duration-300">
        <a href="/movies/${movie.id}" class="block">
            <div class="poster-container relative aspect-[2/3] overflow-hidden bg-zinc-900">
                ${
                    movie.poster_url
                        ? `<img src="${escapeHtml(movie.poster_url)}" alt="${escapeHtml(movie.title)}" class="poster-image h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy">`
                        : `<div class="flex h-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-600">Sem pôster</div>`
                }
                <div class="card-overlay absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div class="absolute bottom-0 left-0 right-0 p-4">
                        <h4 class="card-title mb-2 text-sm font-black leading-tight text-white">${escapeHtml(movie.title)}</h4>
                        <div class="mb-3 flex items-center gap-2 text-xs text-gray-300">${movie.year ? `<span>${escapeHtml(movie.year)}</span><span class="text-gray-500">•</span>` : ""}<span>${typeLabel(movie.type)}</span></div>
                        <div class="flex gap-2">
                            ${postButton(`/movies/${movie.id}/toggle-status`, statusLabel(movie.status), "btn-toggle flex w-full items-center justify-center gap-1 rounded px-3 py-2 text-xs font-semibold transition bg-white text-black hover:bg-gray-200")}
                            ${postButton(`/movies/${movie.id}/delete`, "Remover", "btn-delete flex items-center justify-center rounded bg-red-600 p-2 text-xs transition hover:bg-red-700")}
                        </div>
                    </div>
                </div>
                <div class="absolute left-2 top-2"><span class="media-badge">${typeLabel(movie.type)}</span></div>
                ${movie.status === WATCHING_STATUSES.WATCHED ? `<div class="status-badge absolute right-2 top-2">Visto</div>` : ""}
            </div>
        </a>
    </div>`;
}

function postButton(action, label, className) {
    return `<form action="${action}" method="POST" class="inline"><button class="${className}">${label}</button></form>`;
}

function filterBar(typeFilter, statusFilter) {
    const typeParam = typeFilter === "all" ? "" : `type=${encodeURIComponent(typeFilter)}`;
    const hrefFor = (status) => {
        const params = [typeParam, status ? `filter=${status}` : ""].filter(Boolean).join("&");
        return params ? `/?${params}` : "/";
    };

    return `<nav class="filter-bar" aria-label="Filtrar por status">
        <a class="filter-chip ${!statusFilter ? "is-active" : ""}" href="${hrefFor(null)}">Tudo</a>
        <a class="filter-chip ${statusFilter === WATCHING_STATUSES.PENDING ? "is-active" : ""}" href="${hrefFor(WATCHING_STATUSES.PENDING)}">Para assistir</a>
        <a class="filter-chip ${statusFilter === WATCHING_STATUSES.WATCHING ? "is-active" : ""}" href="${hrefFor(WATCHING_STATUSES.WATCHING)}">Assistindo</a>
        <a class="filter-chip ${statusFilter === WATCHING_STATUSES.WATCHED ? "is-active" : ""}" href="${hrefFor(WATCHING_STATUSES.WATCHED)}">Assistidos</a>
    </nav>`;
}

function stat(value, label) {
    return `<div class="stat-card"><p class="text-3xl font-black text-white">${value}</p><p class="mt-1 text-sm text-gray-400">${label}</p></div>`;
}

function emptyState(typeFilter) {
    const label = typeFilter === "movies" ? "filme" : typeFilter === "series" ? "série" : "item";
    return `<div class="empty-state info-panel flex flex-col items-center justify-center rounded-xl p-8 text-center"><h3 class="mb-2 text-2xl font-black text-white">Nenhum ${label} ainda</h3><p class="mb-6 max-w-md text-gray-400">Adicione títulos para transformar esta tela em uma vitrine organizada por status.</p><a href="/movies/create" class="btn-primary inline-flex items-center gap-2 px-6 py-3 font-bold">Adicionar Título</a></div>`;
}

function typeRadio(value, icon, label, checked) {
    return `<label class="type-radio-card relative cursor-pointer rounded-lg border p-4 transition">
        <input type="radio" name="type" value="${value}" class="peer sr-only" ${checked ? "checked" : ""}>
        <div class="relative z-10 flex flex-col items-center gap-2"><span class="text-xs font-black uppercase text-zinc-500">${icon}</span><span class="font-semibold text-white">${label}</span></div>
    </label>`;
}

function numberInput(name, label, placeholder) {
    return `<div><label for="${name}" class="mb-2 block text-sm font-semibold text-gray-300">${label}</label><input type="number" id="${name}" name="${name}" min="1" placeholder="${placeholder}" class="input-field w-full rounded-lg px-4 py-3 text-white outline-none"></div>`;
}

function errorList(errors) {
    return `<div class="alert-error mb-6 border border-red-600/40 bg-red-600/20 p-4 text-red-200"><p class="mb-2 font-semibold">Corrija os seguintes erros:</p><ul class="ml-7 list-disc space-y-1 text-sm">${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join("")}</ul></div>`;
}

function movieFacts(movie) {
    return [movie.year, movie.type === "series" && movie.seasons ? `${movie.seasons} Temporada${movie.seasons === 1 ? "" : "s"}` : "", movie.type === "series" && movie.episodes ? `${movie.episodes} Episódios` : ""]
        .filter(Boolean)
        .map((fact) => `<span>${escapeHtml(String(fact))}</span>`)
        .join(`<span>•</span>`);
}

function detail(label, value) {
    return `<div class="detail-card rounded-lg p-4"><h4 class="mb-2 text-sm font-semibold text-gray-400">${label}</h4><p class="text-lg font-medium">${escapeHtml(String(value))}</p></div>`;
}

function externalMovieLink(movie) {
    if (movie.tmdb_id) {
        return `<a href="https://www.themoviedb.org/${movie.type === "series" ? "tv" : "movie"}/${movie.tmdb_id}" target="_blank" class="detail-card flex items-center justify-between rounded-lg p-4 transition hover:bg-zinc-800"><span class="font-semibold">Ver no TMDB</span><span>↗</span></a>`;
    }

    if (movie.imdb_id) {
        return `<a href="https://www.imdb.com/title/${escapeHtml(movie.imdb_id)}/" target="_blank" class="detail-card flex items-center justify-between rounded-lg p-4 transition hover:bg-zinc-800"><span class="font-semibold">Ver no IMDb</span><span>↗</span></a>`;
    }

    return "";
}

function actionLabel(status) {
    if (status === WATCHING_STATUSES.PENDING) {
        return "Começar a Assistir";
    }

    if (status === WATCHING_STATUSES.WATCHING) {
        return "Marcar como Assistido";
    }

    return "Assistir Novamente";
}

function statusLabel(status) {
    return STATUS_LABELS[status] ?? "Desconhecido";
}

function formatDate(value) {
    return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(value));
}

function footer() {
    return `<footer class="border-t border-white/10 bg-black/70 py-8"><div class="container-netflix text-center"><p class="text-sm text-gray-500">Last Movies • Watchlist pessoal</p></div></footer>`;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
