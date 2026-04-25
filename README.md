# Valura Compass

> Household-native financial planning. Calm, minimal, browser-only.

Compass is a small, focused web app for tracking the people, money, and goals
that make up a household. It is built to be opened on a quiet evening, used for
fifteen minutes, and closed again — not stared at all day. Everything is saved
in your browser's `localStorage`. There are no accounts, no servers, and no
databases.

If you only need one paragraph: clone the repo, run `npm install && npm run
dev`, open <http://localhost:3000>, click **Get started**, create a household,
and start adding things.

---

## Table of contents

1. [Why Compass exists](#why-compass-exists)
2. [What's in the app](#whats-in-the-app)
3. [Quick start](#quick-start)
4. [Tech stack](#tech-stack)
5. [Project structure](#project-structure)
6. [Routing map](#routing-map)
7. [Data model](#data-model)
8. [How storage works](#how-storage-works)
9. [The store API](#the-store-api)
10. [UI primitives](#ui-primitives)
11. [Design system](#design-system)
12. [Backup, import, and reset](#backup-import-and-reset)
13. [Deploying to Vercel](#deploying-to-vercel)
14. [Local development tips](#local-development-tips)
15. [Privacy and security](#privacy-and-security)
16. [Browser support](#browser-support)
17. [Known limitations](#known-limitations)
18. [Roadmap ideas](#roadmap-ideas)
19. [FAQ](#faq)
20. [Disclaimer](#disclaimer)

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

Compass sits between those. It is opinionated about the shape of a household —
it knows the difference between an asset class and a liability type — but it
does not try to be your bank, your tax filer, or your robo-advisor. You enter
what you want to track. It gives you a calm, organised view back.

Because it runs entirely in the browser, you can use it on a Vercel preview URL
the same way you would on `localhost`. There is nothing to log into, nothing
to phone home, and nothing to leak.

---

## What's in the app

The app is organised around a single noun: **household**. Inside each
household, there are a handful of sections.

| Section         | What it tracks                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| **Overview**    | Net worth, monthly surplus, total insurance cover, asset allocation, expense breakdown, top goals.   |
| **People**      | Family members and dependents — the primary person, spouse, kids, parents, anyone who shares money.  |
| **Income**      | Recurring monthly income, by type (salary, business, rental, etc.) and optionally by earner.         |
| **Expenses**    | Recurring monthly outflows, by category, with an "essential vs. discretionary" flag.                 |
| **Assets**      | Anything you own — cash, equity, debt instruments, gold, real estate, retirement, business, other.   |
| **Liabilities** | Anything you owe — home loan, vehicle loan, credit card, personal/education/business loans.          |
| **Insurance**   | Life and non-life policies, with sum assured, insurer, and annual premium.                           |
| **Goals**       | What you're saving toward — retirement, kids' education, a home, travel — with priority and year.    |
| **Settings**    | Rename the household, change region/currency/structure, export it as JSON, or delete it permanently. |

There is also an app-level **Your data** screen for backing up, importing, or
wiping every household at once.

Every section has the same shape:

- A **page header** with a title, a one-line summary (totals where relevant),
  and a primary action.
- A **list** of the items you've already added — each row has Edit and Delete
  buttons.
- An **empty state** when there's nothing yet, with a single primary action.
- A **dialog** that opens for both Add and Edit, so you only ever learn one
  form per section.

---

## Quick start

```bash
git clone https://github.com/Nirbhai-10/ValuraCompass.git
cd ValuraCompass
npm install
npm run dev
```

Open <http://localhost:3000>.

That's the whole setup. There is no database to provision, no `.env` file to
fill in, no migrations to run, no seed data to load.

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
    │   ├── layout.tsx              # root <html><body>, global CSS
    │   ├── globals.css             # Tailwind layers + a few component classes
    │   ├── page.tsx                # public landing page (/)
    │   └── app/                    # everything under /app
    │       ├── layout.tsx          # in-app shell (header + nav + footer)
    │       ├── page.tsx            # /app — list of households
    │       ├── new/
    │       │   └── page.tsx        # /app/new — create a new household
    │       ├── data/
    │       │   └── page.tsx        # /app/data — backup, import, reset
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
    │   ├── household-nav.tsx       # the section sidenav inside a household
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
    │       └── page-header.tsx     # <PageHeader title subtitle action>
    └── lib/
        ├── types.ts                # all entity types + enum-like label maps
        ├── store.ts                # localStorage store + React hooks
        ├── format.ts               # money + amount parsing helpers
        └── utils.ts                # cn() helper (clsx + tailwind-merge)
```

### A note on modularity

Every section page is a thin shell over the same three building blocks:

```
PageHeader  +  EmptyState | EntityList(EntityRow*)  +  Dialog(form)
```

If you want to add another tracked entity (say, recurring subscriptions or
real-estate properties), you do four things:

1. Add the type and an enum-like label list to `src/lib/types.ts`.
2. Add the new array to `Database` and `EMPTY_DB`.
3. Copy one of the existing section pages (e.g. `assets/page.tsx`) and adjust
   the fields.
4. Add a route entry to `src/components/household-nav.tsx`.

That's it — no migrations, no new endpoints.

---

## Routing map

Compass has eleven routes. They're all listed here.

| Path                                       | Type        | What it shows                                          |
| ------------------------------------------ | ----------- | ------------------------------------------------------ |
| `/`                                        | Static      | Landing page with a hero, three feature blurbs, footer.|
| `/app`                                     | Static      | List of households (or empty state).                   |
| `/app/new`                                 | Static      | Form to create a new household.                        |
| `/app/data`                                | Static      | Backup / import / reset all data.                      |
| `/app/households/[id]`                     | Dynamic     | Household overview (KPIs, breakdowns, top goals).      |
| `/app/households/[id]/people`              | Dynamic     | Manage people in the household.                        |
| `/app/households/[id]/income`              | Dynamic     | Manage monthly income lines.                           |
| `/app/households/[id]/expenses`            | Dynamic     | Manage monthly expense lines.                          |
| `/app/households/[id]/assets`              | Dynamic     | Manage assets.                                         |
| `/app/households/[id]/liabilities`         | Dynamic     | Manage liabilities.                                    |
| `/app/households/[id]/insurance`           | Dynamic     | Manage insurance policies.                             |
| `/app/households/[id]/goals`               | Dynamic     | Manage goals.                                          |
| `/app/households/[id]/settings`            | Dynamic     | Edit, export, or delete a household.                   |

Every route under `/app/households/[id]` is wrapped by a layout that:

- Reads the household from the store.
- If it doesn't exist (e.g. you bookmarked a deleted one), redirects you to
  `/app`.
- Renders a breadcrumb, the household title, and a left-hand sidenav so you
  can switch sections without losing your place.

---

## Data model

All entities live in a single `Database` object whose shape is defined in
[`src/lib/types.ts`](src/lib/types.ts). Every record carries an `id` (a CUID-ish
string) and most carry a `householdId` foreign key.

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
interface Expense     { id; householdId; category; label?; amountMonthly; essential; }
interface Asset       { id; householdId; label; assetClass; currentValue; notes?; }
interface Liability   { id; householdId; label; type; outstanding; emiMonthly?; interestRate?; notes?; }
interface Policy      { id; householdId; label; type; insurer?; sumAssured; premiumAnnual?; notes?; }
interface Goal        { id; householdId; label; type; targetAmount; targetYear; priority; notes?; }
```

The "enum-like" fields (`region`, `structure`, asset classes, expense
categories, etc.) are plain string unions, with display labels held in
constants in the same file. Adding a new value means appending to one array.

When you delete a household, every related record (persons, incomes, expenses,
assets, liabilities, policies, goals) is removed in the same transaction.
When you delete a person, any income that pointed at them is left in place but
its `personId` is cleared, so you don't lose the income line.

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

The store keeps a single in-memory `cache` of the decoded database to avoid
parsing JSON on every render. Writes go to `cache` first and to
`localStorage` second; subscribers are notified synchronously.

The store also listens for the browser `storage` event, so if you open
Compass in two tabs and edit something in one, the other will refresh. This is
free, but worth knowing.

---

## The store API

The store lives at [`src/lib/store.ts`](src/lib/store.ts) and is **the** way to
read or write data in this app.

```ts
import {
  useDatabase,   // hook: returns the whole Database, re-renders on change
  useUpdate,     // hook: returns (mutator) => void
  useHydrated,   // hook: false on first server render, true after hydration
  uid,           // generate a unique ID (with optional prefix)
  nowISO,        // current time as ISO 8601 string
  exportAll,     // returns a pretty-printed JSON string of the whole DB
  importAll,     // takes a JSON string, returns { ok } or { ok: false, error }
  resetAll,      // wipes everything (after caller's confirm)
} from "@/lib/store";
```

A typical mutation looks like this:

```tsx
const update = useUpdate();

update((db) => ({
  ...db,
  goals: [...db.goals, { id: uid("goal"), householdId, /* ... */ }],
}));
```

Three rules to keep in mind:

1. **Always return a new database object.** The mutator must be pure: read
   `db`, return the new state. Don't mutate arrays or records in place.
2. **Use `useHydrated()` before rendering data-dependent UI on routes that are
   statically pre-rendered** (like `/app`). On the server pass, the database
   is empty; without `useHydrated`, you'll get React hydration warnings and a
   visible flash.
3. **`uid("prefix")` is just `prefix_<base36 time><base36 random>`.** It's not
   collision-proof against an attacker, but it's monotonic-ish and unique
   within a single browser, which is all this app needs.

---

## UI primitives

The design system is intentionally tiny. Eight primitives cover everything in
the app:

| Primitive       | Where it's used                                                            |
| --------------- | -------------------------------------------------------------------------- |
| `Button`        | Every clickable action. Variants: `primary`, `secondary`, `ghost`, `danger`. |
| `Card`          | Top-level surfaces (KPI, panel, form container). Pass `padded={false}` to opt out. |
| `Dialog` + `useDialog<T>()` | Add/Edit forms, confirmations. Closes on Esc or backdrop click.    |
| `EmptyState`    | "Nothing here yet" prompts with a CTA.                                     |
| `EntityList` + `EntityRow` | The repeating list pattern in every section page.               |
| `Field` + `Input`/`Select`/`Textarea` | All form fields, with consistent label + hint behaviour.  |
| `Kpi`           | The number-tile cards on the overview.                                     |
| `PageHeader`    | Title + subtitle + primary action above every section.                     |

If you change one, the change ripples through every page that uses it. There
is no inline copy of these styles anywhere — adding a new section page costs
about 150 lines of glue, not 500.

The `Dialog` primitive is worth a closer look:

```tsx
import { Dialog, useDialog } from "@/components/ui";

const dialog = useDialog<Asset>();   // typed: holds an Asset or null

dialog.openFor(null);                 // open empty (Add)
dialog.openFor(existing);             // open with an item (Edit)
dialog.close();                        // hide

<Dialog open={dialog.open} onClose={dialog.close} title="...">
  <form onSubmit={...}>...</form>
</Dialog>
```

This is what gives every section page its identical "click Add or click Edit
on a row → same form, prefilled if editing" behaviour.

---

## Design system

The visual language is set in [`tailwind.config.ts`](tailwind.config.ts) and
the `@layer components` block at the top of
[`src/app/globals.css`](src/app/globals.css). It's deliberately small.

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
pages, `gap-3` for KPI grids, and one of `p-5` / `p-6` for card padding. Keep
to those when adding new pages and the visual rhythm stays steady.

---

## Backup, import, and reset

Open `/app/data` (or click **Your data** in the header) to:

- **Download a JSON backup** of every household, in one file.
- **Import a backup** — replaces the current database with whatever's in the
  uploaded file. The importer accepts both the new envelope shape and the bare
  `Database` shape.
- **Reset all data** — wipes everything in this browser, after a confirm.

There's a smaller, household-scoped **Export this household** action on each
household's Settings page if you only want to back up one.

> Compass never touches a server. If you want to "sync" between two devices,
> the workflow is: **Export here → email/AirDrop the JSON → Import there**.
> Crude, but bulletproof.

---

## Deploying to Vercel

The app is a stock Next.js project with no environment variables and no build
prerequisites beyond `npm install`. Two options:

### Option A — Connect the GitHub repo (recommended)

1. Push the repo to GitHub.
2. In Vercel, **Add New Project** → import the repo.
3. Accept the defaults. The build command is `npm run build` and the output
   directory is `.next/`. There are no environment variables to set.
4. Hit Deploy. Subsequent pushes to `main` will auto-deploy.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel
vercel --prod
```

The first run links the project; the second pushes a production deploy.

### What about Vercel's serverless filesystem?

Earlier versions of this project used SQLite via Prisma. That doesn't work on
Vercel because serverless function filesystems are ephemeral and read-only,
which is why every save in the old build silently failed. Compass now does
everything in the browser — Vercel's serverless platform never sees a single
write — and the deploy is just static + ISR pages with a tiny client bundle.

---

## Local development tips

- **Inspect your data**. Open DevTools → Application → Local Storage → your
  origin → `compass-data-v1`. The value is just JSON; you can hand-edit it for
  debugging.
- **Two-tab live edit**. Open the same household in two tabs. Edit something
  in one and the other refreshes automatically (we listen for the `storage`
  event).
- **Wipe in one line**: `localStorage.removeItem("compass-data-v1")` in the
  console. Or use **Reset all data** in the UI.
- **TypeScript first**. The store is fully typed. If you add a new field, the
  compiler will tell you every page that needs to handle it.
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

Because the data is in plaintext on the device, treat shared devices the way
you'd treat a shared note-taking app. If your threat model includes someone
opening DevTools on your laptop, this is not the right tool.

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

- **One device, one dataset.** No sync. By design — see "Why Compass exists".
  Use the Export/Import flow if you really need to move between devices.
- **No multi-user editing.** A household is the single user's view of their
  family's finances, not a shared workspace.
- **No transaction-level tracking.** Compass tracks balances and recurring
  amounts, not your bank statement. (If you want a budget app, build one on
  top — `Income` + `Expense` are the right primitives.)
- **No advisory engine.** There is no scoring, no recommendations, no Monte
  Carlo simulation. Earlier versions of this project had those; they were
  removed for clarity. (See the roadmap below.)
- **No documents.** Old versions had a Documents tab with OCR placeholders.
  That's gone too — there's nowhere for a file to go without a backend.

---

## Roadmap ideas

These are not commitments, just a sketch of what could come next without
breaking the "browser-only" promise.

- Inline charts on Asset and Liability pages (allocation pie, EMI burn-down).
- Per-household theme accents.
- Editable primary person on People page.
- Goal funding view: link assets to goals, show percent funded.
- A "monthly review" prompt on the overview when 30 days have passed since
  `updatedAt`.
- Optional encryption-at-rest behind a per-device passphrase.
- A printable PDF export of the overview.

If you want any of these, open an issue. None of them require a server.

---

## FAQ

**Why no login?** Because the data never leaves your device. A login would
gate something that already lives only in your browser — pure friction.

**What if I lose my laptop?** You lose your Compass data, the same way you'd
lose a local Word doc. Use **Your data → Download backup** periodically and
keep the JSON somewhere safe (email it to yourself, drop it on a USB stick, or
add it to your password manager's secure notes).

**Why localStorage and not IndexedDB?** Compass datasets are tiny — even a
maximalist household tops out around tens of kilobytes. localStorage's 5MB
quota is plenty, and the API is easier to reason about. If you ever blow past
the quota, the store will swallow the write and continue with the in-memory
cache; that's the right behaviour for an app that actively warns you to keep
backups.

**How do I move data between two computers?** Settings → Export, Settings →
Import. There is no other way, and that is intentional.

**Why does the build work on Vercel without a database?** Because there is no
database. Every Vercel deploy is just static HTML, a tiny JS bundle, and one
key in your browser's local storage.

---

## Disclaimer

Compass is **planning observation only**. Nothing in this app is investment,
tax, or legal advice. The numbers it shows are the numbers you typed in; it
does not predict markets, recommend products, or model returns. If you act on
something Compass shows you, that's on you. If your situation is unusual,
talk to an actual qualified human.

---

Made with care by Valura.Ai · MIT-licensed (see `LICENSE` if present, or use
the spirit of "do anything reasonable" if not).
