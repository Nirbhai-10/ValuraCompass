"use client";

import Link from "next/link";
import { useDatabase, useHydrated } from "@/lib/store";
import { formatMoney } from "@/lib/format";
import { REGION_LABELS, STRUCTURE_LABELS } from "@/lib/types";
import { Button, Card, EmptyState, PageHeader } from "@/components/ui";

export default function HouseholdsListPage() {
  const hydrated = useHydrated();
  const db = useDatabase();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="h-32 animate-pulse rounded-card bg-white border border-line-200" />
      </div>
    );
  }

  const households = [...db.households].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );

  if (households.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState
          title="Welcome to Compass"
          description="Create your first household to start planning. Everything you enter stays in this browser."
          action={
            <Link href="/app/new">
              <Button variant="primary">Create a household</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10 space-y-8">
      <PageHeader
        title="Households"
        subtitle={`${households.length} household${households.length === 1 ? "" : "s"} saved on this device.`}
        action={
          <Link href="/app/new">
            <Button variant="primary">New household</Button>
          </Link>
        }
      />

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
          const fmt = (n: number) => formatMoney(n, h.currency, h.region);
          return (
            <li key={h.id}>
              <Link
                href={`/app/households/${h.id}`}
                className="block group"
                aria-label={`Open ${h.name}`}
              >
                <Card className="transition-colors group-hover:border-brand-deep">
                  <p className="text-xs text-ink-500">
                    {REGION_LABELS[h.region]} · {h.currency} ·{" "}
                    {STRUCTURE_LABELS[h.structure]}
                  </p>
                  <h3 className="text-lg font-semibold mt-1">{h.name}</h3>

                  <dl className="mt-5 grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div>
                      <dt className="text-xs text-ink-500">People</dt>
                      <dd className="font-semibold tabular-nums mt-0.5">{persons}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink-500">Income / mo</dt>
                      <dd className="font-semibold tabular-nums mt-0.5">
                        {fmt(incomeTotal)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink-500">Assets</dt>
                      <dd className="font-semibold tabular-nums mt-0.5">
                        {fmt(assetTotal)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink-500">Liabilities</dt>
                      <dd className="font-semibold tabular-nums mt-0.5">
                        {fmt(liabTotal)}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-5 text-sm font-medium text-brand-deep">Open →</p>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
