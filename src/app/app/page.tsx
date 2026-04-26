"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadDemoData, useDatabase, useHydrated } from "@/lib/store";
import { selectHouseholds } from "@/lib/selectors";
import { householdMetrics } from "@/lib/metrics";
import { formatMoneyCompact } from "@/lib/format";
import { MODE_LABELS, REGION_LABELS, STRUCTURE_LABELS } from "@/lib/types";
import { Button, Card, EmptyState, PageHeader, useToast } from "@/components/ui";

export default function HouseholdsListPage() {
  const router = useRouter();
  const toast = useToast();
  const hydrated = useHydrated();
  const db = useDatabase();

  function handleLoadDemo() {
    loadDemoData();
    toast.success("Demo data loaded — the Sharma family is yours to explore.");
    router.push("/app/households/hh_demo_sharma");
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="h-32 animate-pulse rounded-card bg-white border border-line-200" />
      </div>
    );
  }

  const households = selectHouseholds(db);

  if (households.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EmptyState
          title="Welcome to Compass"
          description="Create your own household, or explore the fully-populated Sharma family demo to see every surface in action."
          action={
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="primary" onClick={handleLoadDemo}>
                Load demo data
              </Button>
              <Link href="/app/new">
                <Button variant="secondary">Create a household</Button>
              </Link>
            </div>
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
          <div className="flex items-center gap-2">
            {!households.some((h) => h.id === "hh_demo_sharma") ? (
              <Button variant="ghost" onClick={handleLoadDemo}>
                Load demo
              </Button>
            ) : null}
            <Link href="/app/new">
              <Button variant="primary">New household</Button>
            </Link>
          </div>
        }
      />

      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {households.map((h) => {
          const m = householdMetrics(db, h.id);
          const fmt = (n: number) => formatMoneyCompact(n, h.currency, h.region);
          return (
            <li key={h.id}>
              <Link
                href={`/app/households/${h.id}`}
                className="block group"
                aria-label={`Open ${h.name}`}
              >
                <Card className="transition-colors group-hover:border-brand-deep">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-ink-500 truncate">
                      {REGION_LABELS[h.region]} · {h.currency} ·{" "}
                      {STRUCTURE_LABELS[h.structure]}
                    </p>
                    <span className="inline-flex shrink-0 items-center px-2 h-5 rounded-full text-[10px] font-medium bg-brand-mint text-brand-deep border border-transparent">
                      {MODE_LABELS[h.mode]}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mt-1.5">{h.name}</h3>

                  <dl className="mt-5 grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div>
                      <dt className="text-xs text-ink-500">Net worth</dt>
                      <dd className="font-semibold tabular-nums mt-0.5">
                        {fmt(m.netWorth)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink-500">Surplus / mo</dt>
                      <dd className="font-semibold tabular-nums mt-0.5">
                        {fmt(m.monthlySurplus)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink-500">Cover</dt>
                      <dd className="font-semibold tabular-nums mt-0.5">
                        {fmt(m.totalCover)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink-500">Emergency fund</dt>
                      <dd className="font-semibold tabular-nums mt-0.5">
                        {m.emergencyFundMonths > 0
                          ? `${m.emergencyFundMonths.toFixed(1)} mo`
                          : "—"}
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
