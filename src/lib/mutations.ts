import { Mutator, nowISO, uid } from "./store";
import {
  Asset,
  AssumptionOverride,
  EstateProfile,
  Expense,
  Goal,
  Household,
  Income,
  Liability,
  Person,
  Policy,
  RiskProfile,
  Task,
  TaxProfile,
} from "./types";

/**
 * All write paths in the app go through this module. Each function returns a
 * `Mutator` (a `(Database) => Database` function). Pages compose them with
 * `useUpdate()`:
 *
 *     const update = useUpdate();
 *     update(addAsset(householdId, draft));
 *
 * Cascade rules (e.g. "deleting a household removes its persons") live here in
 * one place rather than being copy-pasted across pages.
 */

// ----- Households ----------------------------------------------------------

export type HouseholdDraft = Pick<
  Household,
  "name" | "region" | "currency" | "structure" | "mode"
>;

export function addHousehold(
  draft: HouseholdDraft,
  primaryPersonName: string,
): { mutator: Mutator; householdId: string; primaryPersonId: string } {
  const householdId = uid("hh");
  const primaryPersonId = uid("p");
  const ts = nowISO();
  const mutator: Mutator = (db) => ({
    ...db,
    households: [
      ...db.households,
      { id: householdId, ...draft, createdAt: ts, updatedAt: ts },
    ],
    persons: [
      ...db.persons,
      {
        id: primaryPersonId,
        householdId,
        fullName: primaryPersonName,
        relation: "Self",
        isPrimary: true,
      },
    ],
  });
  return { mutator, householdId, primaryPersonId };
}

export function updateHousehold(id: string, patch: Partial<HouseholdDraft>): Mutator {
  return (db) => ({
    ...db,
    households: db.households.map((h) =>
      h.id === id ? { ...h, ...patch, updatedAt: nowISO() } : h,
    ),
  });
}

export function removeHousehold(id: string): Mutator {
  return (db) => ({
    ...db,
    households: db.households.filter((h) => h.id !== id),
    persons: db.persons.filter((p) => p.householdId !== id),
    incomes: db.incomes.filter((i) => i.householdId !== id),
    expenses: db.expenses.filter((e) => e.householdId !== id),
    assets: db.assets.filter((a) => a.householdId !== id),
    liabilities: db.liabilities.filter((l) => l.householdId !== id),
    policies: db.policies.filter((p) => p.householdId !== id),
    goals: db.goals.filter((g) => g.householdId !== id),
    riskProfiles: db.riskProfiles.filter((r) => r.householdId !== id),
    taxProfiles: db.taxProfiles.filter((t) => t.householdId !== id),
    estateProfiles: db.estateProfiles.filter((e) => e.householdId !== id),
    assumptions: db.assumptions.filter((a) => a.householdId !== id),
    tasks: db.tasks.filter((t) => t.householdId !== id),
  });
}

// ----- Persons -------------------------------------------------------------

// `isPrimary` is a managed flag (set on household creation, never edited
// through the form), so we strip it from the editable Draft.
export type PersonDraft = Omit<Person, "id" | "householdId" | "isPrimary">;

export function addPerson(householdId: string, draft: PersonDraft): Mutator {
  return (db) => ({
    ...db,
    persons: [
      ...db.persons,
      { id: uid("p"), householdId, isPrimary: false, ...draft },
    ],
  });
}

export function updatePerson(id: string, patch: Partial<PersonDraft>): Mutator {
  return (db) => ({
    ...db,
    persons: db.persons.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  });
}

export function removePerson(id: string): Mutator {
  return (db) => ({
    ...db,
    persons: db.persons.filter((p) => p.id !== id),
    incomes: db.incomes.map((i) =>
      i.personId === id ? { ...i, personId: undefined } : i,
    ),
  });
}

// ----- Incomes -------------------------------------------------------------

export type IncomeDraft = Omit<Income, "id" | "householdId">;

export function addIncome(householdId: string, draft: IncomeDraft): Mutator {
  return (db) => ({
    ...db,
    incomes: [...db.incomes, { id: uid("inc"), householdId, ...draft }],
  });
}

export function updateIncome(id: string, patch: Partial<IncomeDraft>): Mutator {
  return (db) => ({
    ...db,
    incomes: db.incomes.map((i) => (i.id === id ? { ...i, ...patch } : i)),
  });
}

export function removeIncome(id: string): Mutator {
  return (db) => ({
    ...db,
    incomes: db.incomes.filter((i) => i.id !== id),
  });
}

// ----- Expenses ------------------------------------------------------------

export type ExpenseDraft = Omit<Expense, "id" | "householdId">;

export function addExpense(householdId: string, draft: ExpenseDraft): Mutator {
  return (db) => ({
    ...db,
    expenses: [...db.expenses, { id: uid("exp"), householdId, ...draft }],
  });
}

export function updateExpense(id: string, patch: Partial<ExpenseDraft>): Mutator {
  return (db) => ({
    ...db,
    expenses: db.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
  });
}

export function removeExpense(id: string): Mutator {
  return (db) => ({
    ...db,
    expenses: db.expenses.filter((e) => e.id !== id),
  });
}

// ----- Assets --------------------------------------------------------------

export type AssetDraft = Omit<Asset, "id" | "householdId">;

export function addAsset(householdId: string, draft: AssetDraft): Mutator {
  return (db) => ({
    ...db,
    assets: [...db.assets, { id: uid("ast"), householdId, ...draft }],
  });
}

export function updateAsset(id: string, patch: Partial<AssetDraft>): Mutator {
  return (db) => ({
    ...db,
    assets: db.assets.map((a) => (a.id === id ? { ...a, ...patch } : a)),
  });
}

export function removeAsset(id: string): Mutator {
  return (db) => ({
    ...db,
    assets: db.assets.filter((a) => a.id !== id),
    goals: db.goals.map((g) =>
      g.linkedAssetIds.includes(id)
        ? { ...g, linkedAssetIds: g.linkedAssetIds.filter((x) => x !== id) }
        : g,
    ),
  });
}

// ----- Liabilities ---------------------------------------------------------

export type LiabilityDraft = Omit<Liability, "id" | "householdId">;

export function addLiability(
  householdId: string,
  draft: LiabilityDraft,
): Mutator {
  return (db) => ({
    ...db,
    liabilities: [
      ...db.liabilities,
      { id: uid("lia"), householdId, ...draft },
    ],
  });
}

export function updateLiability(
  id: string,
  patch: Partial<LiabilityDraft>,
): Mutator {
  return (db) => ({
    ...db,
    liabilities: db.liabilities.map((l) =>
      l.id === id ? { ...l, ...patch } : l,
    ),
  });
}

export function removeLiability(id: string): Mutator {
  return (db) => ({
    ...db,
    liabilities: db.liabilities.filter((l) => l.id !== id),
  });
}

// ----- Policies ------------------------------------------------------------

export type PolicyDraft = Omit<Policy, "id" | "householdId">;

export function addPolicy(householdId: string, draft: PolicyDraft): Mutator {
  return (db) => ({
    ...db,
    policies: [...db.policies, { id: uid("pol"), householdId, ...draft }],
  });
}

export function updatePolicy(id: string, patch: Partial<PolicyDraft>): Mutator {
  return (db) => ({
    ...db,
    policies: db.policies.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  });
}

export function removePolicy(id: string): Mutator {
  return (db) => ({
    ...db,
    policies: db.policies.filter((p) => p.id !== id),
  });
}

// ----- Goals ---------------------------------------------------------------

export type GoalDraft = Omit<Goal, "id" | "householdId">;

export function addGoal(householdId: string, draft: GoalDraft): Mutator {
  return (db) => ({
    ...db,
    goals: [...db.goals, { id: uid("goal"), householdId, ...draft }],
  });
}

export function updateGoal(id: string, patch: Partial<GoalDraft>): Mutator {
  return (db) => ({
    ...db,
    goals: db.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
  });
}

export function removeGoal(id: string): Mutator {
  return (db) => ({
    ...db,
    goals: db.goals.filter((g) => g.id !== id),
  });
}

// ----- Risk profile (one per household) -----------------------------------

export type RiskProfileDraft = Omit<RiskProfile, "householdId" | "updatedAt">;

export function upsertRiskProfile(
  householdId: string,
  draft: RiskProfileDraft,
): Mutator {
  return (db) => {
    const ts = nowISO();
    const exists = db.riskProfiles.some((r) => r.householdId === householdId);
    return {
      ...db,
      riskProfiles: exists
        ? db.riskProfiles.map((r) =>
            r.householdId === householdId
              ? { ...r, ...draft, updatedAt: ts }
              : r,
          )
        : [...db.riskProfiles, { householdId, ...draft, updatedAt: ts }],
    };
  };
}

// ----- Tax profile (one per household) -------------------------------------

export type TaxProfileDraft = Omit<TaxProfile, "householdId" | "updatedAt">;

export function upsertTaxProfile(
  householdId: string,
  draft: TaxProfileDraft,
): Mutator {
  return (db) => {
    const ts = nowISO();
    const exists = db.taxProfiles.some((t) => t.householdId === householdId);
    return {
      ...db,
      taxProfiles: exists
        ? db.taxProfiles.map((t) =>
            t.householdId === householdId
              ? { ...t, ...draft, updatedAt: ts }
              : t,
          )
        : [...db.taxProfiles, { householdId, ...draft, updatedAt: ts }],
    };
  };
}

// ----- Estate profile (one per household) ----------------------------------

export type EstateProfileDraft = Omit<EstateProfile, "householdId" | "updatedAt">;

export function upsertEstateProfile(
  householdId: string,
  draft: EstateProfileDraft,
): Mutator {
  return (db) => {
    const ts = nowISO();
    const exists = db.estateProfiles.some((e) => e.householdId === householdId);
    return {
      ...db,
      estateProfiles: exists
        ? db.estateProfiles.map((e) =>
            e.householdId === householdId
              ? { ...e, ...draft, updatedAt: ts }
              : e,
          )
        : [...db.estateProfiles, { householdId, ...draft, updatedAt: ts }],
    };
  };
}

// ----- Assumption overrides (one per household) ---------------------------

export type AssumptionOverrideDraft = Omit<
  AssumptionOverride,
  "householdId" | "updatedAt"
>;

export function upsertAssumptionOverride(
  householdId: string,
  draft: AssumptionOverrideDraft,
): Mutator {
  return (db) => {
    const ts = nowISO();
    const exists = db.assumptions.some((a) => a.householdId === householdId);
    return {
      ...db,
      assumptions: exists
        ? db.assumptions.map((a) =>
            a.householdId === householdId
              ? { ...a, ...draft, updatedAt: ts }
              : a,
          )
        : [...db.assumptions, { householdId, ...draft, updatedAt: ts }],
    };
  };
}

export function clearAssumptionOverride(householdId: string): Mutator {
  return (db) => ({
    ...db,
    assumptions: db.assumptions.filter((a) => a.householdId !== householdId),
  });
}

// ----- Tasks ---------------------------------------------------------------

export type TaskDraft = Omit<Task, "id" | "householdId" | "createdAt" | "updatedAt">;

export function addTask(householdId: string, draft: TaskDraft): Mutator {
  return (db) => {
    const ts = nowISO();
    return {
      ...db,
      tasks: [
        ...db.tasks,
        {
          id: uid("task"),
          householdId,
          ...draft,
          createdAt: ts,
          updatedAt: ts,
        },
      ],
    };
  };
}

export function updateTask(id: string, patch: Partial<TaskDraft>): Mutator {
  return (db) => {
    const ts = nowISO();
    return {
      ...db,
      tasks: db.tasks.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: ts } : t,
      ),
    };
  };
}

export function removeTask(id: string): Mutator {
  return (db) => ({
    ...db,
    tasks: db.tasks.filter((t) => t.id !== id),
  });
}

// ----- Compose helper ------------------------------------------------------

export function compose(...mutators: Mutator[]): Mutator {
  return (db) => mutators.reduce((acc, m) => m(acc), db);
}

export { migrate } from "./migrations";
