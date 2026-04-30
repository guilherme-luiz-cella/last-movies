document.addEventListener("DOMContentLoaded",function(){k(),M(),A(),z()});function k(){const t=document.getElementById("header");t&&window.addEventListener("scroll",()=>{window.pageYOffset>50?t.classList.add("bg-[#141414]/95","backdrop-blur-sm","shadow-lg"):t.classList.remove("bg-[#141414]/95","backdrop-blur-sm","shadow-lg")})}function M(){document.querySelectorAll(".alert-success, .alert-error, .alert-info").forEach(n=>{setTimeout(()=>{n.style.transition="opacity 0.5s ease, transform 0.5s ease",n.style.opacity="0",n.style.transform="translateY(-10px)",setTimeout(()=>{n.remove()},500)},5e3)})}function A(){document.querySelectorAll(".movie-card").forEach(n=>{n.addEventListener("click",function(o){if(o.target.closest("button")||o.target.closest("form"))return;const m=document.createElement("span"),a=this.getBoundingClientRect(),i=Math.max(a.width,a.height),y=o.clientX-a.left-i/2,E=o.clientY-a.top-i/2;m.style.cssText=`
                position: absolute;
                width: ${i}px;
                height: ${i}px;
                left: ${y}px;
                top: ${E}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `,this.style.position="relative",this.style.overflow="hidden",this.appendChild(m),setTimeout(()=>m.remove(),600)})})}function z(){if("IntersectionObserver"in window){const t=new IntersectionObserver((o,m)=>{o.forEach(a=>{if(a.isIntersecting){const i=a.target;i.dataset.src&&(i.src=i.dataset.src,i.removeAttribute("data-src")),i.classList.add("loaded"),m.unobserve(i)}})});document.querySelectorAll("img[data-src]").forEach(o=>t.observe(o))}}function _(t){return confirm(`Tem certeza que deseja remover "${t}" da sua lista?`)}function q(t){const n=t.querySelector("button");n.innerHTML,n.disabled=!0,n.innerHTML='<svg class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>',t.submit()}const C=document.createElement("style");C.textContent=`
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;document.head.appendChild(C);window.confirmDelete=_;window.toggleStatus=q;document.addEventListener("DOMContentLoaded",function(){const t=document.getElementById("title"),n=document.getElementById("suggestions"),o=document.getElementById("searchLoader"),m=document.querySelectorAll('input[name="type"]'),a=document.getElementById("language"),i=document.getElementById("seriesFields"),y=document.getElementById("titleType"),E=document.getElementById("submitText");let I=null,l="movie",b="pt-BR";if(!t||!n){console.log("Create movie page elements not found");return}console.log("Create movie page initialized"),a&&a.addEventListener("change",s=>{b=s.target.value,console.log("Language changed to:",b),d(),t.value.trim().length>=2&&t.dispatchEvent(new Event("input"))}),m.forEach(s=>{s.addEventListener("change",r=>{l=r.target.value,console.log("Type changed to:",l),y&&(y.textContent=l==="movie"?"do Filme":"da Série"),t&&(t.placeholder=l==="movie"?"Ex: Interestelar, Matrix, Duna...":"Ex: Breaking Bad, Stranger Things, The Office..."),E&&(E.textContent=l==="movie"?"Adicionar Filme":"Adicionar Série"),i&&(l==="series"?i.classList.remove("hidden"):i.classList.add("hidden")),d()})});const d=()=>{n.innerHTML="",n.classList.add("hidden")},S=s=>{if(console.log("Rendering suggestions:",s.length),o&&o.classList.add("hidden"),!s||!s.length){d();return}const r=l==="series"?"📺":"🎬";n.innerHTML=s.map(e=>{const u=e.year?` <span class="text-gray-500">(${e.year})</span>`:"",f=e.poster&&e.poster!=="N/A"?`<img src="${e.poster}" alt="Pôster de ${c(e.title)}" class="h-16 w-11 rounded object-cover shadow-lg" loading="lazy">`:`<div class="flex h-16 w-11 items-center justify-center rounded bg-zinc-800 text-zinc-600">
                     <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
                     </svg>
                   </div>`;return`
                <button
                    type="button"
                    data-title="${c(e.title||"")}"
                    data-year="${c(e.year||"")}"
                    data-poster="${c(e.poster||"")}"
                    data-tmdb-id="${c(String(e.tmdb_id||""))}"
                    data-imdb-id="${c(String(e.imdb_id||""))}"
                    data-overview="${c(e.overview||"")}"
                    class="suggestion-item flex w-full items-center gap-4 border-b border-gray-800 px-4 py-3 text-left transition hover:bg-zinc-900 last:border-b-0"
                >
                    ${f}
                    <div class="flex-1">
                        <p class="font-medium text-white">${r} ${c(e.title)}${u}</p>
                        ${e.overview?`<p class="mt-1 text-xs text-gray-400 line-clamp-2">${c(e.overview)}</p>`:""}
                    </div>
                </button>
            `}).join(""),n.classList.remove("hidden"),n.querySelectorAll("button[data-title]").forEach(e=>{e.addEventListener("click",()=>{const u=e.dataset.title||"",f=e.dataset.year||"",w=e.dataset.poster||"",L=e.dataset.tmdbId||"",x=e.dataset.imdbId||"",T=e.dataset.overview||"";console.log("Suggestion selected:",{title:u,year:f,poster:w,tmdbId:L,imdbId:x}),t.value=u;const B=document.getElementById("year");B&&f&&(B.value=f);const $=document.getElementById("poster_url");$&&w&&w!=="N/A"&&($.value=w);let g=document.getElementById("tmdb_id");g||(g=document.createElement("input"),g.type="hidden",g.id="tmdb_id",g.name="tmdb_id",document.getElementById("movieForm").appendChild(g)),g.value=L;let p=document.getElementById("imdb_id");p||(p=document.createElement("input"),p.type="hidden",p.id="imdb_id",p.name="imdb_id",document.getElementById("movieForm").appendChild(p)),p.value=x;let v=document.getElementById("overview");v||(v=document.createElement("input"),v.type="hidden",v.id="overview",v.name="overview",document.getElementById("movieForm").appendChild(v)),v.value=T;let h=document.getElementById("language_hidden");h||(h=document.createElement("input"),h.type="hidden",h.id="language_hidden",h.name="language",document.getElementById("movieForm").appendChild(h)),h.value=b,d(),t.focus()})})};t.addEventListener("input",()=>{const s=t.value.trim();if(clearTimeout(I),console.log("Input changed:",s),s.length<2){d(),o&&o.classList.add("hidden");return}o&&o.classList.remove("hidden"),I=setTimeout(async()=>{try{const r=`/movies/search?q=${encodeURIComponent(s)}&type=${l}&language=${b}`;console.log("Fetching:",r);const e=await fetch(r);if(!e.ok)return console.error("Search failed:",e.status),o&&o.classList.add("hidden"),d();const u=await e.json();console.log("Search results:",u),S(Array.isArray(u)?u:[])}catch(r){console.error("Search error:",r),o&&o.classList.add("hidden"),d()}},400)}),document.addEventListener("click",s=>{!n.contains(s.target)&&s.target!==t&&d()}),t.addEventListener("keydown",s=>{s.key==="Escape"&&d()});function c(s){const r=document.createElement("div");return r.textContent=s,r.innerHTML}});
