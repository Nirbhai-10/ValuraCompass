import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { computeScores, computeCashFlow, computeAllocation, projectGoals, getAssumptionsSync } from "@/lib/analytics/engine";
import { generateInsights, rankNextBestActions } from "@/lib/analytics/insights";
import { ScoreCard } from "@/components/score-card";
import { InsightCard } from "@/components/insight-card";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function HouseholdOverview({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");

  const bundle: any = h;
  const scores = computeScores(bundle);
  const cf = computeCashFlow(bundle);
  const alloc = computeAllocation(bundle);
  const goalProjections = projectGoals(bundle);
  const insights = generateInsights(bundle, scores);
  const nba = rankNextBestActions(insights);
  const a = getAssumptionsSync(bundle);

  const openTasks = await prisma.task.count({
    where: { householdId: h.id, status: { in: ["OPEN", "IN_PROGRESS"] } },
  });

  const currency = h.currency;
  const region = h.region as "IN" | "GCC" | "GLOBAL";

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <ScoreCard score={scores.FHS} emphasis />
        <ScoreCard score={scores.ERS} />
        <ScoreCard score={scores.PAS} />
        <ScoreCard score={scores.RRS} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        {/* Snapshot */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold">Household snapshot</h2>
            <span className="text-xs text-ink-500">Based on current data</span>
          </div>
          <div className="card-body grid sm:grid-cols-2 gap-4">
            <div>
              <p className="section-title">Monthly cash flow</p>
              <dl className="mt-2 text-sm space-y-1.5">
                <div className="flex justify-between"><dt>Net income</dt><dd className="tabular-nums">{formatCurrency(cf.monthlyNetIncome, currency, region)}</dd></div>
                <div className="flex justify-between"><dt>Essentials</dt><dd className="tabular-nums">{formatCurrency(cf.essentialMonthlyExpenses, currency, region)}</dd></div>
                <div className="flex justify-between"><dt>Discretionary</dt><dd className="tabular-nums">{formatCurrency(cf.discretionaryMonthlyExpenses, currency, region)}</dd></div>
                <div className="flex justify-between"><dt>EMIs</dt><dd className="tabular-nums">{formatCurrency(cf.totalEMI, currency, region)}</dd></div>
                <div className="flex justify-between font-semibold pt-1 border-t border-line-100"><dt>Monthly surplus</dt><dd className="tabular-nums">{formatCurrency(cf.monthlySurplus, currency, region)}</dd></div>
              </dl>
            </div>
            <div>
              <p className="section-title">Balance sheet</p>
              <dl className="mt-2 text-sm space-y-1.5">
                <div className="flex justify-between"><dt>Total assets</dt><dd className="tabular-nums">{formatCurrency(alloc.total, currency, region)}</dd></div>
                <div className="flex justify-between"><dt>Liquid (≤ 30d)</dt><dd className="tabular-nums">{formatCurrency(alloc.liquid30d, currency, region)}</dd></div>
                <div className="flex justify-between"><dt>Illiquid</dt><dd className="tabular-nums">{formatCurrency(alloc.illiquid, currency, region)}</dd></div>
                {alloc.concentrationTop ? (
                  <div className="flex justify-between"><dt>Top holding</dt><dd className="tabular-nums">{alloc.concentrationTop.label} — {(alloc.concentrationTop.share * 100).toFixed(0)}%</dd></div>
                ) : null}
              </dl>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold">Next best actions</h2>
            <Link href={`/app/households/${h.id}/tasks`} className="text-sm link">Action center →</Link>
          </div>
          <div className="card-body space-y-4">
            {openTasks > 0 ? <p className="text-xs text-ink-500">{openTasks} open task{openTasks === 1 ? "" : "s"} in the action center.</p> : null}

            {nba.client.length > 0 ? (
              <div>
                <p className="section-title mb-2">For the client</p>
                <ul className="space-y-2">
                  {nba.client.slice(0, 2).map((i) => (
                    <li key={i.ruleId} className="border border-line-200 rounded-button p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug">{i.title}</p>
                      </div>
                      {i.lever ? <p className="text-xs text-brand-deep mt-1.5">Lever · {i.lever}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {nba.advisor.length > 0 ? (
              <div>
                <p className="section-title mb-2">For advisor / specialist</p>
                <ul className="space-y-2">
                  {nba.advisor.slice(0, 2).map((i) => (
                    <li key={i.ruleId} className="border border-line-200 rounded-button p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug">{i.title}</p>
                      </div>
                      {i.lever ? <p className="text-xs text-brand-deep mt-1.5">Lever · {i.lever}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {nba.advisor.length + nba.client.length === 0 ? (
              <p className="text-sm text-ink-500">No urgent actions right now. Keep the plan updated on life events and review next quarter.</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Scores grid (secondary) */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <ScoreCard score={scores.CFS} />
        <ScoreCard score={scores.IDS} />
        <ScoreCard score={scores.DSS} />
        <ScoreCard score={scores.LAS} />
        <ScoreCard score={scores.HFS} />
        <ScoreCard score={scores.FDRS} />
        <ScoreCard score={scores.TES} />
        <ScoreCard score={scores.CRS} />
        <ScoreCard score={scores.ESS} />
        <ScoreCard score={scores.RPS} />
        <ScoreCard score={scores.ISS} />
        <ScoreCard score={scores.DCS} />
      </div>

      {/* Top insights */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Top insights</h2>
          <Link href={`/app/households/${h.id}/insights`} className="text-sm link">See all →</Link>
        </div>
        {insights.length === 0 ? (
          <div className="card p-6 text-sm text-ink-500">No insights yet. Add income, expenses, policies, and goals to produce targeted observations.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {insights.slice(0, 4).map((i) => (
              <InsightCard
                key={i.ruleId}
                title={i.title}
                body={i.body}
                severity={i.severity}
                why={i.why}
                numbers={i.numbers}
                lever={i.lever}
                affectedScores={i.affectedScores}
              />
            ))}
          </div>
        )}
      </div>

      {/* Goals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Goals</h2>
          <Link href={`/app/households/${h.id}/goals`} className="text-sm link">Open goals →</Link>
        </div>
        {goalProjections.length === 0 ? (
          <div className="card p-6 text-sm text-ink-500">No goals yet. Add your first goal to see feasibility and SIP requirements.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {goalProjections.map((g) => (
              <div key={g.goalId} className="card p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{g.label}</h3>
                  <span className={g.onTrack ? "chip-positive" : g.feasibility >= 0.6 ? "chip-low" : "chip-warn"}>
                    {g.onTrack ? "On track" : g.feasibility >= 0.6 ? "Watch" : "At risk"}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-ink-500">Target year</p><p className="font-medium tabular-nums">{g.targetYear} ({g.yearsToGoal}y)</p></div>
                  <div><p className="text-xs text-ink-500">Future cost</p><p className="font-medium tabular-nums">{formatCurrency(g.futureTarget, currency, region)}</p></div>
                  <div><p className="text-xs text-ink-500">Required SIP</p><p className="font-medium tabular-nums">{formatCurrency(g.monthlySIPRequired, currency, region)}/mo</p></div>
                  <div><p className="text-xs text-ink-500">Capacity share</p><p className="font-medium tabular-nums">{formatCurrency(g.capacityAssumed, currency, region)}/mo</p></div>
                </div>
                <div className="mt-3 h-1 bg-line-200 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-deep" style={{ width: `${Math.max(4, Math.round(g.feasibility * 100))}%` }} />
                </div>
                <p className="text-[11px] text-ink-500 mt-1.5">Feasibility {Math.round(g.feasibility * 100)}% at current surplus share.</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assumptions footer */}
      <div className="card p-4 text-[11px] text-ink-500 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="uppercase tracking-wide text-ink-500 font-medium">Assumptions</span>
        <span>Inflation {(a.inflationGeneral * 100).toFixed(1)}%</span>
        <span>Equity {(a.equityNominalReturn * 100).toFixed(1)}%</span>
        <span>Debt {(a.debtNominalReturn * 100).toFixed(1)}%</span>
        <span>Retirement age {a.retirementAge}</span>
        <span>Longevity {a.longevity}</span>
        <Link className="link" href={`/app/households/${h.id}/assumptions`}>Edit →</Link>
      </div>
    </div>
  );
}
