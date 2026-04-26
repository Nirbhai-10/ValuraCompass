import { Database, EMPTY_DB } from "./types";

/**
 * Demo dataset used to populate a fresh browser. Loosely modeled on a
 * dual-income, two-kid Indian household in their late-30s. Numbers are
 * illustrative and intentionally round.
 */
export function buildDemoDatabase(): Database {
  const now = new Date().toISOString();
  const hhId = "hh_demo_sharma";
  const rohan = "p_demo_rohan";
  const priya = "p_demo_priya";
  const anya = "p_demo_anya";
  const kabir = "p_demo_kabir";

  const cash = "ast_demo_cash";
  const fd = "ast_demo_fd";
  const equity = "ast_demo_equity";
  const ppf = "ast_demo_ppf";
  const epf = "ast_demo_epf";
  const nps = "ast_demo_nps";
  const gold = "ast_demo_gold";
  const plot = "ast_demo_plot";

  return {
    ...EMPTY_DB,
    households: [
      {
        id: hhId,
        name: "The Sharma family",
        region: "IN",
        currency: "INR",
        structure: "NUCLEAR",
        mode: "ADVANCED",
        scenarioIds: [
          "baseline",
          "retire_60",
          "retire_65",
          "fire_50",
          "stress_inflation",
          "stress_returns",
          "job_loss_12m",
          "medical_shock_25l",
          "longer_life_95",
          "perpetual_4pct",
        ],
        createdAt: now,
        updatedAt: now,
      },
    ],
    persons: [
      {
        id: rohan,
        householdId: hhId,
        fullName: "Rohan Sharma",
        relation: "Self",
        dob: "1986-09-12",
        isPrimary: true,
      },
      {
        id: priya,
        householdId: hhId,
        fullName: "Priya Sharma",
        relation: "Spouse",
        dob: "1988-04-04",
        isPrimary: false,
      },
      {
        id: anya,
        householdId: hhId,
        fullName: "Anya Sharma",
        relation: "Child",
        dob: "2016-06-21",
        isPrimary: false,
      },
      {
        id: kabir,
        householdId: hhId,
        fullName: "Kabir Sharma",
        relation: "Child",
        dob: "2019-11-02",
        isPrimary: false,
      },
    ],
    incomes: [
      {
        id: "inc_demo_rohan_salary",
        householdId: hhId,
        personId: rohan,
        label: "Salary",
        type: "Salary",
        amountMonthly: 280000,
      },
      {
        id: "inc_demo_priya_consulting",
        householdId: hhId,
        personId: priya,
        label: "Consulting retainer",
        type: "Consulting",
        amountMonthly: 120000,
      },
      {
        id: "inc_demo_dividends",
        householdId: hhId,
        label: "MF dividends",
        type: "Dividends",
        amountMonthly: 8000,
      },
    ],
    expenses: [
      { id: "exp_demo_rent", householdId: hhId, category: "Housing", label: "Apartment rent", amountMonthly: 85000, essential: true },
      { id: "exp_demo_groc", householdId: hhId, category: "Groceries", amountMonthly: 35000, essential: true },
      { id: "exp_demo_util", householdId: hhId, category: "Utilities", amountMonthly: 8000, essential: true },
      { id: "exp_demo_trans", householdId: hhId, category: "Transport", amountMonthly: 15000, essential: true },
      { id: "exp_demo_edu", householdId: hhId, category: "Education", label: "Kids school + activities", amountMonthly: 40000, essential: true },
      { id: "exp_demo_health", householdId: hhId, category: "Healthcare", amountMonthly: 6000, essential: true },
      { id: "exp_demo_ins", householdId: hhId, category: "Insurance", label: "Premiums", amountMonthly: 12000, essential: true },
      { id: "exp_demo_dine", householdId: hhId, category: "Dining", amountMonthly: 18000, essential: false },
      { id: "exp_demo_subs", householdId: hhId, category: "Subscriptions", amountMonthly: 3000, essential: false },
      { id: "exp_demo_travel", householdId: hhId, category: "Travel", amountMonthly: 15000, essential: false },
    ],
    assets: [
      { id: cash, householdId: hhId, label: "HDFC savings", assetClass: "Cash", currentValue: 600000 },
      { id: fd, householdId: hhId, label: "Emergency FD", assetClass: "Debt / fixed income", currentValue: 500000 },
      { id: equity, householdId: hhId, label: "Mutual funds (Equity)", assetClass: "Equity", currentValue: 2800000 },
      { id: ppf, householdId: hhId, label: "PPF", assetClass: "Retirement", currentValue: 1200000 },
      { id: epf, householdId: hhId, label: "EPF", assetClass: "Retirement", currentValue: 1800000 },
      { id: nps, householdId: hhId, label: "NPS Tier-1", assetClass: "Retirement", currentValue: 500000 },
      { id: gold, householdId: hhId, label: "Sovereign Gold Bonds", assetClass: "Gold", currentValue: 350000 },
      { id: plot, householdId: hhId, label: "Plot in Pune", assetClass: "Real estate", currentValue: 4000000 },
    ],
    liabilities: [
      { id: "lia_demo_car", householdId: hhId, label: "Car loan", type: "Vehicle loan", outstanding: 650000, emiMonthly: 14500, interestRate: 9.5 },
      { id: "lia_demo_cc", householdId: hhId, label: "Credit card balance", type: "Credit card", outstanding: 85000 },
    ],
    policies: [
      { id: "pol_demo_term_rohan", householdId: hhId, label: "LIC term — Rohan", type: "Term life", insurer: "LIC", sumAssured: 25000000, premiumAnnual: 28000 },
      { id: "pol_demo_term_priya", householdId: hhId, label: "Term — Priya", type: "Term life", insurer: "HDFC Life", sumAssured: 15000000, premiumAnnual: 15000 },
      { id: "pol_demo_health", householdId: hhId, label: "Family floater health", type: "Health (family)", insurer: "Star Health", sumAssured: 1500000, premiumAnnual: 22000 },
      { id: "pol_demo_ci", householdId: hhId, label: "Critical illness — Rohan", type: "Critical illness", insurer: "Niva Bupa", sumAssured: 2500000, premiumAnnual: 8500 },
    ],
    goals: [
      { id: "goal_demo_emergency", householdId: hhId, label: "Emergency fund", type: "Emergency fund", targetAmount: 600000, targetYear: new Date().getFullYear(), priority: 1, linkedAssetIds: [cash, fd] },
      { id: "goal_demo_anya_college", householdId: hhId, label: "Anya's college", type: "Child education", targetAmount: 5000000, targetYear: 2036, priority: 2, linkedAssetIds: [] },
      { id: "goal_demo_kabir_college", householdId: hhId, label: "Kabir's college", type: "Child education", targetAmount: 5500000, targetYear: 2039, priority: 2, linkedAssetIds: [] },
      { id: "goal_demo_retirement", householdId: hhId, label: "Retirement corpus", type: "Retirement", targetAmount: 40000000, targetYear: 2049, priority: 1, linkedAssetIds: [equity, ppf, epf, nps] },
      { id: "goal_demo_vacation", householdId: hhId, label: "Family vacation", type: "Travel", targetAmount: 400000, targetYear: 2027, priority: 4, linkedAssetIds: [] },
    ],
    riskProfiles: [
      {
        householdId: hhId,
        rps: 64,
        band: "GROWTH",
        answers: { horizon: 4, drawdown: 3, knowledge: 3, dependents: 2, income: 3, reaction: 3 },
        updatedAt: now,
      },
    ],
    taxProfiles: [
      {
        householdId: hhId,
        regime: "NEW",
        businessIncomeShare: 0.25,
        notes: "Priya files as a professional under presumptive scheme.",
        updatedAt: now,
      },
    ],
    estateProfiles: [
      {
        householdId: hhId,
        willStatus: "DRAFT",
        poaStatus: "NONE",
        guardianshipNotes: "Priya's brother (Mumbai) is informally agreed for the kids.",
        legacyIntent: "Equal split between the kids; Priya retains usufruct on the Pune plot.",
        updatedAt: now,
      },
    ],
    assumptions: [],
    tasks: [
      {
        id: "task_demo_will",
        householdId: hhId,
        title: "Register the will",
        body: "Draft is ready; book sub-registrar appointment in the next 30 days.",
        status: "OPEN",
        source: "USER",
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}
