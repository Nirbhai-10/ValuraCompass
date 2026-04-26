"use client";

import { FormEvent } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate } from "@/lib/store";
import {
  ASSUMPTION_FORMAT,
  ASSUMPTION_LABELS,
  Assumptions,
  defaultAssumptions,
  effectiveAssumptions,
  formatAssumption,
} from "@/lib/assumptions";
import {
  selectAssumptionOverride,
  selectHousehold,
} from "@/lib/selectors";
import {
  clearAssumptionOverride,
  upsertAssumptionOverride,
} from "@/lib/mutations";
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  useToast,
} from "@/components/ui";

const FIELDS: (keyof Assumptions)[] = [
  "inflationGeneral",
  "inflationEducation",
  "inflationHealthcare",
  "returnEquity",
  "returnDebt",
  "returnGold",
  "returnVolatility",
  "lifeExpectancy",
];

export default function AssumptionsPage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const toast = useToast();
  const household = selectHousehold(db, householdId);

  if (!household) return null;
  const defaults = defaultAssumptions(household.region);
  const effective = effectiveAssumptions(db, householdId);
  const override = selectAssumptionOverride(db, householdId);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const draft: Record<string, number | undefined> = {};
    FIELDS.forEach((key) => {
      const raw = String(fd.get(key) ?? "").trim();
      if (raw === "") {
        draft[key] = undefined;
        return;
      }
      const n = Number(raw);
      if (!Number.isFinite(n)) return;
      draft[key] = ASSUMPTION_FORMAT[key] === "years" ? n : n / 100;
    });
    update(upsertAssumptionOverride(householdId, draft as Partial<Assumptions>));
    toast.success("Assumptions saved.");
  }

  function handleReset() {
    if (!window.confirm("Reset all assumptions to regional defaults?")) return;
    update(clearAssumptionOverride(householdId));
    toast.success("Reset to defaults.");
  }

  function inputValueFor(key: keyof Assumptions): string {
    const v = override?.[key];
    if (typeof v !== "number") return "";
    return ASSUMPTION_FORMAT[key] === "years" ? v.toFixed(0) : (v * 100).toFixed(2);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assumptions"
        subtitle={
          <>
            Numbers Compass uses for projections and Monte Carlo. Defaults come
            from the household's region ({household.region}). Leave a field
            blank to fall back to the default.
          </>
        }
      />

      <Card>
        <p className="text-sm font-semibold mb-3">In effect</p>
        <dl className="grid gap-3 sm:grid-cols-2">
          {FIELDS.map((key) => {
            const v = effective[key];
            const def = defaults[key];
            const overridden = override?.[key] !== undefined && override?.[key] !== null;
            return (
              <div
                key={key}
                className="flex items-center justify-between gap-3 border border-line-200 rounded-button px-3 py-2"
              >
                <span className="text-xs text-ink-500">{ASSUMPTION_LABELS[key]}</span>
                <span className="text-sm font-semibold tabular-nums">
                  {formatAssumption(key, v)}
                  {overridden ? (
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-brand-deep">
                      override
                    </span>
                  ) : (
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-ink-500">
                      default {formatAssumption(key, def)}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </dl>
      </Card>

      <Card>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((key) => (
            <Field
              key={key}
              label={`${ASSUMPTION_LABELS[key]}${ASSUMPTION_FORMAT[key] === "percent" ? " (%)" : ""}`}
              htmlFor={key}
              hint={`Default: ${formatAssumption(key, defaults[key])}`}
            >
              <Input
                id={key}
                name={key}
                inputMode="decimal"
                placeholder={
                  ASSUMPTION_FORMAT[key] === "percent"
                    ? (defaults[key] * 100).toFixed(2)
                    : defaults[key].toFixed(0)
                }
                defaultValue={inputValueFor(key)}
              />
            </Field>
          ))}
          <div className="sm:col-span-2 flex items-center gap-3 pt-2">
            <Button variant="primary" type="submit">
              Save overrides
            </Button>
            <Button type="button" variant="ghost" onClick={handleReset}>
              Reset to defaults
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
