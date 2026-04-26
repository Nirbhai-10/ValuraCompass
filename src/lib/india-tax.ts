/**
 * India personal income-tax calculator for FY 2024-25 (AY 2025-26).
 *
 * Covers individuals < 60 years of age, both regimes side-by-side. Slab tax,
 * Section 87A rebate, surcharge, 4% Health & Education cess. Standard
 * deduction is allowed for salaried filers in both regimes (₹50,000 in
 * Old, ₹75,000 in New as per Budget 2024).
 *
 * Capital-gains specials (LTCG 10% above ₹1L on equity, STCG 15% on equity,
 * 20% with indexation on property) are NOT modeled here — they're taxed
 * outside the slab system. The page warns the user and asks them to enter
 * pre-CG taxable income.
 *
 * Everything is local, deterministic, and explainable. No external API.
 */

export type Regime = "OLD" | "NEW";

export interface TaxInputs {
  // Income (annual, INR)
  salary: number;
  businessIncome: number;
  housePropertyIncome: number; // net of 30% standard repairs deduction (user enters net)
  otherIncome: number; // interest, dividends, etc.

  // Common
  isSalaried: boolean;

  // Old-regime exemptions on salary (HRA + LTA carve-outs)
  hraExempt: number;
  ltaExempt: number;
  professionalTax: number;

  // Old-regime Chapter VI-A deductions
  d80C: number; // PPF/EPF/ELSS/LIC/etc, capped at 1.5L
  d80CCD1B: number; // NPS additional, capped at 50K
  d80D: number; // health insurance self/family + senior parents (capped via UI helper)
  d24bHomeLoan: number; // home loan interest, capped at 2L for self-occupied
  d80E: number; // education loan interest (no cap)
  d80G: number; // donations (50%/100% qualifying — user enters net)
  d80TTA: number; // savings bank interest, capped at 10K

  // Both regimes
  employerNPS80CCD2: number; // capped at 10% of salary in both regimes
}

export const EMPTY_TAX_INPUTS: TaxInputs = {
  salary: 0,
  businessIncome: 0,
  housePropertyIncome: 0,
  otherIncome: 0,
  isSalaried: true,
  hraExempt: 0,
  ltaExempt: 0,
  professionalTax: 0,
  d80C: 0,
  d80CCD1B: 0,
  d80D: 0,
  d24bHomeLoan: 0,
  d80E: 0,
  d80G: 0,
  d80TTA: 0,
  employerNPS80CCD2: 0,
};

// ----- Slabs ---------------------------------------------------------------

export interface SlabRow {
  upTo: number; // inclusive upper bound; Number.POSITIVE_INFINITY for the top slab
  rate: number; // 0..1
  label: string;
}

export const OLD_REGIME_SLABS: SlabRow[] = [
  { upTo: 250000, rate: 0, label: "Up to ₹2.5L" },
  { upTo: 500000, rate: 0.05, label: "₹2.5L – ₹5L" },
  { upTo: 1000000, rate: 0.2, label: "₹5L – ₹10L" },
  { upTo: Number.POSITIVE_INFINITY, rate: 0.3, label: "Above ₹10L" },
];

export const NEW_REGIME_SLABS: SlabRow[] = [
  { upTo: 300000, rate: 0, label: "Up to ₹3L" },
  { upTo: 700000, rate: 0.05, label: "₹3L – ₹7L" },
  { upTo: 1000000, rate: 0.1, label: "₹7L – ₹10L" },
  { upTo: 1200000, rate: 0.15, label: "₹10L – ₹12L" },
  { upTo: 1500000, rate: 0.2, label: "₹12L – ₹15L" },
  { upTo: Number.POSITIVE_INFINITY, rate: 0.3, label: "Above ₹15L" },
];

// ----- Caps ----------------------------------------------------------------

export const CAP_80C = 150000;
export const CAP_80CCD1B = 50000;
export const CAP_24B_HOME_LOAN = 200000;
export const CAP_80TTA = 10000;
export const STANDARD_DEDUCTION_OLD = 50000;
export const STANDARD_DEDUCTION_NEW = 75000;
export const REBATE_87A_OLD_LIMIT = 500000;
export const REBATE_87A_OLD_MAX = 12500;
export const REBATE_87A_NEW_LIMIT = 700000;
export const REBATE_87A_NEW_MAX = 25000;
export const CESS_RATE = 0.04;

// ----- Computation ---------------------------------------------------------

export interface SlabFill {
  label: string;
  rate: number;
  amount: number;
  tax: number;
}

export interface TaxBreakdown {
  regime: Regime;
  grossSalary: number;
  grossNonSalary: number;
  grossTotalIncome: number;

  standardDeduction: number;
  hraLtaExemption: number;
  professionalTax: number;
  chapterVIA: { label: string; allowed: number; entered: number; section: string }[];
  totalDeductions: number;

  taxableIncome: number;
  slabFills: SlabFill[];
  baseTax: number;
  rebate87A: number;
  taxAfterRebate: number;
  surcharge: number;
  surchargeRate: number;
  cess: number;
  totalTax: number;
  effectiveRate: number;
  takeHome: number;
}

function computeSlabTax(taxable: number, slabs: SlabRow[]): { fills: SlabFill[]; tax: number } {
  let remaining = Math.max(0, taxable);
  let prev = 0;
  let total = 0;
  const fills: SlabFill[] = [];
  for (const s of slabs) {
    const width = s.upTo - prev;
    const amount = Math.max(0, Math.min(remaining, width));
    const tax = amount * s.rate;
    fills.push({ label: s.label, rate: s.rate, amount, tax });
    total += tax;
    remaining -= amount;
    prev = s.upTo;
    if (remaining <= 0) break;
  }
  return { fills, tax: total };
}

function surchargeFor(
  totalIncome: number,
  taxBeforeSurcharge: number,
  regime: Regime,
): { rate: number; amount: number } {
  let rate = 0;
  // Indian-notation underscore separators: 50_00_000 = 50L, 1_00_00_000 = 1Cr.
  if (totalIncome > 50_00_000) rate = 0.1;
  if (totalIncome > 1_00_00_000) rate = 0.15;
  if (totalIncome > 2_00_00_000) rate = 0.25;
  if (totalIncome > 5_00_00_000) rate = regime === "OLD" ? 0.37 : 0.25;
  return { rate, amount: taxBeforeSurcharge * rate };
}

export function computeTax(input: TaxInputs, regime: Regime): TaxBreakdown {
  const grossSalary = Math.max(0, input.salary);
  const grossNonSalary =
    Math.max(0, input.businessIncome) +
    Math.max(0, input.housePropertyIncome) +
    Math.max(0, input.otherIncome);
  const grossTotalIncome = grossSalary + grossNonSalary;

  const standardDeduction = input.isSalaried
    ? regime === "OLD"
      ? STANDARD_DEDUCTION_OLD
      : STANDARD_DEDUCTION_NEW
    : 0;

  const chapterVIA: TaxBreakdown["chapterVIA"] = [];
  let chapterTotal = 0;

  if (regime === "OLD") {
    // Salary-side carve-outs
    const hra = Math.max(0, input.hraExempt);
    const lta = Math.max(0, input.ltaExempt);
    const ptax = Math.max(0, input.professionalTax);

    const d80C = Math.min(Math.max(0, input.d80C), CAP_80C);
    const d80CCD1B = Math.min(Math.max(0, input.d80CCD1B), CAP_80CCD1B);
    const d80D = Math.max(0, input.d80D);
    const d24b = Math.min(Math.max(0, input.d24bHomeLoan), CAP_24B_HOME_LOAN);
    const d80E = Math.max(0, input.d80E);
    const d80G = Math.max(0, input.d80G);
    const d80TTA = Math.min(Math.max(0, input.d80TTA), CAP_80TTA);
    const d80CCD2 = Math.min(Math.max(0, input.employerNPS80CCD2), grossSalary * 0.1);

    const items: TaxBreakdown["chapterVIA"] = [
      { section: "HRA", label: "HRA exemption", entered: input.hraExempt, allowed: hra },
      { section: "LTA", label: "LTA exemption", entered: input.ltaExempt, allowed: lta },
      { section: "PT", label: "Professional tax", entered: input.professionalTax, allowed: ptax },
      { section: "80C", label: "PPF / EPF / ELSS / LIC etc.", entered: input.d80C, allowed: d80C },
      { section: "80CCD(1B)", label: "NPS additional", entered: input.d80CCD1B, allowed: d80CCD1B },
      { section: "80D", label: "Health insurance", entered: input.d80D, allowed: d80D },
      { section: "24(b)", label: "Home loan interest (self-occupied)", entered: input.d24bHomeLoan, allowed: d24b },
      { section: "80E", label: "Education loan interest", entered: input.d80E, allowed: d80E },
      { section: "80G", label: "Donations (qualifying)", entered: input.d80G, allowed: d80G },
      { section: "80TTA", label: "Savings interest", entered: input.d80TTA, allowed: d80TTA },
      { section: "80CCD(2)", label: "Employer NPS", entered: input.employerNPS80CCD2, allowed: d80CCD2 },
    ];
    chapterVIA.push(...items);
    chapterTotal = items.reduce((s, i) => s + i.allowed, 0);
  } else {
    // New regime: only 80CCD(2) is allowed (capped at 10% of salary; 14% for govt)
    const d80CCD2 = Math.min(Math.max(0, input.employerNPS80CCD2), grossSalary * 0.1);
    chapterVIA.push({
      section: "80CCD(2)",
      label: "Employer NPS",
      entered: input.employerNPS80CCD2,
      allowed: d80CCD2,
    });
    chapterTotal = d80CCD2;
  }

  const hraLtaExemption =
    regime === "OLD"
      ? Math.max(0, input.hraExempt) + Math.max(0, input.ltaExempt)
      : 0;
  const ptaxAllowed = regime === "OLD" ? Math.max(0, input.professionalTax) : 0;
  const totalDeductions =
    standardDeduction + hraLtaExemption + ptaxAllowed +
    chapterVIA
      .filter((c) => !["HRA", "LTA", "PT"].includes(c.section))
      .reduce((s, c) => s + c.allowed, 0);

  const taxableIncome = Math.max(0, grossTotalIncome - totalDeductions);

  const slabs = regime === "OLD" ? OLD_REGIME_SLABS : NEW_REGIME_SLABS;
  const { fills: slabFills, tax: baseTax } = computeSlabTax(taxableIncome, slabs);

  // Section 87A rebate
  const rebate87A =
    regime === "OLD"
      ? taxableIncome <= REBATE_87A_OLD_LIMIT
        ? Math.min(REBATE_87A_OLD_MAX, baseTax)
        : 0
      : taxableIncome <= REBATE_87A_NEW_LIMIT
        ? Math.min(REBATE_87A_NEW_MAX, baseTax)
        : 0;

  const taxAfterRebate = Math.max(0, baseTax - rebate87A);
  const sur = surchargeFor(taxableIncome, taxAfterRebate, regime);
  const cess = (taxAfterRebate + sur.amount) * CESS_RATE;
  const totalTax = Math.round(taxAfterRebate + sur.amount + cess);
  const effectiveRate = grossTotalIncome > 0 ? totalTax / grossTotalIncome : 0;
  const takeHome = grossTotalIncome - totalTax;

  return {
    regime,
    grossSalary,
    grossNonSalary,
    grossTotalIncome,
    standardDeduction,
    hraLtaExemption,
    professionalTax: ptaxAllowed,
    chapterVIA,
    totalDeductions,
    taxableIncome,
    slabFills,
    baseTax: Math.round(baseTax),
    rebate87A: Math.round(rebate87A),
    taxAfterRebate: Math.round(taxAfterRebate),
    surcharge: Math.round(sur.amount),
    surchargeRate: sur.rate,
    cess: Math.round(cess),
    totalTax,
    effectiveRate,
    takeHome: Math.round(takeHome),
  };
}

export interface RegimeComparison {
  old: TaxBreakdown;
  newR: TaxBreakdown;
  betterRegime: Regime;
  savings: number; // positive number representing saving by choosing the better regime
  reasons: string[];
}

export function compareRegimes(input: TaxInputs): RegimeComparison {
  const oldB = computeTax(input, "OLD");
  const newB = computeTax(input, "NEW");
  const better = oldB.totalTax <= newB.totalTax ? "OLD" : "NEW";
  const savings = Math.abs(oldB.totalTax - newB.totalTax);

  const reasons: string[] = [];
  if (better === "OLD") {
    if (input.d80C >= 100000) reasons.push("Section 80C investments meaningfully cut taxable income.");
    if (input.d24bHomeLoan >= 100000) reasons.push("Home loan interest deduction (₹2L cap) is in play.");
    if (input.d80D >= 25000) reasons.push("Health-insurance premiums under 80D add up.");
    if (input.hraExempt >= 100000) reasons.push("HRA exemption is significant.");
    if (input.d80CCD1B >= 25000) reasons.push("NPS additional ₹50K (80CCD(1B)) is being claimed.");
    if (reasons.length === 0) reasons.push("Sum of itemised deductions exceeds the New regime's higher slab + ₹75K standard deduction.");
  } else {
    reasons.push("New regime's lower slabs and ₹75K standard deduction beat the itemised path.");
    if (input.d80C < 100000) reasons.push("Old-regime 80C is under-utilised.");
    if (input.d24bHomeLoan < 50000) reasons.push("No meaningful home-loan interest to claim.");
    if (input.hraExempt < 50000) reasons.push("Limited HRA exemption available.");
  }
  return { old: oldB, newR: newB, betterRegime: better, savings, reasons };
}

// ----- Formatting helpers --------------------------------------------------

export const SECTION_HINTS: Record<string, string> = {
  "80C": "Cap ₹1.5L. PPF, EPF, ELSS, LIC, term insurance premium, home loan principal, kids' tuition, NSC, 5-year tax-saving FD, Sukanya Samriddhi.",
  "80CCD(1B)": "Cap ₹50K. Additional NPS Tier-1 contribution beyond the 80C umbrella.",
  "80CCD(2)": "Allowed in both regimes. Capped at 10% of salary (14% for central-govt employees).",
  "80D": "₹25K self/family + ₹50K for senior-citizen parents. Preventive check-ups within ₹5K count.",
  "24(b)": "Cap ₹2L for self-occupied home loan interest. Let-out / second home has no cap (set-off limited to ₹2L against other heads).",
  "80E": "Education-loan interest. No cap; available for 8 years.",
  "80G": "Donations to qualifying institutions. Some are 100% deductible, some 50%, with overall 10% of GTI cap. Enter the net deductible amount.",
  "80TTA": "Cap ₹10K. Savings-bank interest only.",
  HRA: "Lower of (rent − 10% of basic), 50%/40% of basic (metro/non-metro), or actual HRA received.",
  LTA: "Up to twice in a 4-year block. Domestic travel only. Enter what your employer is exempting.",
  PT: "Professional tax paid (state-specific, often ₹2,400/yr).",
};
