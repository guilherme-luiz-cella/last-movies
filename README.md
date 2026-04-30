# Last Movies

Movie and series watchlist running on Cloudflare Workers with Cloudflare D1.

## Runtime

- Cloudflare Workers for HTTP, HTML rendering, and movie metadata integration
- Cloudflare D1 for persistence
- Vite + Tailwind for static assets served through the Worker assets binding
- Vitest for domain, application, and infrastructure tests

## Structure

- `src/domain`: movie types, statuses, validation, and status transition rules
- `src/application`: use cases for list, create, search, status toggle, and delete
- `src/infrastructure`: D1 repository and OMDb/TMDB metadata client implementations
- `src/interface`: Worker HTTP router and HTML response rendering
- `migrations`: D1 database schema
- `test`: success and failure tests for the Worker app logic

## Local setup

```bash
npm install
npm run build
npm run db:migrate:local
npm run dev
```

Set `TMDB_BEARER_TOKEN` as a Wrangler secret when you want TMDB search/details:

```bash
npx wrangler secret put TMDB_BEARER_TOKEN
```

`OMDB_API_KEY` is still supported as a fallback when `TMDB_BEARER_TOKEN` is not present:

```bash
npx wrangler secret put OMDB_API_KEY
```

For local development, `.env` can contain either the raw key or the full OMDb sample URL; the Worker extracts the `apikey` value when a URL is pasted.

## Cloudflare D1 setup

Create the database and copy the returned database id into `wrangler.jsonc`:

```bash
npx wrangler d1 create last-movies
```

Then apply migrations:

```bash
npm run db:migrate:remote
```

## Deploy

```bash
npm run deploy
```

Production route:

```text
https://movies.cella.website
```

## Tests

```bash
npm test
```
