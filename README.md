# LinkedIn Profile Search

Monorepo for the Cyberyan technical assessment: a NestJS API backed by PostgreSQL and Elasticsearch, with a React frontend for searching ~300 LinkedIn profiles.

## Quick Start

```sh
docker compose up --build
```

This starts:

- PostgreSQL on `localhost:5432`
- Elasticsearch on `localhost:9200`
- API on `http://localhost:3000`
- Web UI on `http://localhost:5173`

The API container runs migrations, seeds the LinkedIn dataset idempotently, and starts the server. The web container serves the React app and proxies `/api` requests to the API.

## Local Development

1. Start infrastructure:

```sh
docker compose up postgres elasticsearch -d
```

2. Configure environment:

```sh
cp apps/api/.env.example apps/api/.env
```

3. Install dependencies and prepare the database:

```sh
pnpm install
pnpm --filter api db:generate
pnpm --filter api db:migrate:deploy
pnpm --filter api db:seed
```

4. Run the API and frontend (in separate terminals):

```sh
pnpm --filter api dev
pnpm --filter web dev
```

The frontend runs on **http://localhost:5173** and proxies API requests to `http://localhost:3000` via `/api`.

Optional frontend env:

```sh
cp apps/web/.env.example apps/web/.env
```

## Frontend

Stack: React (Vite), TypeScript, Tailwind CSS, Shadcn-style UI primitives, TanStack Query, Axios.

### Features

- Keyword search across name, summary, and skills (server-side)
- Industry and job title multi-select filters (AND logic)
- Paginated results with loading and empty states
- URL-synced search state for shareable links

### Manual Test Checklist

- [ ] Open `http://localhost:5173` and confirm profiles load
- [ ] Search by keyword (e.g. `recruiting`) and verify results update after debounce
- [ ] Select an industry and job title together; results match both filters
- [ ] Clear filters resets dropdowns while keeping the search query
- [ ] Pagination navigates between result pages
- [ ] Empty state appears when no profiles match
- [ ] `docker compose up --build` serves the UI at `http://localhost:5173`

## API Documentation

With the API running on **http://localhost:3000**:

| URL | Description |
|-----|-------------|
| `/` | API entrypoint with route links |
| `/health` | Health check |
| `/profiles/search` | Search profiles |
| `/profiles/facets` | Facet values for filters |
| `/docs` | **Scalar** interactive API reference |
| `/swagger` | **Swagger UI** |
| `/swagger/json` | OpenAPI JSON spec |

**Testing in Scalar:** click **Test Request** on `GET /profiles/search`, then use the **Query Parameters** panel on the right. Enter values there (e.g. `q=recruiting`, `industry=Civil Engineering`) before sending. Facet values are Title Case — use `/profiles/facets` to see valid options. Lowercase values are auto-normalized.

Example search:

```sh
curl "http://localhost:3000/profiles/search?q=recruiting&industry=Civil%20Engineering"
```

## API Endpoints

### `GET /profiles/search`

Search profiles with keyword and facet filters.

Query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Keyword search across name, summary, skills, interests, job title |
| `industry` | string[] | Filter by industry (repeat param or comma-separated) |
| `jobTitle` | string[] | Filter by job title |
| `jobCompanyName` | string[] | Filter by company |
| `jobCompanyIndustry` | string[] | Filter by company industry |
| `locationName` | string[] | Filter by location |
| `locationCountry` | string[] | Filter by country |
| `locationRegion` | string[] | Filter by region/state |
| `gender` | string[] | Filter by gender |
| `jobTitleRole` | string[] | Filter by job title role |
| `skills` | string[] | Filter by skills (AND with other filters) |
| `interests` | string[] | Filter by interests |
| `minYearsExperience` | number | Minimum years of experience |
| `maxYearsExperience` | number | Maximum years of experience |
| `minSalary` | number | Minimum inferred salary |
| `maxSalary` | number | Maximum inferred salary |
| `page` | number | Page number (default: 1) |
| `limit` | number | Page size (default: 20, max: 100) |

Example:

```sh
curl "http://localhost:3000/profiles/search?q=recruiting&industry=Civil%20Engineering&jobTitle=Recruiting%20Manager"
```

### `GET /profiles/facets`

Returns facet values for dropdown filters. Accepts the same filter parameters as search so facet counts reflect the current query context.

## Data Ingestion Strategy

### Why PostgreSQL

The LinkedIn dataset is highly structured: each row maps cleanly to a relational profile with scalar fields (`industry`, `jobTitle`, `locationCountry`) and JSON arrays (`skills`, `interests`). PostgreSQL gives us durable storage, unique constraints on `linkedinId`, and B-tree indexes on the exact-match fields used by dropdown filters.

### Why Elasticsearch

Global keyword search and multi-facet filtering are Elasticsearch strengths. After profiles are cleaned and stored in PostgreSQL, they are indexed into Elasticsearch for fast full-text search across `fullName`, `summary`, `skills`, and `interests`, plus conjunctive facet filtering.

### ETL Pipeline

The seed script treats ingestion as ETL:

1. **Extract** — stream `docs/300 user linkedin.txt` with `csv-parser` to avoid loading the full file into memory.
2. **Transform** — sanitize each row:
   - convert Python-style arrays like `['manager']` into real JSON arrays
   - map empty strings and `None` to database `NULL`
   - title-case `industry`, `jobTitle`, and related facet labels for consistent dropdown grouping
   - parse salary ranges like `85,000-100,000` into numeric min/max values
3. **Load** — upsert into PostgreSQL by `linkedinId`, then bulk-index into Elasticsearch using the same identifier as the document `_id`.

### Idempotent Seeding

The seed script uses `prisma.profile.upsert()` keyed on `linkedinId`. Running it once or many times leaves the database in the same correct state without duplicate rows or unique-constraint crashes. Elasticsearch documents are indexed with the same `linkedinId` as `_id`, so re-seeding overwrites existing documents instead of duplicating them.

### Indexing Choices

Prisma indexes:

- `industry`, `jobTitle` — exact-match dropdown filters
- `jobCompanyName`, `locationCountry`, `gender`, `jobTitleRole` — additional facet filters

Elasticsearch mappings use `keyword` fields for facets and `text` fields for full-text search (`fullName`, `summary`).

### Test Subset

Unit tests use `apps/api/src/test/fixtures/mock-profiles.json`, a 4-row subset covering:

- a normal profile with skills and interests
- a profile with empty skills
- a profile with a long summary
- an invalid row missing required identifiers

This keeps ETL and query-builder tests isolated from the full dataset and live services.

## Testing

```sh
pnpm --filter api test
```
