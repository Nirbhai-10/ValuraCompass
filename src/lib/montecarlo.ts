/**
 * A small, browser-safe Monte Carlo retirement simulator.
 *
 * Each path simulates: yearly contributions while accumulating, then yearly
 * withdrawals during retirement, with annual returns drawn from a normal
 * distribution and expenses growing at the inflation rate.
 *
 * The function returns the success probability (paths that don't deplete),
 * percentile bands of corpus over time (p10 / p50 / p90), and a small set of
 * sample paths for visualisation.
 */

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
}

export interface MonteCarloResult {
  successProbability: number; // 0..1
  totalYears: number;
  finalP10: number;
  finalP50: number;
  finalP90: number;
  bands: { year: number; p10: number; p50: number; p90: number }[];
  samplePaths: number[][]; // a few paths for the chart
  yearOfFirstFailure?: number; // median year where path first hits 0 (across failed paths)
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
      // Apply return for the year on existing corpus
      corpus = corpus * (1 + r);

      if (year <= accumulationYears) {
        // Contribute (assume contribution grows with inflation so the real
        // savings rate stays constant)
        const inflatedContribution =
          annualContribution * Math.pow(1 + input.inflation, year - 1);
        corpus += inflatedContribution;
      } else {
        // Withdraw this year's expenses
        const yearsFromToday = year - 1; // inflate from "today"
        const annualExpense =
          annualExpenseToday * Math.pow(1 + input.inflation, yearsFromToday);
        corpus -= annualExpense;
        if (corpus < 0 && failedAt === null) {
          failedAt = year;
          corpus = 0;
        }
      }

      path[year] = Math.max(corpus, 0);
    }

    paths[sim] = path;
    if (failedAt === null) successes++;
    else failureYears.push(failedAt);
  }

  const successProbability = successes / numSimulations;

  // Percentile bands per year
  const yearSlices: number[][] = new Array(totalYears + 1);
  for (let year = 0; year <= totalYears; year++) {
    yearSlices[year] = paths
      .map((p) => p[year])
      .sort((a, b) => a - b);
  }
  const pickPercentile = (sorted: number[], p: number) =>
    sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];

  const bands = yearSlices.map((slice, year) => ({
    year,
    p10: pickPercentile(slice, 0.1),
    p50: pickPercentile(slice, 0.5),
    p90: pickPercentile(slice, 0.9),
  }));

  // Pick a handful of representative paths for the visualization (median +
  // a few spread around it)
  const indexBySorted = paths
    .map((p, i) => ({ i, end: p[totalYears] }))
    .sort((a, b) => a.end - b.end);
  const samplePaths: number[][] = [];
  const targets = [0.1, 0.3, 0.5, 0.7, 0.9];
  for (const t of targets) {
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

// Box-Muller transform: convert two uniform samples into one standard normal.
function sampleNormal(mean: number, stdDev: number): number {
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + stdDev * z;
}
