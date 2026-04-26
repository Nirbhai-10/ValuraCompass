import { AssumptionOverride, Database, Region } from "./types";

export interface Assumptions {
  inflationGeneral: number;
  inflationEducation: number;
  inflationHealthcare: number;
  returnEquity: number;
  returnDebt: number;
  returnGold: number;
  returnVolatility: number;
  lifeExpectancy: number;
}

const DEFAULTS_BY_REGION: Record<Region, Assumptions> = {
  IN: {
    inflationGeneral: 0.06,
    inflationEducation: 0.09,
    inflationHealthcare: 0.1,
    returnEquity: 0.11,
    returnDebt: 0.07,
    returnGold: 0.075,
    returnVolatility: 0.16,
    lifeExpectancy: 85,
  },
  GCC: {
    inflationGeneral: 0.03,
    inflationEducation: 0.05,
    inflationHealthcare: 0.06,
    returnEquity: 0.085,
    returnDebt: 0.045,
    returnGold: 0.06,
    returnVolatility: 0.15,
    lifeExpectancy: 86,
  },
  GLOBAL: {
    inflationGeneral: 0.025,
    inflationEducation: 0.04,
    inflationHealthcare: 0.05,
    returnEquity: 0.08,
    returnDebt: 0.04,
    returnGold: 0.055,
    returnVolatility: 0.16,
    lifeExpectancy: 87,
  },
};

export function defaultAssumptions(region: Region): Assumptions {
  return { ...DEFAULTS_BY_REGION[region] };
}

export function effectiveAssumptions(
  db: Database,
  householdId: string,
): Assumptions {
  const household = db.households.find((h) => h.id === householdId);
  const base = defaultAssumptions(household?.region ?? "IN");
  const override = db.assumptions.find((a) => a.householdId === householdId);
  if (!override) return base;
  const merged: Assumptions = { ...base };
  (Object.keys(base) as Array<keyof Assumptions>).forEach((key) => {
    const v = override[key];
    if (typeof v === "number" && Number.isFinite(v)) merged[key] = v;
  });
  return merged;
}

export const ASSUMPTION_LABELS: Record<keyof Assumptions, string> = {
  inflationGeneral: "Inflation — general",
  inflationEducation: "Inflation — education",
  inflationHealthcare: "Inflation — healthcare",
  returnEquity: "Expected return — equity",
  returnDebt: "Expected return — debt",
  returnGold: "Expected return — gold",
  returnVolatility: "Equity volatility (σ)",
  lifeExpectancy: "Life expectancy (years)",
};

export const ASSUMPTION_FORMAT: Record<keyof Assumptions, "percent" | "years"> = {
  inflationGeneral: "percent",
  inflationEducation: "percent",
  inflationHealthcare: "percent",
  returnEquity: "percent",
  returnDebt: "percent",
  returnGold: "percent",
  returnVolatility: "percent",
  lifeExpectancy: "years",
};

export function formatAssumption(
  key: keyof Assumptions,
  value: number,
): string {
  if (ASSUMPTION_FORMAT[key] === "years") return `${value.toFixed(0)} years`;
  return `${(value * 100).toFixed(2)}%`;
}

export type AssumptionDraft = Omit<AssumptionOverride, "householdId" | "updatedAt">;
