/**
 * A small, browser-safe Monte Carlo retirement simulator.
 *
 * Each path simulates accumulation (with inflation-growing contributions),
 * then withdrawal of inflation-adjusted expenses through retirement, with
 * annual returns drawn from a normal distribution. Optional one-time shocks
 * (medical, inheritance) and income gaps (job loss, sabbatical) layer on top.
 *
 * The simulation returns: success probability (paths that don't deplete),
 * percentile bands of corpus over time (p10 / p50 / p90), and a few sample
 * paths for visualization.
 */

export interface OneTimeShock {
  /** Year index from today (0 = year 1 of accumulation) */
  yearOffset: number;
  /** Positive = withdrawal, Negative = inflow. In today's terms; inflated to event year. */
  amountToday: number;
  /** Optional label for UI */
  label?: string;
}

export interface IncomeGap {
  /** First year (offset from today) where contribution is paused */
  startYearOffset: number;
  /** Duration in years (whole-year resolution) */
  years: number;
}

export interface MonteCarloInputs {
  currentCorpus: number;
  monthlyContribution: number;
  yearsToRetirement: number;
  yearsInRetirement: number;
  monthlyExpensesAtRetirementToday: number;
  expectedReturn: number; // mean, e.g. 0.10
  returnVolatility: number; // std dev, e.g. 0.16
  inflation: number; // e.g. 0.06
  numSimulations?: number;
  shocks?: OneTimeShock[];
  incomeGaps?: IncomeGap[];
}

export interface MonteCarloResult {
  successProbability: number; // 0..1
  totalYears: number;
  finalP10: number;
  finalP50: number;
  finalP90: number;
  bands: { year: number; p10: number; p50: number; p90: number }[];
  samplePaths: number[][];
  yearOfFirstFailure?: number;
}

export function runRetirementMonteCarlo(
  input: MonteCarloInputs,
): MonteCarloResult {
  const numSimulations = input.numSimulations ?? 800;
  const totalYears = Math.max(
    1,
    Math.round(input.yearsToRetirement + input.yearsInRetirement),
  );

  const annualContribution = input.monthlyContribution * 12;
  const annualExpenseToday = input.monthlyExpensesAtRetirementToday * 12;
  const accumulationYears = Math.max(0, Math.round(input.yearsToRetirement));

  // Pre-compute "is contribution paused" per year (income gaps)
  const contributionPaused = new Array<boolean>(totalYears + 1).fill(false);
  (input.incomeGaps ?? []).forEach((gap) => {
    for (let y = 0; y < gap.years; y++) {
      const yr = gap.startYearOffset + y;
      if (yr >= 0 && yr <= totalYears) contributionPaused[yr] = true;
    }
  });

  // Pre-bucket shocks by year for fast lookup
  const shocksByYear = new Map<number, OneTimeShock[]>();
  (input.shocks ?? []).forEach((s) => {
    const yr = Math.round(s.yearOffset);
    if (!shocksByYear.has(yr)) shocksByYear.set(yr, []);
    shocksByYear.get(yr)!.push(s);
  });

  const paths: number[][] = new Array(numSimulations);
  let successes = 0;
  const failureYears: number[] = [];

  for (let sim = 0; sim < numSimulations; sim++) {
    const path = new Array<number>(totalYears + 1);
    let corpus = input.currentCorpus;
    path[0] = corpus;
    let failedAt: number | null = null;

    for (let year = 1; year <= totalYears; year++) {
      const r = sampleNormal(input.expectedReturn, input.returnVolatility);
      corpus = corpus * (1 + r);

      if (year <= accumulationYears) {
        if (!contributionPaused[year - 1]) {
          const inflatedContribution =
            annualContribution * Math.pow(1 + input.inflation, year - 1);
          corpus += inflatedContribution;
        }
      } else {
        const yearsFromToday = year - 1;
        const annualExpense =
          annualExpenseToday * Math.pow(1 + input.inflation, yearsFromToday);
        corpus -= annualExpense;
      }

      // Apply one-time shocks scheduled for this year
      const shocksThisYear = shocksByYear.get(year - 1);
      if (shocksThisYear) {
        for (const shock of shocksThisYear) {
          const inflated =
            shock.amountToday *
            Math.pow(1 + input.inflation, Math.max(0, year - 1));
          corpus -= inflated;
        }
      }

      if (corpus < 0 && failedAt === null) {
        failedAt = year;
        corpus = 0;
      }

      path[year] = Math.max(corpus, 0);
    }

    paths[sim] = path;
    if (failedAt === null) successes++;
    else failureYears.push(failedAt);
  }

  const successProbability = successes / numSimulations;

  const yearSlices: number[][] = new Array(totalYears + 1);
  for (let year = 0; year <= totalYears; year++) {
    yearSlices[year] = paths.map((p) => p[year]).sort((a, b) => a - b);
  }
  const pickPercentile = (sorted: number[], p: number) =>
    sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];

  const bands = yearSlices.map((slice, year) => ({
    year,
    p10: pickPercentile(slice, 0.1),
    p50: pickPercentile(slice, 0.5),
    p90: pickPercentile(slice, 0.9),
  }));

  const indexBySorted = paths
    .map((p, i) => ({ i, end: p[totalYears] }))
    .sort((a, b) => a.end - b.end);
  const samplePaths: number[][] = [];
  for (const t of [0.1, 0.3, 0.5, 0.7, 0.9]) {
    const idx = indexBySorted[Math.floor(t * indexBySorted.length)]?.i;
    if (typeof idx === "number") samplePaths.push(paths[idx]);
  }

  return {
    successProbability,
    totalYears,
    finalP10: bands[totalYears].p10,
    finalP50: bands[totalYears].p50,
    finalP90: bands[totalYears].p90,
    bands,
    samplePaths,
    yearOfFirstFailure:
      failureYears.length > 0
        ? failureYears.sort((a, b) => a - b)[Math.floor(failureYears.length / 2)]
        : undefined,
  };
}

function sampleNormal(mean: number, stdDev: number): number {
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + stdDev * z;
}
