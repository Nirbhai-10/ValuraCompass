import type { ScoreSet, CashFlowSnapshot, AllocationSnapshot } from "./types";
import type { HouseholdBundle } from "./engine";
import { computeCashFlow, computeAllocation } from "./engine";

export interface InsightAction {
  type: "CREATE_TASK" | "OPEN_MODULE";
  label: string;
  taskType?: string;
  ownerType?: "ADVISOR" | "CLIENT" | "SPECIALIST";
  priority?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  moduleHref?: string;
}

export interface GeneratedInsight {
  ruleId: string;
  category: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";
  title: string;
  body: string;
  advisorBody?: string;
  why: string;
  actions: InsightAction[];
}

function fmtINR(n: number): string {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function generateInsights(h: HouseholdBundle, scores: ScoreSet): GeneratedInsight[] {
  const cf: CashFlowSnapshot = computeCashFlow(h);
  const alloc: AllocationSnapshot = computeAllocation(h);
  const dependents = h.persons.filter((p) => p.isDependent).length;
  const out: GeneratedInsight[] = [];

  // R-ERS-CRIT
  if (scores.ERS.value < 40 && dependents > 0) {
    const monthsCovered = cf.essentialMonthlyExpenses > 0 ? alloc.liquid / cf.essentialMonthlyExpenses : 0;
    const target = cf.essentialMonthlyExpenses * 6;
    const gap = Math.max(0, target - alloc.liquid);
    out.push({
      ruleId: "R-ERS-CRIT",
      category: "URGENT_RISK",
      severity: "CRITICAL",
      title: "Emergency buffer is too thin for your household",
      body: `Your household can cover essentials for about ${monthsCovered.toFixed(1)} months without new income. For ${dependents} dependent(s), 6 months is a safer floor. Closing a gap of ${fmtINR(gap)} via a steady monthly plan should be a priority.`,
      advisorBody: `ERS ${scores.ERS.value}. Liquid ${fmtINR(alloc.liquid)}; essentials run-rate ${fmtINR(cf.essentialMonthlyExpenses)}/mo. Recommend SIP into liquid/arbitrage.`,
      why: `Liquid assets vs essential monthly run-rate, weighted by dependents.`,
      actions: [
        { type: "CREATE_TASK", label: "Start emergency plan", taskType: "GOAL_FUND", ownerType: "CLIENT", priority: "CRITICAL" },
        { type: "OPEN_MODULE", label: "See assets", moduleHref: "assets" },
      ],
    });
  }

  // R-PAS-LIFE-CRIT
  if (scores.PAS.value < 60 && dependents > 0) {
    const lifeCover = h.policies.filter((p) => p.type === "TERM").reduce((s, p) => s + p.sumAssured, 0);
    const yearsCovered = cf.essentialMonthlyExpenses > 0 ? lifeCover / (cf.essentialMonthlyExpenses * 12) : 0;
    out.push({
      ruleId: "R-PAS-LIFE-CRIT",
      category: "PROTECTION_GAP",
      severity: scores.PAS.value < 40 ? "CRITICAL" : "HIGH",
      title: "Term cover funds a small window of essentials",
      body: `Your current term cover would fund about ${yearsCovered.toFixed(1)} years of essential expenses for your family. For a household with ${dependents} dependent(s), increasing this is usually a high-leverage action.`,
      advisorBody: `Life cover total ${fmtINR(lifeCover)} vs essentials ${fmtINR(cf.essentialMonthlyExpenses * 12)}/yr. Consider raising cover to fund 8+ years of essentials and outstanding debts.`,
      why: `Term sum assured aggregated vs annual essentials × dependents.`,
      actions: [
        { type: "CREATE_TASK", label: "Evaluate term cover", taskType: "INSURANCE_REVIEW", ownerType: "CLIENT", priority: "HIGH" },
        { type: "OPEN_MODULE", label: "Open insurance", moduleHref: "insurance" },
      ],
    });
  }

  // R-CC-REVOLVE
  if (h.liabilities.some((l) => l.type === "CREDIT_CARD" && l.outstanding > 0)) {
    const total = h.liabilities.filter((l) => l.type === "CREDIT_CARD").reduce((s, l) => s + l.outstanding, 0);
    out.push({
      ruleId: "R-CC-REVOLVE",
      category: "DEBT_ACTION",
      severity: "HIGH",
      title: "Credit card balance is expensive — clear this first",
      body: `Carrying ${fmtINR(total)} on your credit card is typically the single biggest drag on your plan. This is usually the first thing to clear before investing more.`,
      why: `Credit card outstanding > 0.`,
      actions: [{ type: "CREATE_TASK", label: "Set payoff plan", taskType: "DEBT_OPT", ownerType: "CLIENT", priority: "HIGH" }],
    });
  }

  // R-CONC-TOP
  if (alloc.concentrationTop && alloc.concentrationTop.share > 0.3) {
    out.push({
      ruleId: "R-CONC-TOP",
      category: "HIDDEN_OPPORTUNITY",
      severity: alloc.concentrationTop.share > 0.5 ? "HIGH" : "MEDIUM",
      title: `One holding is ${(alloc.concentrationTop.share * 100).toFixed(0)}% of your investable assets`,
      body: `${alloc.concentrationTop.label} represents a large share of your investable assets. A gradual, tax-aware diversification over 12–18 months reduces single-point risk without timing markets.`,
      why: `Top-holding share of total assets.`,
      actions: [{ type: "OPEN_MODULE", label: "See assets", moduleHref: "assets" }],
    });
  }

  // R-RETIRE-LOW
  if (scores.RRS.value < 60) {
    out.push({
      ruleId: "R-RETIRE-LOW",
      category: "RETIREMENT_ACTION",
      severity: "HIGH",
      title: "Retirement trajectory needs attention",
      body: `At today's pace, your projected corpus meets about ${scores.RRS.value}% of the modelled target. A modest, consistent increase in monthly savings closes more of this gap than trying to time markets.`,
      why: `Projected corpus vs required corpus at retirement age.`,
      actions: [
        { type: "OPEN_MODULE", label: "Open retirement", moduleHref: "retirement" },
        { type: "CREATE_TASK", label: "Draft retirement plan", taskType: "RECOMMENDATION", ownerType: "ADVISOR", priority: "MEDIUM" },
      ],
    });
  }

  // R-TAX-REGIME
  if (h.region === "IN" && !h.taxProfile?.regime) {
    out.push({
      ruleId: "R-TAX-REGIME",
      category: "TAX_OPPORTUNITY",
      severity: "MEDIUM",
      title: "Regime not captured — worth a quick comparison",
      body: `Your tax regime (Old vs New) isn't yet captured. A quick comparison at your next review can meaningfully affect take-home and planning choices. This is an observation, not tax advice.`,
      why: `India households; taxProfile.regime missing.`,
      actions: [
        { type: "OPEN_MODULE", label: "Open tax planning", moduleHref: "tax" },
        { type: "CREATE_TASK", label: "Discuss regime with CA", taskType: "TAX_REVIEW", ownerType: "SPECIALIST", priority: "MEDIUM" },
      ],
    });
  }

  // R-EST-WILL
  if ((h.estateProfile?.willStatus ?? "NONE") === "NONE" && dependents > 0) {
    out.push({
      ruleId: "R-EST-WILL",
      category: "DOCUMENTATION_GAP",
      severity: "HIGH",
      title: "No will captured, with dependents present",
      body: `A simple registered will is among the highest-value hours you'll spend for your family's continuity. Start a draft and attach nominee confirmations to your assets.`,
      why: `Estate will status missing; dependents > 0.`,
      actions: [{ type: "CREATE_TASK", label: "Start will draft", taskType: "ESTATE", ownerType: "CLIENT", priority: "HIGH" }],
    });
  }

  // R-NOMINEE-GAP
  const nomineeGaps = h.assets.filter((a) => (a.nominees?.length ?? 0) === 0);
  if (nomineeGaps.length > 0) {
    out.push({
      ruleId: "R-NOMINEE-GAP",
      category: "DOCUMENTATION_GAP",
      severity: "MEDIUM",
      title: `${nomineeGaps.length} asset(s) have no nominee mapped`,
      body: `Make sure nominees are set and consistent across your assets. It's one of the cheapest, most impactful cleanups you can do.`,
      why: `Assets with empty nominee list.`,
      actions: [{ type: "CREATE_TASK", label: "Fix nominees", taskType: "NOMINEE_FIX", ownerType: "CLIENT", priority: "MEDIUM" }],
    });
  }

  // R-CFS
  if (scores.CFS.value < 50) {
    out.push({
      ruleId: "R-CFS",
      category: "CASH_FLOW",
      severity: "MEDIUM",
      title: "Cash flow is tight",
      body: `Your savings rate is ${(cf.savingsRate * 100).toFixed(1)}% and EMIs are ${((cf.totalEMI / Math.max(1, cf.monthlyNetIncome)) * 100).toFixed(0)}% of take-home. Small, repeatable wins here compound faster than most people expect.`,
      why: `CFS components under threshold.`,
      actions: [{ type: "OPEN_MODULE", label: "Open expenses", moduleHref: "expenses" }],
    });
  }

  // R-CONCENTRATION-RE
  const reShare = alloc.total > 0 ? (alloc.byClass["REAL_ESTATE"] ?? 0) / alloc.total : 0;
  if (reShare > 0.6) {
    out.push({
      ruleId: "R-RE-CONC",
      category: "HIDDEN_OPPORTUNITY",
      severity: "MEDIUM",
      title: `Real estate is ${(reShare * 100).toFixed(0)}% of your net worth`,
      body: `A very property-heavy household can look wealthy but have thin liquidity. Consider liquidity laddering alongside any long-term plans.`,
      why: `Real estate share of total assets.`,
      actions: [{ type: "OPEN_MODULE", label: "See allocation", moduleHref: "assets" }],
    });
  }

  // R-IDS-SINGLE-EARNER
  const earnerIds = new Set(h.incomes.map((i) => i.personId));
  const totalInc = h.incomes.reduce((s, i) => s + i.amountMonthly, 0);
  if (earnerIds.size === 1 && dependents >= 2 && totalInc > 0) {
    out.push({
      ruleId: "R-IDS-SINGLE-EARNER",
      category: "FAMILY_DEPENDENCY_ALERT",
      severity: "HIGH",
      title: "Single earner supporting multiple dependents",
      body: `Your household income is concentrated on a single earner. Strengthening protection and emergency resilience here pays outsized dividends.`,
      why: `One distinct income earner with ≥ 2 dependents.`,
      actions: [
        { type: "OPEN_MODULE", label: "Review protection", moduleHref: "insurance" },
        { type: "CREATE_TASK", label: "Top-up term cover", taskType: "INSURANCE_REVIEW", ownerType: "CLIENT", priority: "HIGH" },
      ],
    });
  }

  return out;
}

// Next Best Action ranking
export function rankNextBestActions(insights: GeneratedInsight[]): {
  advisor: GeneratedInsight[];
  client: GeneratedInsight[];
} {
  const sevWeight: Record<string, number> = { CRITICAL: 100, HIGH: 70, MEDIUM: 40, LOW: 20, INFORMATIONAL: 10 };
  const sorted = [...insights].sort((a, b) => sevWeight[b.severity] - sevWeight[a.severity]);
  const client = sorted.filter((i) => i.actions.some((a) => a.ownerType === "CLIENT")).slice(0, 3);
  const advisor = sorted.filter((i) => i.actions.some((a) => a.ownerType === "ADVISOR" || a.ownerType === "SPECIALIST")).slice(0, 3);
  return { advisor, client };
}
