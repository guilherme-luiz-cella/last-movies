<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Meus Filmes • {{ config('app.name') }}</title>
    <meta name="description" content="Organize seus filmes para assistir e acompanhe o que já assistiu">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="min-h-screen text-white">
    <header class="fixed top-0 z-50 w-full header-container transition-all duration-300" id="header">
        <div class="container-netflix flex items-center justify-between py-4">
            <div class="flex items-center gap-8">
                <h1 class="brand-mark text-xl font-black text-red-600 sm:text-2xl">Last Movies</h1>
                <nav class="hidden items-center gap-6 md:flex">
                    <a href="{{ route('movies.index') }}"
                        class="nav-link text-sm font-medium {{ $typeFilter === 'all' ? 'is-active' : '' }}">Todos</a>
                    <a href="{{ route('movies.index', ['type' => 'movies']) }}"
                        class="nav-link text-sm font-medium {{ $typeFilter === 'movies' ? 'is-active' : '' }}">Filmes</a>
                    <a href="{{ route('movies.index', ['type' => 'series']) }}"
                        class="nav-link text-sm font-medium {{ $typeFilter === 'series' ? 'is-active' : '' }}">Séries</a>
                </nav>
            </div>

            <a href="{{ route('movies.create') }}"
                class="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-semibold">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Adicionar
            </a>
        </div>
    </header>

    <section class="hero-section relative">
        <div class="hero-overlay-left"></div>
        <div class="hero-overlay-bottom"></div>

        @if($movies->isNotEmpty() && $movies->first()->poster_url)
            <img src="{{ $movies->first()->poster_url }}" alt="{{ $movies->first()->title }}" class="hero-image">
        @else
            <div class="hero-gradient-bg h-full w-full"></div>
        @endif

        <div class="absolute inset-0 flex items-center">
            <div class="container-netflix">
                <div class="hero-copy max-w-2xl pt-24">
                    @if($movies->isNotEmpty())
                        <div class="hero-kicker mb-5">
                            {{ $movies->first()->type === 'series' ? 'Série em destaque' : 'Filme em destaque' }}
                            @if($movies->first()->year)
                                <span>{{ $movies->first()->year }}</span>
                            @endif
                        </div>
                        <h2 class="mb-5 text-5xl font-black leading-none sm:text-6xl lg:text-7xl">{{ $movies->first()->title }}</h2>
                        @if($movies->first()->overview)
                            <p class="mb-7 line-clamp-3 max-w-xl text-base leading-7 text-zinc-200 sm:text-lg">{{ $movies->first()->overview }}</p>
                        @endif
                        <div class="flex flex-wrap gap-3">
                            <form action="{{ route('movies.toggle-status', $movies->first()) }}" method="POST"
                                class="inline">
                                @csrf
                                @method('PATCH')
                                <button
                                    class="flex min-h-11 items-center gap-2 rounded-md bg-white px-6 py-3 font-bold text-black transition hover:bg-zinc-200">
                                    @if($movies->first()->status === 'watched')
                                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M5 13l4 4L19 7" />
                                        </svg>
                                        Assistido
                                    @else
                                        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                        </svg>
                                        Assistir
                                    @endif
                                </button>
                            </form>
                            <a href="{{ route('movies.show', $movies->first()) }}" 
                               class="btn-secondary flex items-center gap-2 px-6 py-3 font-bold">
                                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Mais informações
                            </a>
                        </div>
                    @else
                        <div class="hero-kicker mb-5">Sua watchlist pessoal</div>
                        <h2 class="mb-5 text-5xl font-black leading-none sm:text-6xl lg:text-7xl">Monte sua fila perfeita</h2>
                        <p class="mb-7 max-w-xl text-lg leading-7 text-zinc-300">Adicione filmes e séries, acompanhe o status e encontre tudo com pôster, sinopse e dados automáticos.</p>
                        <a href="{{ route('movies.create') }}"
                            class="btn-primary inline-flex items-center gap-2 px-6 py-3 font-bold">
                            Adicionar Título
                        </a>
                    @endif
                </div>
            </div>
        </div>
    </section>

    <section class="stats-bar">
        <div class="container-netflix">
            <div class="stats-panel grid grid-cols-2 overflow-hidden sm:grid-cols-5">
                <div class="stat-card">
                    <p class="text-3xl font-black text-white">{{ $stats['total'] }}</p>
                    <p class="mt-1 text-sm text-gray-400">
                        @if($typeFilter === 'movies')
                            Filmes
                        @elseif($typeFilter === 'series')
                            Séries
                        @else
                            Total
                        @endif
                    </p>
                </div>
                <div class="stat-card">
                    <p class="text-3xl font-black text-white">{{ $stats['pending'] }}</p>
                    <p class="mt-1 text-sm text-gray-400">Para Assistir</p>
                </div>
                <div class="stat-card">
                    <p class="text-3xl font-black text-white">{{ $stats['watching'] }}</p>
                    <p class="mt-1 text-sm text-gray-400">Assistindo</p>
                </div>
                <div class="stat-card">
                    <p class="text-3xl font-black text-white">{{ $stats['watched'] }}</p>
                    <p class="mt-1 text-sm text-gray-400">Já Assistidos</p>
                </div>
                @if($typeFilter === 'all')
                <div class="stat-card">
                    <p class="text-3xl font-black text-white">{{ $stats['series_count'] }}</p>
                    <p class="mt-1 text-sm text-gray-400">Séries</p>
                </div>
                @else
                <div class="stat-card">
                    @php
                        $percentage = $stats['total'] > 0 ? (int) round(($stats['watched'] / $stats['total']) * 100) : 0;
                    @endphp
                    <p class="text-3xl font-black text-white">{{ $percentage }}%</p>
                    <p class="mt-1 text-sm text-gray-400">Progresso</p>
                </div>
                @endif
            </div>
        </div>
    </section>

    @if(session('status'))
        <div class="container-netflix py-4">
            <div class="alert-success">
                {{ session('status') }}
            </div>
        </div>
    @endif

    <main class="container-netflix pb-12 pt-8">
        <nav class="filter-bar" aria-label="Filtrar por status">
            <a class="filter-chip {{ empty($statusFilter) ? 'is-active' : '' }}"
                href="{{ route('movies.index', $typeFilter === 'all' ? [] : ['type' => $typeFilter]) }}">Tudo</a>
            <a class="filter-chip {{ $statusFilter === 'pending' ? 'is-active' : '' }}"
                href="{{ route('movies.index', array_filter(['type' => $typeFilter === 'all' ? null : $typeFilter, 'filter' => 'pending'])) }}">Para assistir</a>
            <a class="filter-chip {{ $statusFilter === 'watching' ? 'is-active' : '' }}"
                href="{{ route('movies.index', array_filter(['type' => $typeFilter === 'all' ? null : $typeFilter, 'filter' => 'watching'])) }}">Assistindo</a>
            <a class="filter-chip {{ $statusFilter === 'watched' ? 'is-active' : '' }}"
                href="{{ route('movies.index', array_filter(['type' => $typeFilter === 'all' ? null : $typeFilter, 'filter' => 'watched'])) }}">Assistidos</a>
        </nav>

        @foreach($sections as $section)
            @include('movies.partials.section', ['section' => $section])
        @endforeach

        @if($movies->isEmpty())
            <div class="empty-state info-panel flex flex-col items-center justify-center rounded-xl p-8 text-center">
                <svg class="mb-5 h-20 w-20 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <h3 class="mb-2 text-2xl font-black text-white">Nenhum {{ $typeFilter === 'movies' ? 'filme' : ($typeFilter === 'series' ? 'série' : 'item') }} ainda</h3>
                <p class="mb-6 max-w-md text-gray-400">Adicione títulos para transformar esta tela em uma vitrine organizada por status.</p>
                <a href="{{ route('movies.create') }}"
                    class="btn-primary inline-flex items-center gap-2 px-6 py-3 font-bold">
                    Adicionar {{ $typeFilter === 'movies' ? 'Filme' : ($typeFilter === 'series' ? 'Série' : 'Título') }}
                </a>
            </div>
        @endif
    </main>

    <footer class="border-t border-white/10 bg-black/70 py-8">
        <div class="container-netflix text-center">
            <p class="text-sm text-gray-500">Last Movies • Watchlist pessoal</p>
        </div>
    </footer>
</body>

</html>
