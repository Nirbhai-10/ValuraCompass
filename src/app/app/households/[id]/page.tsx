"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useDatabase } from "@/lib/store";
import { formatMoney } from "@/lib/format";
import { Breakdown } from "@/components/breakdown";
import { Card, Kpi } from "@/components/ui";

export default function HouseholdOverviewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const db = useDatabase();
  const household = db.households.find((h) => h.id === id);
  if (!household) return null;

  const persons = db.persons.filter((p) => p.householdId === id);
  const incomes = db.incomes.filter((i) => i.householdId === id);
  const expenses = db.expenses.filter((e) => e.householdId === id);
  const assets = db.assets.filter((a) => a.householdId === id);
  const liabilities = db.liabilities.filter((l) => l.householdId === id);
  const policies = db.policies.filter((p) => p.householdId === id);
  const goals = db.goals.filter((g) => g.householdId === id);

  const monthlyIncome = incomes.reduce((s, i) => s + i.amountMonthly, 0);
  const monthlyExpense = expenses.reduce((s, e) => s + e.amountMonthly, 0);
  const totalAssets = assets.reduce((s, a) => s + a.currentValue, 0);
  const totalLiab = liabilities.reduce((s, l) => s + l.outstanding, 0);
  const netWorth = totalAssets - totalLiab;
  const surplus = monthlyIncome - monthlyExpense;
  const surplusRate = monthlyIncome > 0 ? (surplus / monthlyIncome) * 100 : 0;
  const sumAssured = policies.reduce((s, p) => s + p.sumAssured, 0);

  const fmt = (n: number) => formatMoney(n, household.currency, household.region);

  function bucketize<T>(items: T[], keyFn: (x: T) => string, valueFn: (x: T) => number) {
    const map = new Map<string, number>();
    items.forEach((item) => {
      const key = keyFn(item);
      map.set(key, (map.get(key) ?? 0) + valueFn(item));
    });
    return Array.from(map.entries()).map(([key, value]) => ({
      key,
      label: key,
      value,
    }));
  }

  const assetSlices = bucketize(
    assets,
    (a) => a.assetClass,
    (a) => a.currentValue,
  );
  const expenseSlices = bucketize(
    expenses,
    (e) => e.category,
    (e) => e.amountMonthly,
  );

  const empty =
    persons.length === 0 &&
    incomes.length === 0 &&
    expenses.length === 0 &&
    assets.length === 0 &&
    liabilities.length === 0 &&
    policies.length === 0 &&
    goals.length === 0;

  if (empty) {
    return (
      <Card className="text-center py-16">
        <h2 className="text-lg font-semibold">Let's set up the basics.</h2>
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

  const currentYear = new Date().getFullYear();
  const upcomingGoals = [...goals]
    .sort((a, b) => a.priority - b.priority || a.targetYear - b.targetYear)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          title="Net worth"
          value={fmt(netWorth)}
          sub={`${fmt(totalAssets)} − ${fmt(totalLiab)}`}
          tone={netWorth >= 0 ? "positive" : "danger"}
        />
        <Kpi
          title="Monthly surplus"
          value={fmt(surplus)}
          sub={
            monthlyIncome > 0
              ? `${surplusRate.toFixed(0)}% of income`
              : "Add some income"
          }
          tone={surplus >= 0 ? "positive" : "danger"}
        />
        <Kpi
          title="Insurance cover"
          value={fmt(sumAssured)}
          sub={`${policies.length} polic${policies.length === 1 ? "y" : "ies"}`}
        />
        <Kpi
          title="People"
          value={String(persons.length)}
          sub={persons.length ? "Family members tracked" : "Add the primary person"}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold mb-1">Asset allocation</h3>
          <p className="text-xs text-ink-500 mb-4">
            Where your wealth lives, by class.
          </p>
          <Breakdown
            slices={assetSlices}
            format={fmt}
            emptyMessage="Add assets to see your allocation."
          />
        </Card>
        <Card>
          <h3 className="text-sm font-semibold mb-1">Where the money goes</h3>
          <p className="text-xs text-ink-500 mb-4">
            Monthly outflow by category.
          </p>
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
                Sorted by priority, then by year.
              </p>
            </div>
            <Link
              href={`/app/households/${id}/goals`}
              className="text-xs text-brand-deep font-medium hover:underline"
            >
              All goals →
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {upcomingGoals.map((g) => {
              const yearsAway = g.targetYear - currentYear;
              return (
                <li
                  key={g.id}
                  className="flex items-center justify-between gap-3 border border-line-200 rounded-button px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{g.label}</p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {g.type} ·{" "}
                      {yearsAway > 0
                        ? `in ${yearsAway} yr${yearsAway === 1 ? "" : "s"}`
                        : g.targetYear}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">
                    {fmt(g.targetAmount)}
                  </p>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
