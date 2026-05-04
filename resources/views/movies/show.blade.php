<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $movie->title }} • {{ config('app.name') }}</title>
    <meta name="description" content="{{ $movie->overview ?? 'Detalhes do filme' }}">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen bg-[#141414] text-white">
    <!-- Header -->
    <header class="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div class="container-netflix flex items-center justify-between py-4">
            <div class="flex items-center gap-4">
                <a href="{{ route('movies.index') }}" 
                   class="flex items-center gap-2 text-gray-400 transition hover:text-white">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Voltar
                </a>
                <h1 class="text-xl font-bold text-red-600 sm:text-2xl">MEUS FILMES & SÉRIES</h1>
            </div>
        </div>
    </header>

    <!-- Hero/Banner Section with Gradient Overlay -->
    <section class="relative h-[80vh] min-h-[600px]">
        <!-- Background Image with Gradient -->
        <div class="absolute inset-0">
            @if($movie->poster_url)
                <img src="{{ $movie->poster_url }}" 
                     alt="{{ $movie->title }}"
                     class="h-full w-full object-cover object-center">
            @else
                <div class="h-full w-full bg-gradient-to-br from-zinc-900 to-black"></div>
            @endif
            
            <!-- Gradient Overlays -->
            <div class="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>

        <!-- Content -->
        <div class="relative flex h-full items-end">
            <div class="container-netflix pb-16">
                <div class="max-w-2xl">
                    <!-- Type Badge -->
                    <div class="mb-4 flex items-center gap-3">
                        @if($movie->type === 'series')
                            <span class="inline-flex items-center gap-2 rounded-full bg-purple-600/90 px-4 py-1.5 text-sm font-bold backdrop-blur-sm">
                                📺 SÉRIE
                            </span>
                        @else
                            <span class="inline-flex items-center gap-2 rounded-full bg-red-600/90 px-4 py-1.5 text-sm font-bold backdrop-blur-sm">
                                🎬 FILME
                            </span>
                        @endif

                        <!-- Status Badge -->
                        <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold backdrop-blur-sm
                            @if($movie->status === 'pending') bg-amber-500/90
                            @elseif($movie->status === 'watching') bg-blue-500/90
                            @else bg-emerald-500/90
                            @endif">
                            {{ $movie->getStatusLabel() }}
                        </span>
                    </div>

                    <!-- Title -->
                    <h1 class="mb-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                        {{ $movie->title }}
                    </h1>
                    
                    <!-- Quick Info -->
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

                    <!-- Overview -->
                    @if($movie->overview)
                        <p class="mb-8 text-lg leading-relaxed text-gray-200 line-clamp-3">
                            {{ $movie->overview }}
                        </p>
                    @endif

                    <!-- Action Buttons -->
                    <div class="flex flex-wrap gap-3">
                        <form action="{{ route('movies.toggle-status', $movie) }}" method="POST" class="inline">
                            @csrf
                            @method('PATCH')
                            <button class="flex items-center gap-2 rounded-lg px-8 py-3 font-bold transition
                                @if($movie->status === 'pending') bg-white text-black hover:bg-gray-200
                                @elseif($movie->status === 'watching') bg-blue-600 text-white hover:bg-blue-700
                                @else bg-gray-700 text-white hover:bg-gray-600
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
                            class="flex items-center gap-2 rounded-lg bg-gray-700/80 px-8 py-3 font-bold backdrop-blur-sm transition hover:bg-gray-700">
                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Mais Informações
                        </button>

                        <form action="{{ route('movies.destroy', $movie) }}" method="POST" 
                              onsubmit="return confirm('Tem certeza que deseja remover {{ $movie->title }}?')" class="inline">
                            @csrf
                            @method('DELETE')
                            <button class="flex items-center gap-2 rounded-lg bg-red-600/80 px-8 py-3 font-bold backdrop-blur-sm transition hover:bg-red-600">
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

    <!-- More Information Section -->
    <section id="moreInfo" class="bg-[#181818] py-16">
        <div class="container-netflix">
            <div class="mx-auto max-w-6xl">
                <h2 class="mb-8 text-3xl font-bold">Mais Informações</h2>
                
                <div class="grid gap-8 lg:grid-cols-3">
                    <!-- Main Info -->
                    <div class="lg:col-span-2 space-y-8">
                        <!-- About -->
                        @if($movie->overview)
                            <div>
                                <h3 class="mb-3 text-xl font-semibold text-gray-300">Sinopse</h3>
                                <p class="text-lg leading-relaxed text-gray-400">{{ $movie->overview }}</p>
                            </div>
                        @endif

                        <!-- Details Grid -->
                        <div class="grid gap-6 sm:grid-cols-2">
                            <div class="rounded-lg border border-gray-700 bg-zinc-900/50 p-4">
                                <h4 class="mb-2 text-sm font-semibold text-gray-400">Título</h4>
                                <p class="text-lg font-medium">{{ $movie->title }}</p>
                            </div>

                            @if($movie->year)
                                <div class="rounded-lg border border-gray-700 bg-zinc-900/50 p-4">
                                    <h4 class="mb-2 text-sm font-semibold text-gray-400">Ano de Lançamento</h4>
                                    <p class="text-lg font-medium">{{ $movie->year }}</p>
                                </div>
                            @endif

                            <div class="rounded-lg border border-gray-700 bg-zinc-900/50 p-4">
                                <h4 class="mb-2 text-sm font-semibold text-gray-400">Tipo</h4>
                                <p class="text-lg font-medium">{{ $movie->getTypeLabel() }}</p>
                            </div>

                            <div class="rounded-lg border border-gray-700 bg-zinc-900/50 p-4">
                                <h4 class="mb-2 text-sm font-semibold text-gray-400">Status</h4>
                                <p class="text-lg font-medium">{{ $movie->getStatusLabel() }}</p>
                            </div>

                            @if($movie->type === 'series' && $movie->seasons)
                                <div class="rounded-lg border border-gray-700 bg-zinc-900/50 p-4">
                                    <h4 class="mb-2 text-sm font-semibold text-gray-400">Temporadas</h4>
                                    <p class="text-lg font-medium">{{ $movie->seasons }}</p>
                                </div>
                            @endif

                            @if($movie->type === 'series' && $movie->episodes)
                                <div class="rounded-lg border border-gray-700 bg-zinc-900/50 p-4">
                                    <h4 class="mb-2 text-sm font-semibold text-gray-400">Total de Episódios</h4>
                                    <p class="text-lg font-medium">{{ $movie->episodes }}</p>
                                </div>
                            @endif

                            @if($movie->watched_at)
                                <div class="rounded-lg border border-gray-700 bg-zinc-900/50 p-4">
                                    <h4 class="mb-2 text-sm font-semibold text-gray-400">Assistido em</h4>
                                    <p class="text-lg font-medium">{{ $movie->watched_at->format('d/m/Y') }}</p>
                                </div>
                            @endif
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <div class="space-y-6">
                        <!-- Poster -->
                        @if($movie->poster_url)
                            <div class="overflow-hidden rounded-lg">
                                <img src="{{ $movie->poster_url }}" 
                                     alt="{{ $movie->title }}"
                                     class="w-full transition-transform duration-300 hover:scale-105">
                            </div>
                        @endif

                        <!-- External Links -->
                        @if($movie->tmdb_id)
                            <a href="https://www.themoviedb.org/{{ $movie->type === 'series' ? 'tv' : 'movie' }}/{{ $movie->tmdb_id }}" 
                               target="_blank"
                               class="flex items-center justify-between rounded-lg border border-gray-700 bg-zinc-900/50 p-4 transition hover:bg-zinc-800">
                                <span class="font-semibold">Ver no TMDB</span>
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        @endif

                        <!-- Added Date -->
                        <div class="rounded-lg border border-gray-700 bg-zinc-900/50 p-4">
                            <h4 class="mb-2 text-sm font-semibold text-gray-400">Adicionado em</h4>
                            <p class="text-base">{{ $movie->created_at->format('d/m/Y') }}</p>
                            <p class="mt-1 text-xs text-gray-500">{{ $movie->created_at->diffForHumans() }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-gray-800 bg-black py-8">
        <div class="container-netflix text-center">
            <p class="text-sm text-gray-500">Minha Lista de Filmes & Séries • Feito com Laravel</p>
        </div>
    </footer>
</body>
</html>
