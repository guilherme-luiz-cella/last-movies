document.addEventListener("DOMContentLoaded",function(){M(),k(),A(),_()});function M(){const t=document.getElementById("header");t&&window.addEventListener("scroll",()=>{window.pageYOffset>50?t.classList.add("header-scrolled"):t.classList.remove("header-scrolled")})}function k(){document.querySelectorAll(".alert-success, .alert-error, .alert-info").forEach(n=>{setTimeout(()=>{n.style.transition="opacity 0.5s ease, transform 0.5s ease",n.style.opacity="0",n.style.transform="translateY(-10px)",setTimeout(()=>{n.remove()},500)},5e3)})}function A(){document.querySelectorAll(".movie-card").forEach(n=>{n.addEventListener("click",function(i){if(i.target.closest("button")||i.target.closest("form"))return;const l=document.createElement("span"),o=this.getBoundingClientRect(),r=Math.max(o.width,o.height),f=i.clientX-o.left-r/2,y=i.clientY-o.top-r/2;l.style.cssText=`
                position: absolute;
                width: ${r}px;
                height: ${r}px;
                left: ${f}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `,this.style.position="relative",this.style.overflow="hidden",this.appendChild(l),setTimeout(()=>l.remove(),600)})})}function _(){if("IntersectionObserver"in window){const t=new IntersectionObserver((i,l)=>{i.forEach(o=>{if(o.isIntersecting){const r=o.target;r.dataset.src&&(r.src=r.dataset.src,r.removeAttribute("data-src")),r.classList.add("loaded"),l.unobserve(r)}})});document.querySelectorAll("img[data-src]").forEach(i=>t.observe(i))}}function z(t){return confirm(`Tem certeza que deseja remover "${t}" da sua lista?`)}function q(t){const n=t.querySelector("button");n.innerHTML,n.disabled=!0,n.innerHTML='<svg class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>',t.submit()}const B=document.createElement("style");B.textContent=`
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;document.head.appendChild(B);window.confirmDelete=z;window.toggleStatus=q;document.addEventListener("DOMContentLoaded",function(){const t=document.getElementById("title"),n=document.getElementById("suggestions"),i=document.getElementById("searchLoader"),l=document.querySelectorAll('input[name="type"]'),o=document.getElementById("language"),r=document.getElementById("seriesFields"),f=document.getElementById("titleType"),y=document.getElementById("submitText");let I=null,u="movie",b="pt-BR";if(!t||!n)return;o&&o.addEventListener("change",s=>{b=s.target.value,d(),t.value.trim().length>=2&&t.dispatchEvent(new Event("input"))}),l.forEach(s=>{s.addEventListener("change",a=>{u=a.target.value,f&&(f.textContent=u==="movie"?"do Filme":"da Série"),t&&(t.placeholder=u==="movie"?"Ex: Interestelar, Matrix, Duna...":"Ex: Breaking Bad, Stranger Things, The Office..."),y&&(y.textContent=u==="movie"?"Adicionar Filme":"Adicionar Série"),r&&(u==="series"?r.classList.remove("hidden"):r.classList.add("hidden")),d()})});const d=()=>{n.innerHTML="",n.classList.add("hidden")},$=s=>{if(i&&i.classList.add("hidden"),!s||!s.length){d();return}const a=u==="series"?"Série":"Filme";n.innerHTML=s.map(e=>{const h=e.year?` <span class="text-gray-500">(${e.year})</span>`:"",E=e.poster&&e.poster!=="N/A"?`<img src="${e.poster}" alt="Pôster de ${c(e.title)}" class="h-16 w-11 rounded object-cover shadow-lg" loading="lazy">`:`<div class="flex h-16 w-11 items-center justify-center rounded bg-zinc-800 text-zinc-600">
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
                    ${E}
                    <div class="flex-1">
                        <p class="font-semibold text-white">${c(e.title)}${h}</p>
                        <p class="mt-0.5 text-[11px] font-bold uppercase text-red-300">${a}</p>
                        ${e.overview?`<p class="mt-1 text-xs text-gray-400 line-clamp-2">${c(e.overview)}</p>`:""}
                    </div>
                </button>
            `}).join(""),n.classList.remove("hidden"),n.querySelectorAll("button[data-title]").forEach(e=>{e.addEventListener("click",()=>{const h=e.dataset.title||"",E=e.dataset.year||"",w=e.dataset.poster||"",S=e.dataset.tmdbId||"",C=e.dataset.imdbId||"",T=e.dataset.overview||"";t.value=h;const L=document.getElementById("year");L&&E&&(L.value=E);const x=document.getElementById("poster_url");x&&w&&w!=="N/A"&&(x.value=w);let m=document.getElementById("tmdb_id");m||(m=document.createElement("input"),m.type="hidden",m.id="tmdb_id",m.name="tmdb_id",document.getElementById("movieForm").appendChild(m)),m.value=S;let p=document.getElementById("imdb_id");p||(p=document.createElement("input"),p.type="hidden",p.id="imdb_id",p.name="imdb_id",document.getElementById("movieForm").appendChild(p)),p.value=C;let g=document.getElementById("overview");g||(g=document.createElement("input"),g.type="hidden",g.id="overview",g.name="overview",document.getElementById("movieForm").appendChild(g)),g.value=T;let v=document.getElementById("language_hidden");v||(v=document.createElement("input"),v.type="hidden",v.id="language_hidden",v.name="language",document.getElementById("movieForm").appendChild(v)),v.value=b,d(),t.focus()})})};t.addEventListener("input",()=>{const s=t.value.trim();if(clearTimeout(I),s.length<2){d(),i&&i.classList.add("hidden");return}i&&i.classList.remove("hidden"),I=setTimeout(async()=>{try{const a=`/movies/search?q=${encodeURIComponent(s)}&type=${u}&language=${b}`,e=await fetch(a);if(!e.ok)return console.error("Search failed:",e.status),i&&i.classList.add("hidden"),d();const h=await e.json();$(Array.isArray(h)?h:[])}catch(a){console.error("Search error:",a),i&&i.classList.add("hidden"),d()}},400)}),document.addEventListener("click",s=>{!n.contains(s.target)&&s.target!==t&&d()}),t.addEventListener("keydown",s=>{s.key==="Escape"&&d()});function c(s){const a=document.createElement("div");return a.textContent=s,a.innerHTML}});
