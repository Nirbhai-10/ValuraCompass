"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase } from "@/lib/store";
import { selectAssets, selectHousehold } from "@/lib/selectors";
import { effectiveAssumptions } from "@/lib/assumptions";
import { householdMetrics } from "@/lib/metrics";
import {
  MonteCarloInputs,
  MonteCarloResult,
  runRetirementMonteCarlo,
} from "@/lib/montecarlo";
import { formatMoney, parseAmount } from "@/lib/format";
import { BandChart } from "@/components/sparkline";
import { Button, Card, Field, Input, Kpi, PageHeader } from "@/components/ui";

export default function RetirementPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const db = useDatabase();
  const household = selectHousehold(db, id);

  const RETIREMENT_CLASSES = useMemo(
    () => new Set(["Equity", "Retirement", "Debt / fixed income"]),
    [],
  );

  const defaults = useMemo(() => {
    if (!household) return null;
    const assumptions = effectiveAssumptions(db, id);
    const metrics = householdMetrics(db, id);
    const retirementCorpus = selectAssets(db, id)
      .filter((a) => RETIREMENT_CLASSES.has(a.assetClass))
      .reduce((s, a) => s + a.currentValue, 0);
    const monthlySavings = Math.max(0, metrics.monthlySurplus);
    return {
      currentCorpus: retirementCorpus,
      monthlyContribution: monthlySavings,
      yearsToRetirement: 22,
      yearsInRetirement: 25,
      monthlyExpensesAtRetirementToday: Math.max(metrics.essentialExpense, 50000),
      expectedReturn: assumptions.returnEquity * 0.7 + assumptions.returnDebt * 0.3,
      returnVolatility: assumptions.returnVolatility * 0.7,
      inflation: assumptions.inflationGeneral,
    };
  }, [db, id, household, RETIREMENT_CLASSES]);

  const [inputs, setInputs] = useState<MonteCarloInputs | null>(null);
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [running, setRunning] = useState(false);

  if (!household || !defaults) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const current = inputs ?? defaults;

  function handleRun(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!household) return;
    setRunning(true);

    // Defer to next tick so the spinner shows.
    setTimeout(() => {
      const fd = new FormData(e.currentTarget);
      const next: MonteCarloInputs = {
        currentCorpus: parseAmount(String(fd.get("currentCorpus") ?? "")),
        monthlyContribution: parseAmount(String(fd.get("monthlyContribution") ?? "")),
        yearsToRetirement: Number(String(fd.get("yearsToRetirement") ?? "0")) || 0,
        yearsInRetirement: Number(String(fd.get("yearsInRetirement") ?? "0")) || 0,
        monthlyExpensesAtRetirementToday: parseAmount(
          String(fd.get("monthlyExpensesAtRetirementToday") ?? ""),
        ),
        expectedReturn:
          (Number(String(fd.get("expectedReturnPct") ?? "0")) || 0) / 100,
        returnVolatility:
          (Number(String(fd.get("returnVolatilityPct") ?? "0")) || 0) / 100,
        inflation: (Number(String(fd.get("inflationPct") ?? "0")) || 0) / 100,
        numSimulations: 800,
      };
      setInputs(next);
      setResult(runRetirementMonteCarlo(next));
      setRunning(false);
    }, 30);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Retirement"
        subtitle="Monte Carlo projection: 800 simulated paths over the full horizon."
      />

      <Card>
        <form onSubmit={handleRun} className="grid gap-4 sm:grid-cols-2">
          <Field
            label={`Current retirement corpus (${household.currency})`}
            hint="Defaults to the sum of your Equity, Retirement, and Debt assets."
            htmlFor="currentCorpus"
          >
            <Input
              id="currentCorpus"
              name="currentCorpus"
              inputMode="decimal"
              defaultValue={Math.round(current.currentCorpus)}
            />
          </Field>
          <Field
            label={`Monthly contribution (${household.currency})`}
            hint="Defaults to your current monthly surplus."
            htmlFor="monthlyContribution"
          >
            <Input
              id="monthlyContribution"
              name="monthlyContribution"
              inputMode="decimal"
              defaultValue={Math.round(current.monthlyContribution)}
            />
          </Field>
          <Field label="Years until retirement" htmlFor="yearsToRetirement">
            <Input
              id="yearsToRetirement"
              name="yearsToRetirement"
              type="number"
              min={0}
              max={50}
              defaultValue={current.yearsToRetirement}
            />
          </Field>
          <Field label="Years in retirement" htmlFor="yearsInRetirement">
            <Input
              id="yearsInRetirement"
              name="yearsInRetirement"
              type="number"
              min={1}
              max={60}
              defaultValue={current.yearsInRetirement}
            />
          </Field>
          <Field
            label={`Monthly expenses at retirement, in today's ${household.currency}`}
            htmlFor="monthlyExpensesAtRetirementToday"
          >
            <Input
              id="monthlyExpensesAtRetirementToday"
              name="monthlyExpensesAtRetirementToday"
              inputMode="decimal"
              defaultValue={Math.round(current.monthlyExpensesAtRetirementToday)}
            />
          </Field>
          <Field label="Expected return %" htmlFor="expectedReturnPct">
            <Input
              id="expectedReturnPct"
              name="expectedReturnPct"
              inputMode="decimal"
              defaultValue={(current.expectedReturn * 100).toFixed(1)}
            />
          </Field>
          <Field label="Return volatility (σ) %" htmlFor="returnVolatilityPct">
            <Input
              id="returnVolatilityPct"
              name="returnVolatilityPct"
              inputMode="decimal"
              defaultValue={(current.returnVolatility * 100).toFixed(1)}
            />
          </Field>
          <Field label="Inflation %" htmlFor="inflationPct">
            <Input
              id="inflationPct"
              name="inflationPct"
              inputMode="decimal"
              defaultValue={(current.inflation * 100).toFixed(1)}
            />
          </Field>
          <div className="sm:col-span-2 flex items-center gap-3">
            <Button variant="primary" type="submit" disabled={running}>
              {running ? "Running…" : "Run simulation"}
            </Button>
            {result ? (
              <span className="text-xs text-ink-500">
                {(result.successProbability * 100).toFixed(0)}% of paths cover the
                full retirement horizon.
              </span>
            ) : null}
          </div>
        </form>
      </Card>

      {result ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi
              title="Success rate"
              value={`${(result.successProbability * 100).toFixed(0)}%`}
              sub="paths that don't deplete"
              tone={
                result.successProbability >= 0.85
                  ? "positive"
                  : result.successProbability >= 0.6
                    ? "default"
                    : "warn"
              }
            />
            <Kpi
              title="Median final corpus"
              value={fmt(result.finalP50)}
              sub={`After ${result.totalYears} years`}
            />
            <Kpi
              title="10th percentile"
              value={fmt(result.finalP10)}
              sub="Worst 10% of paths"
              tone="warn"
            />
            <Kpi
              title="90th percentile"
              value={fmt(result.finalP90)}
              sub="Best 10% of paths"
              tone="positive"
            />
          </div>

          <Card>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-sm font-semibold">Corpus over time</h3>
              <p className="text-xs text-ink-500">
                Shaded band = 10th–90th percentile · Line = median path
              </p>
            </div>
            <BandChart bands={result.bands} />
            <p className="mt-2 text-xs text-ink-500">
              {result.yearOfFirstFailure
                ? `Failed paths typically deplete around year ${result.yearOfFirstFailure} of the projection.`
                : "No path depleted across all simulations — corpus survives the full horizon."}
            </p>
          </Card>
        </>
      ) : (
        <p className="text-sm text-ink-500">
          Set inputs and run a simulation. We seed reasonable defaults from your
          current assets, surplus, and assumptions.
        </p>
      )}
    </div>
  );
}
