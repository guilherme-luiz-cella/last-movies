create index if not exists movies_imdb_id_index on movies(imdb_id);
create unique index if not exists movies_imdb_type_unique on movies(imdb_id, type) where imdb_id is not null;
