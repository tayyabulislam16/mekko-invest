@AGENTS.md

# Mekko-Invest — project guide for Claude

Portfolio target-vs-actual tracker. Users set a target allocation (companies +
cash = 100%), record actual invested amounts, and see drift on a dashboard.
Product spec lives in [PRD.md](PRD.md).

## Stack
- **Next.js 16** (App Router, React 19, TypeScript) — Turbopack build.
- **Tailwind CSS v4** (config-less; tokens in [src/app/globals.css](src/app/globals.css)).
- **Cloudflare Workers** deploy via `@opennextjs/cloudflare` (OpenNext).
- **Cloudflare D1** (SQLite) + **Drizzle ORM**.
- **Auth**: cookie sessions, PBKDF2 password hashing via Web Crypto (edge-safe).

> ⚠ This is Next.js 16 — APIs differ from older versions. `cookies()`,
> `searchParams`, and `params` are **async** (await them). Check
> `node_modules/next/dist/docs/` before using unfamiliar APIs.

## Layout
```
src/
  app/
    page.tsx              Landing
    login/  register/     Auth pages (server actions)
    dashboard/            Read-only overview (Mekko chart, bars, table, KPIs)
    portfolio/edit/       Manage capital + holdings
  components/             MekkoChart, HoldingBars, SummaryTable, KpiRow, AppHeader
  db/
    schema.ts             Drizzle schema — SOURCE OF TRUTH for the DB
    index.ts              getDb() — Drizzle client bound to env.DB
  lib/
    auth.ts               Sessions (createSession / getCurrentUser / destroySession)
    crypto.ts             PBKDF2 hashing + newId()
    actions.ts            Server actions (auth + portfolio mutations)
    queries.ts            Data access (getOrCreateDefaultPortfolio)
    portfolio.ts          Pure derivation math (summarize) + formatters
    colors.ts             Categorical palette for holdings
migrations/               Drizzle-generated D1 SQL migrations
wrangler.toml             Worker + D1 binding config
```

## Data model (see src/db/schema.ts)
`users` → `sessions`, `portfolios` → `holdings`. A holding is `type: company|cash`
with `targetPercent` and `actualAmount`. Derived values (target $, actual %, drift,
gap) are **computed in `summarize()`**, never stored.

## Conventions
- **Mutations** = Server Actions in `src/lib/actions.ts` (`"use server"`), invoked
  from `<form action={...}>`. They `revalidatePath()` and `redirect()`.
- **DB access** only via `getDb()` inside a request scope. Never at module top level.
- Every mutation re-checks ownership with `getPortfolioForUser`.
- After changing `schema.ts`, run `npm run db:generate` then a `db:migrate:*`.
- Keep derivation logic pure and in `portfolio.ts` so it stays testable.

## Common commands
```
npm run dev                 # local dev (Cloudflare bindings via OpenNext)
npm run db:generate         # regenerate migration after schema change
npm run db:migrate:local    # apply migrations to local D1
npm run preview             # build + run on workerd locally
npm run deploy              # build + deploy to Cloudflare
npm run cf-typegen          # regenerate cloudflare-env.d.ts
```

## First-time setup
See [README.md](README.md) — create the D1 db, paste its id into `wrangler.toml`,
run migrations, then `npm run dev`.
