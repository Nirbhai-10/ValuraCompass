import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { computeScores, computeCashFlow, computeAllocation } from "@/lib/analytics/engine";
import { generateInsights, rankNextBestActions } from "@/lib/analytics/insights";
import { CompassLogo } from "@/components/logo";
import { PrintButton } from "@/components/print-button";
import { formatCurrency } from "@/lib/utils";
import { getRegion } from "@/lib/region";

export default async function BasicReport({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");
  const bundle: any = h;
  const scores = computeScores(bundle);
  const cf = computeCashFlow(bundle);
  const alloc = computeAllocation(bundle);
  const insights = generateInsights(bundle, scores);
  const nba = rankNextBestActions(insights);
  const region = h.region as "IN" | "GCC" | "GLOBAL";
  const regionPack = getRegion(h.region);

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex items-center justify-between no-print">
        <p className="text-sm text-ink-500">Basic one-pager</p>
        <PrintButton />
      </div>

      <article className="card p-8 print:shadow-none print:border-0">
        <header className="flex items-start justify-between gap-6 border-b border-line-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-brand-deep">
              <CompassLogo className="h-6 w-6" />
              <span className="font-semibold">Valura Compass</span>
            </div>
            <h1 className="text-2xl font-semibold mt-3">{h.name}</h1>
            <p className="text-xs text-ink-500 mt-1">
              {regionPack.displayName} · {h.currency} · {h.structure.replace(/_/g, " ")} ·{" "}
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-500">Financial Health</p>
            <p className="text-5xl font-semibold tabular-nums">{scores.FHS.value}</p>
            <p className="text-xs text-ink-500">{scores.FHS.band}</p>
          </div>
        </header>

        <section className="mt-5 grid md:grid-cols-3 gap-4">
          <Kpi title="Emergency resilience" value={scores.ERS.value} band={scores.ERS.band} />
          <Kpi title="Protection adequacy" value={scores.PAS.value} band={scores.PAS.band} />
          <Kpi title="Retirement readiness" value={scores.RRS.value} band={scores.RRS.band} />
        </section>

        <section className="mt-6 grid md:grid-cols-2 gap-6">
          <div>
            <p className="section-title">Cash flow (monthly)</p>
            <dl className="mt-2 text-sm space-y-1.5">
              <Row k="Net income" v={formatCurrency(cf.monthlyNetIncome, h.currency, region)} />
              <Row k="Essentials" v={formatCurrency(cf.essentialMonthlyExpenses, h.currency, region)} />
              <Row k="Discretionary" v={formatCurrency(cf.discretionaryMonthlyExpenses, h.currency, region)} />
              <Row k="EMIs" v={formatCurrency(cf.totalEMI, h.currency, region)} />
              <Row k="Surplus" v={formatCurrency(cf.monthlySurplus, h.currency, region)} strong />
            </dl>
          </div>
          <div>
            <p className="section-title">Balance sheet</p>
            <dl className="mt-2 text-sm space-y-1.5">
              <Row k="Total assets" v={formatCurrency(alloc.total, h.currency, region)} />
              <Row k="Liquid (≤ 30d)" v={formatCurrency(alloc.liquid30d, h.currency, region)} />
              <Row k="Illiquid" v={formatCurrency(alloc.illiquid, h.currency, region)} />
            </dl>
          </div>
        </section>

        <section className="mt-6 grid md:grid-cols-2 gap-6">
          <div>
            <p className="section-title">Top risks</p>
            <ul className="mt-2 space-y-2 text-sm">
              {insights.filter((i) => i.severity === "CRITICAL" || i.severity === "HIGH").slice(0, 3).map((i) => (
                <li key={i.ruleId}><span className="font-medium">{i.title}</span><br /><span className="text-ink-500 text-xs">{i.body}</span></li>
              ))}
              {insights.filter((i) => i.severity === "CRITICAL" || i.severity === "HIGH").length === 0 ? (
                <li className="text-ink-500">No critical or high risks surfaced at this data density.</li>
              ) : null}
            </ul>
          </div>
          <div>
            <p className="section-title">Top opportunities</p>
            <ul className="mt-2 space-y-2 text-sm">
              {insights.filter((i) => i.severity === "MEDIUM" || i.category === "HIDDEN_OPPORTUNITY" || i.category === "TAX_OPPORTUNITY").slice(0, 3).map((i) => (
                <li key={i.ruleId}><span className="font-medium">{i.title}</span><br /><span className="text-ink-500 text-xs">{i.body}</span></li>
              ))}
              {insights.filter((i) => i.severity === "MEDIUM" || i.category === "HIDDEN_OPPORTUNITY" || i.category === "TAX_OPPORTUNITY").length === 0 ? (
                <li className="text-ink-500">More data will surface opportunities worth following.</li>
              ) : null}
            </ul>
          </div>
        </section>

        <section className="mt-6">
          <p className="section-title">Next best actions</p>
          <div className="grid md:grid-cols-2 gap-4 mt-2 text-sm">
            <div>
              <p className="font-medium text-xs mb-1">You</p>
              <ul className="space-y-1.5">
                {nba.client.slice(0, 2).map((i) => <li key={i.ruleId}>• {i.title}</li>)}
                {nba.client.length === 0 ? <li className="text-ink-500">No client actions right now.</li> : null}
              </ul>
            </div>
            <div>
              <p className="font-medium text-xs mb-1">Advisor / specialist</p>
              <ul className="space-y-1.5">
                {nba.advisor.slice(0, 2).map((i) => <li key={i.ruleId}>• {i.title}</li>)}
                {nba.advisor.length === 0 ? <li className="text-ink-500">No advisor actions queued.</li> : null}
              </ul>
            </div>
          </div>
        </section>

        <footer className="mt-8 pt-4 border-t border-line-200 text-[11px] text-ink-500">
          {regionPack.disclosures.general}<br />
          Prepared by Valura Compass · Planning observation only. Not investment, tax, or legal advice.
        </footer>
      </article>
    </div>
  );
}

function Kpi({ title, value, band }: { title: string; value: number; band: string }) {
  return (
    <div className="border border-line-200 rounded-card p-4">
      <p className="text-xs uppercase tracking-wide text-ink-500">{title}</p>
      <p className="text-3xl font-semibold tabular-nums mt-1">{value}</p>
      <p className="text-xs text-ink-500">{band}</p>
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
