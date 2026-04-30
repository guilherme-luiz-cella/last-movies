var m={MOVIE:"movie",SERIES:"series"},o={PENDING:"pending",WATCHING:"watching",WATCHED:"watched"},k={ALL:"all",MOVIES:"movies",SERIES:"series"},R={[o.PENDING]:"Para Assistir",[o.WATCHING]:"Assistindo",[o.WATCHED]:"Assistido"},M={[o.PENDING]:"\u{1F4CB}",[o.WATCHING]:"\u25B6\uFE0F",[o.WATCHED]:"\u2713"},re={[o.PENDING]:o.WATCHING,[o.WATCHING]:o.WATCHED,[o.WATCHED]:o.PENDING},p=class extends Error{constructor(t){super("Invalid movie input"),this.name="ValidationError",this.errors=t}};function j(e){return re[e]??o.PENDING}function _(e,t=new Date){return e===o.WATCHED?t.toISOString():null}function D(e){return e===k.MOVIES?m.MOVIE:e===k.SERIES?m.SERIES:null}function T(e){return e===m.SERIES?"S\xE9rie":"Filme"}function C(e,t=new Date){let s=[],r=String(e.type??"").trim(),i=String(e.title??"").trim(),n=String(e.status||o.PENDING).trim();Object.values(m).includes(r)||s.push("Tipo deve ser filme ou s\xE9rie."),(i.length===0||i.length>255)&&s.push("T\xEDtulo \xE9 obrigat\xF3rio e deve ter no m\xE1ximo 255 caracteres."),Object.values(o).includes(n)||s.push("Status inicial inv\xE1lido.");let a=N(e.seasons,"Temporadas",s),d=N(e.episodes,"Epis\xF3dios",s),c=L(e.tmdb_id,"TMDB ID",s);if(s.length>0)throw new p(s);return{type:r,title:i,status:n,tmdb_id:c,seasons:r===m.SERIES?a:null,episodes:r===m.SERIES?d:null,year:h(e.year),imdb_id:h(e.imdb_id),poster_url:h(e.poster_url),overview:h(e.overview),watched_at:_(n,t)}}function h(e){let t=String(e??"").trim();return t.length>0?t:null}function L(e,t,s){if(e==null||e==="")return null;let r=Number(e);return Number.isInteger(r)?r:(s.push(`${t} deve ser um n\xFAmero inteiro.`),null)}function N(e,t,s){let r=L(e,t,s);return r!==null&&r<1&&s.push(`${t} deve ser maior que zero.`),r}async function B(e,t={}){let s=D(t.type??"all"),r=t.status||null,i=await e.list({type:s,status:r}),n=await e.stats({type:s});return{movies:i,stats:n}}async function x(e,t){let s=await e.findById(t);if(!s)throw new Response("Not found",{status:404});return s}async function z(e,t,s,r=new Date){let i=C(s,r);if(i.tmdb_id!==null||i.imdb_id!==null){let d=i.tmdb_id!==null?await e.findByTmdbId(i.tmdb_id,i.type):await e.findByImdbId(i.imdb_id,i.type);if(d)return{created:!1,reason:"duplicate",movie:d,message:"Este t\xEDtulo j\xE1 est\xE1 na sua lista!"};let c=await t.getDetails(i,i.type,s.language);c&&(i=ie(i,c))}let n=await e.create(i),a=n.type==="series"?"S\xE9rie adicionada com sucesso!":"Filme adicionado com sucesso!";return{created:!0,movie:n,message:a}}async function U(e,t,s=new Date){let r=await x(e,t),i=j(r.status);return e.updateStatus(r.id,{status:i,watched_at:_(i,s)})}async function F(e,t){let s=await x(e,t);return await e.delete(s.id),{movie:s,message:s.type==="series"?"S\xE9rie removida com sucesso!":"Filme removido com sucesso!"}}async function O(e,t){let s=String(t.q??"").trim();if(s.length<2||s.length>255)throw new p(["Busca deve ter entre 2 e 255 caracteres."]);return e.search(s,t.type||"movie",t.language||"pt-BR")}function ie(e,t){return{...e,title:t.title??e.title,year:t.year??e.year,imdb_id:t.imdb_id??e.imdb_id,tmdb_id:t.tmdb_id??e.tmdb_id,poster_url:t.poster_url??e.poster_url,overview:t.overview??e.overview,seasons:e.type==="series"?t.seasons??e.seasons:null,episodes:e.type==="series"?t.episodes??e.episodes:null}}var y=class{constructor(t){this.db=t}async list({type:t=null,status:s=null}={}){let r=[],i=[];t&&(r.push("type = ?"),i.push(t)),s&&(r.push("status = ?"),i.push(s));let n=r.length>0?`where ${r.join(" and ")}`:"";return(await this.db.prepare(`select * from movies ${n} order by created_at desc, id desc`).bind(...i).all()).results??[]}async stats({type:t=null}={}){let s=t?[t]:[],r=t?"where type = ?":"",i=await this.db.prepare(`select
                    count(*) as total,
                    sum(case when status = 'pending' then 1 else 0 end) as pending,
                    sum(case when status = 'watching' then 1 else 0 end) as watching,
                    sum(case when status = 'watched' then 1 else 0 end) as watched
                from movies ${r}`).bind(...s).first(),n=await this.db.prepare(`select
                    sum(case when type = 'movie' then 1 else 0 end) as movies_count,
                    sum(case when type = 'series' then 1 else 0 end) as series_count
                from movies`).first();return ne({...i,...n})}async findById(t){return this.db.prepare("select * from movies where id = ?").bind(t).first()}async findByTmdbId(t,s){return this.db.prepare("select * from movies where tmdb_id = ? and type = ?").bind(t,s).first()}async findByImdbId(t,s){return this.db.prepare("select * from movies where imdb_id = ? and type = ?").bind(t,s).first()}async create(t){let s=new Date().toISOString();return await this.db.prepare(`insert into movies (
                    type, title, year, seasons, episodes, imdb_id, tmdb_id, poster_url,
                    overview, status, watched_at, created_at, updated_at
                ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) returning *`).bind(t.type,t.title,t.year,t.seasons,t.episodes,t.imdb_id,t.tmdb_id,t.poster_url,t.overview,t.status,t.watched_at,s,s).first()}async updateStatus(t,{status:s,watched_at:r}){return await this.db.prepare(`update movies
                 set status = ?, watched_at = ?, updated_at = ?
                 where id = ?
                 returning *`).bind(s,r,new Date().toISOString(),t).first()}async delete(t){await this.db.prepare("delete from movies where id = ?").bind(t).run()}};function ne(e){return{total:Number(e.total??0),pending:Number(e.pending??0),watching:Number(e.watching??0),watched:Number(e.watched??0),movies_count:Number(e.movies_count??0),series_count:Number(e.series_count??0)}}var v=class{constructor({apiKey:t,fetcher:s=fetch,baseUrl:r}={}){this.apiKey=ae(t),this.fetcher=s,this.baseUrl=r??"https://www.omdbapi.com/"}async search(t,s="movie"){if(!this.apiKey)return[];let r=new URL(this.baseUrl);r.searchParams.set("apikey",this.apiKey),r.searchParams.set("s",t),r.searchParams.set("type",s==="series"?"series":"movie");try{let i=await this.fetcher(r);if(!i.ok)return[];let n=await i.json();return n.Response==="False"?[]:(n.Search??[]).slice(0,6).map(a=>({title:a.Title,year:a.Year,imdb_id:a.imdbID,tmdb_id:null,type:s,poster:a.Poster&&a.Poster!=="N/A"?a.Poster:null,overview:null}))}catch{return[]}}async getDetails(t,s="movie"){if(!this.apiKey||!t.imdb_id)return null;let r=new URL(this.baseUrl);r.searchParams.set("apikey",this.apiKey),r.searchParams.set("i",t.imdb_id),r.searchParams.set("plot","full");try{let i=await this.fetcher(r);if(!i.ok)return null;let n=await i.json();return n.Response==="False"?null:{imdb_id:n.imdbID??t.imdb_id,tmdb_id:null,title:n.Title??null,year:n.Year??null,poster_url:n.Poster&&n.Poster!=="N/A"?n.Poster:null,overview:n.Plot&&n.Plot!=="N/A"?n.Plot:null,type:s}}catch{return null}}};function ae(e){let t=String(e??"").trim();if(!t)return"";try{return new URL(t).searchParams.get("apikey")??t}catch{return t}}var w=class{constructor({bearerToken:t,fetcher:s=fetch,baseUrl:r,imageBaseUrl:i}={}){this.bearerToken=t??"",this.fetcher=s,this.baseUrl=r??"https://api.themoviedb.org/3",this.imageBaseUrl=i??"https://image.tmdb.org/t/p"}async search(t,s="movie",r="pt-BR"){if(!this.bearerToken)return[];let i=s==="series"?"tv":"movie",n=new URL(`${this.baseUrl}/search/${i}`);n.searchParams.set("query",t),n.searchParams.set("language",r),n.searchParams.set("page","1");try{let a=await this.fetcher(n,this.requestOptions());return a.ok?((await a.json()).results??[]).slice(0,6).map(c=>this.mapSearchResult(c,s)).filter(c=>c.title):[]}catch{return[]}}async getDetails(t,s="movie",r="pt-BR"){if(!this.bearerToken)return null;let i=typeof t=="object"?t.tmdb_id:t;if(!i)return null;let n=s==="series"?"tv":"movie",a=new URL(`${this.baseUrl}/${n}/${i}`);a.searchParams.set("language",r);try{let d=await this.fetcher(a,this.requestOptions());return d.ok?this.mapDetails(await d.json(),s):null}catch{return null}}requestOptions(){return{headers:{Authorization:`Bearer ${this.bearerToken}`,Accept:"application/json"}}}mapSearchResult(t,s){let r=s==="series"?t.name??t.original_name:t.title??t.original_title,i=s==="series"?t.first_air_date:t.release_date;return{title:r,year:i?String(i).slice(0,4):null,tmdb_id:t.id??null,type:s,poster:this.posterUrl(t.poster_path),overview:t.overview??null}}mapDetails(t,s){let r=s==="series"?t.name??t.original_name:t.title??t.original_title,i=s==="series"?t.first_air_date:t.release_date,n={tmdb_id:t.id??null,title:r,year:i?String(i).slice(0,4):null,poster_url:this.posterUrl(t.poster_path),overview:t.overview??null,type:s};return s==="series"&&(n.seasons=t.number_of_seasons??null,n.episodes=t.number_of_episodes??null),n}posterUrl(t){return t?`${this.imageBaseUrl}/w500${t}`:null}};function G(e,t=fetch){return e.OMDB_API_KEY?new v({apiKey:e.OMDB_API_KEY,fetcher:t}):new w({bearerToken:e.TMDB_BEARER_TOKEN,fetcher:t})}var H=`
body{margin:0;background:#141414;color:#fff;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
a{color:inherit;text-decoration:none}button,input,select{font:inherit}.container-netflix{width:min(1180px,calc(100% - 32px));margin-inline:auto}
.header-container{background:linear-gradient(to bottom,rgba(0,0,0,.82),rgba(0,0,0,0));position:fixed;top:0;z-index:50;width:100%}
.btn-primary{background:#dc2626;color:#fff}.btn-primary:hover{background:#b91c1c}.btn-secondary{background:rgba(75,85,99,.85);color:#fff}
.hero-section{height:70vh;min-height:480px;position:relative}.hero-image{width:100%;height:100%;object-fit:cover;opacity:.42}.hero-gradient-bg{height:100%;background:linear-gradient(135deg,rgba(153,27,27,.25),#000)}
.hero-overlay-left{background:linear-gradient(to right,#141414,rgba(20,20,20,.62),transparent)}.hero-overlay-bottom{background:linear-gradient(to top,#141414,transparent)}
.stats-bar{background:rgba(0,0,0,.5)}.movies-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:14px}
.movie-card{transition:transform .2s ease}.movie-card:hover{transform:scale(1.03)}.poster-container{aspect-ratio:2/3;border-radius:8px;background:#18181b;overflow:hidden}.poster-image{width:100%;height:100%;object-fit:cover}
.card-overlay{opacity:0}.movie-card:hover .card-overlay{opacity:1}.alert-success{padding:1rem;border:1px solid rgba(16,185,129,.45);background:rgba(16,185,129,.18);color:#a7f3d0;border-radius:8px}
.input-field{box-sizing:border-box}.empty-state{min-height:360px}.hidden{display:none!important}
`,W=`
window.confirmDelete=(title)=>confirm('Tem certeza que deseja remover "'+title+'" da sua lista?');
document.addEventListener("DOMContentLoaded",()=>{const title=document.getElementById("title");const suggestions=document.getElementById("suggestions");if(!title||!suggestions)return;const radios=document.querySelectorAll('input[name="type"]');const language=document.getElementById("language");const series=document.getElementById("seriesFields");const titleType=document.getElementById("titleType");const submit=document.getElementById("submitText");let type="movie";let timer=null;radios.forEach(r=>r.addEventListener("change",()=>{type=r.value;if(series)series.classList.toggle("hidden",type!=="series");if(titleType)titleType.textContent=type==="series"?"da S\xE9rie":"do Filme";if(submit)submit.textContent=type==="series"?"Adicionar S\xE9rie":"Adicionar Filme";suggestions.innerHTML="";suggestions.classList.add("hidden")}));title.addEventListener("input",()=>{clearTimeout(timer);const q=title.value.trim();if(q.length<2){suggestions.classList.add("hidden");return}timer=setTimeout(async()=>{const res=await fetch("/movies/search?q="+encodeURIComponent(q)+"&type="+type+"&language="+(language?.value||"pt-BR"));if(!res.ok){suggestions.classList.add("hidden");return}const items=await res.json();suggestions.innerHTML=items.map(item=>'<button type="button" data-title="'+esc(item.title||'')+'" data-tmdb-id="'+esc(String(item.tmdb_id||''))+'" data-imdb-id="'+esc(String(item.imdb_id||''))+'" class="suggestion-item flex w-full items-center gap-4 border-b border-gray-800 px-4 py-3 text-left transition hover:bg-zinc-900 last:border-b-0">'+(item.poster?'<img src="'+esc(item.poster)+'" class="h-16 w-11 rounded object-cover shadow-lg" loading="lazy">':'')+'<span>'+esc(item.title||'')+(item.year?' ('+esc(item.year)+')':'')+'</span></button>').join("");suggestions.classList.toggle("hidden",items.length===0);suggestions.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{title.value=button.dataset.title||"";setHidden("tmdb_id",button.dataset.tmdbId||"");setHidden("imdb_id",button.dataset.imdbId||"");suggestions.classList.add("hidden")}))},350)});function setHidden(name,value){let input=document.getElementById(name);if(!input){input=document.createElement("input");input.type="hidden";input.id=name;input.name=name;document.getElementById("movieForm").appendChild(input)}input.value=value}function esc(value){return String(value).replace(/[&<>"']/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","'":"&#039;"}[char]))}});
`;function J({movies:e,stats:t,typeFilter:s,statusMessage:r}){let i=e[0]??null,n=t.total>0?Math.round(t.watched/t.total*100):0;return P({title:"Meus Filmes",description:"Organize seus filmes para assistir e acompanhe o que j\xE1 assistiu",body:`
            ${oe({typeFilter:s})}
            <section class="hero-section relative">
                <div class="hero-overlay-left absolute inset-0"></div>
                <div class="hero-overlay-bottom absolute inset-0"></div>
                ${i?.poster_url?`<img src="${l(i.poster_url)}" alt="${l(i.title)}" class="hero-image">`:'<div class="hero-gradient-bg h-full w-full"></div>'}
                <div class="absolute inset-0 flex items-center">
                    <div class="container-netflix">
                        <div class="max-w-2xl">
                            ${i?`
                                        <h2 class="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">${l(i.title)}</h2>
                                        ${i.overview?`<p class="mb-6 line-clamp-3 text-lg text-gray-300">${l(i.overview)}</p>`:""}
                                        <div class="flex flex-wrap gap-3">
                                            ${f(`/movies/${i.id}/toggle-status`,i.status===o.WATCHED?"\u2713 Assistido":"\u25B6 Assistir","flex items-center gap-2 rounded bg-white px-6 py-3 font-bold text-black transition hover:bg-gray-200")}
                                            <a href="/movies/${i.id}" class="btn-secondary flex items-center gap-2 rounded px-6 py-3 font-bold">Mais informa\xE7\xF5es</a>
                                        </div>
                                    `:`
                                        <h2 class="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">Bem-vindo \xE0 sua lista</h2>
                                        <p class="mb-6 text-lg text-gray-300">Comece adicionando filmes e s\xE9ries que voc\xEA quer assistir</p>
                                        <a href="/movies/create" class="btn-primary inline-flex items-center gap-2 rounded px-6 py-3 font-bold">Adicionar T\xEDtulo</a>
                                    `}
                        </div>
                    </div>
                </div>
            </section>
            <section class="stats-bar py-6">
                <div class="container-netflix">
                    <div class="grid grid-cols-2 gap-4 sm:grid-cols-5">
                        ${b(t.total,s==="movies"?"Filmes":s==="series"?"S\xE9ries":"Total","text-red-600")}
                        ${b(t.pending,"Para Assistir","text-amber-500")}
                        ${b(t.watching,"Assistindo","text-blue-500")}
                        ${b(t.watched,"J\xE1 Assistidos","text-emerald-500")}
                        ${s==="all"?b(t.series_count,"S\xE9ries","text-purple-500"):b(`${n}%`,"Progresso","text-blue-500")}
                    </div>
                </div>
            </section>
            ${r?`<div class="container-netflix py-4"><div class="alert-success">${l(r)}</div></div>`:""}
            <main class="container-netflix py-8">
                ${le(e,t,s)}
                ${e.length===0?ce(s):""}
            </main>
            ${te()}
        `})}function I({errors:e=[]}={}){return P({title:"Adicionar Filme",description:"Adicione um novo filme \xE0 sua lista",body:`
            ${Q()}
            <main class="container-netflix py-8 sm:py-12">
                <div class="mx-auto max-w-3xl">
                    <div class="mb-8">
                        <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-red-600/20 px-4 py-1.5 text-sm font-medium text-red-400">+ Novo Filme</div>
                        <h2 class="mb-2 text-3xl font-bold sm:text-4xl">Adicionar \xE0 sua lista</h2>
                        <p class="text-gray-400">Digite o t\xEDtulo do filme para buscar informa\xE7\xF5es autom\xE1ticas</p>
                    </div>
                    ${e.length>0?ue(e):""}
                    <div class="form-card overflow-hidden rounded-xl border border-gray-800 bg-zinc-900/50 backdrop-blur-sm">
                        <form action="/movies" method="POST" class="p-6 sm:p-8" id="movieForm">
                            <div class="mb-6">
                                <label class="mb-2 block text-sm font-semibold text-gray-300">Tipo</label>
                                <div class="grid grid-cols-2 gap-3">
                                    ${K("movie","\u{1F3AC}","Filme",!0)}
                                    ${K("series","\u{1F4FA}","S\xE9rie",!1)}
                                </div>
                            </div>
                            <div class="mb-6">
                                <label for="language" class="mb-2 block text-sm font-semibold text-gray-300">Idioma de Busca</label>
                                <select id="language" name="language" class="input-field w-full rounded-lg border border-gray-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-red-600">
                                    <option value="pt-BR" selected>Portugu\xEAs (Brasil)</option>
                                    <option value="en-US">English (USA)</option>
                                </select>
                            </div>
                            <div class="mb-6">
                                <label for="title" class="mb-2 block text-sm font-semibold text-gray-300">T\xEDtulo <span id="titleType">do Filme</span></label>
                                <div class="relative">
                                    <input type="text" id="title" name="title" placeholder="Ex: Interestelar, Matrix, Duna..." required autocomplete="off" class="input-field w-full rounded-lg border border-gray-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-red-600">
                                    <div id="searchLoader" class="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 text-red-500">...</div>
                                </div>
                                <div id="suggestions" class="suggestions-container mt-2 hidden overflow-hidden rounded-lg border border-gray-700 bg-zinc-950 shadow-2xl"></div>
                            </div>
                            <div id="seriesFields" class="mb-6 hidden space-y-4">
                                <div class="grid grid-cols-2 gap-4">
                                    ${V("seasons","Temporadas","Ex: 3")}
                                    ${V("episodes","Epis\xF3dios (Total)","Ex: 24")}
                                </div>
                            </div>
                            <div class="mb-8">
                                <label for="status" class="mb-2 block text-sm font-semibold text-gray-300">Status Inicial</label>
                                <select id="status" name="status" class="input-field w-full rounded-lg border border-gray-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-red-600">
                                    <option value="pending">\u{1F4CB} Para Assistir</option>
                                    <option value="watching">\u25B6 Assistindo</option>
                                    <option value="watched">\u2713 J\xE1 Assistido</option>
                                </select>
                            </div>
                            <div class="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <a href="/" class="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 px-6 py-3 text-sm font-semibold text-gray-300 transition hover:bg-gray-800">Cancelar</a>
                                <button type="submit" class="btn-primary inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold"><span id="submitText">Adicionar Filme</span></button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        `})}function Z(e){return P({title:e.title,description:e.overview??"Detalhes do filme",body:`
            ${Q()}
            <section class="relative h-[80vh] min-h-[600px]">
                <div class="absolute inset-0">
                    ${e.poster_url?`<img src="${l(e.poster_url)}" alt="${l(e.title)}" class="h-full w-full object-cover object-center">`:'<div class="h-full w-full bg-gradient-to-br from-zinc-900 to-black"></div>'}
                    <div class="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                </div>
                <div class="relative flex h-full items-end">
                    <div class="container-netflix pb-16">
                        <div class="max-w-2xl">
                            <div class="mb-4 flex items-center gap-3">
                                <span class="inline-flex items-center gap-2 rounded-full ${e.type==="series"?"bg-purple-600/90":"bg-red-600/90"} px-4 py-1.5 text-sm font-bold backdrop-blur-sm">${e.type==="series"?"\u{1F4FA} S\xC9RIE":"\u{1F3AC} FILME"}</span>
                                <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold backdrop-blur-sm ${fe(e.status)}">${ee(e.status)} ${E(e.status)}</span>
                            </div>
                            <h1 class="mb-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">${l(e.title)}</h1>
                            <div class="mb-6 flex flex-wrap items-center gap-3 text-base text-gray-300">${pe(e)}</div>
                            ${e.overview?`<p class="mb-8 line-clamp-3 text-lg leading-relaxed text-gray-200">${l(e.overview)}</p>`:""}
                            <div class="flex flex-wrap gap-3">
                                ${f(`/movies/${e.id}/toggle-status`,be(e.status),"rounded-lg bg-white px-8 py-3 font-bold text-black transition hover:bg-gray-200")}
                                ${f(`/movies/${e.id}/delete`,"Remover","rounded-lg bg-red-600/80 px-8 py-3 font-bold backdrop-blur-sm transition hover:bg-red-600")}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section class="bg-[#181818] py-16">
                <div class="container-netflix">
                    <div class="mx-auto max-w-6xl">
                        <h2 class="mb-8 text-3xl font-bold">Mais Informa\xE7\xF5es</h2>
                        <div class="grid gap-8 lg:grid-cols-3">
                            <div class="space-y-8 lg:col-span-2">
                                ${e.overview?`<div><h3 class="mb-3 text-xl font-semibold text-gray-300">Sinopse</h3><p class="text-lg leading-relaxed text-gray-400">${l(e.overview)}</p></div>`:""}
                                <div class="grid gap-6 sm:grid-cols-2">
                                    ${u("T\xEDtulo",e.title)}
                                    ${e.year?u("Ano de Lan\xE7amento",e.year):""}
                                    ${u("Tipo",T(e.type))}
                                    ${u("Status",E(e.status))}
                                    ${e.type==="series"&&e.seasons?u("Temporadas",e.seasons):""}
                                    ${e.type==="series"&&e.episodes?u("Total de Epis\xF3dios",e.episodes):""}
                                    ${e.watched_at?u("Assistido em",Y(e.watched_at)):""}
                                </div>
                            </div>
                            <div class="space-y-6">
                                ${e.poster_url?`<div class="overflow-hidden rounded-lg"><img src="${l(e.poster_url)}" alt="${l(e.title)}" class="w-full"></div>`:""}
                                ${me(e)}
                                ${u("Adicionado em",Y(e.created_at))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            ${te()}
        `})}function $(e,t=null){let s=new URL(e,"https://last-movies.local");return t&&s.searchParams.set("status",t),new Response(null,{status:303,headers:{Location:s.pathname+s.search}})}function g(e,t=200){return new Response(e,{status:t,headers:{"content-type":"text/html; charset=utf-8"}})}function A(e,t=200){return new Response(JSON.stringify(e),{status:t,headers:{"content-type":"application/json; charset=utf-8"}})}function P({title:e,description:t,body:s}){return`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${l(e)} \u2022 Last Movies</title>
    <meta name="description" content="${l(t)}">
    <link rel="stylesheet" href="/build/assets/app.css">
    <script type="module" src="/build/assets/app.js"></script>
</head>
<body class="min-h-screen bg-[#141414] text-white">
${s}
</body>
</html>`}function oe({typeFilter:e}){return`<header class="fixed top-0 z-50 w-full header-container transition-all duration-300" id="header">
        <div class="container-netflix flex items-center justify-between py-4">
            <div class="flex items-center gap-8">
                <h1 class="text-2xl font-bold text-red-600 sm:text-3xl">MEUS FILMES & S\xC9RIES</h1>
                <nav class="hidden items-center gap-6 md:flex">
                    ${[["/","Todos","all"],["/?type=movies","Filmes","movies"],["/?type=series","S\xE9ries","series"]].map(([s,r,i])=>`<a href="${s}" class="nav-link text-sm font-medium ${e===i?"text-white":"text-gray-300"}">${r}</a>`).join("")}
                </nav>
            </div>
            <a href="/movies/create" class="btn-primary flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold">+ Adicionar</a>
        </div>
    </header>`}function Q(){return`<header class="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div class="container-netflix flex items-center justify-between py-4">
            <div class="flex items-center gap-4">
                <a href="/" class="flex items-center gap-2 text-gray-400 transition hover:text-white">\u2190 Voltar</a>
                <h1 class="text-xl font-bold text-red-600 sm:text-2xl">MEUS FILMES & S\xC9RIES</h1>
            </div>
        </div>
    </header>`}function le(e,t,s){return s==="all"?[q("Filmes","\u{1F3AC}",t.movies_count,e.filter(r=>r.type==="movie")),q("S\xE9ries","\u{1F4FA}",t.series_count,e.filter(r=>r.type==="series"))].join(""):X(e)}function q(e,t,s,r){return r.length===0?"":`<section class="mb-12">
        <div class="mb-6 flex items-center gap-3">
            <span class="text-4xl">${t}</span>
            <h2 class="text-3xl font-bold">${e}</h2>
            <span class="rounded-full bg-red-600/20 px-3 py-1 text-sm font-medium text-red-400">${s}</span>
        </div>
        ${X(r)}
    </section>`}function X(e){return[[o.PENDING,"\u{1F4CB} Para Assistir","text-amber-400"],[o.WATCHING,"\u25B6\uFE0F Assistindo","text-blue-400"],[o.WATCHED,"\u2713 J\xE1 Assistidos","text-emerald-400"]].map(([t,s,r])=>{let i=e.filter(n=>n.status===t);return i.length===0?"":`<section class="mb-8"><h3 class="mb-4 text-2xl font-bold ${r}">${s}</h3><div class="movies-grid">${i.map(de).join("")}</div></section>`}).join("")}function de(e){return`<div class="movie-card group relative overflow-hidden rounded-lg transition-all duration-300">
        <a href="/movies/${e.id}" class="block">
            <div class="poster-container relative aspect-[2/3] overflow-hidden bg-zinc-900">
                ${e.poster_url?`<img src="${l(e.poster_url)}" alt="${l(e.title)}" class="poster-image h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy">`:'<div class="flex h-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-600">Sem p\xF4ster</div>'}
                <div class="card-overlay absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div class="absolute bottom-0 left-0 right-0 p-4">
                        <h4 class="card-title mb-2 text-sm font-bold leading-tight text-white">${l(e.title)}</h4>
                        <div class="mb-3 flex items-center gap-2 text-xs text-gray-300">${e.year?`<span>${l(e.year)}</span>`:""}<span class="rounded ${e.type==="series"?"bg-purple-600/30 text-purple-300":"bg-blue-600/30 text-blue-300"} px-2 py-0.5">${T(e.type)}</span></div>
                        <div class="flex gap-2">
                            ${f(`/movies/${e.id}/toggle-status`,`${ee(e.status)} ${E(e.status)}`,"btn-toggle flex w-full items-center justify-center gap-1 rounded px-3 py-2 text-xs font-semibold transition")}
                            ${f(`/movies/${e.id}/delete`,"Remover","btn-delete flex items-center justify-center rounded bg-red-600 p-2 text-xs transition hover:bg-red-700")}
                        </div>
                    </div>
                </div>
                <div class="absolute left-2 top-2"><span class="rounded-full ${e.type==="series"?"bg-purple-600":"bg-blue-600"} px-2 py-1 text-xs font-semibold shadow-lg">${e.type==="series"?"\u{1F4FA}":"\u{1F3AC}"}</span></div>
                ${e.status===o.WATCHED?'<div class="status-badge absolute right-2 top-2 rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold">\u2713</div>':""}
            </div>
        </a>
    </div>`}function f(e,t,s){return`<form action="${e}" method="POST" class="inline"><button class="${s}">${t}</button></form>`}function b(e,t,s){return`<div class="text-center"><p class="text-3xl font-bold ${s}">${e}</p><p class="mt-1 text-sm text-gray-400">${t}</p></div>`}function ce(e){return`<div class="empty-state flex flex-col items-center justify-center text-center"><h3 class="mb-2 text-2xl font-bold text-gray-300">Nenhum ${e==="movies"?"filme":e==="series"?"s\xE9rie":"item"} ainda</h3><p class="mb-6 text-gray-500">Comece adicionando filmes e s\xE9ries \xE0 sua lista</p><a href="/movies/create" class="btn-primary inline-flex items-center gap-2 rounded px-6 py-3 font-bold">Adicionar T\xEDtulo</a></div>`}function K(e,t,s,r){return`<label class="type-radio-card relative cursor-pointer rounded-lg border-2 border-gray-700 bg-zinc-950 p-4 transition hover:border-red-600">
        <input type="radio" name="type" value="${e}" class="peer sr-only" ${r?"checked":""}>
        <div class="flex flex-col items-center gap-2"><span class="text-3xl">${t}</span><span class="font-semibold text-white">${s}</span></div>
        <div class="absolute inset-0 hidden rounded-lg border-2 border-red-600 bg-red-600/10 peer-checked:block"></div>
    </label>`}function V(e,t,s){return`<div><label for="${e}" class="mb-2 block text-sm font-semibold text-gray-300">${t}</label><input type="number" id="${e}" name="${e}" min="1" placeholder="${s}" class="input-field w-full rounded-lg border border-gray-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-purple-600"></div>`}function ue(e){return`<div class="alert-error mb-6 rounded-lg border border-red-600/40 bg-red-600/20 p-4 text-red-200"><p class="mb-2 font-semibold">Corrija os seguintes erros:</p><ul class="ml-7 list-disc space-y-1 text-sm">${e.map(t=>`<li>${l(t)}</li>`).join("")}</ul></div>`}function pe(e){return[e.year,e.type==="series"&&e.seasons?`${e.seasons} Temporada${e.seasons===1?"":"s"}`:"",e.type==="series"&&e.episodes?`${e.episodes} Epis\xF3dios`:""].filter(Boolean).map(t=>`<span>${l(String(t))}</span>`).join("<span>\u2022</span>")}function u(e,t){return`<div class="rounded-lg border border-gray-700 bg-zinc-900/50 p-4"><h4 class="mb-2 text-sm font-semibold text-gray-400">${e}</h4><p class="text-lg font-medium">${l(String(t))}</p></div>`}function me(e){return e.tmdb_id?`<a href="https://www.themoviedb.org/${e.type==="series"?"tv":"movie"}/${e.tmdb_id}" target="_blank" class="flex items-center justify-between rounded-lg border border-gray-700 bg-zinc-900/50 p-4 transition hover:bg-zinc-800"><span class="font-semibold">Ver no TMDB</span><span>\u2197</span></a>`:e.imdb_id?`<a href="https://www.imdb.com/title/${l(e.imdb_id)}/" target="_blank" class="flex items-center justify-between rounded-lg border border-gray-700 bg-zinc-900/50 p-4 transition hover:bg-zinc-800"><span class="font-semibold">Ver no IMDb</span><span>\u2197</span></a>`:""}function be(e){return e===o.PENDING?"Come\xE7ar a Assistir":e===o.WATCHING?"Marcar como Assistido":"Assistir Novamente"}function E(e){return R[e]??"Desconhecido"}function ee(e){return M[e]??"?"}function fe(e){return e===o.PENDING?"bg-amber-500/90":e===o.WATCHING?"bg-blue-500/90":"bg-emerald-500/90"}function Y(e){return new Intl.DateTimeFormat("pt-BR",{timeZone:"UTC"}).format(new Date(e))}function te(){return'<footer class="border-t border-gray-800 bg-black py-8"><div class="container-netflix text-center"><p class="text-sm text-gray-500">Minha Lista de Filmes & S\xE9ries \u2022 Feito para Cloudflare Workers</p></div></footer>'}function l(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}async function se(e,t){let s=new URL(e.url),r=e.method==="HEAD"?"GET":e.method,i=new y(t.DB),n=G(t,t.fetcher??fetch);try{if(r==="GET"&&xe(s)&&t.ASSETS)return t.ASSETS.fetch(e);if(r==="GET"&&s.pathname==="/build/assets/app.css")return new Response(H,{headers:{"content-type":"text/css; charset=utf-8"}});if(r==="GET"&&s.pathname==="/build/assets/app.js")return new Response(W,{headers:{"content-type":"application/javascript; charset=utf-8"}});if(r==="GET"&&s.pathname==="/"){let d=s.searchParams.get("type")||"all",c=s.searchParams.get("filter")||null,S=await B(i,{type:d,status:c});return g(J({...S,typeFilter:d,statusMessage:s.searchParams.get("status")}))}if(r==="GET"&&s.pathname==="/movies/create")return g(I());if(r==="GET"&&s.pathname==="/movies/search"){let d=await O(n,Object.fromEntries(s.searchParams));return A(d)}if(r==="POST"&&s.pathname==="/movies"){let d=await ge(e),c=await z(i,n,d),S=c.movie.type==="series"?"series":"movies";return $(`/?type=${S}`,c.message)}let a=he(s.pathname);if(a&&r==="GET"&&a.action==="show")return g(Z(await x(i,a.id)));if(a&&r==="POST"&&a.action==="toggle-status")return await U(i,a.id),$("/");if(a&&r==="POST"&&a.action==="delete"){let d=await F(i,a.id);return $("/",d.message)}return t.ASSETS?t.ASSETS.fetch(e):new Response("Not found",{status:404})}catch(a){return a instanceof p?r==="POST"?g(I({errors:a.errors}),422):A({errors:a.errors},422):a instanceof Response?a:(console.error(a),new Response("Internal server error",{status:500}))}}async function ge(e){if((e.headers.get("content-type")??"").includes("application/json"))return e.json();let s=await e.formData();return Object.fromEntries(s.entries())}function he(e){let t=e.match(/^\/movies\/(\d+)(?:\/([a-z-]+))?$/);return t?{id:Number(t[1]),action:t[2]??"show"}:null}function xe(e){return e.pathname.startsWith("/build/")||e.pathname==="/favicon.ico"||e.pathname==="/robots.txt"}var ze={fetch(e,t){return se(e,t)}};export{ze as default};
