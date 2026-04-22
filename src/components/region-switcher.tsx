"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

const REGION_LABEL: Record<string, string> = { IN: "India", GCC: "GCC", GLOBAL: "Global" };

export function RegionSwitcher({
  householdId,
  currentRegion,
  currentCurrency,
}: {
  householdId: string;
  currentRegion: "IN" | "GCC" | "GLOBAL";
  currentCurrency: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  async function change(region: string) {
    if (region === currentRegion || pending) return;
    const currencyDefault = region === "IN" ? "INR" : region === "GCC" ? "AED" : "USD";
    start(async () => {
      await fetch(`/api/households/${householdId}/region`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ region, currency: currencyDefault }),
      });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-ink-500">Region</span>
      <select
        className="input h-8 w-28 text-xs"
        value={currentRegion}
        onChange={(e) => change(e.target.value)}
      >
        {Object.entries(REGION_LABEL).map(([id, label]) => (
          <option key={id} value={id}>{label}</option>
        ))}
      </select>
      <span className="chip-default">{currentCurrency}</span>
    </div>
  );
}
