import { parseAmount } from "./format";
import {
  AssetDraft,
  ExpenseDraft,
  GoalDraft,
  HouseholdDraft,
  IncomeDraft,
  LiabilityDraft,
  PersonDraft,
  PolicyDraft,
} from "./mutations";
import { HouseholdMode, HouseholdStructure, Region } from "./types";

export type Validation<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const num = (fd: FormData, key: string) => parseAmount(String(fd.get(key) ?? ""));
const bool = (fd: FormData, key: string) => fd.get(key) === "on";
const opt = (s: string) => (s === "" ? undefined : s);

export function parseHousehold(
  fd: FormData,
): Validation<{ household: HouseholdDraft; primaryName: string }> {
  const name = str(fd, "name");
  const primaryName = str(fd, "primaryName");
  const region = str(fd, "region") as Region;
  const currency = str(fd, "currency");
  const structure = str(fd, "structure") as HouseholdStructure;
  const mode = (str(fd, "mode") || "BASIC") as HouseholdMode;

  if (name.length < 2) return fail("Please enter a household name.");
  if (primaryName.length < 1) return fail("Please enter the primary person's name.");
  if (!currency) return fail("Pick a currency.");
  return {
    ok: true,
    value: {
      household: { name, region, currency, structure, mode },
      primaryName,
    },
  };
}

export function parsePerson(fd: FormData): Validation<PersonDraft> {
  const fullName = str(fd, "fullName");
  if (fullName.length < 1) return fail("Please enter a name.");
  return {
    ok: true,
    value: {
      fullName,
      relation: str(fd, "relation") || "Other",
      dob: opt(str(fd, "dob")),
      notes: opt(str(fd, "notes")),
    },
  };
}

export function parseIncome(fd: FormData): Validation<IncomeDraft> {
  const label = str(fd, "label");
  const amount = num(fd, "amount");
  if (label.length < 1) return fail("Add a label so you can recognise it later.");
  if (amount <= 0) return fail("Enter an amount greater than 0.");
  return {
    ok: true,
    value: {
      label,
      type: str(fd, "type") || "Salary",
      amountMonthly: amount,
      personId: opt(str(fd, "personId")),
      notes: opt(str(fd, "notes")),
    },
  };
}

export function parseExpense(fd: FormData): Validation<ExpenseDraft> {
  const amount = num(fd, "amount");
  if (amount <= 0) return fail("Enter an amount greater than 0.");
  return {
    ok: true,
    value: {
      category: str(fd, "category") || "Other",
      label: opt(str(fd, "label")),
      amountMonthly: amount,
      essential: bool(fd, "essential"),
      notes: opt(str(fd, "notes")),
    },
  };
}

export function parseAsset(fd: FormData): Validation<AssetDraft> {
  const label = str(fd, "label");
  const value = num(fd, "value");
  if (label.length < 1) return fail("Add a label so you can recognise it later.");
  if (value <= 0) return fail("Enter a current value greater than 0.");
  return {
    ok: true,
    value: {
      label,
      assetClass: str(fd, "assetClass") || "Cash",
      currentValue: value,
      notes: opt(str(fd, "notes")),
    },
  };
}

export function parseLiability(fd: FormData): Validation<LiabilityDraft> {
  const label = str(fd, "label");
  const outstanding = num(fd, "outstanding");
  if (label.length < 1) return fail("Add a label so you can recognise it later.");
  if (outstanding <= 0) return fail("Enter an outstanding amount greater than 0.");
  const emi = num(fd, "emi");
  const rate = num(fd, "rate");
  return {
    ok: true,
    value: {
      label,
      type: str(fd, "type") || "Other",
      outstanding,
      emiMonthly: emi > 0 ? emi : undefined,
      interestRate: rate > 0 ? rate : undefined,
      notes: opt(str(fd, "notes")),
    },
  };
}

export function parsePolicy(fd: FormData): Validation<PolicyDraft> {
  const label = str(fd, "label");
  const sumAssured = num(fd, "sumAssured");
  if (label.length < 1) return fail("Add a label so you can recognise it later.");
  if (sumAssured <= 0) return fail("Enter a sum-assured greater than 0.");
  const premium = num(fd, "premium");
  return {
    ok: true,
    value: {
      label,
      type: str(fd, "type") || "Term life",
      insurer: opt(str(fd, "insurer")),
      sumAssured,
      premiumAnnual: premium > 0 ? premium : undefined,
      notes: opt(str(fd, "notes")),
    },
  };
}

export function parseGoal(fd: FormData): Validation<GoalDraft> {
  const label = str(fd, "label");
  const targetAmount = num(fd, "targetAmount");
  const currentYear = new Date().getFullYear();
  const targetYear = Number(str(fd, "targetYear")) || currentYear + 5;
  const priority = Number(str(fd, "priority")) || 3;
  const linkedAssetIds = fd.getAll("linkedAssetIds").map(String).filter(Boolean);
  if (label.length < 1) return fail("Give the goal a name.");
  if (targetAmount <= 0) return fail("Enter a target greater than 0.");
  return {
    ok: true,
    value: {
      label,
      type: str(fd, "type") || "Other",
      targetAmount,
      targetYear,
      priority,
      linkedAssetIds,
      notes: opt(str(fd, "notes")),
    },
  };
}

function fail<T>(error: string): Validation<T> {
  return { ok: false, error };
}
