# Valura Compass

A small, calm tool for tracking the people, money, and goals that make up a household.

Compass runs entirely in your browser. Everything is saved to `localStorage` on
your device — no signup, no servers, no databases. Open the app, create a
household, and start adding things.

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** for styling
- **localStorage** for persistence (via a tiny store in `src/lib/store.ts`)

There is no backend, no database, and no auth.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## What's in the app

- **Households** — create as many as you like; each has its own region,
  currency, and structure.
- **People** — primary person, spouse, children, dependents.
- **Income / Expenses** — recurring monthly inflows and outflows.
- **Assets / Liabilities** — what you own and what you owe.
- **Insurance** — life, health, and other policies with sum assured tracked.
- **Goals** — what you're planning for, with a target year and priority.
- **Overview** — a single-screen summary of net worth, monthly surplus,
  total cover, and goals.

## Resetting your data

Open your browser devtools, go to Application → Local Storage, and delete the
`compass-data-v1` key. Or run `localStorage.clear()` in the console.

## Disclaimer

Planning observation only. Compass is not investment, tax, or legal advice.
