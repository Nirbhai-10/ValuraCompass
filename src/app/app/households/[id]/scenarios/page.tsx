"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate } from "@/lib/store";
import { selectHousehold } from "@/lib/selectors";
import { setHouseholdScenarios } from "@/lib/mutations";
import {
  buildBaseInputs,
  findScenario,
  listScenarios,
  Scenario,
  ScenarioCategory,
} from "@/lib/scenarios";
import {
  MonteCarloResult,
  runRetirementMonteCarlo,
} from "@/lib/montecarlo";
import { formatMoney } from "@/lib/format";
import { BandChart } from "@/components/sparkline";
import { Button, Card, PageHeader, useToast } from "@/components/ui";
import { cn } from "@/lib/utils";

const CATEGORIES: ScenarioCategory[] = [
  "Retirement timing",
  "Stress test",
  "Assumption shock",
  "Income",
  "Life event",
];

export default function ScenariosPage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const toast = useToast();
  const household = selectHousehold(db, householdId);

  const allScenarios = listScenarios();
  const [selected, setSelected] = useState<string[]>(
    household?.scenarioIds ?? ["baseline"],
  );
  const [results, setResults] = useState<Record<string, MonteCarloResult> | null>(
    null,
  );
  const [running, setRunning] = useState(false);
  const [activeChart, setActiveChart] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const out: Record<ScenarioCategory, Scenario[]> = {
      "Retirement timing": [],
      "Stress test": [],
      "Assumption shock": [],
      "Income": [],
      "Life event": [],
    };
    for (const s of allScenarios) out[s.category].push(s);
    return out;
  }, [allScenarios]);

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);

  function toggle(id: string) {
    setSelected((curr) =>
      curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id],
    );
  }

  function runAll() {
    setRunning(true);
    setActiveChart(null);
    setTimeout(() => {
      const base = buildBaseInputs(db, householdId);
      if (!base) {
        setRunning(false);
        return;
      }
      const out: Record<string, MonteCarloResult> = {};
      for (const id of selected) {
        const scen = findScenario(id);
        if (!scen) continue;
        const inputs = scen.build(base.ctx);
        out[id] = runRetirementMonteCarlo(inputs);
      }
      setResults(out);
      setRunning(false);
      // Persist the selection
      update(setHouseholdScenarios(householdId, selected));
      toast.success(
        `Ran ${selected.length} scenario${selected.length === 1 ? "" : "s"}.`,
      );
    }, 30);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scenarios"
        subtitle="Run multiple what-if cases on the same household and compare them side-by-side. The selection here is what shows up in your printed report too."
        action={
          <Button variant="primary" onClick={runAll} disabled={running || selected.length === 0}>
            {running ? "Running…" : `Run ${selected.length} scenario${selected.length === 1 ? "" : "s"}`}
          </Button>
        }
      />

      <Card>
        <p className="text-sm font-semibold mb-3">Pick scenarios</p>
        <div className="grid gap-5">
          {CATEGORIES.map((cat) => (
            <div key={cat}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 mb-2">
                {cat}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {grouped[cat].map((s) => {
                  const checked = selected.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={cn(
                        "flex items-start gap-2 px-3 py-2 rounded-button border text-sm cursor-pointer transition-colors",
                        checked
                          ? "border-brand-deep bg-brand-mint/40"
                          : "border-line-200 hover:border-brand-deep",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(s.id)}
                        className="mt-0.5 size-4 accent-brand-deep"
                      />
                      <span className="min-w-0">
                        <span className="block font-medium text-ink-900">
                          {s.name}
                        </span>
                        <span className="block text-xs text-ink-500 mt-0.5">
                          {s.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {results ? (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold">Comparison</p>
            <p className="text-[11px] text-ink-500">
              800 paths each · sorted by success probability
            </p>
          </div>

          <ul className="grid gap-2">
            {Object.entries(results)
              .sort(
                ([, a], [, b]) =>
                  b.successProbability - a.successProbability,
              )
              .map(([id, res]) => {
                const scen = findScenario(id);
                const isActive = activeChart === id;
                const success = (res.successProbability * 100).toFixed(0);
                const tone =
                  res.successProbability >= 0.85
                    ? "text-brand-deep"
                    : res.successProbability >= 0.6
                      ? "text-ink-900"
                      : "text-severity-medium";
                return (
                  <li key={id} className="border border-line-200 rounded-button">
                    <button
                      type="button"
                      onClick={() => setActiveChart((curr) => (curr === id ? null : id))}
                      className="w-full text-left px-4 py-3 grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center hover:bg-brand-mint/30"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{scen?.name ?? id}</p>
                        <p className="text-xs text-ink-500 mt-0.5 truncate">
                          {scen?.description}
                        </p>
                      </div>
                      <div className="hidden sm:block text-right">
                        <p className="text-[11px] text-ink-500">P50 corpus</p>
                        <p className="text-sm font-semibold tabular-nums">
                          {fmt(res.finalP50)}
                        </p>
                      </div>
                      <div className="hidden md:block text-right">
                        <p className="text-[11px] text-ink-500">P10 corpus</p>
                        <p className="text-sm font-semibold tabular-nums">
                          {fmt(res.finalP10)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-ink-500">Success</p>
                        <p className={cn("text-base font-semibold tabular-nums", tone)}>
                          {success}%
                        </p>
                      </div>
                    </button>
                    {isActive ? (
                      <div className="px-4 pb-4 pt-2 border-t border-line-100">
                        <BandChart bands={res.bands} />
                        <p className="mt-2 text-[11px] text-ink-500">
                          Median path = solid line · Shaded band = 10th–90th percentile.
                          {res.yearOfFirstFailure
                            ? ` Failed paths typically deplete around year ${res.yearOfFirstFailure}.`
                            : ""}
                        </p>
                      </div>
                    ) : null}
                  </li>
                );
              })}
          </ul>
        </Card>
      ) : (
        <p className="text-sm text-ink-500">
          Pick the scenarios to compare and click <span className="font-medium">Run</span>.
          The selection is saved to this household, so future runs and the printed report
          stay consistent.
        </p>
      )}
    </div>
  );
}
