"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useDatabase } from "@/lib/store";
import { formatMoney } from "@/lib/format";

export default function HouseholdOverviewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const db = useDatabase();
  const household = db.households.find((h) => h.id === id);

  if (!household) {
    return null;
  }

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
  const sumAssured = policies.reduce((s, p) => s + p.sumAssured, 0);
  const surplus = monthlyIncome - monthlyExpense;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);

  const KPIS: { title: string; value: string; sub: string }[] = [
    { title: "Net worth", value: fmt(netWorth), sub: `${fmt(totalAssets)} − ${fmt(totalLiab)}` },
    {
      title: "Monthly surplus",
      value: fmt(surplus),
      sub: `${fmt(monthlyIncome)} − ${fmt(monthlyExpense)}`,
    },
    {
      title: "Total cover",
      value: fmt(sumAssured),
      sub: `${policies.length} polic${policies.length === 1 ? "y" : "ies"}`,
    },
    {
      title: "Goals",
      value: String(goals.length),
      sub: goals.length
        ? `${fmt(goals.reduce((s, g) => s + g.targetAmount, 0))} target`
        : "Add a goal",
    },
  ];

  const SECTION_CARDS = [
    {
      href: `/app/households/${id}/people`,
      label: "People",
      count: persons.length,
      hint: "Family members and dependents",
    },
    {
      href: `/app/households/${id}/income`,
      label: "Income",
      count: incomes.length,
      hint: "Salary, business, rental, etc.",
    },
    {
      href: `/app/households/${id}/expenses`,
      label: "Expenses",
      count: expenses.length,
      hint: "Recurring monthly outflows",
    },
    {
      href: `/app/households/${id}/assets`,
      label: "Assets",
      count: assets.length,
      hint: "Cash, investments, property",
    },
    {
      href: `/app/households/${id}/liabilities`,
      label: "Liabilities",
      count: liabilities.length,
      hint: "Loans, credit cards",
    },
    {
      href: `/app/households/${id}/insurance`,
      label: "Insurance",
      count: policies.length,
      hint: "Life, health, other policies",
    },
    {
      href: `/app/households/${id}/goals`,
      label: "Goals",
      count: goals.length,
      hint: "What you're planning for",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.title} className="card card-pad">
            <p className="kpi-title">{k.title}</p>
            <p className="kpi-value mt-1">{k.value}</p>
            <p className="text-xs text-ink-500 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SECTION_CARDS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="card card-pad block hover:border-brand-deep transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{s.label}</p>
                <p className="text-xs text-ink-500 mt-0.5">{s.hint}</p>
              </div>
              <span className="chip">{s.count}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
