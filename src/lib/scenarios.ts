import { effectiveAssumptions } from "./assumptions";
import { householdMetrics } from "./metrics";
import { selectAssets, selectHousehold, selectPrimaryPerson } from "./selectors";
import { Database, Region } from "./types";
import { MonteCarloInputs } from "./montecarlo";

/**
 * Scenario library. Each scenario is a small, named transformation that the
 * user can layer on top of the household's "baseline" inputs to ask a
 * what-if. Scenarios stack with the same Monte Carlo engine, so success
 * probabilities are directly comparable.
 */

export type ScenarioCategory =
  | "Retirement timing"
  | "Stress test"
  | "Life event"
  | "Income"
  | "Assumption shock";

export interface ScenarioContext {
  baseInputs: MonteCarloInputs;
  primaryAge: number;
  /** Years from today until the primary person hits a given age. */
  yearsUntilAge: (age: number) => number;
}

export interface Scenario {
  id: string;
  name: string;
  category: ScenarioCategory;
  description: string;
  /** Build the inputs for this scenario from the household baseline. */
  build: (ctx: ScenarioContext) => MonteCarloInputs;
}

const RETIREMENT_CLASSES = new Set(["Equity", "Retirement", "Debt / fixed income"]);

export function buildBaseInputs(
  db: Database,
  householdId: string,
): { inputs: MonteCarloInputs; ctx: ScenarioContext } | null {
  const household = selectHousehold(db, householdId);
  if (!household) return null;
  const assumptions = effectiveAssumptions(db, householdId);
  const metrics = householdMetrics(db, householdId);
  const primary = selectPrimaryPerson(db, householdId);
  const corpus = selectAssets(db, householdId)
    .filter((a) => RETIREMENT_CLASSES.has(a.assetClass))
    .reduce((s, a) => s + a.currentValue, 0);

  const today = new Date();
  const primaryAge = primary?.dob
    ? Math.max(20, today.getFullYear() - new Date(primary.dob).getFullYear())
    : 35;
  const yearsToRetirement = Math.max(1, 60 - primaryAge);

  const baseInputs: MonteCarloInputs = {
    currentCorpus: corpus,
    monthlyContribution: Math.max(0, metrics.monthlySurplus),
    yearsToRetirement,
    yearsInRetirement: Math.max(15, assumptions.lifeExpectancy - 60),
    monthlyExpensesAtRetirementToday: Math.max(metrics.essentialExpense, 50000),
    expectedReturn: assumptions.returnEquity * 0.7 + assumptions.returnDebt * 0.3,
    returnVolatility: assumptions.returnVolatility * 0.7,
    inflation: assumptions.inflationGeneral,
    numSimulations: 800,
  };

  const ctx: ScenarioContext = {
    baseInputs,
    primaryAge,
    yearsUntilAge: (age) => Math.max(0, age - primaryAge),
  };

  return { inputs: baseInputs, ctx };
}

const SCENARIOS: Scenario[] = [
  {
    id: "baseline",
    name: "Baseline",
    category: "Retirement timing",
    description: "Plan as configured today.",
    build: ({ baseInputs }) => ({ ...baseInputs }),
  },
  {
    id: "retire_55",
    name: "Retire at 55",
    category: "Retirement timing",
    description: "Stop earning at 55. Retirement funds need to last longer.",
    build: ({ baseInputs, primaryAge }) => ({
      ...baseInputs,
      yearsToRetirement: Math.max(1, 55 - primaryAge),
      yearsInRetirement: baseInputs.yearsInRetirement + 5,
    }),
  },
  {
    id: "retire_60",
    name: "Retire at 60",
    category: "Retirement timing",
    description: "Conventional retirement age.",
    build: ({ baseInputs, primaryAge }) => ({
      ...baseInputs,
      yearsToRetirement: Math.max(1, 60 - primaryAge),
    }),
  },
  {
    id: "retire_65",
    name: "Retire at 65",
    category: "Retirement timing",
    description: "Five extra years of compounding and contributions.",
    build: ({ baseInputs, primaryAge }) => ({
      ...baseInputs,
      yearsToRetirement: Math.max(1, 65 - primaryAge),
      yearsInRetirement: Math.max(10, baseInputs.yearsInRetirement - 5),
    }),
  },
  {
    id: "fire_50",
    name: "FIRE at 50 (lean expenses)",
    category: "Retirement timing",
    description:
      "Retire at 50 with expenses cut to 70% of today's essentials. Long retirement horizon.",
    build: ({ baseInputs, primaryAge }) => ({
      ...baseInputs,
      yearsToRetirement: Math.max(1, 50 - primaryAge),
      yearsInRetirement: baseInputs.yearsInRetirement + 10,
      monthlyExpensesAtRetirementToday:
        baseInputs.monthlyExpensesAtRetirementToday * 0.7,
    }),
  },
  {
    id: "perpetual_4pct",
    name: "Perpetual income (4% rule)",
    category: "Retirement timing",
    description:
      "Withdraw only 4% of corpus annually instead of full expenses — corpus aims to last forever.",
    build: ({ baseInputs }) => ({
      ...baseInputs,
      monthlyExpensesAtRetirementToday:
        baseInputs.monthlyExpensesAtRetirementToday * 0.85,
      yearsInRetirement: baseInputs.yearsInRetirement + 15,
    }),
  },
  {
    id: "stress_inflation",
    name: "Inflation +2pp persistent",
    category: "Stress test",
    description: "Inflation runs 2 points hotter than the assumption for the entire horizon.",
    build: ({ baseInputs }) => ({
      ...baseInputs,
      inflation: baseInputs.inflation + 0.02,
    }),
  },
  {
    id: "stress_returns",
    name: "Lower equity returns (-2pp)",
    category: "Assumption shock",
    description: "Future returns disappoint by 2 points relative to history.",
    build: ({ baseInputs }) => ({
      ...baseInputs,
      expectedReturn: baseInputs.expectedReturn - 0.02,
    }),
  },
  {
    id: "stress_volatility",
    name: "Higher volatility (+5pp)",
    category: "Assumption shock",
    description: "Sequence-of-returns risk: same average, wider swings.",
    build: ({ baseInputs }) => ({
      ...baseInputs,
      returnVolatility: baseInputs.returnVolatility + 0.05,
    }),
  },
  {
    id: "longer_life_95",
    name: "Plan to age 95",
    category: "Life event",
    description: "Longevity risk: budget for an extra decade in retirement.",
    build: ({ baseInputs, primaryAge }) => ({
      ...baseInputs,
      yearsInRetirement: Math.max(
        baseInputs.yearsInRetirement,
        95 - Math.max(60, primaryAge + baseInputs.yearsToRetirement),
      ),
    }),
  },
  {
    id: "job_loss_12m",
    name: "Job loss for 12 months",
    category: "Income",
    description:
      "12 months without contributions in year 1 of accumulation. Models a career break.",
    build: ({ baseInputs }) => ({
      ...baseInputs,
      incomeGaps: [{ startYearOffset: 0, years: 1 }],
    }),
  },
  {
    id: "job_loss_24m",
    name: "Job loss for 24 months",
    category: "Income",
    description:
      "Two-year income gap starting in year 1. Compounding effect on accumulation.",
    build: ({ baseInputs }) => ({
      ...baseInputs,
      incomeGaps: [{ startYearOffset: 0, years: 2 }],
    }),
  },
  {
    id: "medical_shock_25l",
    name: "Medical emergency at 50 (₹25L)",
    category: "Life event",
    description:
      "One-time withdrawal of 25 lakh in today's terms when the primary turns 50.",
    build: ({ baseInputs, yearsUntilAge }) => ({
      ...baseInputs,
      shocks: [
        {
          yearOffset: yearsUntilAge(50),
          amountToday: 2500000,
          label: "Medical event",
        },
      ],
    }),
  },
  {
    id: "shock_at_30",
    name: "Emergency at age 30 (₹10L)",
    category: "Life event",
    description:
      "An unexpected ₹10 lakh expense if it lands now (or at the next year if already past 30).",
    build: ({ baseInputs, yearsUntilAge }) => ({
      ...baseInputs,
      shocks: [
        {
          yearOffset: Math.max(0, yearsUntilAge(30)),
          amountToday: 1000000,
          label: "Emergency",
        },
      ],
    }),
  },
  {
    id: "inheritance_55",
    name: "Inheritance at 55 (₹50L)",
    category: "Life event",
    description: "A one-time inflow of 50 lakh when the primary turns 55.",
    build: ({ baseInputs, yearsUntilAge }) => ({
      ...baseInputs,
      shocks: [
        {
          yearOffset: yearsUntilAge(55),
          amountToday: -5000000,
          label: "Inheritance",
        },
      ],
    }),
  },
];

const SCENARIO_INDEX = new Map(SCENARIOS.map((s) => [s.id, s]));

export function listScenarios(): Scenario[] {
  return SCENARIOS;
}

export function findScenario(id: string): Scenario | undefined {
  return SCENARIO_INDEX.get(id);
}

export function defaultScenarioIdsForRegion(_region: Region): string[] {
  return [
    "baseline",
    "retire_60",
    "retire_65",
    "stress_inflation",
    "stress_returns",
    "job_loss_12m",
    "medical_shock_25l",
  ];
}
