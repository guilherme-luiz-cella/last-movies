<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $movie->title }} • {{ config('app.name') }}</title>
    <meta name="description" content="{{ $movie->overview ?? 'Detalhes do filme' }}">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen text-white">
    <header class="simple-header">
        <div class="container-netflix flex items-center justify-between py-4">
            <div class="flex items-center gap-4">
                <a href="{{ route('movies.index') }}" 
                   class="btn-ghost inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Voltar
                </a>
                <h1 class="brand-mark text-xl font-black text-red-600 sm:text-2xl">Last Movies</h1>
            </div>
        </div>
    </header>

    <section class="detail-hero relative">
        <div class="absolute inset-0">
            @if($movie->poster_url)
                <img src="{{ $movie->poster_url }}" 
                     alt="{{ $movie->title }}"
                     class="detail-backdrop h-full w-full object-cover object-center">
            @else
                <div class="h-full w-full bg-gradient-to-br from-zinc-900 to-black"></div>
            @endif
            
            <div class="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
        </div>

        <div class="relative flex h-full items-end">
            <div class="container-netflix pb-16">
                <div class="max-w-2xl">
                    <div class="mb-4 flex items-center gap-3">
                        @if($movie->type === 'series')
                            <span class="eyebrow">
                                Série
                            </span>
                        @else
                            <span class="eyebrow">
                                Filme
                            </span>
                        @endif

                        <span class="eyebrow">
                            {{ $movie->getStatusLabel() }}
                        </span>
                    </div>

                    <h1 class="mb-5 text-5xl font-black leading-none sm:text-6xl lg:text-7xl">
                        {{ $movie->title }}
                    </h1>
                    
                    <div class="mb-6 flex flex-wrap items-center gap-3 text-base text-gray-300">
                        @if($movie->year)
                            <span class="font-semibold text-white">{{ $movie->year }}</span>
                        @endif
                        
                        @if($movie->type === 'series' && $movie->seasons)
                            <span>•</span>
                            <span>{{ $movie->seasons }} {{ Str::plural('Temporada', $movie->seasons) }}</span>
                        @endif
                        
                        @if($movie->type === 'series' && $movie->episodes)
                            <span>•</span>
                            <span>{{ $movie->episodes }} Episódios</span>
                        @endif
                    </div>

                    @if($movie->overview)
                        <p class="mb-8 max-w-xl text-lg leading-8 text-gray-200 line-clamp-3">
                            {{ $movie->overview }}
                        </p>
                    @endif

                    <div class="flex flex-wrap gap-3">
                        <form action="{{ route('movies.toggle-status', $movie) }}" method="POST" class="inline">
                            @csrf
                            @method('PATCH')
                            <button class="flex min-h-11 items-center gap-2 rounded-md px-8 py-3 font-bold transition
                                @if($movie->status === 'pending') bg-white text-black hover:bg-gray-200
                                @elseif($movie->status === 'watching') btn-secondary
                                @else btn-secondary
                                @endif">
                                @if($movie->status === 'pending')
                                    <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                    </svg>
                                    Começar a Assistir
                                @elseif($movie->status === 'watching')
                                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Marcar como Assistido
                                @else
                                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Assistir Novamente
                                @endif
                            </button>
                        </form>

                        <button 
                            onclick="document.getElementById('moreInfo').scrollIntoView({ behavior: 'smooth' })"
                            class="btn-secondary flex items-center gap-2 px-8 py-3 font-bold">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Mais Informações
                        </button>

                        <form action="{{ route('movies.destroy', $movie) }}" method="POST" 
                              onsubmit="return confirm('Tem certeza que deseja remover {{ $movie->title }}?')" class="inline">
                            @csrf
                            @method('DELETE')
                            <button class="btn-danger flex items-center gap-2 px-8 py-3 font-bold">
                                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remover
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="moreInfo" class="detail-grid py-16">
        <div class="container-netflix">
            <div class="mx-auto max-w-6xl">
                <h2 class="mb-8 text-3xl font-black">Mais Informações</h2>
                
                <div class="grid gap-8 lg:grid-cols-3">
                    <div class="lg:col-span-2 space-y-8">
                        @if($movie->overview)
                            <div>
                                <h3 class="mb-3 text-xl font-bold text-gray-200">Sinopse</h3>
                                <p class="text-lg leading-8 text-gray-400">{{ $movie->overview }}</p>
                            </div>
                        @endif

                        <div class="grid gap-6 sm:grid-cols-2">
                            <div class="detail-card rounded-lg p-4">
                                <h4 class="mb-2 text-sm font-semibold text-gray-400">Título</h4>
                                <p class="text-lg font-medium">{{ $movie->title }}</p>
                            </div>

                            @if($movie->year)
                                <div class="detail-card rounded-lg p-4">
                                    <h4 class="mb-2 text-sm font-semibold text-gray-400">Ano de Lançamento</h4>
                                    <p class="text-lg font-medium">{{ $movie->year }}</p>
                                </div>
                            @endif

                            <div class="detail-card rounded-lg p-4">
                                <h4 class="mb-2 text-sm font-semibold text-gray-400">Tipo</h4>
                                <p class="text-lg font-medium">{{ $movie->getTypeLabel() }}</p>
                            </div>

                            <div class="detail-card rounded-lg p-4">
                                <h4 class="mb-2 text-sm font-semibold text-gray-400">Status</h4>
                                <p class="text-lg font-medium">{{ $movie->getStatusLabel() }}</p>
                            </div>

                            @if($movie->type === 'series' && $movie->seasons)
                                <div class="detail-card rounded-lg p-4">
                                    <h4 class="mb-2 text-sm font-semibold text-gray-400">Temporadas</h4>
                                    <p class="text-lg font-medium">{{ $movie->seasons }}</p>
                                </div>
                            @endif

                            @if($movie->type === 'series' && $movie->episodes)
                                <div class="detail-card rounded-lg p-4">
                                    <h4 class="mb-2 text-sm font-semibold text-gray-400">Total de Episódios</h4>
                                    <p class="text-lg font-medium">{{ $movie->episodes }}</p>
                                </div>
                            @endif

                            @if($movie->watched_at)
                                <div class="detail-card rounded-lg p-4">
                                    <h4 class="mb-2 text-sm font-semibold text-gray-400">Assistido em</h4>
                                    <p class="text-lg font-medium">{{ $movie->watched_at->format('d/m/Y') }}</p>
                                </div>
                            @endif
                        </div>
                    </div>

                    <div class="space-y-6">
                        @if($movie->poster_url)
                            <div class="overflow-hidden rounded-lg border border-white/10">
                                <img src="{{ $movie->poster_url }}" 
                                     alt="{{ $movie->title }}"
                                     class="w-full transition-transform duration-300 hover:scale-105">
                            </div>
                        @endif

                        @if($movie->tmdb_id)
                            <a href="https://www.themoviedb.org/{{ $movie->type === 'series' ? 'tv' : 'movie' }}/{{ $movie->tmdb_id }}" 
                               target="_blank"
                               class="detail-card flex items-center justify-between rounded-lg p-4 transition hover:bg-zinc-800">
                                <span class="font-semibold">Ver no TMDB</span>
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        @endif

                        <div class="detail-card rounded-lg p-4">
                            <h4 class="mb-2 text-sm font-semibold text-gray-400">Adicionado em</h4>
                            <p class="text-base">{{ $movie->created_at->format('d/m/Y') }}</p>
                            <p class="mt-1 text-xs text-gray-500">{{ $movie->created_at->diffForHumans() }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <footer class="border-t border-white/10 bg-black/70 py-8">
        <div class="container-netflix text-center">
            <p class="text-sm text-gray-500">Last Movies • Watchlist pessoal</p>
        </div>
    </footer>
</body>
</html>
