import type { ScoreSet, CashFlowSnapshot, AllocationSnapshot } from "./types";
import type { HouseholdBundle } from "./engine";
import { computeCashFlow, computeAllocation, projectGoals } from "./engine";

export interface InsightAction {
  type: "CREATE_TASK" | "OPEN_MODULE";
  label: string;
  taskType?: string;
  ownerType?: "ADVISOR" | "CLIENT" | "SPECIALIST" | "COMPLIANCE" | "SPOUSE";
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
  numbers?: { label: string; value: string }[];
  lever?: string;
  affectedScores: string[];
  actions: InsightAction[];
}

// ----- Formatting helpers ---------------------------------------------------

function fmtAmount(n: number, currency = "INR"): string {
  if (currency === "INR") {
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
    return `₹${Math.round(n).toLocaleString("en-IN")}`;
  }
  const sym = currency === "USD" ? "$" : currency === "AED" ? "AED " : currency === "EUR" ? "€" : currency + " ";
  if (Math.abs(n) >= 1e6) return `${sym}${(n / 1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `${sym}${(n / 1e3).toFixed(1)}k`;
  return `${sym}${Math.round(n).toLocaleString()}`;
}

function monthsToClose(gap: number, monthlyCapacity: number): number {
  if (monthlyCapacity <= 0) return Infinity;
  return Math.ceil(gap / monthlyCapacity);
}

// Effective dependents (flagged or minors)
function dependents(h: HouseholdBundle): number {
  const now = Date.now();
  const ids = new Set<string>();
  for (const p of h.persons) {
    if (p.isDependent) { ids.add(p.id); continue; }
    if (p.dob) {
      const age = (now - new Date(p.dob).getTime()) / (365.25 * 864e5);
      if (age < 18) ids.add(p.id);
    }
  }
  return ids.size;
}

// ----- Rule library ---------------------------------------------------------

export function generateInsights(h: HouseholdBundle, scores: ScoreSet): GeneratedInsight[] {
  const cf: CashFlowSnapshot = computeCashFlow(h);
  const alloc: AllocationSnapshot = computeAllocation(h);
  const deps = dependents(h);
  const currency = h.currency;
  const out: GeneratedInsight[] = [];

  const earnerIds = new Set(h.incomes.map((i) => i.personId));
  const totalIncome = cf.monthlyNetIncome;
  const earnerShares = h.incomes.reduce<Record<string, number>>((acc, i) => {
    acc[i.personId] = (acc[i.personId] || 0) + i.amountMonthly;
    return acc;
  }, {});
  const topEarnerShare = Object.values(earnerShares).length && totalIncome > 0
    ? Math.max(...Object.values(earnerShares)) / totalIncome
    : 0;

  // R-ERS-CRIT
  {
    const monthsCovered = cf.essentialMonthlyExpenses > 0 ? alloc.liquid / cf.essentialMonthlyExpenses : 0;
    if (scores.ERS.value < 60 && deps > 0 && cf.essentialMonthlyExpenses > 0) {
      const targetMonths = 6;
      const target = cf.essentialMonthlyExpenses * targetMonths;
      const gap = Math.max(0, target - alloc.liquid);
      const monthly = Math.max(0, cf.monthlySurplus * 0.5);
      const close = monthsToClose(gap, monthly);
      out.push({
        ruleId: "R-ERS-CRIT",
        category: "URGENT_RISK",
        severity: scores.ERS.value < 40 ? "CRITICAL" : "HIGH",
        title: `Emergency buffer covers ${monthsCovered.toFixed(1)} months — aim for ${targetMonths}`,
        body: `Your accessible cash covers about ${monthsCovered.toFixed(1)} months of essentials. For ${deps} dependent${deps === 1 ? "" : "s"}, ${targetMonths} months is a safer floor. A ${fmtAmount(monthly, currency)}/month plan into a liquid fund closes the gap in about ${Number.isFinite(close) ? close : "—"} months.`,
        advisorBody: `ERS=${scores.ERS.value}. Liquid ${fmtAmount(alloc.liquid, currency)}; essentials ${fmtAmount(cf.essentialMonthlyExpenses, currency)}/mo. Suggest SIP into liquid/arbitrage.`,
        why: `Accessible cash (T+0/T+2) vs essential monthly run-rate, with dependents ≥ 1.`,
        numbers: [
          { label: "Months covered", value: monthsCovered.toFixed(1) },
          { label: "Target buffer", value: fmtAmount(target, currency) },
          { label: "Gap", value: fmtAmount(gap, currency) },
          { label: "Monthly plan", value: fmtAmount(monthly, currency) },
        ],
        lever: `Start a ${fmtAmount(monthly, currency)}/month SIP into a liquid fund until ERS reaches 6 months.`,
        affectedScores: ["ERS", "LAS", "FHS"],
        actions: [
          { type: "CREATE_TASK", label: "Start emergency plan", taskType: "GOAL_FUND", ownerType: "CLIENT", priority: scores.ERS.value < 40 ? "CRITICAL" : "HIGH" },
          { type: "OPEN_MODULE", label: "Open assets", moduleHref: "assets" },
        ],
      });
    }
  }

  // R-PAS-LIFE
  {
    const lifeCover = h.policies.filter((p) => p.type === "TERM").reduce((s, p) => s + p.sumAssured, 0);
    const essentialsAnnual = cf.essentialMonthlyExpenses * 12;
    const debt = h.liabilities.reduce((s, l) => s + l.outstanding, 0);
    const yearsCovered = essentialsAnnual > 0 ? (lifeCover - debt) / essentialsAnnual : 0;
    if (deps > 0 && scores.PAS.value < 85 && essentialsAnnual > 0) {
      const targetYears = 10;
      const targetCover = essentialsAnnual * targetYears + debt;
      const gap = Math.max(0, targetCover - lifeCover);
      out.push({
        ruleId: "R-PAS-LIFE",
        category: "PROTECTION_GAP",
        severity: yearsCovered < 3 ? "CRITICAL" : yearsCovered < 6 ? "HIGH" : "MEDIUM",
        title: `Term cover funds ${yearsCovered.toFixed(1)} years of essentials — target 10`,
        body: `After clearing outstanding debts, your term cover would fund about ${yearsCovered.toFixed(1)} years of essential expenses for your family. A target that funds 10 years (including debt payoff) would raise cover by ${fmtAmount(gap, currency)}.`,
        advisorBody: `PAS=${scores.PAS.value}. Life cover ${fmtAmount(lifeCover, currency)}; essentials ${fmtAmount(essentialsAnnual, currency)}/yr; debt ${fmtAmount(debt, currency)}. Propose additional term.`,
        why: `Sum of term policies minus outstanding debts, divided by annual essentials.`,
        numbers: [
          { label: "Life cover today", value: fmtAmount(lifeCover, currency) },
          { label: "Essentials/yr", value: fmtAmount(essentialsAnnual, currency) },
          { label: "Debt", value: fmtAmount(debt, currency) },
          { label: "Gap to 10-yr target", value: fmtAmount(gap, currency) },
        ],
        lever: `Raise term cover by ${fmtAmount(gap, currency)} to fund 10 years of essentials after debt.`,
        affectedScores: ["PAS", "FHS", "HFS"],
        actions: [
          { type: "CREATE_TASK", label: "Evaluate term top-up", taskType: "INSURANCE_REVIEW", ownerType: "CLIENT", priority: yearsCovered < 3 ? "CRITICAL" : "HIGH" },
          { type: "OPEN_MODULE", label: "Open insurance", moduleHref: "insurance" },
        ],
      });
    }
  }

  // R-PAS-HEALTH
  {
    const hasFloater = h.policies.some((p) => p.type === "FAMILY_FLOATER" || p.type === "INDIVIDUAL_HEALTH");
    if (!hasFloater && deps > 0) {
      out.push({
        ruleId: "R-PAS-HEALTH",
        category: "PROTECTION_GAP",
        severity: "CRITICAL",
        title: "No health cover captured for the household",
        body: `A single hospitalization can undo years of saving. A family floater sized around ${fmtAmount((cf.essentialMonthlyExpenses || 30000) * 12 * 2, currency)} is a reasonable starting point, with a top-up layered on for larger events.`,
        why: `No family-floater or individual health policy on file and the household has dependents.`,
        numbers: [
          { label: "Suggested floor", value: fmtAmount((cf.essentialMonthlyExpenses || 30000) * 12 * 2, currency) },
        ],
        lever: "Add a family floater; consider a super top-up for larger events.",
        affectedScores: ["PAS", "HFS"],
        actions: [
          { type: "CREATE_TASK", label: "Add health cover", taskType: "INSURANCE_REVIEW", ownerType: "CLIENT", priority: "CRITICAL" },
          { type: "OPEN_MODULE", label: "Open insurance", moduleHref: "insurance" },
        ],
      });
    }
    if (hasFloater && h.persons.some((p) => p.elderlyFlag) && !h.policies.some((p) => p.type === "CRITICAL_ILLNESS")) {
      out.push({
        ruleId: "R-PAS-CI",
        category: "PROTECTION_GAP",
        severity: "HIGH",
        title: "Critical illness cover missing with elderly dependents",
        body: `With elderly parents in the household, a separate critical-illness policy for the primary earner acts as income replacement if treatment periods are long. This is different from a family floater.`,
        why: `Elderly dependent flag present; no CRITICAL_ILLNESS policy on file.`,
        affectedScores: ["PAS", "FHS"],
        actions: [
          { type: "CREATE_TASK", label: "Review critical-illness options", taskType: "INSURANCE_REVIEW", ownerType: "CLIENT", priority: "HIGH" },
          { type: "OPEN_MODULE", label: "Open insurance", moduleHref: "insurance" },
        ],
      });
    }
  }

  // R-ULIP-SAVINGSLINKED
  {
    const savings = h.policies.filter((p) => p.type === "ULIP" || p.type === "ENDOWMENT");
    if (savings.length > 0) {
      const totalPrem = savings.reduce((s, p) => s + (p.premiumAnnual ?? 0), 0);
      const totalSA = savings.reduce((s, p) => s + p.sumAssured, 0);
      const termCover = h.policies.filter((p) => p.type === "TERM").reduce((s, p) => s + p.sumAssured, 0);
      out.push({
        ruleId: "R-ULIP-OBS",
        category: "HIDDEN_OPPORTUNITY",
        severity: "MEDIUM",
        title: `Savings-linked policies cost ${fmtAmount(totalPrem, currency)} a year in premium`,
        body: `Your ULIP/endowment cover of ${fmtAmount(totalSA, currency)} is small compared with your term cover of ${fmtAmount(termCover, currency)}. These policies mix insurance with investing and usually do neither well. Before making a change, compare continuing, paid-up, and surrender options carefully with your advisor.`,
        why: `Presence of ULIP/ENDOWMENT policies on file with identifiable premium.`,
        numbers: [
          { label: "Annual premium", value: fmtAmount(totalPrem, currency) },
          { label: "Savings-linked SA", value: fmtAmount(totalSA, currency) },
          { label: "Term SA", value: fmtAmount(termCover, currency) },
        ],
        lever: "Decide continue vs paid-up vs surrender; redirect to a term + investment split if appropriate.",
        affectedScores: ["PAS", "TES"],
        actions: [
          { type: "CREATE_TASK", label: "Policy review with advisor", taskType: "INSURANCE_REVIEW", ownerType: "CLIENT", priority: "MEDIUM" },
        ],
      });
    }
  }

  // R-CC-REVOLVE
  {
    const cc = h.liabilities.filter((l) => l.type === "CREDIT_CARD");
    const ccTotal = cc.reduce((s, l) => s + l.outstanding, 0);
    if (ccTotal > 0) {
      const rate = cc[0]?.interestRate ?? 42;
      const annualCost = Math.round(ccTotal * (rate / 100));
      out.push({
        ruleId: "R-CC-REVOLVE",
        category: "DEBT_ACTION",
        severity: "HIGH",
        title: `Credit card revolve is costing about ${fmtAmount(annualCost, currency)} a year`,
        body: `You're carrying ${fmtAmount(ccTotal, currency)} at roughly ${rate}%. That's usually the most expensive line in any household. Clearing this before any other investment compounds wins fast.`,
        why: `Credit card liabilities with outstanding > 0.`,
        numbers: [
          { label: "Outstanding", value: fmtAmount(ccTotal, currency) },
          { label: "Est. annual cost", value: fmtAmount(annualCost, currency) },
        ],
        lever: "Pay from lowest-return liquid assets first; avoid revolve going forward.",
        affectedScores: ["DSS", "CFS", "FHS"],
        actions: [
          { type: "CREATE_TASK", label: "Plan credit-card payoff", taskType: "DEBT_OPT", ownerType: "CLIENT", priority: "HIGH" },
        ],
      });
    }
  }

  // R-FLOAT-RATE
  {
    const fl = h.liabilities.filter((l) => l.interestType === "FLOATING" && (l.outstanding ?? 0) > 0);
    const flTotal = fl.reduce((s, l) => s + l.outstanding, 0);
    if (flTotal > 0) {
      const worstCaseExtra = Math.round(flTotal * 0.015); // 150bps shock
      out.push({
        ruleId: "R-RATE-SHOCK",
        category: "DEBT_ACTION",
        severity: "LOW",
        title: `Floating-rate debt of ${fmtAmount(flTotal, currency)} is sensitive to rate shocks`,
        body: `A 150-bps rate shock on your floating debt adds about ${fmtAmount(worstCaseExtra, currency)} to annual interest. Worth knowing before rate moves.`,
        why: `Liabilities with FLOATING interest type and positive outstanding.`,
        numbers: [
          { label: "Floating outstanding", value: fmtAmount(flTotal, currency) },
          { label: "Annual +150bps impact", value: fmtAmount(worstCaseExtra, currency) },
        ],
        lever: "Consider a partial fixed-rate refinance or prepayment schedule.",
        affectedScores: ["DSS", "CFS"],
        actions: [
          { type: "CREATE_TASK", label: "Model refinance / prepayment", taskType: "DEBT_OPT", ownerType: "ADVISOR", priority: "MEDIUM" },
        ],
      });
    }
  }

  // R-CONC-TOP
  if (alloc.concentrationTop && alloc.concentrationTop.share > 0.25) {
    const share = alloc.concentrationTop.share;
    out.push({
      ruleId: "R-CONC-TOP",
      category: "HIDDEN_OPPORTUNITY",
      severity: share > 0.5 ? "HIGH" : "MEDIUM",
      title: `One holding is ${(share * 100).toFixed(0)}% of your investable assets`,
      body: `${alloc.concentrationTop.label} represents a large share of your investable assets. A gradual, tax-aware diversification over 12–18 months reduces single-point risk without market timing.`,
      why: `Top-holding share of total assets > 25%.`,
      numbers: [
        { label: "Top holding", value: alloc.concentrationTop.label },
        { label: "Share", value: `${(share * 100).toFixed(0)}%` },
      ],
      lever: "Rebalance in tranches; aim for no single holding > 20% of investable net worth.",
      affectedScores: ["CRS", "HFS"],
      actions: [
        { type: "OPEN_MODULE", label: "Open assets", moduleHref: "assets" },
      ],
    });
  }

  // R-RE-CONC
  {
    const reShare = alloc.total > 0 ? (alloc.byClass["REAL_ESTATE"] ?? 0) / alloc.total : 0;
    if (reShare > 0.5) {
      out.push({
        ruleId: "R-RE-CONC",
        category: "HIDDEN_OPPORTUNITY",
        severity: reShare > 0.7 ? "HIGH" : "MEDIUM",
        title: `Real estate is ${(reShare * 100).toFixed(0)}% of your net worth`,
        body: `A property-heavy household often looks wealthy but can be short on liquidity. Make sure your emergency and near-term goals are funded from non-property assets.`,
        why: `REAL_ESTATE share of total assets > 50%.`,
        numbers: [
          { label: "Real estate share", value: `${(reShare * 100).toFixed(0)}%` },
        ],
        affectedScores: ["CRS", "LAS", "HFS"],
        actions: [
          { type: "OPEN_MODULE", label: "Open assets", moduleHref: "assets" },
        ],
      });
    }
  }

  // R-IDS-SINGLE-EARNER
  if (earnerIds.size <= 1 && deps >= 2 && totalIncome > 0) {
    out.push({
      ruleId: "R-IDS-SINGLE-EARNER",
      category: "FAMILY_DEPENDENCY_ALERT",
      severity: "HIGH",
      title: "One earner supporting several dependents",
      body: `Household income depends on a single earner. Strengthening term, health, and critical-illness cover — in that order — closes the biggest gap for families in this shape.`,
      why: `One distinct income earner with ${deps} dependent${deps === 1 ? "" : "s"}.`,
      numbers: [
        { label: "Earners", value: String(earnerIds.size) },
        { label: "Dependents", value: String(deps) },
      ],
      lever: "Protect the single earner first; consider a critical-illness rider.",
      affectedScores: ["IDS", "FDRS", "HFS"],
      actions: [
        { type: "CREATE_TASK", label: "Review protection stack", taskType: "INSURANCE_REVIEW", ownerType: "CLIENT", priority: "HIGH" },
      ],
    });
  } else if (totalIncome > 0 && topEarnerShare >= 0.8 && deps >= 1) {
    out.push({
      ruleId: "R-IDS-CONC",
      category: "FAMILY_DEPENDENCY_ALERT",
      severity: "MEDIUM",
      title: `One earner produces ${(topEarnerShare * 100).toFixed(0)}% of household income`,
      body: `Concentration of income on one earner increases household fragility. If the secondary earner has capacity to formalize additional income, or the primary earner has cover headroom, either helps.`,
      why: `Top earner share ≥ 80% with dependents.`,
      numbers: [
        { label: "Top earner share", value: `${(topEarnerShare * 100).toFixed(0)}%` },
      ],
      affectedScores: ["IDS", "HFS"],
      actions: [{ type: "OPEN_MODULE", label: "Open income", moduleHref: "income" }],
    });
  }

  // R-CFS
  if (scores.CFS.value < 70) {
    const emiRatio = totalIncome > 0 ? cf.totalEMI / totalIncome : 0;
    out.push({
      ruleId: "R-CFS",
      category: "CASH_FLOW",
      severity: scores.CFS.value < 50 ? "HIGH" : "MEDIUM",
      title: `Cash flow is ${scores.CFS.band.toLowerCase()} (savings rate ${(cf.savingsRate * 100).toFixed(1)}%)`,
      body: `Savings rate is ${(cf.savingsRate * 100).toFixed(1)}% and EMIs are ${(emiRatio * 100).toFixed(0)}% of take-home. Small, repeatable wins here compound faster than most people expect.`,
      why: `Savings rate + EMI ratio + discretionary share combined score < 70.`,
      numbers: [
        { label: "Savings rate", value: `${(cf.savingsRate * 100).toFixed(1)}%` },
        { label: "EMI ratio", value: `${(emiRatio * 100).toFixed(0)}%` },
        { label: "Discretionary", value: fmtAmount(cf.discretionaryMonthlyExpenses, currency) },
      ],
      affectedScores: ["CFS", "FHS"],
      actions: [{ type: "OPEN_MODULE", label: "Open expenses", moduleHref: "expenses" }],
    });
  }

  // R-GOAL-CONFLICT
  {
    const proj = projectGoals(h);
    const underfunded = proj.filter((p) => p.feasibility < 0.7);
    if (proj.length >= 2 && underfunded.length >= 2) {
      const worst = [...underfunded].sort((a, b) => a.feasibility - b.feasibility).slice(0, 2);
      out.push({
        ruleId: "R-GOAL-CONFLICT",
        category: "GOAL_CONFLICT",
        severity: "MEDIUM",
        title: `${underfunded.length} goals are competing for the same cash flow`,
        body: `"${worst[0].label}" and "${worst[1].label}" are both underfunded at current capacity. Worth choosing priority, increasing savings, or stretching one timeline.`,
        why: `Multiple goals with feasibility < 0.7 under equal-share capacity.`,
        numbers: worst.map((g) => ({ label: g.label, value: `${Math.round(g.feasibility * 100)}%` })),
        lever: "Decide: raise savings, delay one goal, or flex its target amount.",
        affectedScores: ["GFS", "FHS"],
        actions: [
          { type: "OPEN_MODULE", label: "Open goals", moduleHref: "goals" },
          { type: "CREATE_TASK", label: "Discuss goal tradeoffs", taskType: "RECOMMENDATION", ownerType: "ADVISOR", priority: "MEDIUM" },
        ],
      });
    }
  }

  // R-RETIRE-LOW — driven by RRS band, with a tangible lever
  if (scores.RRS.value < 70) {
    // How much extra monthly SIP would lift RRS to ~80?
    const bump = Math.round(Math.max(5000, cf.monthlySurplus * 0.25));
    out.push({
      ruleId: "R-RETIRE-LOW",
      category: "RETIREMENT_ACTION",
      severity: scores.RRS.value < 50 ? "HIGH" : "MEDIUM",
      title: `Retirement trajectory is ${scores.RRS.band.toLowerCase()} at current pace`,
      body: `Shared across your current goals, retirement savings are tracking about ${scores.RRS.value}% of the modelled target. An additional ${fmtAmount(bump, currency)}/month earmarked for retirement is usually enough to nudge the probability meaningfully.`,
      why: `RRS composite < 70.`,
      numbers: [
        { label: "Current trajectory", value: `${scores.RRS.value}%` },
        { label: "Suggested uplift", value: `${fmtAmount(bump, currency)}/mo` },
      ],
      lever: `Earmark ${fmtAmount(bump, currency)}/mo for retirement explicitly.`,
      affectedScores: ["RRS", "FHS"],
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
      title: "Regime not captured — run a quick Old vs New comparison",
      body: `Your tax regime isn't captured. At your income band, a quick comparison at your next review can meaningfully affect take-home and planning choices. This is a planning observation, not tax advice.`,
      why: `India household with no taxProfile.regime set.`,
      affectedScores: ["TES"],
      actions: [
        { type: "OPEN_MODULE", label: "Open tax", moduleHref: "tax" },
        { type: "CREATE_TASK", label: "Discuss regime with CA", taskType: "TAX_REVIEW", ownerType: "SPECIALIST", priority: "MEDIUM" },
      ],
    });
  }

  // R-EST-WILL
  {
    const will = h.estateProfile?.willStatus ?? "NONE";
    if ((will === "NONE" || will === "DRAFT" || will === "OUTDATED") && deps > 0) {
      out.push({
        ruleId: "R-EST-WILL",
        category: "DOCUMENTATION_GAP",
        severity: will === "NONE" ? "HIGH" : "MEDIUM",
        title: will === "NONE" ? "No will with dependents present" : `Will status is "${will}" — finalize and register`,
        body: will === "NONE"
          ? `A simple registered will is one of the highest-value hours a family can spend. It reduces dispute risk and protects minors.`
          : `A drafted or outdated will isn't enforceable the way a registered one is. Worth closing out.`,
        why: `Estate will status is not REGISTERED/UPDATED and dependents > 0.`,
        lever: "Register the will this quarter; align guardianship where relevant.",
        affectedScores: ["ESS", "DCS"],
        actions: [
          { type: "CREATE_TASK", label: "Close out will", taskType: "ESTATE", ownerType: "CLIENT", priority: will === "NONE" ? "HIGH" : "MEDIUM" },
          { type: "OPEN_MODULE", label: "Open estate", moduleHref: "estate" },
        ],
      });
    }
  }

  // R-NOMINEE-GAP
  {
    const nomineeGaps = h.assets.filter((a) => (a.nominees?.length ?? 0) === 0);
    if (nomineeGaps.length > 0 && h.assets.length > 0) {
      const pct = Math.round((nomineeGaps.length / h.assets.length) * 100);
      out.push({
        ruleId: "R-NOMINEE-GAP",
        category: "DOCUMENTATION_GAP",
        severity: pct >= 50 ? "MEDIUM" : "LOW",
        title: `${nomineeGaps.length} asset${nomineeGaps.length === 1 ? "" : "s"} have no nominee mapped (${pct}%)`,
        body: `Nominee coverage is one of the cheapest, most impactful cleanups you can do. Spend 20 minutes across your bank, broker, and MF platforms and you'll be done.`,
        why: `Assets with empty nominee list > 0.`,
        numbers: [
          { label: "Unmapped assets", value: String(nomineeGaps.length) },
          { label: "Total assets", value: String(h.assets.length) },
        ],
        affectedScores: ["ESS", "DCS"],
        actions: [
          { type: "CREATE_TASK", label: "Fix nominees", taskType: "NOMINEE_FIX", ownerType: "CLIENT", priority: "MEDIUM" },
        ],
      });
    }
  }

  // R-RPS-CAP-MISMATCH (stated vs capacity)
  {
    const stated = h.riskProfile?.stated;
    if (stated && (stated === "GROWTH" || stated === "AGGRESSIVE") && scores.ERS.value < 50) {
      out.push({
        ruleId: "R-RPS-MISMATCH",
        category: "SUITABILITY_MISMATCH",
        severity: "MEDIUM",
        title: `Stated "${stated.replace(/_/g, " ").toLowerCase()}" doesn't match current capacity`,
        body: `Your stated comfort is high, but emergency buffer is thin. We treat your working risk profile as Balanced until ERS improves, so recommendations stay safe. You can override this with your advisor.`,
        why: `Risk profile stated GROWTH/AGGRESSIVE with ERS < 50.`,
        lever: "Rebuild emergency buffer first; then revisit risk capacity.",
        affectedScores: ["RPS", "ISS"],
        actions: [{ type: "OPEN_MODULE", label: "Open risk", moduleHref: "risk" }],
      });
    }
  }

  // R-DOC-MISSING
  {
    const expected = ["ITR", "POLICY", "STATEMENT", "WILL"];
    const present = new Set((h.documents ?? []).map((d) => d.type));
    const missing = expected.filter((x) => !present.has(x));
    if (missing.length > 0) {
      out.push({
        ruleId: "R-DOC-MISSING",
        category: "DOCUMENTATION_GAP",
        severity: "LOW",
        title: `${missing.length} key document type${missing.length === 1 ? "" : "s"} not on file`,
        body: `Uploading these helps the engine reason with real numbers and improves the confidence of every downstream output: ${missing.join(", ").toLowerCase()}.`,
        why: `Household documents missing from expected catalog.`,
        affectedScores: ["DCS", "PCS"],
        actions: [{ type: "OPEN_MODULE", label: "Upload documents", moduleHref: "documents" }],
      });
    }
  }

  // R-ELDERCARE
  if (h.persons.some((p) => p.elderlyFlag)) {
    const hcReserve = h.goals.find((g) => g.type === "HEALTHCARE_RESERVE" || g.inflationCategory === "HEALTHCARE");
    if (!hcReserve) {
      out.push({
        ruleId: "R-ELDERCARE",
        category: "FAMILY_DEPENDENCY_ALERT",
        severity: "MEDIUM",
        title: "Consider a dedicated parents' healthcare reserve",
        body: `With elderly dependents in the household, a dedicated healthcare reserve goal makes the most of healthcare-inflation modelling and avoids raiding long-term investments during an event.`,
        why: `Elderly flag on ≥ 1 person; no healthcare goal present.`,
        affectedScores: ["HFS", "FDRS", "PAS"],
        actions: [
          { type: "OPEN_MODULE", label: "Add goal", moduleHref: "goals" },
          { type: "CREATE_TASK", label: "Size healthcare reserve", taskType: "RECOMMENDATION", ownerType: "ADVISOR", priority: "MEDIUM" },
        ],
      });
    }
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
  const client = sorted
    .filter((i) => i.actions.some((a) => a.ownerType === "CLIENT"))
    .slice(0, 3);
  const advisor = sorted
    .filter((i) => i.actions.some((a) => a.ownerType === "ADVISOR" || a.ownerType === "SPECIALIST"))
    .slice(0, 3);
  return { advisor, client };
}
