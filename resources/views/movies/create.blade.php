<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Adicionar Filme • {{ config('app.name') }}</title>
    <meta name="description" content="Adicione um novo filme à sua lista">
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
                @if ($errors->any())
                    <div class="alert-error mb-6 border border-red-600/40 bg-red-600/20 p-4 text-red-200">
                        <div class="mb-2 flex items-center gap-2 font-semibold">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Corrija os seguintes erros:
                        </div>
                        <ul class="ml-7 list-disc space-y-1 text-sm">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

            <div class="form-card overflow-hidden rounded-xl">
                <form action="{{ route('movies.store') }}" method="POST" class="p-6 sm:p-8" id="movieForm">
                    @csrf

                    <div class="mb-6">
                        <label for="type" class="mb-2 block text-sm font-semibold text-gray-300">
                            Tipo
                        </label>
                        <div class="grid grid-cols-2 gap-3">
                            <label class="type-radio-card relative cursor-pointer rounded-lg border p-4 transition">
                                <input type="radio" name="type" value="movie" class="peer sr-only" checked>
                                <div class="relative z-10 flex flex-col items-center gap-2">
                                    <span class="text-xs font-black uppercase text-zinc-500">01</span>
                                    <span class="font-semibold text-white">Filme</span>
                                </div>
                            </label>
                            <label class="type-radio-card relative cursor-pointer rounded-lg border p-4 transition">
                                <input type="radio" name="type" value="series" class="peer sr-only">
                                <div class="relative z-10 flex flex-col items-center gap-2">
                                    <span class="text-xs font-black uppercase text-zinc-500">02</span>
                                    <span class="font-semibold text-white">Série</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="mb-6">
                        <label for="language" class="mb-2 block text-sm font-semibold text-gray-300">
                            Idioma de Busca
                        </label>
                        <div class="relative">
                            <select
                                id="language"
                                name="language"
                                class="input-field w-full appearance-none rounded-lg border border-gray-700 bg-zinc-950 px-4 py-3 pr-10 text-white outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
                            >
                                <option value="pt-BR" selected>Português (Brasil)</option>
                                <option value="en-US">English (USA)</option>
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div class="mb-6">
                        <label for="title" class="mb-2 block text-sm font-semibold text-gray-300">
                            Título <span id="titleType">do Filme</span>
                        </label>
                        <div class="relative">
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value="{{ old('title') }}"
                                placeholder="Ex: Interestelar, Matrix, Duna..."
                                required
                                autocomplete="off"
                                class="input-field w-full rounded-lg border border-gray-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
                            >
                            
                            <div id="searchLoader" class="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2">
                                <svg class="h-5 w-5 animate-spin text-red-600" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        </div>
                        
                        <div id="suggestions" class="suggestions-container mt-2 hidden overflow-hidden rounded-lg border border-gray-700 bg-zinc-950 shadow-2xl"></div>
                        
                        <p class="mt-2 text-xs text-gray-500">Sugestões aparecem automaticamente enquanto você digita.</p>
                    </div>

                    <div id="seriesFields" class="mb-6 hidden space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="seasons" class="mb-2 block text-sm font-semibold text-gray-300">
                                    Temporadas
                                </label>
                                <input
                                    type="number"
                                    id="seasons"
                                    name="seasons"
                                    min="1"
                                    value="{{ old('seasons') }}"
                                    placeholder="Ex: 3"
                                    class="input-field w-full rounded-lg border border-gray-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                                >
                            </div>
                            <div>
                                <label for="episodes" class="mb-2 block text-sm font-semibold text-gray-300">
                                    Episódios (Total)
                                </label>
                                <input
                                    type="number"
                                    id="episodes"
                                    name="episodes"
                                    min="1"
                                    value="{{ old('episodes') }}"
                                    placeholder="Ex: 24"
                                    class="input-field w-full rounded-lg border border-gray-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
                                >
                            </div>
                        </div>
                        <p class="text-xs text-gray-500">Campos opcionais preenchidos automaticamente quando disponíveis.</p>
                    </div>

                    <div class="mb-8">
                        <label for="status" class="mb-2 block text-sm font-semibold text-gray-300">
                            Status Inicial
                        </label>
                        <div class="relative">
                            <select
                                id="status"
                                name="status"
                                class="input-field w-full appearance-none rounded-lg border border-gray-700 bg-zinc-950 px-4 py-3 pr-10 text-white outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
                            >
                                <option value="pending" @selected(old('status', 'pending') === 'pending')>
                                    Para Assistir
                                </option>
                                <option value="watching" @selected(old('status') === 'watching')>
                                    Assistindo
                                </option>
                                <option value="watched" @selected(old('status') === 'watched')>
                                    Já Assistido
                                </option>
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <a href="{{ route('movies.index') }}" 
                           class="btn-ghost inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold">
                            Cancelar
                        </a>
                        <button type="submit" 
                                class="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span id="submitText">Adicionar Filme</span>
                        </button>
                    </div>
                </form>
            </div>
            </div>
        </div>
    </main>
</body>
</html>
