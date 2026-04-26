# Valura Compass

> Household-native financial planning — Basic and Advanced over one data
> model, with a Monte Carlo retirement simulator, an insights engine, a risk
> profiler, tax/estate profiles, and editable assumptions. Browser-only.

Compass is a focused web app for tracking the people, money, and goals that
make up a household. **Basic mode** keeps the everyday surfaces clean and
fast. **Advanced mode** unlocks the deeper layers: Monte Carlo retirement
projections, a rule-based insights engine, a 6-question risk profile,
tax/estate profiles, and per-household assumption overrides.

Everything is saved in your browser's `localStorage`. There are no accounts,
no servers, and no databases. **A demo household ("the Sharma family") is
loaded automatically on first visit** so you can see every surface populated
without typing anything in.

If you only need one paragraph: clone the repo, run
`npm install && npm run dev`, open <http://localhost:3000>, click
**Get started**, and explore the demo household. Reset it from "Your data"
when you're ready to start your own.

---

## Table of contents

1. [Why Compass exists](#why-compass-exists)
2. [What's in the app](#whats-in-the-app)
3. [Quick start](#quick-start)
4. [Tech stack](#tech-stack)
5. [Architecture overview](#architecture-overview)
6. [Project structure](#project-structure)
7. [Routing map](#routing-map)
8. [Data model](#data-model)
9. [How storage works](#how-storage-works)
10. [The lib layer in detail](#the-lib-layer-in-detail)
    - [`lib/store.ts` — persistence + React hooks](#libstorets--persistence--react-hooks)
    - [`lib/selectors.ts` — read queries](#libselectorsts--read-queries)
    - [`lib/mutations.ts` — typed write operations](#libmutationsts--typed-write-operations)
    - [`lib/metrics.ts` — derived calculations](#libmetricsts--derived-calculations)
    - [`lib/validation.ts` — input validators](#libvalidationts--input-validators)
    - [`lib/migrations.ts` — schema upgrades](#libmigrationsts--schema-upgrades)
    - [`lib/format.ts`, `lib/types.ts`, `lib/utils.ts`](#smaller-modules)
11. [UI primitives](#ui-primitives)
12. [Design system](#design-system)
13. [Features](#features)
14. [Backup, import, and reset](#backup-import-and-reset)
15. [Print / Save as PDF](#print--save-as-pdf)
16. [Adding a new entity type](#adding-a-new-entity-type)
17. [Deploying to Vercel](#deploying-to-vercel)
18. [Local development tips](#local-development-tips)
19. [Privacy and security](#privacy-and-security)
20. [Browser support](#browser-support)
21. [Known limitations](#known-limitations)
22. [Roadmap ideas](#roadmap-ideas)
23. [FAQ](#faq)

---

## Why Compass exists

Most personal-finance apps fall into one of two camps:

- **Aggregators** that connect to your bank, scrape your spend, and present a
  river of charts. They do a lot, but most of them assume you live in the US,
  and most of them want a subscription, an email address, and a SOC2 audit's
  worth of trust before they show you anything useful.
- **Spreadsheets**. Powerful, but every household builds the wheel from
  scratch. Hard to share. Easy to break. No structure for things like
  insurance cover or "this is the goal for the kids' education".

Compass sits between those. It is opinionated about the *shape* of a
household — it knows the difference between an asset class and a liability
type — but it does not try to be your bank, your tax filer, or your
robo-advisor. You enter what you want to track. It gives you a calm,
organised view back.

Because it runs entirely in the browser, you can use it on a Vercel preview
URL the same way you would on `localhost`. There is nothing to log into,
nothing to phone home, and nothing to leak.

---

## What's in the app

Everything is anchored to a **household**, which has a **mode** — Basic or
Advanced. Basic shows a clean everyday surface set; Advanced unlocks the
projection / observation surfaces over the same underlying data.

### Always available (Basic + Advanced)

| Section         | What it tracks                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| **Overview**    | Net worth, monthly surplus, emergency-fund months, insurance multiple, asset allocation, expense breakdown, top-funded goals, and the top insights when in Advanced. |
| **People**      | Family members and dependents — primary person, spouse, kids, parents.                                |
| **Income**      | Recurring monthly income, by type and optionally by earner.                                           |
| **Expenses**    | Recurring monthly outflows, by category, with an essential / discretionary flag.                      |
| **Assets**      | Cash, equity, debt, gold, real estate, retirement, business, other.                                   |
| **Liabilities** | Home / vehicle / education / personal / business loans, credit cards, anything you owe.               |
| **Insurance**   | Life and non-life policies with sum assured, insurer, premium.                                        |
| **Goals**       | What you're saving toward, with priority, target year, and asset linking for "% funded" tracking.     |
| **Insights**    | Plain-English observations from a deterministic rules engine (emergency-fund, term-cover, concentration, debt-to-assets, allocation drift, will-status, near-goal-funding, missing data). Pin any to your action center. |
| **Action center** | A small list of things you've decided to do next, derived from insights or added by you.            |
| **Settings**    | Rename, change region/currency/structure, switch mode, export JSON, open the report, or delete.       |
| **Report**      | A one-page printable summary suited for PDF / advisor handoff.                                        |

### Advanced mode adds

| Section         | What it does                                                                                          |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| **Retirement**  | A full Monte Carlo simulator. 800 paths over the accumulation + retirement horizon, sampling annual returns from a normal distribution, drawing inflation-adjusted expenses through retirement. Returns success probability, percentile bands (p10 / p50 / p90), and a corpus-over-time chart. Inputs default from your current retirement-class assets and surplus. Optional one-time shocks (medical, inheritance) and income gaps (job loss, sabbatical) layer on top. |
| **Scenarios**   | A library of pre-built what-if cases — Retire at 55 / 60 / 65, FIRE at 50, Perpetual income (4% rule), Inflation +2pp, Returns −2pp, Higher volatility, Plan to age 95, Job loss for 12 / 24 months, Medical emergency at 50 (₹25L), Emergency at age 30 (₹10L), Inheritance at 55 (₹50L). Pick any subset and run them in one click. The page shows side-by-side success probability, P50 / P10 final corpus, and per-scenario band charts on click. The selection is saved per household and gets included in the printed report. |
| **Risk profile**| A 6-question RPS questionnaire (horizon, drawdown reaction, knowledge, dependents, income stability, growth-vs-comfort). Live score + band (Conservative → Aggressive) with a one-line rationale. |
| **Tax**         | India regime selector (Old / New / NA), business-income share, free-form notes. Used by other surfaces to frame complexity. |
| **Estate**      | Will + power-of-attorney status, guardianship notes, legacy intent.                                  |
| **Assumptions** | Per-household overrides for inflation (general / education / healthcare), expected returns (equity / debt / gold), equity volatility (σ), and life expectancy. Defaults are seeded by region (IN / GCC / GLOBAL). |

### Plan scores (Advanced overview + report)

Six derived scores, each 0–100 with a band (`Stressed` < 50, `Tight` 50–69, `Stable` 70–84, `Strong` 85+). Computed by [`lib/scores.ts`](src/lib/scores.ts), pure functions over the database, fully explainable.

- **Financial Health (FHS)** — composite of cash flow, net worth, emergency cover, and debt stress.
- **Emergency Resilience (ERS)** — months of essential expenses covered by liquid assets.
- **Debt Stress (DSS)** — debt-to-assets and EMI-to-income.
- **Retirement Readiness (RRS)** — retirement-class corpus vs. a 25× essentials target.
- **Investment Suitability (ISS)** — alignment between equity allocation and the household's risk band.
- **Planning Completeness (PAS)** — coverage across people, income, expenses, assets, liabilities, insurance, goals, risk, tax, estate.

There is also an app-level **Your data** screen for backing up, importing,
or wiping every household at once. New visitors get the Sharma-family demo
loaded automatically; reset that key any time to start blank.

Every section has the same shape:

- A **page header** with a title, a one-line summary (totals where
  relevant), and a primary action.
- A **search input** so you can filter long lists by label, type, or notes.
- A **list** of the items you've already added — each row has Edit and
  Delete buttons.
- An **empty state** when there's nothing yet, with a single primary action.
- A **dialog** that opens for both Add and Edit, so you only ever learn one
  form per section.
- **Toast notifications** at the bottom of the screen confirming each save
  or delete.

---

## Quick start

```bash
git clone https://github.com/Nirbhai-10/ValuraCompass.git
cd ValuraCompass
npm install
npm run dev
```

Open <http://localhost:3000>.

That's the whole setup. There is no database to provision, no `.env` file
to fill in, no migrations to run, no seed data to load.

### Available scripts

| Command             | What it does                                                                |
| ------------------- | --------------------------------------------------------------------------- |
| `npm run dev`       | Starts the Next.js dev server on port 3000 with hot reload.                 |
| `npm run build`     | Type-checks and builds for production. Output lives in `.next/`.            |
| `npm run start`     | Serves the production build (run after `build`).                            |
| `npm run lint`      | Runs Next.js' ESLint config across `src/`.                                  |
| `npm run typecheck` | Runs `tsc --noEmit` so you can verify types without producing a build.      |

---

## Tech stack

| Layer    | Choice                       | Why                                                                                  |
| -------- | ---------------------------- | ------------------------------------------------------------------------------------ |
| Framework| **Next.js 14** (App Router)  | File-system routing, React Server Components when useful, deploys cleanly on Vercel. |
| Language | **TypeScript** (strict)      | Catches the boring class of bugs at the editor.                                      |
| UI       | **React 18**                 | Client components for everything that touches the store.                             |
| Styling  | **Tailwind CSS 3.4**         | Utility-first, easy to keep visual rhythm consistent.                                |
| Storage  | **`localStorage`**           | Per-device, per-origin, ~5MB. No backend required.                                   |
| Misc     | `clsx` + `tailwind-merge`    | A tiny `cn()` helper for conditional class names.                                    |

There is **no** Prisma, **no** SQL, **no** auth provider, **no** API layer,
**no** Server Action that writes data. Every mutation runs in the browser
against `localStorage`.

---

## Architecture overview

The codebase is sliced into three layers, none of which know more about each
other than they need to:

```
                  ┌──────────────────────────────┐
                  │      pages (src/app/…)       │  Read store via hooks; trigger mutations.
                  │  thin: page = layout + glue  │  Imports from ui/ + lib/.
                  └──────┬─────────────────┬─────┘
                         │                 │
                ┌────────▼─────┐    ┌──────▼────────┐
                │   ui/  …     │    │   lib/  …     │  Pure React primitives; pure data fns.
                │  Button,     │    │  selectors,   │  ui/ never imports lib/, lib/ never
                │  Card, Dialog│    │  mutations,   │  imports ui/.
                │  Toast, etc. │    │  metrics,     │
                └──────────────┘    │  validation,  │
                                    │  store, types │
                                    └───────────────┘
```

- **`src/lib/`** is the brain. Pure TypeScript functions over a `Database`
  type. No React, no DOM. The only React-aware file is `store.ts`, which
  exposes hooks (`useDatabase`, `useUpdate`, `useHydrated`).
- **`src/components/ui/`** is the design system. Every primitive is small,
  styled once, and used everywhere. They never reach into the store.
- **`src/app/…`** holds the routes. Pages are thin: they wire `lib/` reads,
  `lib/` writes, `ui/` primitives, and a small amount of layout glue. No
  business logic lives here.

Adding a feature means adding to `lib/` (data + math), then composing a page
from existing `ui/` primitives. Most pages are 150–250 lines; the heavy
lifting sits in shared modules.

---

## Project structure

```
.
├── README.md                       # this file
├── next.config.mjs                 # minimal Next config (strict mode only)
├── package.json                    # dependencies and scripts
├── postcss.config.js               # Tailwind + Autoprefixer
├── tailwind.config.ts              # design tokens (colors, radii, fonts)
├── tsconfig.json                   # strict TS, "@/*" → "./src/*"
├── public/                         # static assets (currently empty)
└── src/
    ├── app/                        # Next.js App Router
    │   ├── layout.tsx              # root <html><body>, ToastProvider, global CSS
    │   ├── globals.css             # Tailwind layers + component classes + print rules
    │   ├── page.tsx                # public landing page (/)
    │   ├── print/[id]/page.tsx     # printable household report (top-level, no app chrome)
    │   └── app/                    # everything under /app
    │       ├── layout.tsx          # in-app shell (header + nav + footer)
    │       ├── page.tsx            # /app — list of households
    │       ├── new/page.tsx        # /app/new — create a new household
    │       ├── data/page.tsx       # /app/data — backup, import, reset
    │       └── households/[id]/
    │           ├── layout.tsx      # household-scoped shell with sidenav
    │           ├── page.tsx        # /app/households/:id — overview
    │           ├── settings/page.tsx
    │           ├── people/page.tsx
    │           ├── income/page.tsx
    │           ├── expenses/page.tsx
    │           ├── assets/page.tsx
    │           ├── liabilities/page.tsx
    │           ├── insurance/page.tsx
    │           └── goals/page.tsx
    ├── components/
    │   ├── logo.tsx                # CompassLogo + CompassMark (SVG)
    │   ├── household-nav.tsx       # the section sidenav inside a household (with mobile drawer)
    │   ├── breakdown.tsx           # horizontal-bar breakdown widget
    │   └── ui/                     # reusable design-system primitives
    │       ├── index.ts            # re-exports for ergonomic imports
    │       ├── button.tsx          # <Button variant size> wrapping <button>
    │       ├── card.tsx            # <Card padded> wrapper
    │       ├── dialog.tsx          # <Dialog> + useDialog<T>() hook
    │       ├── empty-state.tsx     # <EmptyState title description action>
    │       ├── entity-row.tsx      # <EntityList> + <EntityRow> for sections
    │       ├── field.tsx           # <Field> + <Input> + <Select> + <Textarea>
    │       ├── kpi.tsx             # <Kpi title value sub tone>
    │       ├── page-header.tsx     # <PageHeader title subtitle action>
    │       ├── search-input.tsx    # <SearchInput> + matchesQuery() helper
    │       └── toast.tsx           # <ToastProvider> + useToast()
    └── lib/
        ├── store.ts                # localStorage store + React hooks
        ├── types.ts                # all entity types + label maps
        ├── selectors.ts            # pure read queries
        ├── mutations.ts            # typed Mutator factories
        ├── metrics.ts              # derived numbers
        ├── validation.ts           # FormData → typed Drafts
        ├── migrations.ts           # schema upgrades (run on every read)
        ├── format.ts               # money + amount parsing helpers
        └── utils.ts                # cn() helper (clsx + tailwind-merge)
```

---

## Routing map

| Path                                       | Type        | What it shows                                            |
| ------------------------------------------ | ----------- | -------------------------------------------------------- |
| `/`                                        | Static      | Landing page.                                            |
| `/app`                                     | Static      | List of households.                                      |
| `/app/new`                                 | Static      | Create a new household (mode picker on the form).        |
| `/app/data`                                | Static      | Backup / import / reset all data.                        |
| `/app/households/[id]`                     | Dynamic     | Overview: KPIs, top insights, breakdowns, top goals.     |
| `/app/households/[id]/people`              | Dynamic     | Manage people.                                           |
| `/app/households/[id]/income`              | Dynamic     | Manage monthly income.                                   |
| `/app/households/[id]/expenses`            | Dynamic     | Manage monthly expenses.                                 |
| `/app/households/[id]/assets`              | Dynamic     | Manage assets.                                           |
| `/app/households/[id]/liabilities`         | Dynamic     | Manage liabilities.                                      |
| `/app/households/[id]/insurance`           | Dynamic     | Manage insurance policies.                               |
| `/app/households/[id]/goals`               | Dynamic     | Manage goals (with asset-funding selector).              |
| `/app/households/[id]/insights`            | Dynamic     | Rule-based observations; pin any to action center.       |
| `/app/households/[id]/tasks`               | Dynamic     | Action center for everyday and pinned items.             |
| `/app/households/[id]/retirement`          | Advanced    | Monte Carlo retirement simulator (800 paths) with shocks + income gaps. |
| `/app/households/[id]/scenarios`           | Advanced    | Pick + run multiple scenarios; side-by-side comparison.  |
| `/app/households/[id]/risk`                | Advanced    | RPS questionnaire + band rationale.                      |
| `/app/households/[id]/tax`                 | Advanced    | Regime, business-income share, notes.                    |
| `/app/households/[id]/estate`              | Advanced    | Will / POA status, guardianship, legacy intent.          |
| `/app/households/[id]/assumptions`         | Advanced    | Per-household overrides for inflation / returns / σ.     |
| `/app/households/[id]/settings`            | Dynamic     | Edit basics, switch mode, export, delete.                |
| `/print/[id]`                              | Dynamic     | Print-friendly one-page household report.                |

Every route under `/app/households/[id]` is wrapped by a layout that:

- Reads the household from the store.
- If it doesn't exist (e.g. you bookmarked a deleted one), redirects to `/app`.
- Renders breadcrumb, household title, and a sidenav for switching sections.
  On mobile, the sidenav collapses into a single-button dropdown.

The `/print/[id]` route is intentionally outside the `/app` route group so
it inherits only the root layout — no app header, no sidenav, no footer.
That keeps the printed page clean.

---

## Data model

All entities live in a single `Database` object, defined in
[`src/lib/types.ts`](src/lib/types.ts). Every record carries an `id` and most
carry a `householdId` foreign key.

```ts
interface Household {
  id: string;
  name: string;
  region: "IN" | "GCC" | "GLOBAL";
  currency: string;          // ISO 4217 ("INR", "AED", "USD", ...)
  structure: HouseholdStructure;
  createdAt: string;         // ISO timestamp
  updatedAt: string;
}

interface Person      { id; householdId; fullName; relation; dob?; isPrimary; notes?; }
interface Income      { id; householdId; personId?; label; type; amountMonthly; notes?; }
interface Expense     { id; householdId; category; label?; amountMonthly; essential; notes?; }
interface Asset       { id; householdId; label; assetClass; currentValue; notes?; }
interface Liability   { id; householdId; label; type; outstanding; emiMonthly?; interestRate?; notes?; }
interface Policy      { id; householdId; label; type; insurer?; sumAssured; premiumAnnual?; notes?; }
interface Goal        { id; householdId; label; type; targetAmount; targetYear;
                        priority; linkedAssetIds: string[]; notes?; }
```

The "enum-like" fields (`region`, `structure`, asset classes, expense
categories, etc.) are plain string unions, with display labels held in
constants in the same file. Adding a new value means appending to one array.

Cascade rules (centralised in [`mutations.ts`](src/lib/mutations.ts)):

- **Deleting a household** removes every person, income, expense, asset,
  liability, policy, and goal that belongs to it.
- **Deleting a person** keeps their income but clears `personId` so the
  income line isn't lost.
- **Deleting an asset** drops it from any goal's `linkedAssetIds` so funded%
  numbers don't dangle.

---

## How storage works

There is exactly one `localStorage` key:

```
compass-data-v1
```

The value is a JSON envelope:

```json
{
  "version": 1,
  "data": {
    "households": [...],
    "persons":    [...],
    "incomes":    [...],
    "expenses":   [...],
    "assets":     [...],
    "liabilities":[...],
    "policies":   [...],
    "goals":      [...]
  }
}
```

The envelope's `version` field exists so that future schema migrations have a
landing pad. The reader is forgiving: it will also accept the bare `data`
object, which is what you'll get from older builds or hand-written backups.

Every read runs through `migrate()` (see
[`migrations.ts`](src/lib/migrations.ts)), which backfills missing fields
(e.g. `linkedAssetIds: []` on goals from older versions) so the rest of the
app can rely on the shape.

The store keeps a single in-memory `cache` of the decoded database to avoid
parsing JSON on every render. Writes go to `cache` first and to
`localStorage` second; subscribers are notified synchronously. The store
also listens for the browser `storage` event, so if you open Compass in two
tabs and edit something in one, the other refreshes automatically.

---

## The lib layer in detail

The `src/lib/` directory is the heart of the app. All business rules,
storage, formatting, and math live here. Pages never duplicate this logic.

### `lib/store.ts` — persistence + React hooks

Owns the `localStorage` key and exposes the React-facing API:

```ts
useDatabase()  // hook: returns the whole Database, re-renders on change
useUpdate()    // hook: returns (mutator) => void
useHydrated()  // hook: false on first server render, true after hydration

uid("prefix")  // generate a unique-enough ID
nowISO()       // current time as ISO 8601 string

exportAll()    // returns a pretty-printed JSON string of the whole DB
importAll(str) // returns { ok: true } or { ok: false, error: "…" }
resetAll()     // wipe everything

type Mutator = (db: Database) => Database;
```

You always interact with the database through the hooks. Direct calls to
`localStorage` should not appear in pages.

### `lib/selectors.ts` — read queries

A small library of pure functions that read from a `Database`:

```ts
selectHouseholds(db)
selectHousehold(db, id)
selectPersons(db, householdId)
selectPrimaryPerson(db, householdId)
selectIncomes(db, householdId)
selectExpenses(db, householdId)
selectAssets(db, householdId)
selectLiabilities(db, householdId)
selectPolicies(db, householdId)
selectGoals(db, householdId)
selectHouseholdSnapshot(db, householdId)  // everything for one household
isHouseholdEmpty(db, householdId)
```

Pages prefer selectors over inlining `db.x.filter(...)` calls. If the shape
of storage changes (e.g. swapping arrays for indexed maps), only this module
needs to update.

### `lib/mutations.ts` — typed write operations

Each entity has three mutators (`add*`, `update*`, `remove*`) plus
`addHousehold` / `updateHousehold` / `removeHousehold`. They return a
`Mutator` so they compose cleanly with `useUpdate`:

```ts
import { useUpdate } from "@/lib/store";
import { addAsset, removeAsset, updateAsset } from "@/lib/mutations";

const update = useUpdate();
update(addAsset(householdId, draft));
update(updateAsset(id, patch));
update(removeAsset(id));
```

Cascade logic (deleting a household, an asset linked to goals, etc.) lives
here so pages don't need to worry about it. There's also a tiny
`compose(...mutators)` helper if you ever need to apply several at once.

### `lib/metrics.ts` — derived calculations

A pure-function module that converts a `Database` into the numbers the UI
shows. Used by both the overview and the printable report:

```ts
householdMetrics(db, hhId): {
  monthlyIncome, monthlyExpense, essentialExpense,
  monthlySurplus, surplusRate,
  totalAssets, totalLiabilities, netWorth,
  totalCover, totalAnnualPremium,
  liquidAssets, emergencyFundMonths,
  debtToAssets,
}

assetAllocation(db, hhId): Slice[]
expenseBreakdown(db, hhId): Slice[]
liabilityBreakdown(db, hhId): Slice[]
incomeBreakdown(db, hhId): Slice[]

goalProgress(db, hhId, goalId): { goal, funded, pct, remaining, yearsAway }
allGoalProgress(db, hhId): GoalProgress[]
```

Every number visible in the UI comes from this module. If you spot a wrong
total anywhere, you fix it in one place and every screen catches up.

### `lib/validation.ts` — input validators

Each entity has a `parseX(formData)` validator that returns either
`{ ok: true, value: Draft }` or `{ ok: false, error: string }`. Pages call
the validator before mutating:

```ts
const result = parseAsset(new FormData(e.currentTarget));
if (!result.ok) {
  setError(result.error);
  return;
}
update(addAsset(householdId, result.value));
```

This puts the "what's a valid Asset?" rules in one place and keeps page
forms thin.

### `lib/migrations.ts` — schema upgrades

A single `migrate(input)` function that takes a partial database (from
`localStorage` or an imported file) and returns a complete, modern shape
with any missing fields filled in. Run automatically on read, on import,
and on reset.

### Smaller modules

- **`lib/types.ts`** — every entity, every enum-like literal-union list, and
  the `Database` / `EMPTY_DB` exports.
- **`lib/format.ts`** — `formatMoney(n, currency, region)`, `formatNumber`,
  `parseAmount`. Centralises locale logic.
- **`lib/utils.ts`** — just `cn(...)` for class-name composition.

---

## UI primitives

The design system is intentionally small. Ten primitives cover everything:

| Primitive       | Purpose                                                                |
| --------------- | ---------------------------------------------------------------------- |
| `Button`        | Every clickable action. Variants: `primary`, `secondary`, `ghost`, `danger`. Sizes: `sm`, `md`. |
| `Card`          | Top-level surfaces. Pass `padded={false}` to opt out of padding.       |
| `Dialog` + `useDialog<T>()` | Add/Edit forms. Closes on Esc, on backdrop click, locks body scroll. |
| `EmptyState`    | "Nothing here yet" prompts with a CTA.                                 |
| `EntityList` + `EntityRow` | The repeating list pattern in every section page.           |
| `Field` + `Input`/`Select`/`Textarea` | All form fields, with consistent label + hint + focus behaviour. |
| `Kpi`           | The number-tile cards on the overview. Tones: `default`, `positive`, `warn`, `danger`. |
| `PageHeader`    | Title + subtitle + primary action above every section.                 |
| `SearchInput` + `matchesQuery()` | The filter pattern at the top of every list.          |
| `Toast` (`ToastProvider`, `useToast`) | Bottom-of-screen feedback. Auto-dismisses after ~3.5s. |

If you change one, the change ripples through every page that uses it.
There is no inline copy of these styles anywhere — adding a new section
page costs roughly 200 lines of glue, not 500.

The `Dialog` primitive is worth a closer look:

```tsx
import { Dialog, useDialog } from "@/components/ui";

const dialog = useDialog<Asset>();   // typed: holds an Asset or null

dialog.openFor(null);                 // open empty (Add)
dialog.openFor(existing);             // open with an item (Edit)
dialog.close();                       // hide

<Dialog open={dialog.open} onClose={dialog.close} title="...">
  <form onSubmit={...}>...</form>
</Dialog>
```

This drives every section's "click Add or click Edit on a row → same form,
prefilled if editing" behaviour.

---

## Design system

The visual language is set in
[`tailwind.config.ts`](tailwind.config.ts) and the `@layer components` block
in [`src/app/globals.css`](src/app/globals.css).

### Colors

| Token            | Hex       | Used for                              |
| ---------------- | --------- | ------------------------------------- |
| `brand.deep`     | `#0F5132` | Primary actions, links, focused state |
| `brand.green`    | `#4CAF50` | Logo gradient end stop                |
| `brand.mint`     | `#D4EDDA` | Hover backgrounds, soft accents       |
| `brand.canvas`   | `#F5F7FA` | Page background                       |
| `brand.surface`  | `#FFFFFF` | Card surfaces                         |
| `ink.900`        | `#0F172A` | Headings                              |
| `ink.700`        | `#334155` | Body text                             |
| `ink.500`        | `#64748B` | Secondary text                        |
| `ink.300`        | `#94A3B8` | Placeholder, disabled                 |
| `line.200`       | `#E2E8F0` | Borders                               |
| `line.100`       | `#F1F5F9` | Dividers                              |
| `severity.*`     | reds/oranges/cyans | Used sparingly for delete and warn states |

### Type

- **Sans (UI):** Inter / system stack, with `tabular-nums` enabled
  app-wide so amounts always line up.
- **Display (heroes):** Source Serif Pro, falling back to Georgia.

### Radii

- `rounded-button` = 8px
- `rounded-card` = 12px

### Spacing rhythm

The app sticks to a small set of vertical gaps: `space-y-6` inside section
pages, `gap-3` for KPI grids, and one of `p-5` / `p-6` for card padding.
Keep to those when adding new pages and the visual rhythm stays steady.

---

## Features

### Search and filter

Every section page has a search input at the top of its list. It does a
case-insensitive substring match over the most useful fields (label, type /
category, insurer, notes). The match logic lives in
[`matchesQuery()`](src/components/ui/search-input.tsx) and is reused
everywhere.

### Edit and delete

Every row exposes Edit and Delete. Edits open the same dialog as Add but
prefill the form. Deletes ask for a `confirm()` first and trigger a toast on
success.

### Toasts

A small bottom-of-screen pill confirms saves and deletes, and shows
validation errors. Tones are `info`, `success`, and `error`. Toasts
auto-dismiss after ~3.5 seconds and can be tapped to dismiss earlier. Wired
in via `<ToastProvider>` in the root layout.

### Goal funding

Each goal can be linked to one or more assets via the goal's edit dialog.
The Goals page shows a per-goal progress bar (sum of linked asset values ÷
target × 100). The Overview shows the closest four goals and their progress
side-by-side. Funded% updates live as you change asset values.

### Notes everywhere

Person, Income, Expense, Asset, Liability, Policy, and Goal all support a
free-form `notes` textarea. Useful for account numbers, insurance riders,
"why this exists" reminders, or anything else.

### Mobile sidenav drawer

On screens narrower than `lg`, the household sidenav collapses to a single
button showing the current section. Tapping it expands the full list; the
drawer closes automatically when you navigate.

### Emergency-fund signal

The overview's "Emergency fund" KPI divides liquid assets (Cash + Debt /
fixed income) by essential monthly expenses (or all expenses if nothing is
flagged essential). It tones positive at 6+ months, neutral at 3–6, and
warn below 3.

### Insurance multiple

When both income and cover are present, the overview shows total insurance
cover as a multiple of annual income — a quick, opinion-free sanity check.

---

## Backup, import, and reset

Open `/app/data` (or click **Your data** in the header) to:

- **Download a JSON backup** of every household, in one file.
- **Import a backup** — replaces the current database with whatever's in the
  uploaded file. The importer accepts both the new envelope shape and the
  bare `Database` shape, and runs the same migration the in-app reader runs.
- **Reset all data** — wipes everything in this browser, after a confirm.

There's a smaller, household-scoped **Export this household** action on each
household's Settings page if you only want to back up one.

> Compass never touches a server. If you want to "sync" between two devices,
> the workflow is: **Export here → email/AirDrop the JSON → Import there**.
> Crude, but bulletproof.

---

## Print / Save as PDF

Open a household → **Settings → Open report** (or **Report** in the
sidenav). The page is a one-page typeset summary with KPIs and tables for
every section, sized for letter / A4 with sensible margins.

Click **Print / Save as PDF** to use the browser's native print dialog. The
buttons disappear when printing, and the page background is forced white.

The print route lives at `/print/[id]`, outside the app's normal layout
chrome — no header, no sidenav, no footer to muddle the output.

---

## Adding a new entity type

If you want to add another tracked entity (say, recurring subscriptions or
properties), you do **six** things — and `tsc` will yell at you about the
ones you forget:

1. Add the type and an enum-like label list to `src/lib/types.ts`. Add the
   array to `Database` and `EMPTY_DB`.
2. Add `selectX(db, householdId)` to `selectors.ts`.
3. Add `addX`, `updateX`, `removeX` (with cascade rules) to `mutations.ts`.
4. Add `parseX(formData)` to `validation.ts`.
5. (Optional) Add any derived figure to `metrics.ts` and surface it on the
   overview / report.
6. Copy one of the existing section pages (e.g. `assets/page.tsx`),
   adjusting the fields and the labels. Add a route entry to
   `src/components/household-nav.tsx`.

Most new sections take a couple of hours end-to-end. There are no migrations
to write, no endpoints to wire, no auth rules to thread through.

---

## Deploying to Vercel

The app is a stock Next.js project with no environment variables and no
build prerequisites beyond `npm install`. Two options:

### Option A — Connect the GitHub repo (recommended)

1. Push the repo to GitHub.
2. In Vercel, **Add New Project** → import the repo.
3. Accept the defaults. Build command is `npm run build`; output directory
   is `.next/`. There are no environment variables to set.
4. Hit Deploy. Subsequent pushes to `main` will auto-deploy.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel        # first run: link / preview deploy
vercel --prod # production deploy
```

### What about Vercel's serverless filesystem?

Earlier versions of this project used SQLite via Prisma. That doesn't work
on Vercel because serverless function filesystems are ephemeral and
read-only, which is why every save in the old build silently failed.
Compass now does everything in the browser — Vercel's serverless platform
never sees a single write — and the deploy is just static + ISR pages with
a tiny client bundle.

---

## Local development tips

- **Inspect your data**. DevTools → Application → Local Storage → your
  origin → `compass-data-v1`. The value is JSON; you can hand-edit it for
  debugging.
- **Two-tab live edit**. Open the same household in two tabs. Edit
  something in one and the other refreshes automatically (we listen for the
  `storage` event).
- **Wipe in one line**: `localStorage.removeItem("compass-data-v1")` in the
  console. Or use **Reset all data** in the UI.
- **TypeScript first**. The store is fully typed. If you add a new field,
  the compiler will tell you every page that needs to handle it.
- **No SSR data**. Pages that depend on the store are client components and
  call `useHydrated()` before rendering data-dependent UI. Don't try to read
  `localStorage` in a Server Component or `useLayoutEffect` — both will fail
  during pre-render.

---

## Privacy and security

| Question                                            | Answer                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------- |
| Where is my data stored?                            | In your browser's `localStorage`, on the device you're using.                   |
| Does any data leave my device?                      | No. The app makes no network requests for user data, ever.                      |
| Is the data encrypted at rest?                      | No. `localStorage` is plaintext. Treat it like a notes app.                     |
| Can other websites read it?                         | No. `localStorage` is partitioned per origin.                                   |
| What if I clear browsing data?                      | The data is gone. **Export a backup before you clear cookies.**                 |
| What if I open the app in an incognito window?      | You start with an empty database, and it's wiped when the window closes.        |
| Is there an account or login?                       | No.                                                                             |
| Does the project track usage / send analytics?      | No. There are no analytics, no telemetry, no cookies.                           |

Because the data is in plaintext on the device, treat shared devices the
way you'd treat a shared note-taking app. If your threat model includes
someone opening DevTools on your laptop, this is not the right tool.

---

## Browser support

Compass uses `useSyncExternalStore`, modern `Intl.NumberFormat`, and modern
CSS. Anything from the last two years works:

- **Chrome / Edge** — 100+
- **Safari** — 15.4+
- **Firefox** — 100+
- **Mobile Safari / Chrome Android** — current

There is no IE11 path. There is no plan to add one.

---

## Known limitations

- **One device, one dataset.** No sync. By design — see "Why Compass
  exists". Use the Export/Import flow if you really need to move between
  devices.
- **No multi-user editing.** A household is the single user's view of their
  family's finances, not a shared workspace.
- **No transaction-level tracking.** Compass tracks balances and recurring
  amounts, not your bank statement. (If you want a budget app, build it on
  top — `Income` + `Expense` are the right primitives.)
- **No advisory engine.** There is no scoring, no recommendations, no Monte
  Carlo simulation. Earlier versions of this project had those; they were
  removed for clarity.
- **No documents.** Old versions had a Documents tab with OCR placeholders.
  That's gone too — there's nowhere for a file to go without a backend.

---

## Roadmap ideas

These are not commitments, just a sketch of what could come next without
breaking the "browser-only" promise.

- Net-worth-over-time chart, by snapshotting on every meaningful change.
- Editable primary person on the People page.
- Per-asset performance notes (cost basis, return so far).
- Multi-currency display per household (primary + secondary).
- Recurring-event reminders ("review this in 30 days").
- Optional encryption-at-rest behind a per-device passphrase.
- A printable cover letter on the report page (advisor handoff).

If you want any of these, open an issue. None require a server.

---

## FAQ

**Why no login?** Because the data never leaves your device. A login would
gate something that already lives only in your browser — pure friction.

**What if I lose my laptop?** You lose your Compass data, the same way
you'd lose a local Word doc. Use **Your data → Download backup**
periodically and keep the JSON somewhere safe (email it to yourself, drop
it on a USB stick, or add it to your password manager's secure notes).

**Why localStorage and not IndexedDB?** Compass datasets are tiny — even a
maximalist household tops out around tens of kilobytes. localStorage's 5MB
quota is plenty, and the API is easier to reason about. If you ever blow
past the quota, the store will swallow the write and continue with the
in-memory cache; that's the right behaviour for an app that actively warns
you to keep backups.

**How do I move data between two computers?** Settings → Export, Settings →
Import. There is no other way, and that is intentional.

**Can I track historical changes?** Not yet — the schema only stores
current values. The roadmap has a "snapshot on change" idea that would let
the overview show a net-worth trend over time.

**Why does the build work on Vercel without a database?** Because there is
no database. Every Vercel deploy is just static HTML, a tiny JS bundle, and
one key in your browser's local storage.

---

Made with care by Valura.Ai.
