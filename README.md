# Mekko-Invest

Set a **target** investment allocation across companies and cash (totaling 100%),
record what you've **actually** invested, and see how your real portfolio compares —
holding by holding — on a Marimekko-style dashboard.

See [PRD.md](PRD.md) for the product spec and [CLAUDE.md](CLAUDE.md) for the
architecture guide.

## Stack
Next.js 16 (App Router) · Tailwind v4 · Cloudflare Workers (OpenNext) ·
Cloudflare D1 (SQLite) + Drizzle ORM · cookie-session auth.

## Prerequisites
- Node 20+ and npm
- A Cloudflare account + `wrangler` (installed as a dev dependency)

## Local setup

```bash
npm install

# 1. Log in to Cloudflare (opens a browser)
npx wrangler login

# 2. Create the D1 database
npx wrangler d1 create mekko-invest-db
#    → copy the printed `database_id` into wrangler.toml (replace REPLACE_WITH_D1_DATABASE_ID)

# 3. Apply migrations to the LOCAL D1 instance
npm run db:migrate:local

# 4. Run the dev server
npm run dev
```

Open http://localhost:3000, register an account, and you'll land on the dashboard
with a starter portfolio (100% cash). Head to **Edit portfolio** to set your target
capital, add companies with target %, and enter actual invested amounts.

## Database workflow
The schema lives in [src/db/schema.ts](src/db/schema.ts). After editing it:

```bash
npm run db:generate        # create a new migration in ./migrations
npm run db:migrate:local   # apply to local D1
npm run db:migrate:remote  # apply to the deployed D1 (production)
```

## Deploy to Cloudflare

```bash
# One-time: apply migrations to the remote database
npm run db:migrate:remote

# Build with OpenNext and deploy the Worker
npm run deploy
```

`npm run preview` builds and runs the production Worker locally (on workerd) for a
final check before deploying.

## Environment / secrets
- Non-secret vars → `[vars]` in `wrangler.toml`.
- Secrets (e.g. an auth pepper) → `npx wrangler secret put NAME`, and locally via a
  gitignored `.dev.vars` (see `.dev.vars.example`).
- Regenerate binding types after changing bindings: `npm run cf-typegen`.

## Project scripts
| Script | What it does |
|--------|--------------|
| `npm run dev` | Local dev server with Cloudflare bindings |
| `npm run build` | Next.js production build |
| `npm run preview` | Build + run on workerd locally |
| `npm run deploy` | Build + deploy to Cloudflare Workers |
| `npm run db:generate` | Generate a Drizzle migration from the schema |
| `npm run db:migrate:local` / `:remote` | Apply migrations |
| `npm run cf-typegen` | Regenerate `cloudflare-env.d.ts` |
