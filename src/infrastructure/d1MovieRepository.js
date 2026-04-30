export class D1MovieRepository {
    constructor(db) {
        this.db = db;
    }

    async list({ type = null, status = null } = {}) {
        const filters = [];
        const params = [];

        if (type) {
            filters.push("type = ?");
            params.push(type);
        }

        if (status) {
            filters.push("status = ?");
            params.push(status);
        }

        const where = filters.length > 0 ? `where ${filters.join(" and ")}` : "";
        const statement = this.db
            .prepare(`select * from movies ${where} order by created_at desc, id desc`)
            .bind(...params);

        const result = await statement.all();
        return result.results ?? [];
    }

    async stats({ type = null } = {}) {
        const params = type ? [type] : [];
        const where = type ? "where type = ?" : "";
        const scoped = await this.db
            .prepare(
                `select
                    count(*) as total,
                    sum(case when status = 'pending' then 1 else 0 end) as pending,
                    sum(case when status = 'watching' then 1 else 0 end) as watching,
                    sum(case when status = 'watched' then 1 else 0 end) as watched
                from movies ${where}`,
            )
            .bind(...params)
            .first();

        const global = await this.db
            .prepare(
                `select
                    sum(case when type = 'movie' then 1 else 0 end) as movies_count,
                    sum(case when type = 'series' then 1 else 0 end) as series_count
                from movies`,
            )
            .first();

        return normalizeStats({ ...scoped, ...global });
    }

    async findById(id) {
        return this.db.prepare("select * from movies where id = ?").bind(id).first();
    }

    async findByTmdbId(tmdbId, type) {
        return this.db.prepare("select * from movies where tmdb_id = ? and type = ?").bind(tmdbId, type).first();
    }

    async findByImdbId(imdbId, type) {
        return this.db.prepare("select * from movies where imdb_id = ? and type = ?").bind(imdbId, type).first();
    }

    async create(movie) {
        const now = new Date().toISOString();
        const result = await this.db
            .prepare(
                `insert into movies (
                    type, title, year, seasons, episodes, imdb_id, tmdb_id, poster_url,
                    overview, status, watched_at, created_at, updated_at
                ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) returning *`,
            )
            .bind(
                movie.type,
                movie.title,
                movie.year,
                movie.seasons,
                movie.episodes,
                movie.imdb_id,
                movie.tmdb_id,
                movie.poster_url,
                movie.overview,
                movie.status,
                movie.watched_at,
                now,
                now,
            )
            .first();

        return result;
    }

    async updateStatus(id, { status, watched_at }) {
        const result = await this.db
            .prepare(
                `update movies
                 set status = ?, watched_at = ?, updated_at = ?
                 where id = ?
                 returning *`,
            )
            .bind(status, watched_at, new Date().toISOString(), id)
            .first();

        return result;
    }

    async delete(id) {
        await this.db.prepare("delete from movies where id = ?").bind(id).run();
    }
}

function normalizeStats(stats) {
    return {
        total: Number(stats.total ?? 0),
        pending: Number(stats.pending ?? 0),
        watching: Number(stats.watching ?? 0),
        watched: Number(stats.watched ?? 0),
        movies_count: Number(stats.movies_count ?? 0),
        series_count: Number(stats.series_count ?? 0),
    };
}
