<div class="movie-card group relative overflow-hidden rounded-md transition-all duration-300">
    <a href="{{ route('movies.show', $movie) }}" class="block">
        <!-- Poster Image -->
        <div class="poster-container relative aspect-[2/3] overflow-hidden bg-zinc-900">
            @if($movie->poster_url)
                <img src="{{ $movie->poster_url }}" alt="{{ $movie->title }}"
                    class="poster-image h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy">
            @else
                <div class="flex h-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                    <svg class="h-16 w-16 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                </div>
            @endif

            <!-- Overlay on Hover -->
            <div
                class="card-overlay absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div class="absolute bottom-0 left-0 right-0 p-4">
                    <h4 class="card-title mb-2 text-sm font-bold leading-tight text-white">{{ $movie->title }}</h4>
                    <div class="mb-3 flex items-center gap-2 text-xs text-gray-300">
                        @if($movie->year)
                            <span>{{ $movie->year }}</span>
                        @endif
                        @if($movie->type === 'series')
                            <span class="text-gray-500">•</span>
                            <span class="rounded bg-red-600/30 px-2 py-0.5 text-red-200">Série</span>
                            @if($movie->seasons)
                                <span class="text-gray-500">•</span>
                                <span>{{ $movie->seasons }} {{ $movie->seasons == 1 ? 'Temporada' : 'Temporadas' }}</span>
                            @endif
                        @else
                            <span class="text-gray-500">•</span>
                            <span class="rounded bg-red-600/30 px-2 py-0.5 text-red-200">Filme</span>
                        @endif
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex gap-2">
                        <form action="{{ route('movies.toggle-status', $movie) }}" method="POST" class="flex-1">
                            @csrf
                            @method('PATCH')
                            <button
                                class="btn-toggle flex w-full items-center justify-center gap-1 rounded px-3 py-2 text-xs font-semibold transition
                                    @if($movie->status === 'pending') bg-white text-black hover:bg-gray-200
                                    @elseif($movie->status === 'watching') bg-zinc-700 text-white hover:bg-zinc-600
                                    @else bg-white text-black hover:bg-gray-200
                                    @endif">
                                @if($movie->status === 'pending')
                                    <span class="hidden sm:inline">Para Assistir</span>
                                @elseif($movie->status === 'watching')
                                    <span>▶</span> <span class="hidden sm:inline">Assistindo</span>
                                @else
                                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span class="hidden sm:inline">Assistido</span>
                                @endif
                            </button>
                        </form>

                        <form action="{{ route('movies.destroy', $movie) }}" method="POST"
                            onsubmit="return confirmDelete('{{ $movie->title }}')">
                            @csrf
                            @method('DELETE')
                            <button
                                class="btn-delete flex items-center justify-center rounded bg-red-600 p-2 transition hover:bg-red-700">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Type Badge -->
            <div class="absolute left-2 top-2">
                @if($movie->type === 'series')
                    <span class="rounded-full bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide shadow-lg">
                        Série
                    </span>
                @else
                    <span class="rounded-full bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide shadow-lg">
                        Filme
                    </span>
                @endif
            </div>

            <!-- Status Badge -->
            @if($movie->status === 'watched')
                <div
                    class="status-badge absolute right-2 top-2 rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold">
                    ✓
                </div>
            @endif
        </div>
    </a>
</div>
