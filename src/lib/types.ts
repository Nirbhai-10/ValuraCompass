export type Region = "IN" | "GCC" | "GLOBAL";

export type HouseholdStructure =
  | "SINGLE"
  | "DINK"
  | "NUCLEAR"
  | "NUCLEAR_WITH_PARENTS"
  | "JOINT"
  | "SINGLE_PARENT"
  | "MULTI_GEN"
  | "CROSS_BORDER";

export interface Household {
  id: string;
  name: string;
  region: Region;
  currency: string;
  structure: HouseholdStructure;
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id: string;
  householdId: string;
  fullName: string;
  relation: string;
  dob?: string;
  isPrimary: boolean;
  notes?: string;
}

export interface Income {
  id: string;
  householdId: string;
  personId?: string;
  label: string;
  type: string;
  amountMonthly: number;
  notes?: string;
}

export interface Expense {
  id: string;
  householdId: string;
  category: string;
  label?: string;
  amountMonthly: number;
  essential: boolean;
}

export interface Asset {
  id: string;
  householdId: string;
  label: string;
  assetClass: string;
  currentValue: number;
  notes?: string;
}

export interface Liability {
  id: string;
  householdId: string;
  label: string;
  type: string;
  outstanding: number;
  emiMonthly?: number;
  interestRate?: number;
  notes?: string;
}

export interface Policy {
  id: string;
  householdId: string;
  label: string;
  type: string;
  insurer?: string;
  sumAssured: number;
  premiumAnnual?: number;
  notes?: string;
}

export interface Goal {
  id: string;
  householdId: string;
  label: string;
  type: string;
  targetAmount: number;
  targetYear: number;
  priority: number;
  notes?: string;
}

export interface Database {
  households: Household[];
  persons: Person[];
  incomes: Income[];
  expenses: Expense[];
  assets: Asset[];
  liabilities: Liability[];
  policies: Policy[];
  goals: Goal[];
}

export const EMPTY_DB: Database = {
  households: [],
  persons: [],
  incomes: [],
  expenses: [],
  assets: [],
  liabilities: [],
  policies: [],
  goals: [],
};

export const PERSON_RELATIONS = [
  "Self",
  "Spouse",
  "Partner",
  "Child",
  "Parent",
  "Parent-in-law",
  "Sibling",
  "Other",
] as const;

export const INCOME_TYPES = [
  "Salary",
  "Business",
  "Consulting",
  "Rental",
  "Dividends",
  "Interest",
  "Pension",
  "Other",
] as const;

export const EXPENSE_CATEGORIES = [
  "Housing",
  "Utilities",
  "Groceries",
  "Transport",
  "Insurance",
  "Education",
  "Healthcare",
  "Entertainment",
  "Dining",
  "Travel",
  "Subscriptions",
  "Debt service",
  "Other",
] as const;

export const ASSET_CLASSES = [
  "Cash",
  "Equity",
  "Debt / fixed income",
  "Gold",
  "Real estate",
  "Retirement",
  "Business",
  "Other",
] as const;

export const LIABILITY_TYPES = [
  "Home loan",
  "Vehicle loan",
  "Personal loan",
  "Education loan",
  "Business loan",
  "Credit card",
  "Other",
] as const;

export const POLICY_TYPES = [
  "Term life",
  "Health (family)",
  "Health (individual)",
  "Critical illness",
  "Accident",
  "Disability",
  "Home",
  "Vehicle",
  "Other",
] as const;

export const GOAL_TYPES = [
  "Emergency fund",
  "Retirement",
  "Child education",
  "Child marriage",
  "Home purchase",
  "Vehicle",
  "Travel",
  "Healthcare reserve",
  "Debt freedom",
  "Other",
] as const;

export const STRUCTURE_LABELS: Record<HouseholdStructure, string> = {
  SINGLE: "Single",
  DINK: "Couple, no kids",
  NUCLEAR: "Nuclear (you + spouse + kids)",
  NUCLEAR_WITH_PARENTS: "Nuclear with parents",
  JOINT: "Joint family",
  SINGLE_PARENT: "Single parent",
  MULTI_GEN: "Multi-generational",
  CROSS_BORDER: "Cross-border",
};

export const REGION_LABELS: Record<Region, string> = {
  IN: "India",
  GCC: "GCC",
  GLOBAL: "Global",
};
