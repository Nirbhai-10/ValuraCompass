import type {
  Household,
  Person,
  Income,
  Expense,
  Asset,
  Liability,
  Policy,
  Goal,
  TaxProfile,
  RiskProfile,
  EstateProfile,
  BehaviorProfile,
  Document as DocumentModel,
  AssumptionOverride,
  PolicyInsured,
  AssetNominee,
} from "@prisma/client";
import { getRegion } from "../region";
import type { Assumptions } from "../assumptions";
import { clamp, safeJSONParse } from "../utils";
import type { AllocationSnapshot, CashFlowSnapshot, Score, ScoreSet } from "./types";

export interface HouseholdBundle extends Household {
  persons: Person[];
  incomes: Income[];
  expenses: Expense[];
  assets: (Asset & { nominees: AssetNominee[] })[];
  liabilities: Liability[];
  policies: (Policy & { insured: PolicyInsured[] })[];
  goals: Goal[];
  taxProfile: TaxProfile | null;
  riskProfile: RiskProfile | null;
  estateProfile: EstateProfile | null;
  behaviorProfile: BehaviorProfile | null;
  documents?: DocumentModel[];
  assumptionOverride?: AssumptionOverride | null;
}

function band(value: number, bands: [number, string][]): string {
  // bands sorted ascending by threshold; value <= threshold => label of next
  for (const [t, label] of bands) {
    if (value <= t) return label;
  }
  return bands[bands.length - 1][1];
}

const STANDARD_BANDS: [number, string][] = [
  [39, "Needs Work"],
  [59, "Building"],
  [79, "Solid"],
  [100, "Strong"],
];

const RPS_BANDS: [number, string][] = [
  [24, "Conservative"],
  [44, "Moderately Conservative"],
  [59, "Balanced"],
  [79, "Growth"],
  [100, "Aggressive"],
];

function safeDiv(a: number, b: number): number {
  if (!isFinite(a) || !isFinite(b) || b === 0) return 0;
  return a / b;
}

export function computeCashFlow(h: HouseholdBundle): CashFlowSnapshot {
  const monthlyNetIncome = h.incomes.reduce((s, i) => s + (i.amountMonthly || 0), 0);
  const essentialMonthlyExpenses = h.expenses
    .filter((e) => e.essential)
    .reduce((s, e) => s + (e.amountMonthly || 0), 0);
  const discretionaryMonthlyExpenses = h.expenses
    .filter((e) => !e.essential)
    .reduce((s, e) => s + (e.amountMonthly || 0), 0);
  const totalEMI = h.liabilities.reduce((s, l) => s + (l.emiMonthly || 0), 0);
  const monthlySurplus =
    monthlyNetIncome - (essentialMonthlyExpenses + discretionaryMonthlyExpenses + totalEMI);
  const savingsRate = monthlyNetIncome > 0 ? Math.max(0, monthlySurplus / monthlyNetIncome) : 0;
  return {
    monthlyNetIncome,
    essentialMonthlyExpenses,
    discretionaryMonthlyExpenses,
    totalEMI,
    monthlySurplus,
    savingsRate,
  };
}

export function computeAllocation(h: HouseholdBundle): AllocationSnapshot {
  const total = h.assets.reduce((s, a) => s + (a.currentValue || 0), 0);
  const byClass: Record<string, number> = {};
  for (const a of h.assets) {
    byClass[a.assetClass] = (byClass[a.assetClass] || 0) + (a.currentValue || 0);
  }
  const liquidClasses = ["CASH"];
  const liquid = h.assets
    .filter((a) => a.liquidityBucket === "T0" || a.liquidityBucket === "T2" || liquidClasses.includes(a.assetClass))
    .reduce((s, a) => s + a.currentValue, 0);
  const liquid30d = h.assets
    .filter((a) => ["T0", "T2", "D30"].includes(a.liquidityBucket))
    .reduce((s, a) => s + a.currentValue, 0);
  const illiquid = h.assets
    .filter((a) => ["Y1", "ILLIQUID"].includes(a.liquidityBucket))
    .reduce((s, a) => s + a.currentValue, 0);
  const concentrationTop = h.assets.length
    ? (() => {
        const sorted = [...h.assets].sort((a, b) => b.currentValue - a.currentValue);
        const top = sorted[0];
        return { label: top.label, share: total > 0 ? top.currentValue / total : 0 };
      })()
    : null;
  return { total, byClass, liquid, liquid30d, illiquid, concentrationTop };
}

function dependentsCount(h: HouseholdBundle): number {
  return h.persons.filter((p) => p.isDependent).length;
}

function primaryEarners(h: HouseholdBundle): Person[] {
  const ids = new Set(h.incomes.map((i) => i.personId));
  return h.persons.filter((p) => ids.has(p.id));
}

export function getAssumptionsSync(h: HouseholdBundle): Assumptions {
  const regionPack = getRegion(h.region);
  const base = regionPack.assumptions;
  const overrides = safeJSONParse<Partial<Assumptions>>(h.assumptionOverride?.data, {});
  return { ...base, ...overrides };
}

// ----- Score computation ----------------------------------------------------

function makeScore(
  id: string,
  label: string,
  value: number,
  bands: [number, string][],
  narrative: string,
  components: Score["components"],
  confidence: number,
): Score {
  return {
    id,
    label,
    value: Math.round(clamp(value, 0, 100)),
    band: band(value, bands),
    narrative,
    components,
    confidence: clamp(confidence, 0, 1),
  };
}

function dataConfidence(h: HouseholdBundle): number {
  let c = 0.2;
  if (h.persons.length > 0) c += 0.1;
  if (h.incomes.length > 0) c += 0.15;
  if (h.expenses.length > 0) c += 0.15;
  if (h.assets.length > 0) c += 0.1;
  if (h.liabilities.length > 0 || h.expenses.length > 0) c += 0.05;
  if (h.policies.length > 0) c += 0.1;
  if (h.goals.length > 0) c += 0.1;
  if (h.riskProfile) c += 0.05;
  return clamp(c, 0, 1);
}

export function computeScores(h: HouseholdBundle): ScoreSet {
  const a = getAssumptionsSync(h);
  const cf = computeCashFlow(h);
  const alloc = computeAllocation(h);
  const deps = dependentsCount(h);
  const earners = primaryEarners(h);
  const totalIncome = cf.monthlyNetIncome;
  const topEarner = h.incomes.reduce<Record<string, number>>((acc, i) => {
    acc[i.personId] = (acc[i.personId] || 0) + i.amountMonthly;
    return acc;
  }, {});
  const topEarnerShare =
    Object.values(topEarner).length && totalIncome > 0
      ? Math.max(...Object.values(topEarner)) / totalIncome
      : 0;
  const dc = dataConfidence(h);

  // ERS — months of essentials covered by liquid
  const monthsLiquid = cf.essentialMonthlyExpenses > 0 ? alloc.liquid / cf.essentialMonthlyExpenses : 0;
  const ersMonths = clamp((monthsLiquid / 6) * 70, 0, 70); // 6m = 70pts
  const accessSpeed = alloc.liquid > 0 ? 20 : 0;
  const depsPenalty = deps > 3 ? -10 : deps > 1 ? -5 : 0;
  const healthBuffer = h.policies.some((p) => p.type === "CRITICAL_ILLNESS") ? 10 : 0;
  const ersValue = clamp(ersMonths + accessSpeed + healthBuffer + 10 + depsPenalty, 0, 100);
  const ERS = makeScore(
    "ERS",
    "Emergency Resilience",
    ersValue,
    [
      [39, "Fragile"],
      [59, "Low"],
      [79, "Adequate"],
      [100, "Strong"],
    ],
    `Household can cover about ${monthsLiquid.toFixed(1)} months of essentials without new income.`,
    [
      { id: "months", label: "Months of essentials", value: ersMonths, weight: 0.7 },
      { id: "access", label: "Access speed", value: accessSpeed, weight: 0.2 },
      { id: "health", label: "Health buffer", value: healthBuffer, weight: 0.1 },
    ],
    dc,
  );

  // CFS — savings rate, emi ratio, discretionary/essential
  const surplusRatio = clamp(cf.savingsRate / 0.25, 0, 1); // 25% = full
  const emiRatio = totalIncome > 0 ? cf.totalEMI / totalIncome : 0;
  const emiScore = clamp(1 - emiRatio / 0.4, 0, 1); // 40%+ bad
  const discRatio = cf.essentialMonthlyExpenses > 0 ? cf.discretionaryMonthlyExpenses / cf.essentialMonthlyExpenses : 0;
  const discScore = clamp(1 - discRatio / 1.0, 0, 1);
  const cfsValue = (surplusRatio * 0.45 + emiScore * 0.35 + discScore * 0.2) * 100;
  const CFS = makeScore(
    "CFS",
    "Cash Flow Stability",
    cfsValue,
    [
      [49, "Stressed"],
      [69, "Tight"],
      [84, "Stable"],
      [100, "Strong"],
    ],
    `Savings rate ${(cf.savingsRate * 100).toFixed(1)}%, EMI ratio ${(emiRatio * 100).toFixed(1)}%.`,
    [
      { id: "surplus", label: "Savings rate", value: surplusRatio * 100, weight: 0.45 },
      { id: "emi", label: "EMI ratio", value: emiScore * 100, weight: 0.35 },
      { id: "disc", label: "Discretionary share", value: discScore * 100, weight: 0.2 },
    ],
    dc,
  );

  // IDS — diversification, concentration, variability
  const sources = h.incomes.length;
  const diversification = clamp(sources / 3, 0, 1);
  const concentration = clamp(1 - topEarnerShare, 0, 1);
  const variabilityScore = (() => {
    const v = h.incomes.map((i) =>
      i.variability === "STABLE" ? 1 : i.variability === "MODERATE" ? 0.6 : 0.3,
    );
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0.5;
  })();
  const employmentScore = earners.every((p) => p.employmentType === "SALARIED") ? 0.85 : 0.7;
  const idsValue = (diversification * 0.3 + concentration * 0.3 + variabilityScore * 0.25 + employmentScore * 0.15) * 100;
  const IDS = makeScore(
    "IDS",
    "Income Durability",
    idsValue,
    [
      [49, "Fragile"],
      [69, "Moderate"],
      [84, "Durable"],
      [100, "Very Durable"],
    ],
    `${sources} income source(s); top earner share ${(topEarnerShare * 100).toFixed(0)}%.`,
    [
      { id: "div", label: "Diversification", value: diversification * 100, weight: 0.3 },
      { id: "conc", label: "Payer/earner concentration", value: concentration * 100, weight: 0.3 },
      { id: "var", label: "Stability", value: variabilityScore * 100, weight: 0.25 },
      { id: "emp", label: "Employment mix", value: employmentScore * 100, weight: 0.15 },
    ],
    dc,
  );

  // PAS — life cover adequacy + health presence + CI + disability + nominee consistency
  const lifeCoverTotal = h.policies
    .filter((p) => p.type === "TERM")
    .reduce((s, p) => s + p.sumAssured, 0);
  const essentialsAnnual = cf.essentialMonthlyExpenses * 12;
  const depsYears = deps > 0 ? 15 : 0;
  const lifeTarget = essentialsAnnual * depsYears + h.liabilities.reduce((s, l) => s + l.outstanding, 0);
  const lifeCoverRatio = lifeTarget > 0 ? clamp(lifeCoverTotal / lifeTarget, 0, 1) : 1;
  const healthCoverRatio = h.policies.some((p) => p.type === "FAMILY_FLOATER" || p.type === "INDIVIDUAL_HEALTH")
    ? 1
    : h.policies.some((p) => p.type === "EMPLOYER_GROUP")
    ? 0.5
    : 0;
  const ciPresent = h.policies.some((p) => p.type === "CRITICAL_ILLNESS") ? 1 : 0;
  const disPresent = h.policies.some((p) => p.type === "DISABILITY") ? 1 : 0;
  const nomineeMapped = h.policies.some((p) => p.insured.some((i) => i.role === "NOMINEE")) ? 1 : 0;
  const pasValue =
    (lifeCoverRatio * 0.45 + healthCoverRatio * 0.25 + ciPresent * 0.1 + disPresent * 0.1 + nomineeMapped * 0.1) * 100;
  const PAS = makeScore(
    "PAS",
    "Protection Adequacy",
    pasValue,
    [
      [49, "Critical"],
      [69, "Inadequate"],
      [84, "Adequate"],
      [100, "Strong"],
    ],
    deps > 0
      ? `Term cover funds ~${lifeTarget > 0 ? (lifeCoverTotal / Math.max(essentialsAnnual, 1)).toFixed(1) : "n/a"} years of essentials for dependents.`
      : `Protection adequacy reflects current household coverage.`,
    [
      { id: "life", label: "Life cover adequacy", value: lifeCoverRatio * 100, weight: 0.45 },
      { id: "health", label: "Health cover", value: healthCoverRatio * 100, weight: 0.25 },
      { id: "ci", label: "Critical illness", value: ciPresent * 100, weight: 0.1 },
      { id: "dis", label: "Disability cover", value: disPresent * 100, weight: 0.1 },
      { id: "nom", label: "Nominee mapping", value: nomineeMapped * 100, weight: 0.1 },
    ],
    dc,
  );

  // DSS — EMI-to-income, debt-to-asset, credit card, floating exposure, informal
  const debtToAsset = alloc.total > 0 ? h.liabilities.reduce((s, l) => s + l.outstanding, 0) / alloc.total : 0;
  const ccRevolve = h.liabilities.some((l) => l.type === "CREDIT_CARD" && l.outstanding > 0) ? 0 : 1;
  const floatingExp = h.liabilities.some((l) => l.interestType === "FLOATING") ? 0.6 : 1;
  const informalDebt = h.liabilities.some((l) => l.type === "INFORMAL" || l.type === "FAMILY_LOAN") ? 0.6 : 1;
  const emiRatioScore = clamp(1 - emiRatio / 0.4, 0, 1);
  const debtToAssetScore = clamp(1 - debtToAsset / 0.6, 0, 1);
  const dssValue = (emiRatioScore * 0.4 + debtToAssetScore * 0.25 + ccRevolve * 0.15 + floatingExp * 0.1 + informalDebt * 0.1) * 100;
  const DSS = makeScore(
    "DSS",
    "Debt Stress",
    dssValue,
    [
      [39, "High"],
      [59, "Elevated"],
      [79, "Manageable"],
      [100, "Healthy"],
    ],
    `EMI ratio ${(emiRatio * 100).toFixed(0)}%, debt-to-asset ${(debtToAsset * 100).toFixed(0)}%.`,
    [
      { id: "emi", label: "EMI to income", value: emiRatioScore * 100, weight: 0.4 },
      { id: "debtAsset", label: "Debt to assets", value: debtToAssetScore * 100, weight: 0.25 },
      { id: "cc", label: "Credit card clean", value: ccRevolve * 100, weight: 0.15 },
      { id: "float", label: "Floating rate posture", value: floatingExp * 100, weight: 0.1 },
      { id: "informal", label: "Informal debt", value: informalDebt * 100, weight: 0.1 },
    ],
    dc,
  );

  // GFS (per goal) — feasibility using SIP equivalent
  const inflationFor = (cat: string) =>
    cat === "HEALTHCARE" ? a.inflationHealthcare : cat === "EDUCATION" ? a.inflationEducation : a.inflationGeneral;
  const nominalReturn = 0.7 * a.equityNominalReturn + 0.3 * a.debtNominalReturn; // conservative mix default
  const thisYear = new Date().getFullYear();
  const goalFeasibilities = h.goals.map((g) => {
    const years = Math.max(1, g.targetYear - thisYear);
    const infl = inflationFor(g.inflationCategory);
    const futureTarget = g.targetAmountToday * Math.pow(1 + infl, years);
    // monthly SIP required: FV = PMT * (((1+r)^n - 1) / r), n = years*12, r = nominalReturn/12
    const r = nominalReturn / 12;
    const n = years * 12;
    const pmt = (futureTarget * r) / (Math.pow(1 + r, n) - 1);
    const capacity = cf.monthlySurplus > 0 ? cf.monthlySurplus / (h.goals.length || 1) : 0;
    const feasibility = capacity > 0 ? clamp(capacity / pmt, 0, 1) : 0;
    return { goal: g, futureTarget, pmt, feasibility };
  });
  const gfsAvg = goalFeasibilities.length
    ? (goalFeasibilities.reduce((s, g) => s + g.feasibility, 0) / goalFeasibilities.length) * 100
    : 50;
  const GFS_AVG = makeScore(
    "GFS",
    "Goal Feasibility (avg)",
    gfsAvg,
    [
      [39, "Off Track"],
      [69, "At Risk"],
      [84, "On Track"],
      [100, "Comfortable"],
    ],
    `${h.goals.length} goal(s) averaged.`,
    [],
    dc,
  );

  // RRS — retirement readiness: corpus at retirement vs target
  const primary = h.persons.find((p) => p.isPrimary) || h.persons[0];
  const currentAge = primary && primary.dob ? Math.max(18, Math.floor((Date.now() - new Date(primary.dob).getTime()) / (365.25 * 864e5))) : 35;
  const retireAge = primary?.intendedRetirementAge || a.retirementAge;
  const yearsToRetire = Math.max(1, retireAge - currentAge);
  const postRetireYears = Math.max(5, a.longevity - retireAge);
  const currentCorpus = alloc.byClass["RETIREMENT"] || 0;
  const corpusAtRetire =
    currentCorpus * Math.pow(1 + nominalReturn, yearsToRetire) +
    (cf.monthlySurplus > 0
      ? ((cf.monthlySurplus * 12) *
          (Math.pow(1 + nominalReturn, yearsToRetire) - 1)) /
        nominalReturn
      : 0);
  const monthlyRetExpense = cf.essentialMonthlyExpenses * Math.pow(1 + a.inflationGeneral, yearsToRetire);
  const annualRetExpense = monthlyRetExpense * 12;
  const requiredCorpus =
    (annualRetExpense * (1 - Math.pow(1 / (1 + a.debtNominalReturn), postRetireYears))) /
    a.debtNominalReturn;
  const rrsRaw = requiredCorpus > 0 ? clamp(corpusAtRetire / requiredCorpus, 0, 1.5) : 1;
  const rrsValue = rrsRaw * 100;
  const RRS = makeScore(
    "RRS",
    "Retirement Readiness",
    rrsValue > 100 ? 100 : rrsValue,
    STANDARD_BANDS,
    `At current pace, projected corpus covers about ${Math.round(rrsRaw * 100)}% of what's estimated.`,
    [],
    dc,
  );

  // LAS — liquidity vs upcoming 12M outflows (approx)
  const upcoming12M = (cf.essentialMonthlyExpenses + cf.totalEMI) * 12;
  const lasRatio = upcoming12M > 0 ? clamp(alloc.liquid30d / upcoming12M, 0, 1) : 1;
  const LAS = makeScore(
    "LAS",
    "Liquidity Adequacy",
    lasRatio * 100,
    STANDARD_BANDS,
    `30-day liquid assets cover ~${(lasRatio * 100).toFixed(0)}% of the next 12 months of essentials + EMIs.`,
    [],
    dc,
  );

  // HFS — fragility aggregated
  const earnerFragility = topEarnerShare > 0.8 ? 0.3 : topEarnerShare > 0.6 ? 0.6 : 0.9;
  const caregiver = h.persons.some((p) => p.isCaregiver) ? 0.8 : 1;
  const healthConc = h.persons.some((p) => p.specialNeedsFlag || p.elderlyFlag) ? 0.7 : 1;
  const crossBorder = h.persons.some((p) => (p.residencyCountry && p.residencyCountry !== "IN") || (p.taxResidencyCountry && p.taxResidencyCountry !== "IN")) ? 0.85 : 1;
  const liabGuarantees = h.liabilities.some((l) => l.type === "BUSINESS_LOAN") ? 0.8 : 1;
  const hfsValue = (earnerFragility * 0.3 + caregiver * 0.15 + healthConc * 0.15 + crossBorder * 0.1 + liabGuarantees * 0.1 + ERS.value/100 * 0.2) * 100;
  const HFS = makeScore(
    "HFS",
    "Household Fragility",
    hfsValue,
    [
      [39, "Fragile"],
      [59, "Vulnerable"],
      [79, "Resilient"],
      [100, "Robust"],
    ],
    `Aggregated fragility considering earner dependency, caregiver burden, and cross-border exposure.`,
    [],
    dc,
  );

  // FDRS — dependency intensity
  const fdrs = (() => {
    if (earners.length === 0) return 50;
    const ratio = deps / earners.length;
    const ratioScore = clamp(1 - ratio / 3, 0, 1);
    const specialNeeds = h.persons.some((p) => p.specialNeedsFlag) ? 0.7 : 1;
    const elderly = h.persons.some((p) => p.elderlyFlag) ? 0.85 : 1;
    return (ratioScore * 0.6 + specialNeeds * 0.2 + elderly * 0.2) * 100;
  })();
  const FDRS = makeScore("FDRS", "Family Dependency Risk", fdrs, STANDARD_BANDS, `${deps} dependent(s) for ${earners.length} earner(s).`, [], dc);

  // TES — tax efficiency (simple: regime declared, wrapper utilization presence, cap gains awareness)
  const regimeSet = !!h.taxProfile?.regime;
  const retirementWrappers = alloc.byClass["RETIREMENT"] || 0;
  const retirementShare = alloc.total > 0 ? retirementWrappers / alloc.total : 0;
  const tesValue = (regimeSet ? 40 : 0) + clamp(retirementShare * 100, 0, 40) + (h.taxProfile?.businessIncomeShare != null ? 10 : 0) + 10;
  const TES = makeScore("TES", "Tax Efficiency (observation)", tesValue, STANDARD_BANDS, `Planning-level tax observation score (India-first).`, [], dc);

  // CRS — concentration
  const topShare = alloc.concentrationTop?.share ?? 0;
  const crsValue = clamp(1 - topShare / 0.6, 0, 1) * 100;
  const CRS = makeScore("CRS", "Concentration Risk", crsValue, STANDARD_BANDS, topShare > 0 ? `Top holding is ${(topShare * 100).toFixed(0)}% of investable assets.` : "Few assets captured.", [], dc);

  // ESS — estate readiness
  const willScore = h.estateProfile?.willStatus === "REGISTERED" || h.estateProfile?.willStatus === "UPDATED" ? 1 : h.estateProfile?.willStatus === "DRAFT" ? 0.5 : 0;
  const nominees = h.assets.filter((a) => (a.nominees?.length || 0) > 0).length;
  const nomineeCoverage = h.assets.length > 0 ? nominees / h.assets.length : 0;
  const beneficiaryConsistency = h.policies.some((p) => p.insured.some((i) => i.role === "NOMINEE")) ? 1 : 0.5;
  const guardianship = h.estateProfile?.guardianshipNotes ? 1 : 0;
  const essValue = (willScore * 0.35 + nomineeCoverage * 0.3 + beneficiaryConsistency * 0.15 + guardianship * 0.2) * 100;
  const ESS = makeScore("ESS", "Estate Readiness", essValue, STANDARD_BANDS, `Will status: ${h.estateProfile?.willStatus ?? "not captured"}. Nominee coverage: ${(nomineeCoverage * 100).toFixed(0)}%.`, [], dc);

  // RPS — composite from stated + capacity + behavior
  const statedMap: Record<string, number> = {
    CONSERVATIVE: 15, MOD_CONSERVATIVE: 35, BALANCED: 55, GROWTH: 70, AGGRESSIVE: 85,
  };
  const statedVal = h.riskProfile?.stated ? statedMap[h.riskProfile.stated] ?? 50 : statedMap[primary?.riskAttitudeStated ?? "BALANCED"] ?? 50;
  const capacityVal = clamp((ERS.value / 100) * 40 + (IDS.value / 100) * 40 + ((deps === 0 ? 20 : deps === 1 ? 15 : deps === 2 ? 10 : 5)), 0, 100);
  const behaviorVal = h.behaviorProfile?.panicSelling ? clamp(100 - h.behaviorProfile.panicSelling * 20, 20, 100) : 60;
  const liquidityVal = LAS.value;
  const rpsValue = statedVal * 0.25 + capacityVal * 0.25 + behaviorVal * 0.2 + liquidityVal * 0.15 + (GFS_AVG.value < 70 ? 60 : 50) * 0.15;
  const RPS = makeScore(
    "RPS",
    "Risk Profile",
    rpsValue,
    RPS_BANDS,
    `Composite of stated (${statedVal}), capacity (${Math.round(capacityVal)}), behavior (${Math.round(behaviorVal)}), liquidity (${Math.round(liquidityVal)}).`,
    [
      { id: "stated", label: "Stated", value: statedVal, weight: 0.25 },
      { id: "capacity", label: "Capacity", value: capacityVal, weight: 0.25 },
      { id: "behavior", label: "Behavior", value: behaviorVal, weight: 0.2 },
      { id: "liquidity", label: "Liquidity", value: liquidityVal, weight: 0.15 },
      { id: "need", label: "Need for risk", value: GFS_AVG.value, weight: 0.15 },
    ],
    dc,
  );

  // ISS — simple composite: RPS + horizon + liquidity + dependency
  const avgHorizon = h.goals.length
    ? h.goals.reduce((s, g) => s + (g.targetYear - thisYear), 0) / h.goals.length
    : 10;
  const horizonScore = clamp(avgHorizon / 15, 0, 1) * 100;
  const issValue = RPS.value * 0.3 + horizonScore * 0.25 + LAS.value * 0.15 + FDRS.value * 0.15 + (PAS.value / 100) * 15;
  const ISS = makeScore("ISS", "Investment Suitability", issValue, STANDARD_BANDS, `Per-category suitability heatmap available in Advanced.`, [], dc);

  // DCS — document completeness
  const expected = ["ITR", "FORM16", "POLICY", "STATEMENT", "LOAN", "WILL"];
  const present = new Set((h.documents ?? []).map((d) => d.type));
  const dcsValue = (expected.filter((e) => present.has(e)).length / expected.length) * 100;
  const DCS = makeScore("DCS", "Documentation Completeness", dcsValue, STANDARD_BANDS, `${expected.filter((e) => present.has(e)).length}/${expected.length} key document types present.`, [], dc);

  // PCS — planning completeness (data density + scenarios + recs docs + tasks)
  const pcsRaw = dc; // reuse data coverage as primary driver
  const PCS = makeScore("PCS", "Planning Completeness", pcsRaw * 100, STANDARD_BANDS, `Based on data coverage across modules.`, [], dc);

  // FTS — follow-through proxy from task completion
  const tasks = (h as any).tasks as { status: string }[] | undefined;
  const openTasks = tasks?.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length ?? 0;
  const doneTasks = tasks?.filter((t) => t.status === "DONE").length ?? 0;
  const ftsRaw = openTasks + doneTasks > 0 ? doneTasks / (openTasks + doneTasks) : 0.5;
  const FTS = makeScore("FTS", "Follow-Through Probability", ftsRaw * 100, STANDARD_BANDS, `Inferred from completed vs open tasks.`, [], dc);

  // AUI — used to prioritize NBA (not a user-facing quality score; surfaced internally)
  const auiValue = clamp(
    (ERS.value < 50 ? 30 : 0) + (PAS.value < 50 ? 30 : 0) + (DSS.value < 50 ? 15 : 0) + (CFS.value < 50 ? 10 : 0) + (HFS.value < 50 ? 15 : 0),
    0,
    100,
  );
  const AUI = makeScore("AUI", "Action Urgency Index", auiValue, STANDARD_BANDS, `Higher means more urgent items right now.`, [], dc);

  // FHS — composite
  const fhsValue =
    ERS.value * 0.12 +
    PAS.value * 0.18 +
    DSS.value * 0.12 +
    RRS.value * 0.15 +
    CFS.value * 0.10 +
    LAS.value * 0.08 +
    CRS.value * 0.06 +
    TES.value * 0.05 +
    ESS.value * 0.04 +
    HFS.value * 0.10;
  const FHS = makeScore(
    "FHS",
    "Financial Health",
    fhsValue,
    STANDARD_BANDS,
    `Overall household financial health composite.`,
    [
      { id: "ERS", label: "Emergency", value: ERS.value, weight: 0.12 },
      { id: "PAS", label: "Protection", value: PAS.value, weight: 0.18 },
      { id: "DSS", label: "Debt", value: DSS.value, weight: 0.12 },
      { id: "RRS", label: "Retirement", value: RRS.value, weight: 0.15 },
      { id: "CFS", label: "Cash flow", value: CFS.value, weight: 0.1 },
      { id: "LAS", label: "Liquidity", value: LAS.value, weight: 0.08 },
      { id: "CRS", label: "Concentration", value: CRS.value, weight: 0.06 },
      { id: "TES", label: "Tax observation", value: TES.value, weight: 0.05 },
      { id: "ESS", label: "Estate", value: ESS.value, weight: 0.04 },
      { id: "HFS", label: "Fragility", value: HFS.value, weight: 0.1 },
    ],
    dc,
  );

  return {
    FHS, ERS, CFS, IDS, PAS, DSS, RRS, LAS, HFS, FDRS,
    TES, CRS, ESS, RPS, ISS, DCS, PCS, FTS, AUI, GFS_AVG,
  };
}

// ----- Goal projections ------------------------------------------------------

export interface GoalProjection {
  goalId: string;
  label: string;
  targetYear: number;
  yearsToGoal: number;
  futureTarget: number;
  monthlySIPRequired: number;
  feasibility: number;
  capacityAssumed: number;
  onTrack: boolean;
}

export function projectGoals(h: HouseholdBundle): GoalProjection[] {
  const a = getAssumptionsSync(h);
  const cf = computeCashFlow(h);
  const thisYear = new Date().getFullYear();
  const nominalReturn = 0.7 * a.equityNominalReturn + 0.3 * a.debtNominalReturn;
  const capacityPerGoal = h.goals.length ? Math.max(0, cf.monthlySurplus) / h.goals.length : 0;
  return h.goals.map((g) => {
    const years = Math.max(1, g.targetYear - thisYear);
    const infl =
      g.inflationCategory === "HEALTHCARE"
        ? a.inflationHealthcare
        : g.inflationCategory === "EDUCATION"
        ? a.inflationEducation
        : a.inflationGeneral;
    const futureTarget = g.targetAmountToday * Math.pow(1 + infl, years);
    const r = nominalReturn / 12;
    const n = years * 12;
    const pmt = (futureTarget * r) / (Math.pow(1 + r, n) - 1);
    const feasibility = capacityPerGoal > 0 ? clamp(capacityPerGoal / pmt, 0, 1) : 0;
    return {
      goalId: g.id,
      label: g.label,
      targetYear: g.targetYear,
      yearsToGoal: years,
      futureTarget: Math.round(futureTarget),
      monthlySIPRequired: Math.round(pmt),
      feasibility,
      capacityAssumed: Math.round(capacityPerGoal),
      onTrack: feasibility >= 0.9,
    };
  });
}

// ----- Monte Carlo (simple, retirement-focused) -----------------------------

export interface MonteCarloResult {
  successProbability: number;
  p10Corpus: number;
  p50Corpus: number;
  p90Corpus: number;
  paths: number;
}

function normRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function monteCarloRetirement(h: HouseholdBundle, paths = 1500): MonteCarloResult {
  const a = getAssumptionsSync(h);
  const cf = computeCashFlow(h);
  const alloc = computeAllocation(h);
  const primary = h.persons.find((p) => p.isPrimary) || h.persons[0];
  const currentAge = primary?.dob
    ? Math.max(18, Math.floor((Date.now() - new Date(primary.dob).getTime()) / (365.25 * 864e5)))
    : 35;
  const retireAge = primary?.intendedRetirementAge || a.retirementAge;
  const years = Math.max(1, retireAge - currentAge);
  const sigma = 0.18; // annual equity vol
  const mu = 0.7 * a.equityNominalReturn + 0.3 * a.debtNominalReturn;
  const startCorpus = alloc.byClass["RETIREMENT"] || 0;
  const monthlySIP = Math.max(0, cf.monthlySurplus);
  const monthlyExpAtRetire = cf.essentialMonthlyExpenses * Math.pow(1 + a.inflationGeneral, years);
  const postRetireYears = Math.max(5, a.longevity - retireAge);
  const requiredCorpus = (monthlyExpAtRetire * 12 * (1 - Math.pow(1 / (1 + a.debtNominalReturn), postRetireYears))) / a.debtNominalReturn;
  const results: number[] = [];
  for (let p = 0; p < paths; p++) {
    let c = startCorpus;
    for (let y = 0; y < years; y++) {
      const shock = mu + sigma * normRandom();
      c = c * (1 + shock) + monthlySIP * 12;
    }
    results.push(c);
  }
  results.sort((a, b) => a - b);
  const pct = (q: number) => results[Math.floor(q * results.length)] ?? 0;
  const successes = results.filter((c) => c >= requiredCorpus).length;
  return {
    successProbability: successes / results.length,
    p10Corpus: Math.round(pct(0.1)),
    p50Corpus: Math.round(pct(0.5)),
    p90Corpus: Math.round(pct(0.9)),
    paths,
  };
}
