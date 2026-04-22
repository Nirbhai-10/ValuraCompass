# Valura Compass — Financial Planning MVP

A real, working web app implementing the Compass blueprint in `docs/compass/`.
Web-first. India-first with a region switch for India, GCC, and Global. Basic and Advanced modes
over one data model. Advisor and self-serve journeys. Individual, couple, and family views.
Full CRUD, real calculations, real persistence, and an audit trail.

## Tech stack

- **Next.js 14 (App Router) + TypeScript + React 18**
- **Tailwind CSS** (premium design tokens mirroring the brand palette)
- **Prisma ORM + SQLite** for local development (swap `provider` in `prisma/schema.prisma` for Postgres in prod)
- **Cookie-session auth** via signed JWT (`jose`), with middleware protecting `/app/*`
- **Zod** for validation on every server action

No mock data. Seed data for demo accounts only. No external network calls in any
calculation path.

## Project structure

```
.
├── docs/compass/                 # 27-section product blueprint (Markdown)
├── prisma/
│   ├── schema.prisma             # Canonical data model
│   ├── seed.ts                   # Demo firm, advisor, client, and the Sharma family
│   └── dev.db                    # SQLite database (generated)
├── public/uploads/               # Local file storage root for documents
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # login, signup, logout
│   │   │   ├── login/            # page.tsx + actions.ts
│   │   │   ├── signup/           # page.tsx + actions.ts
│   │   │   └── logout/route.ts
│   │   ├── api/
│   │   │   └── households/[id]/
│   │   │       ├── mode/route.ts       # toggle Basic/Advanced
│   │   │       └── region/route.ts     # switch region + currency
│   │   ├── app/                  # Authenticated app
│   │   │   ├── layout.tsx        # shell (header, session, household list)
│   │   │   ├── page.tsx          # households dashboard
│   │   │   ├── onboarding/       # create household flow
│   │   │   └── households/[id]/
│   │   │       ├── layout.tsx    # household shell (region, mode, left rail)
│   │   │       ├── page.tsx      # household overview: scores, insights, goals, NBA
│   │   │       ├── basic/        # Basic Mode wizard (11 steps, actions persist)
│   │   │       ├── people/       # People + Relationships CRUD + Family Map
│   │   │       ├── income/       # Incomes CRUD
│   │   │       ├── expenses/     # Expenses CRUD
│   │   │       ├── assets/       # Assets CRUD (class, liquidity, nominees)
│   │   │       ├── liabilities/  # Liabilities CRUD (EMI, rate, tenure)
│   │   │       ├── insurance/    # Policies CRUD (type, sum assured, premium)
│   │   │       ├── goals/        # Goals CRUD + projections
│   │   │       ├── retirement/   # Monte Carlo + projection
│   │   │       ├── risk/         # Risk profile + suitability heatmap
│   │   │       ├── tax/          # Tax-aware observation engine (India-first)
│   │   │       ├── estate/       # Will/PoA/trust readiness
│   │   │       ├── insights/     # Rule-driven insights, one-click → tasks
│   │   │       ├── tasks/        # Action Center (owner separation, status)
│   │   │       ├── documents/    # Upload + placeholder OCR service layer
│   │   │       ├── reports/
│   │   │       │   ├── basic/    # One-page premium report
│   │   │       │   └── full/     # Full plan report
│   │   │       ├── assumptions/  # Region defaults + per-household overrides
│   │   │       └── audit/        # Immutable audit trail viewer
│   │   ├── globals.css           # Tailwind + component classes
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Landing page
│   ├── components/               # Reusable UI (logo, cards, chips, map, etc.)
│   ├── lib/
│   │   ├── analytics/
│   │   │   ├── engine.ts         # 20 scores + projections + Monte Carlo
│   │   │   ├── insights.ts       # Rule library + NBA ranking
│   │   │   ├── suitability.ts    # Per-category guardrails
│   │   │   ├── tax.ts            # Observation engine (India-first)
│   │   │   └── types.ts
│   │   ├── assumptions.ts        # Region defaults + household overrides
│   │   ├── audit.ts              # Audit trail writes
│   │   ├── auth.ts               # bcrypt + JWT session helpers
│   │   ├── household.ts          # household/user access helpers
│   │   ├── prisma.ts             # singleton Prisma client
│   │   ├── region.ts             # IN / GCC / GLOBAL region packs
│   │   ├── services/
│   │   │   ├── ocr.ts            # PLACEHOLDER OCR service interface (see below)
│   │   │   └── storage.ts        # Local file storage (swap to S3/GCS later)
│   │   └── utils.ts              # clsx/twMerge + currency + number helpers
│   └── middleware.ts             # Protects /app/* with session JWT
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
├── .env / .env.example
└── package.json
```

## Setup

### Prerequisites

- Node.js 20+ (tested on 22)
- npm 10+

### Install

```bash
npm install
cp .env.example .env   # a local .env is already generated; edit AUTH_SECRET for production
```

### Database setup (local SQLite)

```bash
npm run setup
# equivalent to:
# prisma generate && prisma db push && tsx prisma/seed.ts
```

This:
- creates `prisma/dev.db`
- applies the schema (no migrations folder required for the SQLite dev workflow)
- seeds a demo firm, advisor, client, and a realistic Indian household

Switch to Postgres for production: change `provider = "postgresql"` in
`prisma/schema.prisma`, set `DATABASE_URL`, and run `prisma migrate dev`.

### Run locally

```bash
npm run dev    # development
# or
npm run build && npm run start    # production build
```

Open http://localhost:3000

### Seeded demo accounts

| Role | Email | Password |
|------|-------|----------|
| Advisor | `advisor@valura.ai` | `demo1234` |
| Client | `client@valura.ai` | `demo1234` |

Both are linked to the same demo household — **"The Sharma Family"** — with:
- 4 people (primary earner, spouse, child, elderly parent)
- 2 income sources, 10 expense lines, 8 assets, 2 liabilities, 3 policies, 4 goals
- Tax profile, risk profile, estate profile, behavior profile
- 4 auto-created tasks

### Useful scripts

```bash
npm run dev          # next dev
npm run build        # prisma generate + next build
npm run start        # production server
npm run db:push      # apply schema
npm run db:seed      # re-seed demo data
npm run db:studio    # Prisma Studio
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
```

## What's real vs what's a placeholder

### Production-ready (real logic, persisted, audited):

- Authentication: bcrypt + JWT cookie session, zod-validated forms, middleware.
- Multi-tenant model: `Firm → User → HouseholdMembership → Household` with scopes.
- Data model: people, relationships, income, expenses, assets (+ nominees), liabilities,
  policies (+ insured/beneficiary), goals, tasks, documents, scenarios, profiles (tax,
  risk, estate, behavior), assumption overrides, score snapshots, insights, audit events.
- Region framework: `IN` (default), `GCC`, `GLOBAL` rule packs with currency, assumptions,
  disclosures, and instruments, switchable per-household.
- Analytics engine: 20 scores (FHS, ERS, CFS, IDS, PAS, DSS, RRS, LAS, HFS, FDRS, TES, CRS,
  ESS, RPS, ISS, DCS, PCS, FTS, AUI, GFS avg) with component breakdowns, data-coverage
  confidence, plain-English narratives.
- Projections: per-goal future cost, required SIP, feasibility; retirement corpus path.
- Monte Carlo retirement simulation (2,000 paths default, configurable).
- Insight engine: rule-driven, severity-tagged, plain-English, one-click → task.
- Risk profile + suitability heatmap with guardrails per product category.
- Tax-aware observation engine (India regime-aware), review-needed flags.
- CRUD for every module with audit events.
- Action Center: owner separation (Advisor/Client/Spouse/Specialist/Compliance), status flow.
- Documents: upload to local storage with type and privacy classification.
- Reports: one-page Basic plan + full plan, print-optimized.
- Audit trail: immutable log of field writes, uploads, computations, task lifecycle,
  region/mode changes, OCR runs.

### Placeholder integrations (service layer stable; implementation intentionally inert):

Each placeholder is isolated behind an interface so production can plug in a real
provider **without changing callers**.

1. **OCR / Document Understanding — `src/lib/services/ocr.ts`**
   - Interface: `OcrService.extract(filePath, hint?) → OcrResult`
   - Placeholder returns an empty fields array and metadata noting that no provider is
     configured. It does not invent any fields or numbers.
   - To go live: implement a new class against `OcrService` (e.g., Google Document AI,
     AWS Textract, Azure Document Intelligence) and return a real `OcrResult`. Inject via
     `getOcrService()` or `setOcrServiceForTests()`.

2. **File storage — `src/lib/services/storage.ts`**
   - Ships with a local filesystem implementation under `public/uploads/<householdId>/`.
   - For production, replace `storeUpload` with S3 / GCS / Azure Blob and return the same
     `StoredFile` shape.

3. **Email / SMS / WhatsApp notifications**
   - Not shipped in V1. Audit trail captures events that would trigger notifications; add a
     service layer (e.g., `src/lib/services/notifications.ts`) when wiring an ESP.

4. **Aggregator / Open Banking / Account Aggregator feeds**
   - Out of scope per blueprint (V1 is manual-first + OCR-assisted).

5. **Live FX rates**
   - Currency conversion for cross-currency reporting is not applied in V1. Each record
     stores its own currency alongside values; a future FX service can translate for
     consolidated views.

6. **AI narratives (Section 21 of the blueprint)**
   - Not wired to an external LLM. Insight templates produce fully deterministic, plain-
     English copy using the engine's numbers. A future `src/lib/services/ai.ts` should be
     built to the citation-bound contract described in the blueprint before enabling.

## Security notes

- `AUTH_SECRET` must be at least 32 bytes in production. Rotate on compromise.
- SQLite is for development only. Use Postgres (with connection pooling) in production.
- File uploads are stored on disk locally; swap the storage layer before deploying.
- The seeded demo users and household are for exploration only.

## Brand

- Palette: `#4CAF50` (brand green — positive chips, highlights only), `#0F5132` (deep green —
  structure and primary CTAs), `#D4EDDA` (mint tint), `#F5F7FA` (canvas), `#FFFFFF`.
- Logo: `src/components/logo.tsx` renders an inline SVG mark. If the customer-supplied logo
  asset is available, drop it under `public/brand/` and swap the component to an `<Image>`.
- Severity palette (`#B91C1C`, `#C2410C`, `#A16207`, `#0E7490`) is kept distinct from brand
  green so severity never reads as "good."

## Next steps to take this to production

1. Replace SQLite with Postgres; add migrations folder.
2. Wire a real OCR provider via the `OcrService` interface.
3. Replace local file storage with S3/GCS and pre-signed URLs.
4. Add email notifications via a mail provider (transactional + reminders).
5. Add rate limiting on auth endpoints.
6. Add CSP headers and finalize security headers.
7. Add AI narration behind the citation-bound contract from `docs/compass/21-ai-layer.md`.
8. Harden couple consent UX for sensitive fields.
9. Add CI: `npm run typecheck`, `npm run lint`, `npm run build`.
