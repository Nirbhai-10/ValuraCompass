import { householdMetrics } from "./metrics";
import {
  selectAssets,
  selectGoals,
  selectPersons,
  selectPolicies,
} from "./selectors";
import { Database, RiskBand } from "./types";

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export interface Insight {
  ruleId: string;
  category:
    | "Liquidity"
    | "Protection"
    | "Cash flow"
    | "Allocation"
    | "Goals"
    | "Estate"
    | "Data";
  severity: Severity;
  title: string;
  body: string;
  why: string;
  action?: string;
}

export const SEVERITY_RANK: Record<Severity, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  INFO: 4,
};

interface RuleContext {
  db: Database;
  hhId: string;
}

type Rule = (ctx: RuleContext) => Insight | null;

const RULES: Rule[] = [
  emergencyFundRule,
  termInsuranceForBreadwinnerRule,
  healthInsuranceRule,
  highDiscretionaryRule,
  highDebtToAssetsRule,
  concentrationRule,
  willStatusRule,
  missingDobOnDependentsRule,
  goalUnfundedRule,
  riskMismatchRule,
];

export function buildInsights(db: Database, hhId: string): Insight[] {
  const ctx: RuleContext = { db, hhId };
  const out: Insight[] = [];
  for (const rule of RULES) {
    const result = rule(ctx);
    if (result) out.push(result);
  }
  return out.sort(
    (a, b) =>
      SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
      a.title.localeCompare(b.title),
  );
}

// ----- Rules ---------------------------------------------------------------

function emergencyFundRule({ db, hhId }: RuleContext): Insight | null {
  const m = householdMetrics(db, hhId);
  if (m.monthlyExpense === 0) return null;
  const months = m.emergencyFundMonths;
  if (months >= 6) return null;
  const sev: Severity = months < 1.5 ? "CRITICAL" : months < 3 ? "HIGH" : "MEDIUM";
  return {
    ruleId: "emergency_fund_low",
    category: "Liquidity",
    severity: sev,
    title: `Emergency fund covers ${months.toFixed(1)} month${months === 1 ? "" : "s"}`,
    body: "A liquid buffer of 3–6 months of essential expenses keeps a job loss, medical event, or business hiccup from forcing a panic sale.",
    why: "Liquid assets (cash + debt instruments) divided by essential monthly expenses.",
    action: "Top up the savings/FD bucket until it covers at least 6 months of essentials.",
  };
}

function termInsuranceForBreadwinnerRule({ db, hhId }: RuleContext): Insight | null {
  const m = householdMetrics(db, hhId);
  const persons = selectPersons(db, hhId);
  const policies = selectPolicies(db, hhId);
  const dependents = persons.filter((p) => !p.isPrimary).length;
  if (dependents === 0) return null;
  if (m.monthlyIncome === 0) return null;
  const annualIncome = m.monthlyIncome * 12;
  const termCover = policies
    .filter((p) => p.type === "Term life")
    .reduce((s, p) => s + p.sumAssured, 0);
  const multiple = annualIncome > 0 ? termCover / annualIncome : 0;
  if (multiple >= 10) return null;
  const sev: Severity = termCover === 0 ? "CRITICAL" : multiple < 5 ? "HIGH" : "MEDIUM";
  return {
    ruleId: "term_insurance_low",
    category: "Protection",
    severity: sev,
    title:
      termCover === 0
        ? "No term insurance with dependents in the household"
        : `Term cover is ${multiple.toFixed(1)}× annual income`,
    body: "A term plan worth roughly 10–15× annual income keeps the household whole if the breadwinner is suddenly out of the picture.",
    why: "Total Term life sum-assured divided by annual income, against the 10× rule of thumb.",
    action: "Add or raise pure term cover to at least 10× annual household income.",
  };
}

function healthInsuranceRule({ db, hhId }: RuleContext): Insight | null {
  const policies = selectPolicies(db, hhId);
  const persons = selectPersons(db, hhId);
  const hasHealth = policies.some(
    (p) => p.type === "Health (family)" || p.type === "Health (individual)",
  );
  if (hasHealth) return null;
  return {
    ruleId: "health_insurance_missing",
    category: "Protection",
    severity: "HIGH",
    title: "No health insurance recorded",
    body: `${persons.length} ${persons.length === 1 ? "person" : "people"} in the household with nothing tracked here. A single hospitalisation can wipe out years of savings.`,
    why: "No policy of type 'Health (family)' or 'Health (individual)' is on file.",
    action: "Add a family-floater (or individual) plan with at least ₹10–15L cover.",
  };
}

function highDiscretionaryRule({ db, hhId }: RuleContext): Insight | null {
  const m = householdMetrics(db, hhId);
  if (m.monthlyExpense === 0) return null;
  const discretionary = m.monthlyExpense - m.essentialExpense;
  if (discretionary <= 0) return null;
  const ratio = discretionary / m.monthlyExpense;
  if (ratio < 0.35) return null;
  return {
    ruleId: "high_discretionary",
    category: "Cash flow",
    severity: ratio > 0.55 ? "MEDIUM" : "LOW",
    title: `Discretionary spend is ${(ratio * 100).toFixed(0)}% of expenses`,
    body: "A higher share of flexible spend isn't bad, but it's the lever that actually moves cash flow when you need it to.",
    why: "Sum of expenses with `essential = false` divided by total monthly expenses.",
    action: "Mark anything truly fixed as essential, then trim or redirect the rest.",
  };
}

function highDebtToAssetsRule({ db, hhId }: RuleContext): Insight | null {
  const m = householdMetrics(db, hhId);
  if (m.totalAssets === 0) return null;
  if (m.debtToAssets < 0.4) return null;
  return {
    ruleId: "high_debt_to_assets",
    category: "Cash flow",
    severity: m.debtToAssets > 0.7 ? "HIGH" : "MEDIUM",
    title: `Debt is ${(m.debtToAssets * 100).toFixed(0)}% of assets`,
    body: "Above ~40% the household becomes sensitive to rate hikes and income shocks. Above 70% the equity cushion is thin.",
    why: "Total outstanding liabilities divided by total assets.",
    action: "Prioritise paying down the highest-rate debt first; avoid new revolving balances.",
  };
}

function concentrationRule({ db, hhId }: RuleContext): Insight | null {
  const assets = selectAssets(db, hhId);
  const total = assets.reduce((s, a) => s + a.currentValue, 0);
  if (total === 0) return null;
  const byClass = new Map<string, number>();
  for (const a of assets) byClass.set(a.assetClass, (byClass.get(a.assetClass) ?? 0) + a.currentValue);
  let topClass: string | null = null;
  let topShare = 0;
  byClass.forEach((v, k) => {
    if (v / total > topShare) {
      topShare = v / total;
      topClass = k;
    }
  });
  if (topShare < 0.65 || topClass == null) return null;
  return {
    ruleId: "asset_concentration",
    category: "Allocation",
    severity: topShare > 0.85 ? "MEDIUM" : "LOW",
    title: `${(topShare * 100).toFixed(0)}% of assets sit in ${topClass}`,
    body: "Concentration is fine while it works and dangerous when it doesn't. Worth a deliberate look, especially if it's a single property or single stock.",
    why: "Largest asset class share against the 65% concentration threshold.",
    action: "Plan a gradual rebalance into other classes, especially liquid debt and equity if missing.",
  };
}

function willStatusRule({ db, hhId }: RuleContext): Insight | null {
  const estate = db.estateProfiles.find((e) => e.householdId === hhId);
  if (!estate || estate.willStatus === "REGISTERED") return null;
  const sev: Severity = estate.willStatus === "OUTDATED" ? "MEDIUM" : "HIGH";
  return {
    ruleId: "will_not_registered",
    category: "Estate",
    severity: sev,
    title:
      estate.willStatus === "DRAFT"
        ? "Will is in draft, not registered"
        : estate.willStatus === "OUTDATED"
          ? "Will is marked outdated"
          : "No will on file",
    body: "Without a registered will, distribution falls under default succession laws — slow, contested, and sometimes contrary to your intent.",
    why: "Estate profile shows `willStatus` other than `REGISTERED`.",
    action: "Finish the draft and register at the sub-registrar; revisit every 5 years or after major life events.",
  };
}

function missingDobOnDependentsRule({ db, hhId }: RuleContext): Insight | null {
  const persons = selectPersons(db, hhId);
  const dependents = persons.filter((p) => !p.isPrimary && p.relation === "Child");
  const missing = dependents.filter((d) => !d.dob).length;
  if (missing === 0) return null;
  return {
    ruleId: "missing_dob_dependents",
    category: "Data",
    severity: "LOW",
    title: `${missing} child${missing === 1 ? "" : "ren"} without a DOB`,
    body: "Education and marriage goals depend on the runway you have. A date of birth lets the timeline math work.",
    why: "Persons with `relation = Child` are missing a `dob` field.",
    action: "Add the DOB on People → Edit.",
  };
}

function goalUnfundedRule({ db, hhId }: RuleContext): Insight | null {
  const goals = selectGoals(db, hhId);
  const assets = selectAssets(db, hhId);
  const currentYear = new Date().getFullYear();
  const offenders = goals.filter((g) => {
    const fundedNow = assets
      .filter((a) => g.linkedAssetIds.includes(a.id))
      .reduce((s, a) => s + a.currentValue, 0);
    const yearsAway = g.targetYear - currentYear;
    if (yearsAway > 5) return false; // medium/long-term goals are OK below
    return fundedNow / g.targetAmount < 0.3;
  });
  if (offenders.length === 0) return null;
  return {
    ruleId: "near_goal_unfunded",
    category: "Goals",
    severity: "MEDIUM",
    title: `${offenders.length} short-term goal${offenders.length === 1 ? "" : "s"} below 30% funded`,
    body: "Short-term goals (within 5 years) need the runway and the assets earmarked. Linking real assets to them tightens the plan.",
    why: "Goals with `targetYear` within 5 years where linked-asset value is below 30% of target.",
    action: "Open Goals → Edit and link the right assets, or move money toward them.",
  };
}

function riskMismatchRule({ db, hhId }: RuleContext): Insight | null {
  const profile = db.riskProfiles.find((r) => r.householdId === hhId);
  if (!profile) return null;
  const total = householdMetrics(db, hhId).totalAssets;
  if (total === 0) return null;
  const equity = selectAssets(db, hhId)
    .filter((a) => a.assetClass === "Equity" || a.assetClass === "Retirement")
    .reduce((s, a) => s + a.currentValue, 0);
  const equityShare = equity / total;
  const targetByBand: Record<RiskBand, number> = {
    CONSERVATIVE: 0.25,
    MOD_CONSERVATIVE: 0.4,
    BALANCED: 0.55,
    GROWTH: 0.7,
    AGGRESSIVE: 0.8,
  };
  const target = targetByBand[profile.band];
  const drift = equityShare - target;
  if (Math.abs(drift) < 0.15) return null;
  return {
    ruleId: "risk_band_drift",
    category: "Allocation",
    severity: "LOW",
    title: `Equity allocation is ${(equityShare * 100).toFixed(0)}% vs. ${profile.band.replace("_", " ").toLowerCase()} target ${(target * 100).toFixed(0)}%`,
    body: "Stated risk is one thing; the portfolio's actual risk is what matters when markets misbehave.",
    why: "Difference between (Equity + Retirement) share and the band's target equity share is over 15%.",
    action: "Rebalance over 2–3 quarters to avoid taxable jolts.",
  };
}
