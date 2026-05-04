/**
 * Create Movie Page JavaScript - Search and Form Handling
 */

document.addEventListener("DOMContentLoaded", function () {
    // Get DOM elements
    const titleInput = document.getElementById("title");
    const suggestionsEl = document.getElementById("suggestions");
    const searchLoader = document.getElementById("searchLoader");
    const typeRadios = document.querySelectorAll('input[name="type"]');
    const languageSelect = document.getElementById("language");
    const seriesFields = document.getElementById("seriesFields");
    const titleType = document.getElementById("titleType");
    const submitText = document.getElementById("submitText");

    let debounceTimer = null;
    let currentType = "movie";
    let currentLanguage = "pt-BR";

    if (!titleInput || !suggestionsEl) {
        return;
    }

    if (languageSelect) {
        languageSelect.addEventListener("change", (e) => {
            currentLanguage = e.target.value;
            hideSuggestions();

            if (titleInput.value.trim().length >= 2) {
                titleInput.dispatchEvent(new Event("input"));
            }
        });
    }

    typeRadios.forEach((radio) => {
        radio.addEventListener("change", (e) => {
            currentType = e.target.value;

            if (titleType) {
                titleType.textContent =
                    currentType === "movie" ? "do Filme" : "da Série";
            }

            if (titleInput) {
                titleInput.placeholder =
                    currentType === "movie"
                        ? "Ex: Interestelar, Matrix, Duna..."
                        : "Ex: Breaking Bad, Stranger Things, The Office...";
            }

            if (submitText) {
                submitText.textContent =
                    currentType === "movie"
                        ? "Adicionar Filme"
                        : "Adicionar Série";
            }

            // Show/hide series fields
            if (seriesFields) {
                if (currentType === "series") {
                    seriesFields.classList.remove("hidden");
                } else {
                    seriesFields.classList.add("hidden");
                }
            }

            hideSuggestions();
        });
    });

    const hideSuggestions = () => {
        suggestionsEl.innerHTML = "";
        suggestionsEl.classList.add("hidden");
    };

    const renderSuggestions = (items) => {
        if (searchLoader) {
            searchLoader.classList.add("hidden");
        }

        if (!items || !items.length) {
            hideSuggestions();
            return;
        }

        const typeLabel = currentType === "series" ? "Série" : "Filme";

        suggestionsEl.innerHTML = items
            .map((item) => {
                const year = item.year
                    ? ` <span class="text-gray-500">(${item.year})</span>`
                    : "";
                const poster =
                    item.poster && item.poster !== "N/A"
                        ? `<img src="${item.poster}" alt="Pôster de ${escapeHtml(item.title)}" class="h-16 w-11 rounded object-cover shadow-lg" loading="lazy">`
                        : `<div class="flex h-16 w-11 items-center justify-center rounded bg-zinc-800 text-zinc-600">
                     <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
                     </svg>
                   </div>`;

                return `
                <button
                    type="button"
                    data-title="${escapeHtml(item.title || "")}"
                    data-year="${escapeHtml(item.year || "")}"
                    data-poster="${escapeHtml(item.poster || "")}"
                    data-tmdb-id="${escapeHtml(String(item.tmdb_id || ""))}"
                    data-imdb-id="${escapeHtml(String(item.imdb_id || ""))}"
                    data-overview="${escapeHtml(item.overview || "")}"
                    class="suggestion-item flex w-full items-center gap-4 border-b border-gray-800 px-4 py-3 text-left transition hover:bg-zinc-900 last:border-b-0"
                >
                    ${poster}
                    <div class="flex-1">
                        <p class="font-semibold text-white">${escapeHtml(item.title)}${year}</p>
                        <p class="mt-0.5 text-[11px] font-bold uppercase text-red-300">${typeLabel}</p>
                        ${item.overview ? `<p class="mt-1 text-xs text-gray-400 line-clamp-2">${escapeHtml(item.overview)}</p>` : ""}
                    </div>
                </button>
            `;
            })
            .join("");

        suggestionsEl.classList.remove("hidden");

        suggestionsEl
            .querySelectorAll("button[data-title]")
            .forEach((button) => {
                button.addEventListener("click", () => {
                    const title = button.dataset.title || "";
                    const year = button.dataset.year || "";
                    const poster = button.dataset.poster || "";
                    const tmdbId = button.dataset.tmdbId || "";
                    const imdbId = button.dataset.imdbId || "";
                    const overview = button.dataset.overview || "";

                    titleInput.value = title;

                    const yearInput = document.getElementById("year");
                    if (yearInput && year) {
                        yearInput.value = year;
                    }

                    const posterInput = document.getElementById("poster_url");
                    if (posterInput && poster && poster !== "N/A") {
                        posterInput.value = poster;
                    }

                    let tmdbIdInput = document.getElementById("tmdb_id");
                    if (!tmdbIdInput) {
                        tmdbIdInput = document.createElement("input");
                        tmdbIdInput.type = "hidden";
                        tmdbIdInput.id = "tmdb_id";
                        tmdbIdInput.name = "tmdb_id";
                        document
                            .getElementById("movieForm")
                            .appendChild(tmdbIdInput);
                    }
                    tmdbIdInput.value = tmdbId;

                    let imdbIdInput = document.getElementById("imdb_id");
                    if (!imdbIdInput) {
                        imdbIdInput = document.createElement("input");
                        imdbIdInput.type = "hidden";
                        imdbIdInput.id = "imdb_id";
                        imdbIdInput.name = "imdb_id";
                        document
                            .getElementById("movieForm")
                            .appendChild(imdbIdInput);
                    }
                    imdbIdInput.value = imdbId;

                    let overviewInput = document.getElementById("overview");
                    if (!overviewInput) {
                        overviewInput = document.createElement("input");
                        overviewInput.type = "hidden";
                        overviewInput.id = "overview";
                        overviewInput.name = "overview";
                        document
                            .getElementById("movieForm")
                            .appendChild(overviewInput);
                    }
                    overviewInput.value = overview;

                    let languageInput =
                        document.getElementById("language_hidden");
                    if (!languageInput) {
                        languageInput = document.createElement("input");
                        languageInput.type = "hidden";
                        languageInput.id = "language_hidden";
                        languageInput.name = "language";
                        document
                            .getElementById("movieForm")
                            .appendChild(languageInput);
                    }
                    languageInput.value = currentLanguage;

                    hideSuggestions();
                    titleInput.focus();
                });
            });
    };

    titleInput.addEventListener("input", () => {
        const query = titleInput.value.trim();
        clearTimeout(debounceTimer);

        if (query.length < 2) {
            hideSuggestions();
            if (searchLoader) {
                searchLoader.classList.add("hidden");
            }
            return;
        }

        if (searchLoader) {
            searchLoader.classList.remove("hidden");
        }

        debounceTimer = setTimeout(async () => {
            try {
                const url = `/movies/search?q=${encodeURIComponent(query)}&type=${currentType}&language=${currentLanguage}`;

                const response = await fetch(url);

                if (!response.ok) {
                    console.error("Search failed:", response.status);
                    if (searchLoader) {
                        searchLoader.classList.add("hidden");
                    }
                    return hideSuggestions();
                }

                const items = await response.json();
                renderSuggestions(Array.isArray(items) ? items : []);
            } catch (error) {
                console.error("Search error:", error);
                if (searchLoader) {
                    searchLoader.classList.add("hidden");
                }
                hideSuggestions();
            }
        }, 400);
    });

    // Close suggestions when clicking outside
    document.addEventListener("click", (event) => {
        if (
            !suggestionsEl.contains(event.target) &&
            event.target !== titleInput
        ) {
            hideSuggestions();
        }
    });

    // Close suggestions on Escape key
    titleInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            hideSuggestions();
        }
    });

    // Helper function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
});
