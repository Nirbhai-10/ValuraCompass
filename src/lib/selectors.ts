import {
  Asset,
  Database,
  Expense,
  Goal,
  Household,
  Income,
  Liability,
  Person,
  Policy,
} from "./types";

/**
 * Pure read accessors over a `Database`. Every page reads through these so the
 * shape of storage stays an implementation detail of the lib layer.
 */

export function selectHouseholds(db: Database): Household[] {
  return [...db.households].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
}

export function selectHousehold(db: Database, id: string): Household | undefined {
  return db.households.find((h) => h.id === id);
}

export function selectPersons(db: Database, householdId: string): Person[] {
  return db.persons.filter((p) => p.householdId === householdId);
}

export function selectPrimaryPerson(
  db: Database,
  householdId: string,
): Person | undefined {
  return db.persons.find((p) => p.householdId === householdId && p.isPrimary);
}

export function selectIncomes(db: Database, householdId: string): Income[] {
  return db.incomes.filter((i) => i.householdId === householdId);
}

export function selectExpenses(db: Database, householdId: string): Expense[] {
  return db.expenses.filter((e) => e.householdId === householdId);
}

export function selectAssets(db: Database, householdId: string): Asset[] {
  return db.assets.filter((a) => a.householdId === householdId);
}

export function selectLiabilities(
  db: Database,
  householdId: string,
): Liability[] {
  return db.liabilities.filter((l) => l.householdId === householdId);
}

export function selectPolicies(db: Database, householdId: string): Policy[] {
  return db.policies.filter((p) => p.householdId === householdId);
}

export function selectGoals(db: Database, householdId: string): Goal[] {
  return db.goals.filter((g) => g.householdId === householdId);
}

export interface HouseholdSnapshot {
  household: Household;
  persons: Person[];
  incomes: Income[];
  expenses: Expense[];
  assets: Asset[];
  liabilities: Liability[];
  policies: Policy[];
  goals: Goal[];
}

export function selectHouseholdSnapshot(
  db: Database,
  householdId: string,
): HouseholdSnapshot | undefined {
  const household = selectHousehold(db, householdId);
  if (!household) return undefined;
  return {
    household,
    persons: selectPersons(db, householdId),
    incomes: selectIncomes(db, householdId),
    expenses: selectExpenses(db, householdId),
    assets: selectAssets(db, householdId),
    liabilities: selectLiabilities(db, householdId),
    policies: selectPolicies(db, householdId),
    goals: selectGoals(db, householdId),
  };
}

export function isHouseholdEmpty(db: Database, householdId: string): boolean {
  const snap = selectHouseholdSnapshot(db, householdId);
  if (!snap) return true;
  return (
    snap.persons.length === 0 &&
    snap.incomes.length === 0 &&
    snap.expenses.length === 0 &&
    snap.assets.length === 0 &&
    snap.liabilities.length === 0 &&
    snap.policies.length === 0 &&
    snap.goals.length === 0
  );
}
