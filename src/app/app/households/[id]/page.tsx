"use client";

import Link from "next/link";
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
import { formatMoney } from "@/lib/format";
import { Breakdown } from "@/components/breakdown";
import { Card, Kpi } from "@/components/ui";

export default function HouseholdOverviewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const db = useDatabase();
  const household = selectHousehold(db, id);
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
    </div>
  );
}
