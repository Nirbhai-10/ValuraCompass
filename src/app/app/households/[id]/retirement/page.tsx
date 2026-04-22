import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { computeScores, monteCarloRetirement, projectGoals, getAssumptionsSync, computeCashFlow, computeAllocation } from "@/lib/analytics/engine";
import { ScoreCard } from "@/components/score-card";
import { formatCurrency } from "@/lib/utils";

export default async function RetirementPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");
  const bundle: any = h;
  const region = h.region as "IN" | "GCC" | "GLOBAL";
  const scores = computeScores(bundle);
  const mc = monteCarloRetirement(bundle, 2000);
  const a = getAssumptionsSync(bundle);
  const cf = computeCashFlow(bundle);
  const alloc = computeAllocation(bundle);

  const primary = h.persons.find((p) => p.isPrimary) ?? h.persons[0];
  const currentAge = primary?.dob ? Math.floor((Date.now() - new Date(primary.dob).getTime()) / (365.25 * 864e5)) : 35;
  const retireAge = primary?.intendedRetirementAge ?? a.retirementAge;
  const years = Math.max(1, retireAge - currentAge);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <ScoreCard score={scores.RRS} emphasis />
        <div className="kpi">
          <p className="kpi-title">Success probability (sim.)</p>
          <p className="kpi-value">{Math.round(mc.successProbability * 100)}%</p>
          <p className="kpi-sub">Based on {mc.paths.toLocaleString()} Monte Carlo paths.</p>
        </div>
        <div className="kpi">
          <p className="kpi-title">Years to retirement</p>
          <p className="kpi-value">{years}</p>
          <p className="kpi-sub">Current age {currentAge} → retire at {retireAge}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="font-semibold">Projection</h2></div>
        <div className="card-body grid gap-4 md:grid-cols-2">
          <dl className="text-sm space-y-1.5">
            <div className="flex justify-between"><dt>Current retirement corpus</dt><dd className="tabular-nums">{formatCurrency(alloc.byClass["RETIREMENT"] ?? 0, h.currency, region)}</dd></div>
            <div className="flex justify-between"><dt>Current monthly surplus</dt><dd className="tabular-nums">{formatCurrency(cf.monthlySurplus, h.currency, region)}</dd></div>
            <div className="flex justify-between"><dt>Assumed nominal return</dt><dd className="tabular-nums">{((0.7 * a.equityNominalReturn + 0.3 * a.debtNominalReturn) * 100).toFixed(1)}%</dd></div>
            <div className="flex justify-between"><dt>Assumed inflation</dt><dd className="tabular-nums">{(a.inflationGeneral * 100).toFixed(1)}%</dd></div>
            <div className="flex justify-between"><dt>Assumed longevity</dt><dd className="tabular-nums">{a.longevity}</dd></div>
          </dl>
          <dl className="text-sm space-y-1.5">
            <div className="flex justify-between"><dt>Corpus at P10</dt><dd className="tabular-nums">{formatCurrency(mc.p10Corpus, h.currency, region)}</dd></div>
            <div className="flex justify-between"><dt>Corpus at P50</dt><dd className="tabular-nums">{formatCurrency(mc.p50Corpus, h.currency, region)}</dd></div>
            <div className="flex justify-between"><dt>Corpus at P90</dt><dd className="tabular-nums">{formatCurrency(mc.p90Corpus, h.currency, region)}</dd></div>
          </dl>
        </div>
      </div>

      <div className="card p-5 text-xs text-ink-500">
        Results are illustrative, based on your current data and assumption set (editable in Assumptions).
        Probabilities are derived from {mc.paths} simulated return paths and are not forecasts.
      </div>
    </div>
  );
}
