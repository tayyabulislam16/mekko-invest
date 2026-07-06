# Mekko-Invest — Product Requirements Document

## 1. Overview

**Mekko-Invest** is a portfolio planning and tracking web app. Users define a
**target allocation** — how they *want* their capital split across companies and
cash (totaling 100%) — and record their **actual invested amounts**. The app
visualizes how the real portfolio compares to the target, so a user can see at a
glance where they are over- or under-invested.

The name comes from the **Mekko (Marimekko) chart** used as the primary
visualization, where column width encodes allocation percentage.

### 1.1 Problem
Individual investors set intentions ("20% in Company A, 15% cash…") but lose
track of whether their real holdings match that plan. Spreadsheets are manual
and don't visualize drift well.

### 1.2 Goal
Let a user (1) define a target allocation, (2) enter what they've actually
invested, and (3) instantly see actual-vs-target as percentages and money,
highlighting drift.

## 2. Users & Auth
- **Multi-user** with accounts (email + password).
- Each user's portfolios and data are private to them.
- Session-based auth; passwords hashed (scrypt/bcrypt-compatible for the edge).

## 3. Core Concepts / Data Model

### Portfolio
A named plan owned by a user. Holds a **total target capital** (e.g. $100,000)
and a set of holdings. Target percentages across all holdings + cash must sum to
100%.

### Holding
A single line in a portfolio:
- `type`: `company` | `cash`
- `name` / `ticker` (for companies)
- `targetPercent`: intended share of the portfolio (0–100)
- `actualAmount`: money actually invested/held in this line (currency)

### Derived values (computed, not stored)
- **Target amount** = `totalCapital * targetPercent / 100`
- **Actual total** = sum of all `actualAmount`
- **Actual percent** (of actual total) = `actualAmount / actualTotal * 100`
- **Drift** = `actualPercent − targetPercent` (over/under-allocated)
- **Gap to target ($)** = `targetAmount − actualAmount`

## 4. Features (MVP)

| # | Feature | Description |
|---|---------|-------------|
| F1 | Auth | Register, log in, log out. Private data per user. |
| F2 | Create portfolio | Name + total target capital. |
| F3 | Manage holdings | Add/edit/remove companies and a cash line; set target %. |
| F4 | 100% validation | Warn/enforce that target percentages sum to 100%. |
| F5 | Record actuals | Enter actual invested amount per holding. |
| F6 | Dashboard | Mekko chart (target vs actual), bars per holding, summary table. |
| F7 | Drift indicators | Color + labels for over/under vs target. |

### 4.1 Dashboard visualization (dashboard mix)
- **Hero: Mekko chart** — two stacked/side-by-side Marimekko columns, one for
  Target allocation and one for Actual allocation. Segment width = %.
- **Per-holding bars** — target % vs actual % with over/under indicator.
- **Summary table** — name, target %, target $, actual $, actual %, drift, gap.
- **KPI row** — total capital, total invested, cash %, uninvested amount, #
  holdings.

## 5. Non-Goals (MVP)
- Live market price feeds / brokerage sync.
- Historical performance / P&L over time.
- Multiple portfolios per user (single active portfolio in MVP; schema allows
  more later).
- Sharing/collaboration.

## 6. Tech Stack
- **Framework**: Next.js 15 (App Router, TypeScript, React 19).
- **Styling**: Tailwind CSS.
- **Hosting**: Cloudflare Workers via `@opennextjs/cloudflare`.
- **Database**: Cloudflare D1 (SQLite), accessed with **Drizzle ORM**.
- **Auth**: session-based (cookie), password hashing at the edge.
- **Charts**: custom SVG/CSS Marimekko (no heavy chart dep) + lightweight bars.

## 7. Architecture

```
Browser ──> Next.js (App Router) on Cloudflare Workers
              ├── Server Components / Route Handlers
              ├── Server Actions (mutations)
              ├── Auth middleware (session cookie)
              └── Drizzle ORM ──> Cloudflare D1 (SQLite)
```

- Reads via Server Components; mutations via Server Actions / Route Handlers.
- D1 binding (`DB`) exposed through OpenNext's Cloudflare context.

## 8. Data Schema (D1 / Drizzle)

- `users(id, email, password_hash, created_at)`
- `sessions(id, user_id, expires_at)`
- `portfolios(id, user_id, name, total_capital, currency, created_at)`
- `holdings(id, portfolio_id, type, name, ticker, target_percent, actual_amount, sort_order)`

See `src/db/schema.ts` for the source of truth.

## 9. Key Screens / Routes
- `/` — landing (marketing + CTA).
- `/login`, `/register` — auth.
- `/dashboard` — the portfolio dashboard (default portfolio).
- `/portfolio/edit` — manage holdings, targets, actuals, capital.
- `/api/*` — route handlers where server actions aren't used.

## 10. Success Metrics
- A user can go from register → build a 100% target → enter actuals → see drift
  in under 5 minutes.
- Target vs actual drift is visually obvious for every holding.

## 11. Milestones
1. **M1 — Scaffold & infra**: Next.js + Cloudflare + D1 + Drizzle wired.
2. **M2 — Auth**: register/login/logout + protected routes.
3. **M3 — Portfolio CRUD**: create portfolio, manage holdings & capital.
4. **M4 — Actuals + Dashboard**: enter actuals, Mekko chart, bars, table, drift.
5. **M5 — Polish & deploy**: validation, empty states, deploy to Cloudflare.

## 12. Open Questions (future)
- Multi-currency handling and FX.
- Import holdings from CSV / broker.
- Rebalancing suggestions ("buy $X of A to hit target").
