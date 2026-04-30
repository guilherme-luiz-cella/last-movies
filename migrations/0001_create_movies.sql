create table if not exists movies (
    id integer primary key autoincrement,
    type text not null default 'movie' check (type in ('movie', 'series')),
    title text not null,
    year text,
    seasons integer,
    episodes integer,
    imdb_id text,
    tmdb_id integer,
    poster_url text,
    overview text,
    status text not null default 'pending' check (status in ('pending', 'watching', 'watched')),
    watched_at text,
    created_at text not null,
    updated_at text not null
);

create index if not exists movies_type_index on movies(type);
create index if not exists movies_status_index on movies(status);
create index if not exists movies_tmdb_id_index on movies(tmdb_id);
create index if not exists movies_imdb_id_index on movies(imdb_id);
create unique index if not exists movies_tmdb_type_unique on movies(tmdb_id, type) where tmdb_id is not null;
create unique index if not exists movies_imdb_type_unique on movies(imdb_id, type) where imdb_id is not null;
