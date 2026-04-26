"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDatabase, useHydrated } from "@/lib/store";
import {
  selectAssets,
  selectGoals,
  selectHousehold,
  selectIncomes,
  selectLiabilities,
  selectPersons,
  selectPolicies,
} from "@/lib/selectors";
import {
  allGoalProgress,
  assetAllocation,
  expenseBreakdown,
  householdMetrics,
} from "@/lib/metrics";
import { allScores } from "@/lib/scores";
import { buildInsights } from "@/lib/insights";
import {
  buildBaseInputs,
  findScenario,
} from "@/lib/scenarios";
import {
  MonteCarloResult,
  runRetirementMonteCarlo,
} from "@/lib/montecarlo";
import { formatMoney } from "@/lib/format";
import { CompassLogo } from "@/components/logo";
import { MODE_LABELS, REGION_LABELS, STRUCTURE_LABELS } from "@/lib/types";

export default function PrintReportPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const hydrated = useHydrated();
  const db = useDatabase();
  const household = selectHousehold(db, id);

  useEffect(() => {
    if (hydrated && !household) router.replace("/app");
  }, [hydrated, household, router]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="h-32 animate-pulse rounded-card bg-white border border-line-200" />
      </div>
    );
  }

  if (!household) return null;

  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const m = householdMetrics(db, id);
  const persons = selectPersons(db, id);
  const incomes = selectIncomes(db, id);
  const assets = selectAssets(db, id);
  const liabs = selectLiabilities(db, id);
  const policies = selectPolicies(db, id);
  const goals = selectGoals(db, id);
  const assetSlices = assetAllocation(db, id);
  const expenseSlices = expenseBreakdown(db, id);
  const progresses = allGoalProgress(db, id).sort(
    (a, b) =>
      a.goal.priority - b.goal.priority || a.goal.targetYear - b.goal.targetYear,
  );

  const isAdvanced = household.mode === "ADVANCED";
  const scores = isAdvanced ? allScores(db, id) : [];
  const insights = isAdvanced ? buildInsights(db, id).slice(0, 6) : [];

  // Run pinned scenarios (advanced mode only)
  const scenarioResults: { id: string; name: string; description: string; result: MonteCarloResult }[] = [];
  if (isAdvanced && household.scenarioIds.length > 0) {
    const base = buildBaseInputs(db, id);
    if (base) {
      for (const sid of household.scenarioIds) {
        const scen = findScenario(sid);
        if (!scen) continue;
        const inputs = scen.build(base.ctx);
        scenarioResults.push({
          id: sid,
          name: scen.name,
          description: scen.description,
          result: runRetirementMonteCarlo({ ...inputs, numSimulations: 400 }),
        });
      }
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-6 sm:p-10 print:p-0 print:max-w-none print:bg-white">
      <header className="flex items-center justify-between gap-4 print:mb-6">
        <CompassLogo />
        <div className="flex items-center gap-2 no-print">
          <Link
            href={`/app/households/${id}`}
            className="inline-flex h-9 px-4 items-center rounded-button text-sm text-ink-700 hover:text-brand-deep hover:bg-brand-mint/40"
          >
            ← Back
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex h-9 px-4 items-center rounded-button bg-brand-deep text-white text-sm font-medium hover:bg-[#0A3E26]"
          >
            Print / Save as PDF
          </button>
        </div>
      </header>

      <section className="mt-8 print:mt-0">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Compass household report
        </p>
        <h1 className="font-display text-3xl mt-1 text-ink-900">{household.name}</h1>
        <p className="text-sm text-ink-500 mt-1">
          {REGION_LABELS[household.region]} · {household.currency} ·{" "}
          {STRUCTURE_LABELS[household.structure]} · {MODE_LABELS[household.mode]} mode ·
          Generated {new Date().toLocaleDateString()}
        </p>
      </section>

      <section className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 print:gap-2">
        {[
          { title: "Net worth", value: fmt(m.netWorth) },
          { title: "Surplus / mo", value: fmt(m.monthlySurplus) },
          {
            title: "Emergency fund",
            value:
              m.emergencyFundMonths > 0
                ? `${m.emergencyFundMonths.toFixed(1)} mo`
                : "—",
          },
          { title: "Insurance cover", value: fmt(m.totalCover) },
        ].map((k) => (
          <div
            key={k.title}
            className="border border-line-200 rounded-card p-4 print:rounded-none"
          >
            <p className="text-xs text-ink-500">{k.title}</p>
            <p className="text-xl font-semibold tabular-nums mt-1">{k.value}</p>
          </div>
        ))}
      </section>

      <Section title="People">
        {persons.length === 0 ? (
          <Empty />
        ) : (
          <Table
            headers={["Name", "Relation", "DOB"]}
            rows={persons.map((p) => [
              p.fullName + (p.isPrimary ? " (primary)" : ""),
              p.relation,
              p.dob ?? "—",
            ])}
          />
        )}
      </Section>

      <Section title="Income">
        {incomes.length === 0 ? (
          <Empty />
        ) : (
          <Table
            headers={["Label", "Type", "Earner", "Monthly"]}
            rows={incomes.map((i) => {
              const earner = persons.find((p) => p.id === i.personId);
              return [i.label, i.type, earner?.fullName ?? "—", fmt(i.amountMonthly)];
            })}
            footer={["Total", "", "", fmt(m.monthlyIncome)]}
          />
        )}
      </Section>

      <Section title="Expenses">
        {expenseSlices.length === 0 ? (
          <Empty />
        ) : (
          <Table
            headers={["Category", "Monthly", "Share"]}
            rows={expenseSlices.map((s) => [
              s.label,
              fmt(s.value),
              `${((s.value / m.monthlyExpense) * 100).toFixed(0)}%`,
            ])}
            footer={["Total", fmt(m.monthlyExpense), ""]}
          />
        )}
      </Section>

      <Section title="Assets">
        {assets.length === 0 ? (
          <Empty />
        ) : (
          <Table
            headers={["Label", "Class", "Value"]}
            rows={assets.map((a) => [a.label, a.assetClass, fmt(a.currentValue)])}
            footer={["Total", "", fmt(m.totalAssets)]}
          />
        )}
        {assetSlices.length > 0 ? (
          <p className="mt-2 text-xs text-ink-500">
            Allocation:{" "}
            {assetSlices
              .map(
                (s) =>
                  `${s.label} ${((s.value / m.totalAssets) * 100).toFixed(0)}%`,
              )
              .join(" · ")}
          </p>
        ) : null}
      </Section>

      <Section title="Liabilities">
        {liabs.length === 0 ? (
          <Empty />
        ) : (
          <Table
            headers={["Label", "Type", "Outstanding", "EMI / mo"]}
            rows={liabs.map((l) => [
              l.label,
              l.type,
              fmt(l.outstanding),
              l.emiMonthly ? fmt(l.emiMonthly) : "—",
            ])}
            footer={["Total", "", fmt(m.totalLiabilities), ""]}
          />
        )}
      </Section>

      <Section title="Insurance">
        {policies.length === 0 ? (
          <Empty />
        ) : (
          <Table
            headers={["Label", "Type", "Insurer", "Sum assured"]}
            rows={policies.map((p) => [
              p.label,
              p.type,
              p.insurer ?? "—",
              fmt(p.sumAssured),
            ])}
            footer={["Total cover", "", "", fmt(m.totalCover)]}
          />
        )}
      </Section>

      <Section title="Goals">
        {goals.length === 0 ? (
          <Empty />
        ) : (
          <Table
            headers={["Goal", "Year", "Target", "Funded", "Progress"]}
            rows={progresses.map((p) => [
              p.goal.label,
              String(p.goal.targetYear),
              fmt(p.goal.targetAmount),
              fmt(p.funded),
              `${(p.pct * 100).toFixed(0)}%`,
            ])}
          />
        )}
      </Section>

      {scores.length > 0 ? (
        <Section title="Plan scores">
          <Table
            headers={["Score", "Value", "Band", "Read"]}
            rows={scores.map((s) => [s.label, String(s.value), s.band, s.narrative])}
          />
        </Section>
      ) : null}

      {insights.length > 0 ? (
        <Section title="Top observations">
          <ul className="space-y-3">
            {insights.map((i) => (
              <li key={i.ruleId} className="border border-line-200 rounded-card p-3 print:rounded-none">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold">{i.title}</p>
                  <span className="text-[10px] uppercase font-semibold tracking-wide text-ink-500">
                    {i.severity} · {i.category}
                  </span>
                </div>
                <p className="text-xs text-ink-700 mt-1 leading-relaxed">{i.body}</p>
                {i.action ? (
                  <p className="text-xs text-ink-900 mt-1.5">
                    <span className="font-medium">Suggested:</span> {i.action}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {scenarioResults.length > 0 ? (
        <Section title="Scenarios">
          <p className="text-xs text-ink-500 mb-3">
            Each scenario was simulated with 400 Monte Carlo paths over the household&apos;s
            full retirement horizon. Sorted by success probability.
          </p>
          <Table
            headers={["Scenario", "Description", "Success", "P50 corpus", "P10 corpus"]}
            rows={[...scenarioResults]
              .sort((a, b) => b.result.successProbability - a.result.successProbability)
              .map((r) => [
                r.name,
                r.description,
                `${(r.result.successProbability * 100).toFixed(0)}%`,
                fmt(r.result.finalP50),
                fmt(r.result.finalP10),
              ])}
          />
        </Section>
      ) : null}

      <footer className="mt-12 text-[11px] text-ink-500 border-t border-line-200 pt-3">
        Generated by Valura Compass. All numbers are figures you entered yourself.
      </footer>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 print:mt-6">
      <h2 className="text-base font-semibold text-ink-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Empty() {
  return <p className="text-sm text-ink-500">— Nothing recorded —</p>;
}

function Table({
  headers,
  rows,
  footer,
}: {
  headers: string[];
  rows: (string | number)[][];
  footer?: (string | number)[];
}) {
  return (
    <div className="border border-line-200 rounded-card overflow-hidden print:rounded-none">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-brand-canvas/60">
            {headers.map((h, i) => (
              <th
                key={h}
                className={`px-4 py-2 text-left text-xs font-semibold text-ink-500 uppercase tracking-wide ${
                  i === headers.length - 1 ? "text-right" : ""
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line-100">
              {r.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-2 ${
                    j === r.length - 1 ? "text-right tabular-nums" : ""
                  } ${j === 0 ? "text-ink-900 font-medium" : "text-ink-700"}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer ? (
          <tfoot>
            <tr className="border-t border-line-200 bg-brand-canvas/40">
              {footer.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-2 text-xs font-semibold ${
                    j === footer.length - 1 ? "text-right tabular-nums" : ""
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
