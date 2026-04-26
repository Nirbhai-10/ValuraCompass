"use client";

import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";

interface Section {
  id: string;
  title: string;
  body: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: "quick-start",
    title: "Quick start",
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          First-time visitors land on the demo household. Click around — every page
          is populated.
        </li>
        <li>
          When you're ready, go to <Link href="/app/data" className="link">Your data → Reset all data</Link>{" "}
          to clear the demo, then <Link href="/app/new" className="link">create your own household</Link>.
        </li>
        <li>
          Everything is saved in your browser. Backup before you clear cookies.
        </li>
      </ul>
    ),
  },
  {
    id: "household-model",
    title: "The household model",
    body: (
      <>
        <p>
          A household is the unit of planning. Each household has a region (India,
          GCC, Global), a currency, a structure (Nuclear, Joint, Single, etc.), and
          a mode (Basic / Advanced). Inside, you track:
        </p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong>People</strong> — primary, spouse, children, parents, anyone who shares money.</li>
          <li><strong>Income</strong> — recurring monthly inflows (salary, business, rental, dividends).</li>
          <li><strong>Expenses</strong> — recurring outflows by category, with an essential / discretionary flag.</li>
          <li><strong>Assets</strong> — cash, equity, debt, gold, real estate, retirement, business.</li>
          <li><strong>Liabilities</strong> — loans, credit-card balances, anything you owe.</li>
          <li><strong>Insurance</strong> — life, health, critical illness, disability, etc.</li>
          <li><strong>Goals</strong> — what you're saving toward; link assets to track funded %.</li>
        </ul>
      </>
    ),
  },
  {
    id: "modes",
    title: "Basic vs Advanced",
    body: (
      <>
        <p>
          Use the <strong>Basic / Advanced</strong> toggle in the household header
          to switch instantly. Switching never deletes data — Advanced fields stay
          intact, just hidden.
        </p>
        <p className="mt-2">
          <strong>Basic mode</strong> shows the everyday surfaces: People, Income,
          Expenses, Assets, Liabilities, Insurance, Goals, Insights, Action center.
        </p>
        <p className="mt-2">
          <strong>Advanced mode</strong> adds: Retirement (Monte Carlo), Scenarios,
          Risk profile, Tax (Old vs New regime + optimisations), Estate, and editable
          Assumptions.
        </p>
      </>
    ),
  },
  {
    id: "overview",
    title: "Overview",
    body: (
      <p>
        The first page of every household. KPIs at the top (net worth, monthly
        surplus, emergency-fund months, insurance cover), six plan scores in
        Advanced, the donut allocation chart, the cash-flow bar, the closest goals,
        and the top five next-best-actions. Open Action center for the full list.
      </p>
    ),
  },
  {
    id: "insights",
    title: "Insights",
    body: (
      <p>
        Plain-English observations from a deterministic rules engine. Things like:
        emergency fund covers fewer than 6 months, term cover below 10× annual
        income, asset concentration, will not registered, etc. Each insight has a
        severity, a "why", and a suggested action.
      </p>
    ),
  },
  {
    id: "action-center",
    title: "Action center",
    body: (
      <>
        <p>
          The action center is the to-do list for the household. Two parts:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <strong>Suggested next actions</strong> — concrete moves with amounts,
            deadlines, owner, and a deep-link to the page where you can act. Click
            <em> Pin</em> to add any of them to your list.
          </li>
          <li>
            <strong>Your action list</strong> — the running list. Anything you've
            pinned plus your own tasks. Status switches between Open / In progress /
            Done / Snoozed.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "scenarios",
    title: "Scenarios",
    body: (
      <>
        <p>
          (Advanced) Pre-built what-if cases over the same retirement Monte Carlo:
          Retire at 55 / 60 / 65, FIRE at 50, Perpetual income (4% rule), Inflation
          +2pp, Returns −2pp, Plan to age 95, Job loss for 12 / 24 months, Medical
          shock at 50, Inheritance at 55, etc.
        </p>
        <p className="mt-2">
          Pick a subset, run them in one click, see them sorted by success
          probability with a band chart per scenario. The selection is saved per
          household and gets included in the printed report.
        </p>
      </>
    ),
  },
  {
    id: "retirement",
    title: "Retirement",
    body: (
      <p>
        (Advanced) A full Monte Carlo simulator — 800 paths over your accumulation
        + retirement horizon. Inputs default from your retirement-class assets and
        current monthly surplus. Returns success probability, percentile bands
        (P10 / P50 / P90), and a corpus-over-time chart. Optional one-time shocks
        and income-gap years layer on top.
      </p>
    ),
  },
  {
    id: "tax",
    title: "Tax (India)",
    body: (
      <>
        <p>
          (Advanced) Indian income tax for FY 2024-25. Side-by-side Old vs New
          regime, slab visualizer, all major deductions modeled (80C, 80CCD(1B),
          80D, 24(b), 80E, 80G, 80TTA, 80CCD(2)), HRA / LTA / professional tax,
          Section 87A rebate, surcharge tiers, and the 4% cess.
        </p>
        <p className="mt-2">
          The optimisation engine flags concrete moves: switch regimes if it saves
          you money, top up 80C / 80CCD(1B), negotiate employer 80CCD(2), claim
          full home-loan interest, etc. Each suggestion shows the cash saving it
          unlocks. We never suggest taking on new debt or fabricating deductions.
        </p>
      </>
    ),
  },
  {
    id: "risk",
    title: "Risk profile",
    body: (
      <p>
        (Advanced) A 6-question questionnaire (horizon, drawdown reaction,
        knowledge, dependents, income stability, growth-vs-comfort). Live score
        and band — Conservative through Aggressive — with a one-line rationale.
        Used by the Suitability score on the overview to flag drift between your
        stated risk and your actual equity allocation.
      </p>
    ),
  },
  {
    id: "estate",
    title: "Estate",
    body: (
      <p>
        (Advanced) A short profile: will status (None / Draft / Registered /
        Outdated), power-of-attorney status, guardianship notes, and legacy intent.
        The action center surfaces will-related steps based on what you record here.
      </p>
    ),
  },
  {
    id: "assumptions",
    title: "Assumptions",
    body: (
      <p>
        (Advanced) Every projection in Compass uses a small set of assumptions
        (inflation, expected returns, equity volatility, life expectancy). The
        defaults come from your household's region. You can override any of them
        for this household; leave a field blank to fall back to the default.
      </p>
    ),
  },
  {
    id: "report",
    title: "Report",
    body: (
      <>
        <p>
          A printable one-page summary — accessible from the household sidenav
          (Report ↗) or the Settings page. It includes:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>KPIs and identity (region, currency, mode).</li>
          <li>Tables for every section that has data.</li>
          <li>Plan scores and top observations (Advanced).</li>
          <li>The full action plan with amounts, deadlines, and owners.</li>
          <li>All pinned scenarios run with 400 paths, sorted by success rate.</li>
        </ul>
        <p className="mt-2">
          Click <em>Print / Save as PDF</em> to use the browser's native dialog.
        </p>
      </>
    ),
  },
  {
    id: "data",
    title: "Backup, import, reset",
    body: (
      <>
        <p>
          Open <Link href="/app/data" className="link">Your data</Link>:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <strong>Load demo</strong> — replaces this browser's data with the Sharma
            family demo.
          </li>
          <li>
            <strong>Download backup</strong> — writes one JSON file with everything.
          </li>
          <li>
            <strong>Import</strong> — replaces what's here with the JSON you upload.
          </li>
          <li>
            <strong>Reset</strong> — wipes every household. No undo.
          </li>
        </ul>
        <p className="mt-2">
          To move data between two devices: download here, AirDrop / email the JSON
          to the other device, import there.
        </p>
      </>
    ),
  },
  {
    id: "privacy",
    title: "Privacy",
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>All data lives in your browser's <code className="bg-line-100 px-1 rounded">localStorage</code> under the key <code className="bg-line-100 px-1 rounded">compass-data-v1</code>.</li>
        <li>The app makes no network requests for user data, ever.</li>
        <li>No accounts, no cookies, no analytics.</li>
        <li>If you clear browsing data, the data is gone — keep a backup.</li>
      </ul>
    ),
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:py-10 grid gap-8 lg:grid-cols-[200px_1fr]">
      <aside className="lg:sticky lg:top-6 self-start">
        <nav className="bg-white border border-line-200 rounded-card p-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 px-3 py-2">
            On this page
          </p>
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block px-3 py-1.5 rounded-button text-sm text-ink-700 hover:bg-brand-mint/40 hover:text-brand-deep"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="space-y-8 min-w-0">
        <PageHeader
          title="How Compass works"
          subtitle="A short walkthrough of every surface, what it's for, and how the pieces fit together."
        />

        {SECTIONS.map((s) => (
          <Card key={s.id}>
            <h2
              id={s.id}
              className="text-base font-semibold text-ink-900 scroll-mt-24"
            >
              {s.title}
            </h2>
            <div className="mt-2 text-sm text-ink-700 leading-relaxed space-y-2">
              {s.body}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
