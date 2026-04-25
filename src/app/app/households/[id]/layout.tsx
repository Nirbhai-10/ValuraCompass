"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { HouseholdNav } from "@/components/household-nav";
import { useDatabase, useHydrated, useUpdate } from "@/lib/store";
import { REGION_LABELS, STRUCTURE_LABELS } from "@/lib/types";

export default function HouseholdLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const hydrated = useHydrated();
  const db = useDatabase();
  const update = useUpdate();
  const household = id ? db.households.find((h) => h.id === id) : undefined;

  useEffect(() => {
    if (hydrated && id && !household) {
      router.replace("/app");
    }
  }, [hydrated, id, household, router]);

  if (!hydrated || !household) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="h-32 animate-pulse rounded-card bg-white border border-line-200" />
      </div>
    );
  }

  function handleDelete() {
    if (!household) return;
    const ok = window.confirm(`Delete "${household.name}" and all its data? This cannot be undone.`);
    if (!ok) return;
    update((curr) => ({
      ...curr,
      households: curr.households.filter((h) => h.id !== household.id),
      persons: curr.persons.filter((p) => p.householdId !== household.id),
      incomes: curr.incomes.filter((i) => i.householdId !== household.id),
      expenses: curr.expenses.filter((e) => e.householdId !== household.id),
      assets: curr.assets.filter((a) => a.householdId !== household.id),
      liabilities: curr.liabilities.filter((l) => l.householdId !== household.id),
      policies: curr.policies.filter((p) => p.householdId !== household.id),
      goals: curr.goals.filter((g) => g.householdId !== household.id),
    }));
    router.push("/app");
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="min-w-0">
          <p className="text-xs text-ink-500">
            <Link href="/app" className="link">Households</Link>
            <span className="mx-1.5">/</span>
            <span>{household.name}</span>
          </p>
          <h1 className="text-2xl font-semibold mt-1 truncate">{household.name}</h1>
          <p className="text-xs text-ink-500 mt-1">
            {REGION_LABELS[household.region]} · {household.currency} ·{" "}
            {STRUCTURE_LABELS[household.structure]}
          </p>
        </div>
        <button onClick={handleDelete} className="btn-danger text-sm">
          Delete household
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <aside className="lg:sticky lg:top-4 self-start">
          <HouseholdNav householdId={household.id} />
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
