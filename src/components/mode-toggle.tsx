"use client";

import { useUpdate } from "@/lib/store";
import { updateHousehold } from "@/lib/mutations";
import { useToast } from "@/components/ui";
import { HouseholdMode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ModeToggleProps {
  householdId: string;
  mode: HouseholdMode;
  className?: string;
}

const OPTIONS: { value: HouseholdMode; label: string; hint: string }[] = [
  { value: "BASIC", label: "Basic", hint: "Everyday surfaces — fast, calm." },
  {
    value: "ADVANCED",
    label: "Advanced",
    hint: "Adds Monte Carlo, scenarios, scores, risk, tax, estate.",
  },
];

export function ModeToggle({ householdId, mode, className }: ModeToggleProps) {
  const update = useUpdate();
  const toast = useToast();

  function set(next: HouseholdMode) {
    if (next === mode) return;
    update(updateHousehold(householdId, { mode: next }));
    toast.success(
      next === "ADVANCED"
        ? "Advanced mode on — Monte Carlo, scenarios, scores, and more are now in the sidenav."
        : "Switched to Basic. Your advanced data is safe; switch back any time.",
    );
  }

  return (
    <div
      role="group"
      aria-label="Mode"
      className={cn(
        "inline-flex items-center bg-white border border-line-200 rounded-button p-0.5 text-sm",
        className,
      )}
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === mode;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            title={opt.hint}
            onClick={() => set(opt.value)}
            className={cn(
              "h-8 px-3 rounded-[6px] font-medium transition-colors",
              active
                ? "bg-brand-deep text-white shadow-sm"
                : "text-ink-700 hover:text-brand-deep",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
