import { suggestOptimizations } from "./india-tax";
import { buildInsights } from "./insights";
import { householdMetrics } from "./metrics";
import {
  selectAssets,
  selectEstateProfile,
  selectGoals,
  selectHousehold,
  selectIncomes,
  selectLiabilities,
  selectPersons,
  selectPolicies,
  selectRiskProfile,
  selectTaxProfile,
} from "./selectors";
import { Database, RiskBand } from "./types";

/**
 * Next-best-actions generator.
 *
 * Insights describe *what's wrong*; actions describe *what to do about it*
 * — concretely, with amounts, deadlines, owner, and a deep-link to the
 * page where the user actually edits the data.
 *
 * The output is derived (not stored). The Action Center can pin any of
 * these to the task list with one click; the Overview surfaces the top
 * few; the printed report includes the full plan.
 */

export type ActionCategory =
  | "Liquidity"
  | "Protection"
  | "Cash flow"
  | "Allocation"
  | "Goals"
  | "Estate"
  | "Tax"
  | "Data"
  | "Review";

export type ActionSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export const SEVERITY_RANK: Record<ActionSeverity, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  INFO: 4,
};

export type ActionOwner = "Primary" | "Spouse" | "Either" | "Advisor";
export type ActionSource = "insight" | "tax" | "data" | "review" | "score";

export interface Action {
  id: string;
  title: string;
  body: string;
  category: ActionCategory;
  severity: ActionSeverity;
  owner: ActionOwner;
  /** Concrete amount in INR if the action involves a number (cover, top-up, savings). */
  amount?: number;
  /** Tax saving in INR for tax-source actions. */
  expectedSaving?: number;
  /** ISO date if the action has a sensible deadline. */
  deadline?: string;
  /** App route where the user can act. */
  whereToAct?: string;
  source: ActionSource;
  /** Original insight / optimisation id, for traceability. */
  sourceId?: string;
}

const TARGET_EQUITY_BY_BAND: Record<RiskBand, number> = {
  CONSERVATIVE: 0.25,
  MOD_CONSERVATIVE: 0.4,
  BALANCED: 0.55,
  GROWTH: 0.7,
  AGGRESSIVE: 0.8,
};

function fy_end_iso(): string {
  // March 31 of the current Indian financial year (or next year if we're already past).
  const today = new Date();
  const y = today.getMonth() >= 3 ? today.getFullYear() + 1 : today.getFullYear();
  return `${y}-03-31`;
}

function plus_days(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

function cap_round(n: number): number {
  // Round to a friendly number for display: nearest 1000 below 1L, nearest 25000 below 10L, nearest lakh otherwise.
  if (n < 100_000) return Math.round(n / 1000) * 1000;
  if (n < 10_00_000) return Math.round(n / 25000) * 25000;
  return Math.round(n / 100_000) * 100_000;
}

export function generateActions(db: Database, hhId: string): Action[] {
  const household = selectHousehold(db, hhId);
  if (!household) return [];

  const m = householdMetrics(db, hhId);
  const persons = selectPersons(db, hhId);
  const incomes = selectIncomes(db, hhId);
  const expenses = m.essentialExpense > 0 ? m.essentialExpense : m.monthlyExpense;
  const liabilities = selectLiabilities(db, hhId);
  const policies = selectPolicies(db, hhId);
  const goals = selectGoals(db, hhId);
  const assets = selectAssets(db, hhId);
  const taxProfile = selectTaxProfile(db, hhId);
  const estate = selectEstateProfile(db, hhId);
  const risk = selectRiskProfile(db, hhId);
  const insights = buildInsights(db, hhId);

  const out: Action[] = [];

  // ----- Emergency fund -------------------------------------------------
  const emergencyTarget = expenses * 6;
  if (m.liquidAssets < emergencyTarget && expenses > 0) {
    const gap = cap_round(emergencyTarget - m.liquidAssets);
    out.push({
      id: "emergency_topup",
      title: `Top up emergency reserve by about ₹${gap.toLocaleString("en-IN")}`,
      body: `Liquid buffer covers ${m.emergencyFundMonths.toFixed(1)} months. The 6-month target is ₹${cap_round(emergencyTarget).toLocaleString("en-IN")}.`,
      category: "Liquidity",
      severity:
        m.emergencyFundMonths < 1.5
          ? "CRITICAL"
          : m.emergencyFundMonths < 3
            ? "HIGH"
            : "MEDIUM",
      owner: "Primary",
      amount: gap,
      whereToAct: `/app/households/${hhId}/assets`,
      source: "insight",
      sourceId: "emergency_fund_low",
    });
  }

  // ----- Term life cover ------------------------------------------------
  const dependents = persons.filter((p) => !p.isPrimary).length;
  const termCover = policies
    .filter((p) => p.type === "Term life")
    .reduce((s, p) => s + p.sumAssured, 0);
  const annualIncome = m.monthlyIncome * 12;
  if (dependents > 0 && annualIncome > 0) {
    const target = annualIncome * 10;
    if (termCover < target) {
      const gap = cap_round(target - termCover);
      out.push({
        id: "term_cover_topup",
        title:
          termCover === 0
            ? `Buy term life cover of about ₹${gap.toLocaleString("en-IN")}`
            : `Top up term life cover by ₹${gap.toLocaleString("en-IN")}`,
        body: `${dependents} dependents in the household. Current cover is ${(termCover / annualIncome).toFixed(1)}× annual income; the rule of thumb is 10×.`,
        category: "Protection",
        severity: termCover === 0 ? "CRITICAL" : termCover / annualIncome < 5 ? "HIGH" : "MEDIUM",
        owner: "Primary",
        amount: gap,
        whereToAct: `/app/households/${hhId}/insurance`,
        source: "insight",
        sourceId: "term_insurance_low",
      });
    }
  }

  // ----- Health insurance missing --------------------------------------
  const hasHealth = policies.some(
    (p) => p.type === "Health (family)" || p.type === "Health (individual)",
  );
  if (!hasHealth && persons.length > 0) {
    out.push({
      id: "health_floor",
      title: "Buy a family-floater health policy with ₹10–15L cover",
      body: `${persons.length} ${persons.length === 1 ? "person" : "people"} in the household. Even one hospitalisation can wipe out months of savings.`,
      category: "Protection",
      severity: "HIGH",
      owner: "Primary",
      whereToAct: `/app/households/${hhId}/insurance`,
      source: "insight",
      sourceId: "health_insurance_missing",
    });
  }

  // ----- Credit card / high-rate debt ----------------------------------
  const ccBalance = liabilities
    .filter((l) => l.type === "Credit card")
    .reduce((s, l) => s + l.outstanding, 0);
  if (ccBalance > 0) {
    out.push({
      id: "cc_payoff",
      title: `Clear credit-card balance ₹${cap_round(ccBalance).toLocaleString("en-IN")}`,
      body: "Revolving balances accrue at 30%+ effective. This is almost always your highest-return action.",
      category: "Cash flow",
      severity: ccBalance > 50000 ? "HIGH" : "MEDIUM",
      owner: "Primary",
      amount: cap_round(ccBalance),
      deadline: plus_days(30),
      whereToAct: `/app/households/${hhId}/liabilities`,
      source: "insight",
      sourceId: "high_debt_to_assets",
    });
  }

  // ----- Asset concentration -------------------------------------------
  const total = m.totalAssets;
  if (total > 0) {
    const byClass = new Map<string, number>();
    for (const a of assets) {
      byClass.set(a.assetClass, (byClass.get(a.assetClass) ?? 0) + a.currentValue);
    }
    let topClass: string | null = null;
    let topValue = 0;
    byClass.forEach((v, k) => {
      if (v > topValue) {
        topValue = v;
        topClass = k;
      }
    });
    const topShare = topValue / total;
    if (topShare > 0.65 && topClass) {
      const moveAmount = cap_round(topValue - total * 0.55);
      out.push({
        id: "concentration_rebalance",
        title: `Rebalance — plan to move ₹${moveAmount.toLocaleString("en-IN")} out of ${topClass}`,
        body: `${(topShare * 100).toFixed(0)}% of the portfolio sits in one class. Stagger the move over 2–3 quarters to soften tax and timing risk.`,
        category: "Allocation",
        severity: topShare > 0.85 ? "MEDIUM" : "LOW",
        owner: "Either",
        amount: moveAmount,
        whereToAct: `/app/households/${hhId}/assets`,
        source: "insight",
        sourceId: "asset_concentration",
      });
    }
  }

  // ----- Risk band drift ------------------------------------------------
  if (risk && total > 0) {
    const equity = assets
      .filter((a) => a.assetClass === "Equity" || a.assetClass === "Retirement")
      .reduce((s, a) => s + a.currentValue, 0);
    const target = TARGET_EQUITY_BY_BAND[risk.band];
    const drift = equity / total - target;
    if (Math.abs(drift) > 0.15) {
      const moveAmount = cap_round(Math.abs(drift) * total);
      out.push({
        id: "risk_band_rebalance",
        title:
          drift > 0
            ? `Rotate ₹${moveAmount.toLocaleString("en-IN")} from equity to debt`
            : `Move ₹${moveAmount.toLocaleString("en-IN")} into equity over the next 2 quarters`,
        body: `Equity allocation is ${((equity / total) * 100).toFixed(0)}% vs. ${risk.band.replace("_", " ").toLowerCase()} target ${(target * 100).toFixed(0)}%.`,
        category: "Allocation",
        severity: "LOW",
        owner: "Either",
        amount: moveAmount,
        whereToAct: `/app/households/${hhId}/assets`,
        source: "insight",
        sourceId: "risk_band_drift",
      });
    }
  }

  // ----- Goal underfunding (short-term) ---------------------------------
  const currentYear = new Date().getFullYear();
  for (const g of goals) {
    const yearsAway = g.targetYear - currentYear;
    if (yearsAway < 0 || yearsAway > 5) continue;
    const linkedValue = assets
      .filter((a) => g.linkedAssetIds.includes(a.id))
      .reduce((s, a) => s + a.currentValue, 0);
    const ratio = g.targetAmount > 0 ? linkedValue / g.targetAmount : 0;
    if (ratio < 0.3) {
      const monthly = cap_round(
        Math.max(0, (g.targetAmount - linkedValue) / Math.max(yearsAway * 12, 1)),
      );
      out.push({
        id: `goal_underfunded_${g.id}`,
        title:
          g.linkedAssetIds.length === 0
            ? `Link assets that fund "${g.label}"`
            : `Increase monthly contribution toward "${g.label}" by ~₹${monthly.toLocaleString("en-IN")}`,
        body: `Target ₹${g.targetAmount.toLocaleString("en-IN")} by ${g.targetYear}; only ${(ratio * 100).toFixed(0)}% funded. With ${yearsAway} year${yearsAway === 1 ? "" : "s"} left, the runway is short.`,
        category: "Goals",
        severity: yearsAway <= 2 ? "HIGH" : "MEDIUM",
        owner: "Either",
        amount: monthly,
        whereToAct: `/app/households/${hhId}/goals`,
        source: "insight",
        sourceId: "near_goal_unfunded",
      });
    }
  }

  // ----- Estate ---------------------------------------------------------
  if (!estate || estate.willStatus === "NONE") {
    out.push({
      id: "draft_will",
      title: "Draft a will and register it",
      body: "Without a will, succession defaults to statute. Even a basic notarised will is a meaningful improvement.",
      category: "Estate",
      severity: "HIGH",
      owner: "Primary",
      deadline: plus_days(90),
      whereToAct: `/app/households/${hhId}/estate`,
      source: "insight",
      sourceId: "will_not_registered",
    });
  } else if (estate.willStatus === "DRAFT") {
    out.push({
      id: "register_will",
      title: "Register the will at the sub-registrar",
      body: "A drafted but unregistered will can be challenged. Registration is cheap and strengthens the document.",
      category: "Estate",
      severity: "MEDIUM",
      owner: "Primary",
      deadline: plus_days(60),
      whereToAct: `/app/households/${hhId}/estate`,
      source: "insight",
      sourceId: "will_not_registered",
    });
  } else if (estate.willStatus === "OUTDATED") {
    out.push({
      id: "refresh_will",
      title: "Refresh the will — current copy is marked outdated",
      body: "Major life events since the last update warrant a re-look. Re-register if the changes are material.",
      category: "Estate",
      severity: "MEDIUM",
      owner: "Primary",
      whereToAct: `/app/households/${hhId}/estate`,
      source: "insight",
      sourceId: "will_not_registered",
    });
  }

  // ----- Tax optimisations ---------------------------------------------
  if (taxProfile?.inputs && (taxProfile.regime === "OLD" || taxProfile.regime === "NEW")) {
    const taxOpts = suggestOptimizations(taxProfile.inputs, taxProfile.regime);
    for (const o of taxOpts) {
      out.push({
        id: `tax_${o.id}`,
        title: o.title,
        body: o.body,
        category: "Tax",
        severity: o.severity === "INFO" ? "LOW" : o.severity,
        owner: "Primary",
        expectedSaving: o.expectedSavings,
        deadline: o.id.startsWith("80") ? fy_end_iso() : undefined,
        whereToAct: `/app/households/${hhId}/tax`,
        source: "tax",
        sourceId: o.id,
      });
    }
  } else if (!taxProfile) {
    out.push({
      id: "tax_profile_missing",
      title: "Set up the tax profile (Old vs New regime)",
      body: "A few inputs unlock the regime comparison and the optimisation engine — both run locally and only against your data.",
      category: "Tax",
      severity: "LOW",
      owner: "Primary",
      whereToAct: `/app/households/${hhId}/tax`,
      source: "data",
    });
  }

  // ----- Data hygiene ---------------------------------------------------
  const childrenWithoutDob = persons.filter(
    (p) => !p.isPrimary && p.relation === "Child" && !p.dob,
  );
  if (childrenWithoutDob.length > 0) {
    out.push({
      id: "missing_dob_children",
      title: `Add date of birth for ${childrenWithoutDob.length} child${childrenWithoutDob.length === 1 ? "" : "ren"}`,
      body: "Education and timeline math depends on DOBs. Two minutes on the People page closes this gap.",
      category: "Data",
      severity: "LOW",
      owner: "Either",
      whereToAct: `/app/households/${hhId}/people`,
      source: "data",
      sourceId: "missing_dob_dependents",
    });
  }

  if (incomes.length === 0) {
    out.push({
      id: "income_missing",
      title: "Add your monthly income",
      body: "Most calculations downstream — surplus, suitability, retirement readiness — depend on it.",
      category: "Data",
      severity: "HIGH",
      owner: "Primary",
      whereToAct: `/app/households/${hhId}/income`,
      source: "data",
    });
  }

  // ----- Periodic review -----------------------------------------------
  const lastTouched = new Date(household.updatedAt).getTime();
  const monthsSince = (Date.now() - lastTouched) / (1000 * 60 * 60 * 24 * 30);
  if (monthsSince > 11) {
    out.push({
      id: "annual_review",
      title: "Schedule the annual review",
      body: `Plan was last touched ${monthsSince.toFixed(0)} months ago. Re-baseline assets, refresh insurance renewals, run scenarios.`,
      category: "Review",
      severity: "MEDIUM",
      owner: "Either",
      deadline: plus_days(30),
      whereToAct: `/app/households/${hhId}/scenarios`,
      source: "review",
    });
  }

  // Surface remaining insights (anything not already turned into a concrete
  // action above) as informational items so nothing silently disappears.
  const handledRuleIds = new Set(out.map((a) => a.sourceId).filter(Boolean));
  for (const insight of insights) {
    if (handledRuleIds.has(insight.ruleId)) continue;
    out.push({
      id: `insight_${insight.ruleId}`,
      title: insight.title,
      body: insight.body,
      category:
        insight.category === "Liquidity"
          ? "Liquidity"
          : insight.category === "Protection"
            ? "Protection"
            : insight.category === "Cash flow"
              ? "Cash flow"
              : insight.category === "Allocation"
                ? "Allocation"
                : insight.category === "Goals"
                  ? "Goals"
                  : insight.category === "Estate"
                    ? "Estate"
                    : "Data",
      severity:
        insight.severity === "INFO"
          ? "LOW"
          : (insight.severity as ActionSeverity),
      owner: "Either",
      whereToAct: `/app/households/${hhId}/insights`,
      source: "insight",
      sourceId: insight.ruleId,
    });
  }

  return out.sort(
    (a, b) =>
      SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
      (b.expectedSaving ?? 0) - (a.expectedSaving ?? 0),
  );
}

export const CATEGORY_LABEL: Record<ActionCategory, string> = {
  Liquidity: "Liquidity",
  Protection: "Protection",
  "Cash flow": "Cash flow",
  Allocation: "Allocation",
  Goals: "Goals",
  Estate: "Estate",
  Tax: "Tax",
  Data: "Data hygiene",
  Review: "Periodic review",
};
