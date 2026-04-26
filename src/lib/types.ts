export type Region = "IN" | "GCC" | "GLOBAL";

export type HouseholdMode = "BASIC" | "ADVANCED";

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
  mode: HouseholdMode;
  /** Scenario IDs the user has pinned for this household (used by /scenarios + /print). */
  scenarioIds: string[];
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
  notes?: string;
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
  linkedAssetIds: string[];
  notes?: string;
}

// ----- Advanced-mode profiles ---------------------------------------------

export type RiskBand =
  | "CONSERVATIVE"
  | "MOD_CONSERVATIVE"
  | "BALANCED"
  | "GROWTH"
  | "AGGRESSIVE";

export interface RiskProfile {
  householdId: string;
  rps: number; // 0..100
  band: RiskBand;
  answers: Record<string, number>; // questionId → score 0..4
  updatedAt: string;
}

export type TaxRegime = "OLD" | "NEW" | "NA";

export interface TaxInputs {
  salary: number;
  businessIncome: number;
  housePropertyIncome: number;
  otherIncome: number;
  isSalaried: boolean;
  hraExempt: number;
  ltaExempt: number;
  professionalTax: number;
  d80C: number;
  d80CCD1B: number;
  d80D: number;
  d24bHomeLoan: number;
  d80E: number;
  d80G: number;
  d80TTA: number;
  employerNPS80CCD2: number;
}

export interface TaxProfile {
  householdId: string;
  regime: TaxRegime;
  inputs?: TaxInputs;
  notes?: string;
  updatedAt: string;
}

export type WillStatus = "NONE" | "DRAFT" | "REGISTERED" | "OUTDATED";

export interface EstateProfile {
  householdId: string;
  willStatus: WillStatus;
  poaStatus?: WillStatus;
  guardianshipNotes?: string;
  legacyIntent?: string;
  updatedAt: string;
}

/**
 * Per-household assumption overrides. Defaults live in `lib/assumptions.ts`.
 * Only fields the user has changed are persisted; everything else falls
 * back to the regional default.
 */
export interface AssumptionOverride {
  householdId: string;
  inflationGeneral?: number; // e.g. 0.06 = 6%
  inflationEducation?: number;
  inflationHealthcare?: number;
  returnEquity?: number;
  returnDebt?: number;
  returnGold?: number;
  returnVolatility?: number;
  lifeExpectancy?: number;
  updatedAt: string;
}

export type TaskStatus = "OPEN" | "IN_PROGRESS" | "DONE" | "SNOOZED";

export interface Task {
  id: string;
  householdId: string;
  title: string;
  body?: string;
  status: TaskStatus;
  source: "USER" | "INSIGHT";
  insightRuleId?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------

export interface Database {
  households: Household[];
  persons: Person[];
  incomes: Income[];
  expenses: Expense[];
  assets: Asset[];
  liabilities: Liability[];
  policies: Policy[];
  goals: Goal[];
  riskProfiles: RiskProfile[];
  taxProfiles: TaxProfile[];
  estateProfiles: EstateProfile[];
  assumptions: AssumptionOverride[];
  tasks: Task[];
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
  riskProfiles: [],
  taxProfiles: [],
  estateProfiles: [],
  assumptions: [],
  tasks: [],
};

// ----- Label dictionaries --------------------------------------------------

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

export const MODE_LABELS: Record<HouseholdMode, string> = {
  BASIC: "Basic",
  ADVANCED: "Advanced",
};

export const RISK_BAND_LABELS: Record<RiskBand, string> = {
  CONSERVATIVE: "Conservative",
  MOD_CONSERVATIVE: "Moderately conservative",
  BALANCED: "Balanced",
  GROWTH: "Growth",
  AGGRESSIVE: "Aggressive",
};

export const WILL_STATUS_LABELS: Record<WillStatus, string> = {
  NONE: "None",
  DRAFT: "Draft",
  REGISTERED: "Registered",
  OUTDATED: "Outdated",
};

export const TAX_REGIME_LABELS: Record<TaxRegime, string> = {
  OLD: "India · Old regime",
  NEW: "India · New regime",
  NA: "Not applicable / non-resident",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  DONE: "Done",
  SNOOZED: "Snoozed",
};
