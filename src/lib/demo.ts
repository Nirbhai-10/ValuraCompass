import { Database, EMPTY_DB } from "./types";

/**
 * Demo dataset used to populate a fresh browser. Loosely modeled on a
 * dual-income, two-kid Indian household in their late-30s, with two
 * partially-supported parents on Priya's side. Numbers are illustrative
 * and intentionally round, but every surface in the app gets meaningful
 * data — including notes — so the user can poke at any screen.
 */
export function buildDemoDatabase(): Database {
  const now = new Date().toISOString();
  const hhId = "hh_demo_sharma";

  // People
  const rohan = "p_demo_rohan";
  const priya = "p_demo_priya";
  const anya = "p_demo_anya";
  const kabir = "p_demo_kabir";
  const ashok = "p_demo_ashok"; // Priya's father, partial support
  const sushma = "p_demo_sushma"; // Priya's mother, partial support

  // Assets
  const cash = "ast_demo_cash";
  const fd = "ast_demo_fd";
  const equity = "ast_demo_equity";
  const intl = "ast_demo_intl";
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
        structure: "NUCLEAR_WITH_PARENTS",
        mode: "ADVANCED",
        scenarioIds: [
          "baseline",
          "retire_60",
          "retire_65",
          "fire_50",
          "perpetual_4pct",
          "stress_inflation",
          "stress_returns",
          "stress_volatility",
          "longer_life_95",
          "job_loss_12m",
          "medical_shock_25l",
          "inheritance_55",
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
        notes: "Product lead at a B2B SaaS company. Plans to retire around 60.",
      },
      {
        id: priya,
        householdId: hhId,
        fullName: "Priya Sharma",
        relation: "Spouse",
        dob: "1988-04-04",
        isPrimary: false,
        notes: "Independent UX consultant. Files under presumptive scheme.",
      },
      {
        id: anya,
        householdId: hhId,
        fullName: "Anya Sharma",
        relation: "Child",
        dob: "2016-06-21",
        isPrimary: false,
        notes: "Likes math and the violin. College planning kicks in around 2034.",
      },
      {
        id: kabir,
        householdId: hhId,
        fullName: "Kabir Sharma",
        relation: "Child",
        dob: "2019-11-02",
        isPrimary: false,
      },
      {
        id: ashok,
        householdId: hhId,
        fullName: "Ashok Iyer",
        relation: "Parent-in-law",
        dob: "1955-01-19",
        isPrimary: false,
        notes:
          "Priya's father. Pension covers most living costs; family helps with healthcare top-ups.",
      },
      {
        id: sushma,
        householdId: hhId,
        fullName: "Sushma Iyer",
        relation: "Parent-in-law",
        dob: "1959-08-30",
        isPrimary: false,
        notes:
          "Priya's mother. Stays with the family in Bangalore for ~6 months a year.",
      },
    ],
    incomes: [
      {
        id: "inc_demo_rohan_salary",
        householdId: hhId,
        personId: rohan,
        label: "Salary — Rohan",
        type: "Salary",
        amountMonthly: 280000,
        notes: "Includes RSU vesting averaged across the year.",
      },
      {
        id: "inc_demo_priya_consulting",
        householdId: hhId,
        personId: priya,
        label: "Consulting retainer — Priya",
        type: "Consulting",
        amountMonthly: 120000,
        notes: "2 active retainers + occasional one-offs.",
      },
      {
        id: "inc_demo_dividends",
        householdId: hhId,
        label: "MF dividends",
        type: "Dividends",
        amountMonthly: 8000,
      },
      {
        id: "inc_demo_rental",
        householdId: hhId,
        label: "Rent (small flat, Pune)",
        type: "Rental",
        amountMonthly: 18000,
        notes: "Net of maintenance and society dues.",
      },
    ],
    expenses: [
      {
        id: "exp_demo_rent",
        householdId: hhId,
        category: "Housing",
        label: "Apartment rent (Indiranagar)",
        amountMonthly: 85000,
        essential: true,
      },
      { id: "exp_demo_groc", householdId: hhId, category: "Groceries", amountMonthly: 35000, essential: true },
      { id: "exp_demo_util", householdId: hhId, category: "Utilities", label: "Electricity + water + gas", amountMonthly: 8000, essential: true },
      { id: "exp_demo_trans", householdId: hhId, category: "Transport", label: "Cab + fuel + maintenance", amountMonthly: 15000, essential: true },
      { id: "exp_demo_edu", householdId: hhId, category: "Education", label: "Kids school + activities", amountMonthly: 40000, essential: true },
      {
        id: "exp_demo_health",
        householdId: hhId,
        category: "Healthcare",
        label: "Medications + parents top-ups",
        amountMonthly: 12000,
        essential: true,
        notes: "Parents' co-pays included.",
      },
      { id: "exp_demo_ins", householdId: hhId, category: "Insurance", label: "Policy premiums (averaged)", amountMonthly: 12000, essential: true },
      { id: "exp_demo_emi", householdId: hhId, category: "Debt service", label: "Car loan EMI", amountMonthly: 14500, essential: true },
      { id: "exp_demo_dine", householdId: hhId, category: "Dining", amountMonthly: 18000, essential: false },
      { id: "exp_demo_subs", householdId: hhId, category: "Subscriptions", label: "OTT, news, music, software", amountMonthly: 3000, essential: false },
      { id: "exp_demo_travel", householdId: hhId, category: "Travel", label: "Annual averaged", amountMonthly: 15000, essential: false },
      {
        id: "exp_demo_parents",
        householdId: hhId,
        category: "Other",
        label: "Parents' household support",
        amountMonthly: 10000,
        essential: true,
        notes: "Direct transfers to Priya's parents.",
      },
    ],
    assets: [
      { id: cash, householdId: hhId, label: "HDFC savings", assetClass: "Cash", currentValue: 600000, notes: "Linked to monthly auto-debits." },
      { id: fd, householdId: hhId, label: "Emergency FD", assetClass: "Debt / fixed income", currentValue: 500000, notes: "12-month FD; auto-renew." },
      { id: equity, householdId: hhId, label: "Mutual funds (Equity)", assetClass: "Equity", currentValue: 2800000, notes: "60% large-cap, 25% flexi, 15% small/mid." },
      { id: intl, householdId: hhId, label: "International equity (S&P 500 index)", assetClass: "Equity", currentValue: 700000, notes: "USD-denominated; 10% of equity allocation target." },
      { id: ppf, householdId: hhId, label: "PPF — Rohan", assetClass: "Retirement", currentValue: 1200000, notes: "Maxed out yearly." },
      { id: epf, householdId: hhId, label: "EPF — Rohan", assetClass: "Retirement", currentValue: 1800000 },
      { id: nps, householdId: hhId, label: "NPS Tier-1", assetClass: "Retirement", currentValue: 500000, notes: "Aggressive lifecycle (LC75)." },
      { id: gold, householdId: hhId, label: "Sovereign Gold Bonds", assetClass: "Gold", currentValue: 350000 },
      { id: plot, householdId: hhId, label: "Plot in Pune", assetClass: "Real estate", currentValue: 4000000, notes: "Residential plot; held for 8 years." },
    ],
    liabilities: [
      {
        id: "lia_demo_car",
        householdId: hhId,
        label: "Car loan — Honda",
        type: "Vehicle loan",
        outstanding: 650000,
        emiMonthly: 14500,
        interestRate: 9.5,
        notes: "26 EMIs remaining.",
      },
      {
        id: "lia_demo_cc",
        householdId: hhId,
        label: "Credit card balance",
        type: "Credit card",
        outstanding: 85000,
        notes: "Carrying month-to-month; flagged in insights.",
      },
    ],
    policies: [
      {
        id: "pol_demo_term_rohan",
        householdId: hhId,
        label: "LIC term — Rohan",
        type: "Term life",
        insurer: "LIC",
        sumAssured: 25000000,
        premiumAnnual: 28000,
        notes: "Cover until age 65.",
      },
      {
        id: "pol_demo_term_priya",
        householdId: hhId,
        label: "Term — Priya",
        type: "Term life",
        insurer: "HDFC Life",
        sumAssured: 15000000,
        premiumAnnual: 15000,
      },
      {
        id: "pol_demo_health",
        householdId: hhId,
        label: "Family floater health",
        type: "Health (family)",
        insurer: "Star Health",
        sumAssured: 1500000,
        premiumAnnual: 22000,
        notes: "Covers all 4 immediate members.",
      },
      {
        id: "pol_demo_parents_health",
        householdId: hhId,
        label: "Parents health (Iyer)",
        type: "Health (individual)",
        insurer: "Niva Bupa",
        sumAssured: 1000000,
        premiumAnnual: 38000,
        notes: "Senior-citizen plan for Priya's parents.",
      },
      {
        id: "pol_demo_ci",
        householdId: hhId,
        label: "Critical illness — Rohan",
        type: "Critical illness",
        insurer: "Niva Bupa",
        sumAssured: 2500000,
        premiumAnnual: 8500,
      },
      {
        id: "pol_demo_disability",
        householdId: hhId,
        label: "Disability income — Rohan",
        type: "Disability",
        insurer: "ICICI Lombard",
        sumAssured: 8000000,
        premiumAnnual: 7000,
        notes: "Pays a monthly benefit during long-term disability.",
      },
    ],
    goals: [
      {
        id: "goal_demo_emergency",
        householdId: hhId,
        label: "Emergency fund",
        type: "Emergency fund",
        targetAmount: 800000,
        targetYear: new Date().getFullYear(),
        priority: 1,
        linkedAssetIds: [cash, fd],
        notes: "Target ≈ 6 months of essentials.",
      },
      {
        id: "goal_demo_anya_college",
        householdId: hhId,
        label: "Anya's college",
        type: "Child education",
        targetAmount: 5000000,
        targetYear: 2036,
        priority: 2,
        linkedAssetIds: [equity, intl],
        notes: "Indian engineering / global undergrad blend.",
      },
      {
        id: "goal_demo_kabir_college",
        householdId: hhId,
        label: "Kabir's college",
        type: "Child education",
        targetAmount: 5500000,
        targetYear: 2039,
        priority: 2,
        linkedAssetIds: [],
      },
      {
        id: "goal_demo_retirement",
        householdId: hhId,
        label: "Retirement corpus",
        type: "Retirement",
        targetAmount: 40000000,
        targetYear: 2049,
        priority: 1,
        linkedAssetIds: [equity, ppf, epf, nps, intl],
      },
      {
        id: "goal_demo_home",
        householdId: hhId,
        label: "Buy a home in Bangalore",
        type: "Home purchase",
        targetAmount: 12000000,
        targetYear: 2030,
        priority: 3,
        linkedAssetIds: [plot, gold],
        notes: "Likely funded by selling the Pune plot + gold.",
      },
      {
        id: "goal_demo_vacation",
        householdId: hhId,
        label: "Family vacation (Japan)",
        type: "Travel",
        targetAmount: 400000,
        targetYear: 2027,
        priority: 4,
        linkedAssetIds: [],
      },
      {
        id: "goal_demo_parents_care",
        householdId: hhId,
        label: "Parents' healthcare reserve",
        type: "Healthcare reserve",
        targetAmount: 1500000,
        targetYear: 2030,
        priority: 2,
        linkedAssetIds: [],
        notes: "For procedures the senior plan won't fully cover.",
      },
    ],
    riskProfiles: [
      {
        householdId: hhId,
        rps: 64,
        band: "GROWTH",
        answers: {
          horizon: 4,
          drawdown: 3,
          knowledge: 3,
          dependents: 2,
          income: 3,
          reaction: 3,
        },
        updatedAt: now,
      },
    ],
    taxProfiles: [
      {
        householdId: hhId,
        regime: "NEW",
        inputs: {
          // Modeled around Rohan's filing (primary). Priya files separately under the
          // presumptive scheme as a professional and isn't included in this profile.
          salary: 3360000, // 2.8L/mo × 12
          businessIncome: 0,
          housePropertyIncome: 151200, // 18k/mo × 12 net of 30% standard
          otherIncome: 96000, // dividends 8k/mo × 12
          isSalaried: true,
          hraExempt: 600000,
          ltaExempt: 0,
          professionalTax: 2400,
          d80C: 150000,
          d80CCD1B: 50000,
          d80D: 47000, // 22k family floater + 25k for senior-citizen parents
          d24bHomeLoan: 0,
          d80E: 0,
          d80G: 0,
          d80TTA: 10000,
          employerNPS80CCD2: 0,
        },
        notes:
          "Rohan's filing. Priya files separately as a professional under the presumptive scheme.",
        updatedAt: now,
      },
    ],
    estateProfiles: [
      {
        householdId: hhId,
        willStatus: "DRAFT",
        poaStatus: "NONE",
        guardianshipNotes:
          "Priya's brother (Mumbai) is informally agreed for the kids if needed.",
        legacyIntent:
          "Equal split between the kids; Priya retains usufruct on the Pune plot. Charitable bequest to a literacy NGO.",
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
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
          .toISOString()
          .slice(0, 10),
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "task_demo_emergency",
        householdId: hhId,
        title: "Top up emergency FD by ₹2L",
        body: "Currently sitting at ~5 months of essentials; aim for 6.",
        status: "IN_PROGRESS",
        source: "INSIGHT",
        insightRuleId: "emergency_fund_low",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "task_demo_cc",
        householdId: hhId,
        title: "Clear credit-card balance",
        body: "₹85K outstanding at 36% APR — pay off before next cycle.",
        status: "OPEN",
        source: "USER",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "task_demo_review",
        householdId: hhId,
        title: "Annual review with advisor",
        body: "Q4 check-in: rebalance, term-cover review, tax harvesting.",
        status: "SNOOZED",
        source: "USER",
        dueDate: `${new Date().getFullYear()}-12-15`,
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}
