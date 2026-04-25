"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { HouseholdNav } from "@/components/household-nav";
import { useDatabase, useHydrated } from "@/lib/store";
import { REGION_LABELS, STRUCTURE_LABELS } from "@/lib/types";

export default function HouseholdLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const hydrated = useHydrated();
  const db = useDatabase();
  const household = id ? db.households.find((h) => h.id === id) : undefined;

  useEffect(() => {
    if (hydrated && id && !household) {
      router.replace("/app");
    }
  }, [hydrated, id, household, router]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="h-32 animate-pulse rounded-card bg-white border border-line-200" />
      </div>
    );
  }

  if (!household) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10">
      <div className="mb-8">
        <p className="text-xs text-ink-500">
          <Link href="/app" className="link">
            Households
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink-700">{household.name}</span>
        </p>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">{household.name}</h1>
        <p className="text-sm text-ink-500 mt-1.5">
          {REGION_LABELS[household.region]} · {household.currency} ·{" "}
          {STRUCTURE_LABELS[household.structure]}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-6 self-start">
          <HouseholdNav householdId={household.id} />
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
