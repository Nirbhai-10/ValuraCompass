"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function ModeToggle({ householdId, currentMode }: { householdId: string; currentMode: "BASIC" | "ADVANCED" }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  async function set(mode: "BASIC" | "ADVANCED") {
    if (mode === currentMode || pending) return;
    start(async () => {
      await fetch(`/api/households/${householdId}/mode`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      router.refresh();
    });
  }

  return (
    <div className="inline-flex rounded-button border border-line-200 bg-white p-0.5">
      <button
        onClick={() => set("BASIC")}
        className={cn(
          "px-3 h-8 text-xs rounded-button",
          currentMode === "BASIC" ? "bg-brand-deep text-white" : "text-ink-700",
        )}
      >
        Basic
      </button>
      <button
        onClick={() => set("ADVANCED")}
        className={cn(
          "px-3 h-8 text-xs rounded-button",
          currentMode === "ADVANCED" ? "bg-brand-deep text-white" : "text-ink-700",
        )}
      >
        Advanced
      </button>
    </div>
  );
}
