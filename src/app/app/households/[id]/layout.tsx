"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { HouseholdNav } from "@/components/household-nav";
import { useDatabase, useHydrated } from "@/lib/store";
import { selectHousehold } from "@/lib/selectors";
import { MODE_LABELS, REGION_LABELS, STRUCTURE_LABELS } from "@/lib/types";

export default function HouseholdLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const hydrated = useHydrated();
  const db = useDatabase();
  const household = id ? selectHousehold(db, id) : undefined;

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
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <h1 className="text-3xl font-semibold tracking-tight break-words">
            {household.name}
          </h1>
          <span className="inline-flex items-center px-2.5 h-6 rounded-full text-[11px] font-medium bg-brand-mint text-brand-deep border border-transparent">
            {MODE_LABELS[household.mode]}
          </span>
        </div>
        <p className="text-sm text-ink-500 mt-1.5">
          {REGION_LABELS[household.region]} · {household.currency} ·{" "}
          {STRUCTURE_LABELS[household.structure]}
        </p>
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-6 self-start">
          <HouseholdNav householdId={household.id} mode={household.mode} />
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
