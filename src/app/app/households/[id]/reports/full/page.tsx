import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { computeScores, computeCashFlow, computeAllocation, projectGoals, monteCarloRetirement } from "@/lib/analytics/engine";
import { generateInsights } from "@/lib/analytics/insights";
import { categorySuitability } from "@/lib/analytics/suitability";
import { taxObservations } from "@/lib/analytics/tax";
import { CompassMark } from "@/components/logo";
import { PrintButton } from "@/components/print-button";
import { formatCurrency } from "@/lib/utils";
import { getRegion } from "@/lib/region";

export default async function FullReport({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");
  const bundle: any = h;
  const scores = computeScores(bundle);
  const cf = computeCashFlow(bundle);
  const alloc = computeAllocation(bundle);
  const insights = generateInsights(bundle, scores);
  const suit = categorySuitability(bundle, scores);
  const tax = taxObservations(bundle);
  const mc = monteCarloRetirement(bundle, 1500);
  const goalsProj = projectGoals(bundle);
  const region = h.region as "IN" | "GCC" | "GLOBAL";
  const regionPack = getRegion(h.region);

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex items-center justify-between no-print">
        <p className="text-sm text-ink-500">Full plan report</p>
        <PrintButton />
      </div>

      <article className="card p-8 print:shadow-none print:border-0 space-y-8">
        <header className="flex items-start justify-between gap-6 border-b border-line-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-brand-deep">
              <CompassMark size={26} />
              <span className="font-display text-lg"><span style={{ color: "#0F5132" }}>Valura</span><span style={{ color: "#334155" }}>.Ai</span> · Compass</span>
            </div>
            <h1 className="text-2xl font-semibold mt-3">{h.name} — Full plan</h1>
            <p className="text-xs text-ink-500 mt-1">
              {regionPack.displayName} · {h.currency} · {h.structure.replace(/_/g, " ")} · Generated {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-500">Financial Health</p>
            <p className="text-5xl font-semibold tabular-nums">{scores.FHS.value}</p>
            <p className="text-xs text-ink-500">{scores.FHS.band}</p>
          </div>
        </header>

        <section>
          <h2 className="font-semibold mb-2">Household</h2>
          <p className="text-sm text-ink-700">{h.persons.length} people captured · {h.persons.filter((p) => p.isDependent).length} dependent(s) · {h.persons.filter((p) => p.isPrimary).length} primary earner(s).</p>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold mb-2">Monthly cash flow</h2>
            <dl className="text-sm space-y-1.5">
              <Row k="Net income" v={formatCurrency(cf.monthlyNetIncome, h.currency, region)} />
              <Row k="Essentials" v={formatCurrency(cf.essentialMonthlyExpenses, h.currency, region)} />
              <Row k="Discretionary" v={formatCurrency(cf.discretionaryMonthlyExpenses, h.currency, region)} />
              <Row k="EMIs" v={formatCurrency(cf.totalEMI, h.currency, region)} />
              <Row k="Surplus" v={formatCurrency(cf.monthlySurplus, h.currency, region)} strong />
            </dl>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Balance sheet</h2>
            <dl className="text-sm space-y-1.5">
              <Row k="Total assets" v={formatCurrency(alloc.total, h.currency, region)} />
              <Row k="Liquid (≤ 30d)" v={formatCurrency(alloc.liquid30d, h.currency, region)} />
              <Row k="Illiquid" v={formatCurrency(alloc.illiquid, h.currency, region)} />
              {alloc.concentrationTop ? (
                <Row k="Top holding" v={`${alloc.concentrationTop.label} — ${(alloc.concentrationTop.share * 100).toFixed(0)}%`} />
              ) : null}
            </dl>
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Scores</h2>
          <table className="w-full table">
            <thead><tr><th>Score</th><th className="text-right">Value</th><th>Band</th><th>Narrative</th></tr></thead>
            <tbody>
              {Object.values(scores).map((s) => (
                <tr key={s.id}>
                  <td>{s.label}</td>
                  <td className="text-right tabular-nums">{s.value}</td>
                  <td className="text-ink-500">{s.band}</td>
                  <td className="text-ink-500 text-xs">{s.narrative}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Insights</h2>
          <ul className="space-y-3 text-sm">
            {insights.map((i) => (
              <li key={i.ruleId}>
                <span className="font-medium">[{i.severity}] {i.title}</span>
                <p className="text-ink-700 text-xs mt-0.5">{i.body}</p>
              </li>
            ))}
            {insights.length === 0 ? <li className="text-ink-500">None at this density.</li> : null}
          </ul>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Goals</h2>
          {goalsProj.length === 0 ? (
            <p className="text-sm text-ink-500">No goals yet.</p>
          ) : (
            <table className="w-full table">
              <thead><tr><th>Goal</th><th className="text-right">Today</th><th className="text-right">Future</th><th className="text-right">Required SIP</th><th>Status</th></tr></thead>
              <tbody>
                {goalsProj.map((g) => (
                  <tr key={g.goalId}>
                    <td className="font-medium">{g.label}</td>
                    <td className="text-right tabular-nums">{formatCurrency(h.goals.find((x) => x.id === g.goalId)?.targetAmountToday ?? 0, h.currency, region)}</td>
                    <td className="text-right tabular-nums">{formatCurrency(g.futureTarget, h.currency, region)}</td>
                    <td className="text-right tabular-nums">{formatCurrency(g.monthlySIPRequired, h.currency, region)}</td>
                    <td className="text-ink-500">{g.onTrack ? "On track" : g.feasibility >= 0.6 ? "Watch" : "At risk"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section>
          <h2 className="font-semibold mb-2">Retirement (simulated)</h2>
          <p className="text-sm">
            Probability of meeting modelled retirement essentials: <strong>{Math.round(mc.successProbability * 100)}%</strong>.
          </p>
          <p className="text-xs text-ink-500 mt-1">
            Based on {mc.paths.toLocaleString()} Monte Carlo paths using the current assumption set. P10/P50/P90 corpus:{" "}
            {formatCurrency(mc.p10Corpus, h.currency, region)} / {formatCurrency(mc.p50Corpus, h.currency, region)} / {formatCurrency(mc.p90Corpus, h.currency, region)}.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Suitability (category guardrails)</h2>
          <table className="w-full table">
            <thead><tr><th>Category</th><th>Decision</th><th>Rationale</th></tr></thead>
            <tbody>
              {suit.map((r) => (
                <tr key={r.category}>
                  <td>{r.label}</td>
                  <td className="text-ink-500">{r.decision}</td>
                  <td className="text-ink-500 text-xs">{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Tax observations</h2>
          {tax.length === 0 ? <p className="text-sm text-ink-500">No observations right now.</p> : (
            <ul className="text-sm space-y-2">
              {tax.map((t) => <li key={t.id}><span className="font-medium">{t.title}</span><p className="text-ink-700 text-xs mt-0.5">{t.body}</p></li>)}
            </ul>
          )}
        </section>

        <footer className="pt-4 border-t border-line-200 text-[11px] text-ink-500">
          {regionPack.disclosures.general} {regionPack.disclosures.taxObservation}
        </footer>
      </article>
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "font-semibold pt-1 border-t border-line-100" : ""}`}>
      <dt>{k}</dt>
      <dd className="tabular-nums">{v}</dd>
    </div>
  );
}
