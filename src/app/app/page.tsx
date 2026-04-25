"use client";

import Link from "next/link";
import { useDatabase, useHydrated } from "@/lib/store";
import { formatMoney } from "@/lib/format";
import { REGION_LABELS, STRUCTURE_LABELS } from "@/lib/types";

export default function HouseholdsListPage() {
  const hydrated = useHydrated();
  const db = useDatabase();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="h-32 animate-pulse rounded-card bg-white border border-line-200" />
      </div>
    );
  }

  const households = [...db.households].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );

  if (households.length === 0) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="card card-pad text-center">
          <h1 className="text-2xl font-semibold">Welcome to Compass</h1>
          <p className="text-ink-500 mt-2 max-w-md mx-auto">
            Create your first household to start planning. Everything is saved in this browser.
          </p>
          <Link href="/app/new" className="btn-primary mt-6 inline-flex">
            Create a household
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Households</h1>
          <p className="text-sm text-ink-500 mt-1">
            {households.length} household{households.length === 1 ? "" : "s"} saved on this device.
          </p>
        </div>
        <Link href="/app/new" className="btn-primary">
          New household
        </Link>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {households.map((h) => {
          const persons = db.persons.filter((p) => p.householdId === h.id).length;
          const incomeTotal = db.incomes
            .filter((i) => i.householdId === h.id)
            .reduce((s, i) => s + i.amountMonthly, 0);
          const assetTotal = db.assets
            .filter((a) => a.householdId === h.id)
            .reduce((s, a) => s + a.currentValue, 0);
          const liabTotal = db.liabilities
            .filter((l) => l.householdId === h.id)
            .reduce((s, l) => s + l.outstanding, 0);
          return (
            <li key={h.id}>
              <Link
                href={`/app/households/${h.id}`}
                className="card card-pad block hover:border-brand-deep transition-colors"
              >
                <p className="text-xs text-ink-500">
                  {REGION_LABELS[h.region]} · {h.currency} · {STRUCTURE_LABELS[h.structure]}
                </p>
                <h3 className="text-lg font-semibold mt-1">{h.name}</h3>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-ink-500">People</dt>
                    <dd className="font-semibold tabular-nums mt-0.5">{persons}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-500">Income / mo</dt>
                    <dd className="font-semibold tabular-nums mt-0.5">
                      {formatMoney(incomeTotal, h.currency, h.region)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-500">Assets</dt>
                    <dd className="font-semibold tabular-nums mt-0.5">
                      {formatMoney(assetTotal, h.currency, h.region)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-500">Liabilities</dt>
                    <dd className="font-semibold tabular-nums mt-0.5">
                      {formatMoney(liabTotal, h.currency, h.region)}
                    </dd>
                  </div>
                </dl>

                <p className="mt-4 text-sm text-brand-deep font-medium">Open →</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
