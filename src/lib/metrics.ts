import { Database, Goal } from "./types";
import {
  selectAssets,
  selectExpenses,
  selectGoals,
  selectIncomes,
  selectLiabilities,
  selectPolicies,
} from "./selectors";

/**
 * Derived numbers for a household. Pure functions over `Database`. Pages don't
 * compute their own totals — they ask metrics and trust the answer.
 */

export interface HouseholdMetrics {
  monthlyIncome: number;
  monthlyExpense: number;
  essentialExpense: number;
  monthlySurplus: number;
  surplusRate: number; // surplus as % of income, 0 when income is 0
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  totalCover: number;
  totalAnnualPremium: number;
  emergencyFundMonths: number; // liquid-ish assets / monthly essential expense
  liquidAssets: number;
  debtToAssets: number; // 0..1
}

const LIQUID_CLASSES = new Set(["Cash", "Debt / fixed income"]);

export function householdMetrics(
  db: Database,
  householdId: string,
): HouseholdMetrics {
  const incomes = selectIncomes(db, householdId);
  const expenses = selectExpenses(db, householdId);
  const assets = selectAssets(db, householdId);
  const liabilities = selectLiabilities(db, householdId);
  const policies = selectPolicies(db, householdId);

  const monthlyIncome = sum(incomes, (i) => i.amountMonthly);
  const monthlyExpense = sum(expenses, (e) => e.amountMonthly);
  const essentialExpense = sum(
    expenses.filter((e) => e.essential),
    (e) => e.amountMonthly,
  );
  const monthlySurplus = monthlyIncome - monthlyExpense;
  const surplusRate = monthlyIncome > 0 ? monthlySurplus / monthlyIncome : 0;
  const totalAssets = sum(assets, (a) => a.currentValue);
  const totalLiabilities = sum(liabilities, (l) => l.outstanding);
  const totalCover = sum(policies, (p) => p.sumAssured);
  const totalAnnualPremium = sum(policies, (p) => p.premiumAnnual ?? 0);
  const liquidAssets = sum(
    assets.filter((a) => LIQUID_CLASSES.has(a.assetClass)),
    (a) => a.currentValue,
  );
  const baseExpense = essentialExpense > 0 ? essentialExpense : monthlyExpense;
  const emergencyFundMonths = baseExpense > 0 ? liquidAssets / baseExpense : 0;
  const netWorth = totalAssets - totalLiabilities;
  const debtToAssets = totalAssets > 0 ? totalLiabilities / totalAssets : 0;

  return {
    monthlyIncome,
    monthlyExpense,
    essentialExpense,
    monthlySurplus,
    surplusRate,
    totalAssets,
    totalLiabilities,
    netWorth,
    totalCover,
    totalAnnualPremium,
    liquidAssets,
    emergencyFundMonths,
    debtToAssets,
  };
}

export interface Slice {
  key: string;
  label: string;
  value: number;
}

export function assetAllocation(db: Database, householdId: string): Slice[] {
  return bucketize(
    selectAssets(db, householdId),
    (a) => a.assetClass,
    (a) => a.currentValue,
  );
}

export function expenseBreakdown(db: Database, householdId: string): Slice[] {
  return bucketize(
    selectExpenses(db, householdId),
    (e) => e.category,
    (e) => e.amountMonthly,
  );
}

export function liabilityBreakdown(
  db: Database,
  householdId: string,
): Slice[] {
  return bucketize(
    selectLiabilities(db, householdId),
    (l) => l.type,
    (l) => l.outstanding,
  );
}

export function incomeBreakdown(db: Database, householdId: string): Slice[] {
  return bucketize(
    selectIncomes(db, householdId),
    (i) => i.type,
    (i) => i.amountMonthly,
  );
}

export interface GoalProgress {
  goal: Goal;
  funded: number;
  pct: number; // 0..1
  remaining: number;
  yearsAway: number;
}

export function goalProgress(
  db: Database,
  householdId: string,
  goalId: string,
  refYear = new Date().getFullYear(),
): GoalProgress | undefined {
  const goal = selectGoals(db, householdId).find((g) => g.id === goalId);
  if (!goal) return undefined;
  const assets = selectAssets(db, householdId);
  const linked = assets.filter((a) => goal.linkedAssetIds.includes(a.id));
  const funded = sum(linked, (a) => a.currentValue);
  const pct = goal.targetAmount > 0 ? Math.min(funded / goal.targetAmount, 1) : 0;
  const remaining = Math.max(goal.targetAmount - funded, 0);
  const yearsAway = goal.targetYear - refYear;
  return { goal, funded, pct, remaining, yearsAway };
}

export function allGoalProgress(
  db: Database,
  householdId: string,
): GoalProgress[] {
  return selectGoals(db, householdId)
    .map((g) => goalProgress(db, householdId, g.id))
    .filter((x): x is GoalProgress => Boolean(x));
}

// ---------------------------------------------------------------------------

function sum<T>(items: T[], get: (x: T) => number): number {
  return items.reduce((s, x) => s + (Number.isFinite(get(x)) ? get(x) : 0), 0);
}

function bucketize<T>(
  items: T[],
  keyFn: (x: T) => string,
  valueFn: (x: T) => number,
): Slice[] {
  const map = new Map<string, number>();
  items.forEach((item) => {
    const key = keyFn(item);
    map.set(key, (map.get(key) ?? 0) + valueFn(item));
  });
  return Array.from(map.entries())
    .map(([key, value]) => ({ key, label: key, value }))
    .sort((a, b) => b.value - a.value);
}
