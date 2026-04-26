"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useDatabase } from "@/lib/store";
import {
  isHouseholdEmpty,
  selectGoals,
  selectHousehold,
  selectPersons,
} from "@/lib/selectors";
import {
  allGoalProgress,
  assetAllocation,
  expenseBreakdown,
  householdMetrics,
} from "@/lib/metrics";
import { Severity, buildInsights } from "@/lib/insights";
import { formatMoney } from "@/lib/format";
import { Breakdown } from "@/components/breakdown";
import { Card, Kpi } from "@/components/ui";

const SEVERITY_CLASSES: Record<Severity, string> = {
  CRITICAL: "bg-red-50 text-severity-critical border-red-100",
  HIGH: "bg-orange-50 text-severity-high border-orange-100",
  MEDIUM: "bg-amber-50 text-severity-medium border-amber-100",
  LOW: "bg-cyan-50 text-severity-low border-cyan-100",
  INFO: "bg-line-100 text-ink-700 border-line-200",
};

export default function HouseholdOverviewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const db = useDatabase();
  const household = selectHousehold(db, id);

  const insights = useMemo(
    () => (household ? buildInsights(db, id) : []),
    [db, id, household],
  );

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);

  if (isHouseholdEmpty(db, id)) {
    return (
      <Card className="text-center py-16">
        <h2 className="text-lg font-semibold">Let&apos;s set up the basics.</h2>
        <p className="text-sm text-ink-500 mt-2 max-w-md mx-auto">
          Add a person, your monthly income, and a goal or two. Your overview will fill in
          automatically.
        </p>
        <div className="mt-6 inline-flex flex-wrap justify-center gap-2">
          <Link href={`/app/households/${id}/people`} className="btn-primary text-sm">
            Add a person
          </Link>
          <Link href={`/app/households/${id}/income`} className="btn-secondary text-sm">
            Add income
          </Link>
          <Link href={`/app/households/${id}/goals`} className="btn-secondary text-sm">
            Add a goal
          </Link>
        </div>
      </Card>
    );
  }

  const m = householdMetrics(db, id);
  const persons = selectPersons(db, id);
  const goals = selectGoals(db, id);
  const assetSlices = assetAllocation(db, id);
  const expenseSlices = expenseBreakdown(db, id);
  const progresses = allGoalProgress(db, id);

  const upcomingGoals = [...progresses]
    .sort(
      (a, b) =>
        a.goal.priority - b.goal.priority || a.goal.targetYear - b.goal.targetYear,
    )
    .slice(0, 4);

  const topInsights = insights.slice(0, 4);
  const isAdvanced = household.mode === "ADVANCED";

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          title="Net worth"
          value={fmt(m.netWorth)}
          sub={`${fmt(m.totalAssets)} − ${fmt(m.totalLiabilities)}`}
          tone={m.netWorth >= 0 ? "positive" : "danger"}
        />
        <Kpi
          title="Monthly surplus"
          value={fmt(m.monthlySurplus)}
          sub={
            m.monthlyIncome > 0
              ? `${(m.surplusRate * 100).toFixed(0)}% of income`
              : "Add some income"
          }
          tone={m.monthlySurplus >= 0 ? "positive" : "danger"}
        />
        <Kpi
          title="Emergency fund"
          value={
            m.emergencyFundMonths > 0
              ? `${m.emergencyFundMonths.toFixed(1)} mo`
              : "—"
          }
          sub={
            m.emergencyFundMonths >= 6
              ? "Comfortable cushion"
              : m.emergencyFundMonths >= 3
                ? "On the way to 6 months"
                : "Below 3 months"
          }
          tone={
            m.emergencyFundMonths >= 6
              ? "positive"
              : m.emergencyFundMonths >= 3
                ? "default"
                : "warn"
          }
        />
        <Kpi
          title="Insurance cover"
          value={fmt(m.totalCover)}
          sub={
            m.monthlyIncome > 0 && m.totalCover > 0
              ? `${(m.totalCover / (m.monthlyIncome * 12)).toFixed(1)}× annual income`
              : `${persons.length} people in household`
          }
        />
      </div>

      {topInsights.length > 0 ? (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold">What stands out</h3>
              <p className="text-xs text-ink-500 mt-0.5">
                Plain-English observations from the rules engine. Open Insights for
                everything and the "why".
              </p>
            </div>
            <Link
              href={`/app/households/${id}/insights`}
              className="text-xs text-brand-deep font-medium hover:underline"
            >
              All insights →
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {topInsights.map((i) => (
              <li
                key={i.ruleId}
                className="border border-line-200 rounded-button px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 h-5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${SEVERITY_CLASSES[i.severity]}`}
                  >
                    {i.severity}
                  </span>
                  <span className="text-[11px] text-ink-500">{i.category}</span>
                </div>
                <p className="text-sm font-medium mt-1.5">{i.title}</p>
                {i.action ? (
                  <p className="text-xs text-ink-500 mt-1.5 leading-relaxed">
                    {i.action}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold mb-1">Asset allocation</h3>
          <p className="text-xs text-ink-500 mb-4">Where your wealth lives, by class.</p>
          <Breakdown
            slices={assetSlices}
            format={fmt}
            emptyMessage="Add assets to see your allocation."
          />
        </Card>
        <Card>
          <h3 className="text-sm font-semibold mb-1">Where the money goes</h3>
          <p className="text-xs text-ink-500 mb-4">Monthly outflow by category.</p>
          <Breakdown
            slices={expenseSlices}
            format={fmt}
            emptyMessage="Add expenses to see a breakdown."
          />
        </Card>
      </div>

      {upcomingGoals.length > 0 ? (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Closest goals</h3>
              <p className="text-xs text-ink-500 mt-0.5">
                Sorted by priority, then by year. Bars show how much is funded.
              </p>
            </div>
            <Link
              href={`/app/households/${id}/goals`}
              className="text-xs text-brand-deep font-medium hover:underline"
            >
              All {goals.length} goals →
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {upcomingGoals.map(({ goal, funded, pct, yearsAway }) => (
              <li
                key={goal.id}
                className="border border-line-200 rounded-button px-4 py-3"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium truncate">{goal.label}</p>
                  <p className="text-sm font-semibold tabular-nums whitespace-nowrap">
                    {fmt(goal.targetAmount)}
                  </p>
                </div>
                <p className="text-xs text-ink-500 mt-0.5">
                  {goal.type} ·{" "}
                  {yearsAway > 0
                    ? `in ${yearsAway} yr${yearsAway === 1 ? "" : "s"}`
                    : goal.targetYear}
                </p>
                <div className="mt-3 flex items-baseline justify-between text-xs text-ink-500">
                  <span>{fmt(funded)} funded</span>
                  <span className="text-ink-700 font-medium">
                    {(pct * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 bg-line-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-deep rounded-full transition-all"
                    style={{ width: `${Math.max(pct * 100, 2)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {isAdvanced ? (
        <Card>
          <h3 className="text-sm font-semibold">Advanced surfaces</h3>
          <p className="text-xs text-ink-500 mt-0.5 mb-3">
            Available because this household is in Advanced mode.
          </p>
          <ul className="flex flex-wrap gap-2 text-xs">
            {[
              { href: `/app/households/${id}/retirement`, label: "Retirement Monte Carlo" },
              { href: `/app/households/${id}/risk`, label: "Risk profile" },
              { href: `/app/households/${id}/tax`, label: "Tax" },
              { href: `/app/households/${id}/estate`, label: "Estate" },
              { href: `/app/households/${id}/assumptions`, label: "Assumptions" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center px-3 h-8 rounded-button border border-line-200 hover:border-brand-deep hover:text-brand-deep"
              >
                {l.label} →
              </Link>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
