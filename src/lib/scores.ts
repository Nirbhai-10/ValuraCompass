import { householdMetrics } from "./metrics";
import {
  selectAssets,
  selectExpenses,
  selectGoals,
  selectIncomes,
  selectLiabilities,
  selectPersons,
  selectPolicies,
  selectRiskProfile,
  selectTaxProfile,
  selectEstateProfile,
} from "./selectors";
import { Database } from "./types";

/**
 * Compass scores. Each score is a 0–100 number with a band, a one-line
 * narrative, and the components that drove it. Pure functions over the
 * Database so they're cheap, deterministic, and easy to display in the
 * report.
 *
 * Bands (consistent across scores):
 *   0–49   Stressed
 *   50–69  Tight
 *   70–84  Stable
 *   85–100 Strong
 */

export type ScoreBand = "Stressed" | "Tight" | "Stable" | "Strong";

export interface Score {
  id: string;
  label: string;
  value: number; // 0..100
  band: ScoreBand;
  narrative: string;
  components: { label: string; value: string }[];
}

export function band(value: number): ScoreBand {
  if (value < 50) return "Stressed";
  if (value < 70) return "Tight";
  if (value < 85) return "Stable";
  return "Strong";
}

export function bandTone(b: ScoreBand): "positive" | "default" | "warn" | "danger" {
  switch (b) {
    case "Strong":
      return "positive";
    case "Stable":
      return "default";
    case "Tight":
      return "warn";
    case "Stressed":
      return "danger";
  }
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

// ----- Individual scores ---------------------------------------------------

export function emergencyResilienceScore(db: Database, hhId: string): Score {
  const m = householdMetrics(db, hhId);
  const months = m.emergencyFundMonths;
  // 0 months → 0, 6 months → 90, 12+ months → 100. Linear in-between.
  const value = clamp(months >= 12 ? 100 : 15 * months);
  return {
    id: "ers",
    label: "Emergency resilience",
    value: Math.round(value),
    band: band(value),
    narrative:
      months >= 6
        ? `Liquid buffer covers ${months.toFixed(1)} months of essentials — comfortable.`
        : months >= 3
          ? `Buffer covers ${months.toFixed(1)} months. Aim for 6.`
          : `Only ${months.toFixed(1)} months of buffer. A single shock would force tough choices.`,
    components: [
      { label: "Liquid assets", value: m.liquidAssets.toLocaleString("en-IN") },
      {
        label: "Essential expenses / mo",
        value: (m.essentialExpense || m.monthlyExpense).toLocaleString("en-IN"),
      },
      { label: "Months of cover", value: months.toFixed(1) },
    ],
  };
}

export function debtStressScore(db: Database, hhId: string): Score {
  const m = householdMetrics(db, hhId);
  // Debt to assets: 0 → 100, 0.5 → 60, 0.7 → 30, 1.0 → 0
  const dta = m.debtToAssets;
  // EMI to monthly income — penalty if > 35%
  const emiToIncome =
    m.monthlyIncome > 0
      ? selectLiabilities(db, hhId).reduce((s, l) => s + (l.emiMonthly ?? 0), 0) /
        m.monthlyIncome
      : 0;

  const dtaScore = clamp(100 - dta * 100);
  const emiScore = clamp(100 - Math.max(0, emiToIncome - 0.2) * 200); // every 1pp above 20% costs 2 points
  const value = clamp(dtaScore * 0.6 + emiScore * 0.4);

  return {
    id: "dss",
    label: "Debt stress",
    value: Math.round(value),
    band: band(value),
    narrative:
      dta < 0.3 && emiToIncome < 0.3
        ? "Debt is comfortably below the equity cushion and the EMI bite is moderate."
        : dta > 0.6 || emiToIncome > 0.5
          ? "Debt is heavy relative to assets or income — sensitive to rate or income shocks."
          : "Debt is manageable but worth watching.",
    components: [
      { label: "Debt / assets", value: `${(dta * 100).toFixed(0)}%` },
      { label: "EMI / income", value: `${(emiToIncome * 100).toFixed(0)}%` },
    ],
  };
}

export function financialHealthScore(db: Database, hhId: string): Score {
  const m = householdMetrics(db, hhId);
  // Surplus rate (0 → 0, 30%+ → 100)
  const surplusScore = clamp(m.surplusRate >= 0 ? Math.min(m.surplusRate / 0.3, 1) * 100 : 0);
  // Net worth positivity
  const netWorthScore = m.totalAssets > 0
    ? clamp(((m.netWorth) / m.totalAssets) * 100 + 30) // pegged so 100% equity = 130 → clamped to 100
    : 0;
  const ers = emergencyResilienceScore(db, hhId).value;
  const dss = debtStressScore(db, hhId).value;
  const value = clamp(0.3 * surplusScore + 0.2 * netWorthScore + 0.25 * ers + 0.25 * dss);
  return {
    id: "fhs",
    label: "Financial health",
    value: Math.round(value),
    band: band(value),
    narrative:
      "Composite of cash flow, net worth, emergency cover, and debt stress. A single number for direction.",
    components: [
      { label: "Surplus / income", value: `${(m.surplusRate * 100).toFixed(0)}%` },
      { label: "Emergency resilience", value: String(Math.round(ers)) },
      { label: "Debt stress", value: String(Math.round(dss)) },
    ],
  };
}

export function retirementReadinessScore(db: Database, hhId: string): Score {
  const m = householdMetrics(db, hhId);
  // Crude readiness: how far along is the retirement-class corpus toward a 25× annual essentials target?
  const target = (m.essentialExpense || m.monthlyExpense) * 12 * 25;
  const corpus = selectAssets(db, hhId)
    .filter((a) =>
      ["Equity", "Retirement", "Debt / fixed income"].includes(a.assetClass),
    )
    .reduce((s, a) => s + a.currentValue, 0);
  const ratio = target > 0 ? corpus / target : 0;
  const value = clamp(ratio * 100);
  return {
    id: "rrs",
    label: "Retirement readiness",
    value: Math.round(value),
    band: band(value),
    narrative:
      ratio >= 1
        ? "Already at or beyond a 25× essential-expenses corpus."
        : ratio >= 0.5
          ? "Halfway-or-more to a comfortable corpus. Keep contributing."
          : "Far from a long-life corpus. Time and contributions both still on your side.",
    components: [
      {
        label: "Retirement corpus",
        value: corpus.toLocaleString("en-IN"),
      },
      { label: "Target (25× essentials)", value: target.toLocaleString("en-IN") },
      { label: "Ratio", value: `${(ratio * 100).toFixed(0)}%` },
    ],
  };
}

export function suitabilityScore(db: Database, hhId: string): Score {
  // ISS: alignment between equity allocation and the household's stated band.
  const profile = selectRiskProfile(db, hhId);
  const m = householdMetrics(db, hhId);
  const equityShare =
    m.totalAssets > 0
      ? selectAssets(db, hhId)
          .filter((a) => a.assetClass === "Equity" || a.assetClass === "Retirement")
          .reduce((s, a) => s + a.currentValue, 0) / m.totalAssets
      : 0;

  const target = profile
    ? {
        CONSERVATIVE: 0.25,
        MOD_CONSERVATIVE: 0.4,
        BALANCED: 0.55,
        GROWTH: 0.7,
        AGGRESSIVE: 0.8,
      }[profile.band]
    : 0.55;

  const drift = Math.abs(equityShare - target);
  const value = clamp(100 - drift * 200); // 10pp drift = 80, 25pp drift = 50

  return {
    id: "iss",
    label: "Investment suitability",
    value: Math.round(value),
    band: band(value),
    narrative: profile
      ? `Equity share is ${(equityShare * 100).toFixed(0)}% vs. ${profile.band.replace("_", " ").toLowerCase()} target of ${(target * 100).toFixed(0)}%.`
      : "Risk profile not set — using a balanced default. Run the questionnaire for a tighter fit.",
    components: [
      { label: "Equity share", value: `${(equityShare * 100).toFixed(0)}%` },
      { label: "Target", value: `${(target * 100).toFixed(0)}%` },
      { label: "Drift", value: `${(drift * 100).toFixed(0)} pp` },
    ],
  };
}

export function planningCompletenessScore(db: Database, hhId: string): Score {
  // PAS: how complete is the plan, by domain coverage?
  const persons = selectPersons(db, hhId).length;
  const incomes = selectIncomes(db, hhId).length;
  const expenses = selectExpenses(db, hhId).length;
  const assets = selectAssets(db, hhId).length;
  const liabilities = selectLiabilities(db, hhId).length;
  const policies = selectPolicies(db, hhId).length;
  const goals = selectGoals(db, hhId).length;
  const hasRisk = !!selectRiskProfile(db, hhId);
  const hasTax = !!selectTaxProfile(db, hhId);
  const hasEstate = !!selectEstateProfile(db, hhId);

  const checks: { label: string; ok: boolean }[] = [
    { label: "People", ok: persons >= 1 },
    { label: "Income", ok: incomes >= 1 },
    { label: "Expenses", ok: expenses >= 3 },
    { label: "Assets", ok: assets >= 2 },
    { label: "Liabilities tracked", ok: liabilities >= 0 },
    { label: "Insurance", ok: policies >= 1 },
    { label: "Goals", ok: goals >= 1 },
    { label: "Risk profile", ok: hasRisk },
    { label: "Tax profile", ok: hasTax },
    { label: "Estate profile", ok: hasEstate },
  ];
  const value = clamp((checks.filter((c) => c.ok).length / checks.length) * 100);
  return {
    id: "pas",
    label: "Planning completeness",
    value: Math.round(value),
    band: band(value),
    narrative: `${checks.filter((c) => c.ok).length} of ${checks.length} domains have data.`,
    components: checks.map((c) => ({ label: c.label, value: c.ok ? "✓" : "—" })),
  };
}

export function allScores(db: Database, hhId: string): Score[] {
  return [
    financialHealthScore(db, hhId),
    emergencyResilienceScore(db, hhId),
    debtStressScore(db, hhId),
    retirementReadinessScore(db, hhId),
    suitabilityScore(db, hhId),
    planningCompletenessScore(db, hhId),
  ];
}
