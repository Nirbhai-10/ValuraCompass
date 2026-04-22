import type { HouseholdBundle } from "./engine";
import { computeCashFlow, computeAllocation } from "./engine";

export interface TaxObservation {
  id: string;
  title: string;
  body: string;
  severity: "INFORMATIONAL" | "LOW" | "MEDIUM" | "HIGH";
  reviewWith: "NONE" | "CA" | "CROSS_BORDER_SPECIALIST";
  assumption: string;
}

export function taxObservations(h: HouseholdBundle): TaxObservation[] {
  const out: TaxObservation[] = [];
  const cf = computeCashFlow(h);
  const alloc = computeAllocation(h);
  const annualIncome = cf.monthlyNetIncome * 12;
  const disclosure = "Illustrative ranges only. Final treatment depends on specific facts; review with your CA.";

  if (h.region !== "IN") {
    out.push({
      id: "TAX-CB",
      title: "Cross-border tax context requires a local specialist",
      body: "For non-India regions, Compass limits itself to structural observations. Please verify with a local tax specialist familiar with your residency.",
      severity: "MEDIUM",
      reviewWith: "CROSS_BORDER_SPECIALIST",
      assumption: disclosure,
    });
    return out;
  }

  if (!h.taxProfile?.regime) {
    out.push({
      id: "TAX-REGIME-MISSING",
      title: "Regime not captured — worth a quick Old vs New comparison",
      body: "Your current tax regime isn't captured. With your income band and typical deductions, a comparison may reveal meaningful differences. This is a planning observation, not a filing directive.",
      severity: "MEDIUM",
      reviewWith: "CA",
      assumption: disclosure,
    });
  } else if (h.taxProfile.regime === "OLD") {
    out.push({
      id: "TAX-OLD-REGIME",
      title: "You're on the Old regime — ensure deductions are being used",
      body: "Old regime benefits most when Section 80C, 80D, HRA, and home-loan-interest deductions are well-utilized. A year-on-year comparison vs the New regime is a healthy habit.",
      severity: "LOW",
      reviewWith: "CA",
      assumption: disclosure,
    });
  } else if (h.taxProfile.regime === "NEW") {
    out.push({
      id: "TAX-NEW-REGIME",
      title: "You're on the New regime — verify you're not leaving deductions on the table",
      body: "New regime simplifies tax but removes many deductions. If your 80C/80D/HRA utilization was material under the Old regime, confirm the switch still comes out ahead.",
      severity: "LOW",
      reviewWith: "CA",
      assumption: disclosure,
    });
  }

  // Savings-linked insurance heuristic
  const savingsLinked = h.policies.filter((p) => p.type === "ULIP" || p.type === "ENDOWMENT");
  if (savingsLinked.length > 0) {
    const totalPremium = savingsLinked.reduce((s, p) => s + (p.premiumAnnual || 0), 0);
    if (totalPremium > annualIncome * 0.1) {
      out.push({
        id: "TAX-SAVINGS-LINKED",
        title: "Savings-linked insurance premiums are material",
        body: "You have significant premiums in ULIP/endowment policies. These products blend investment and insurance with specific tax and surrender rules. Exit timing meaningfully changes outcomes — approach with care.",
        severity: "MEDIUM",
        reviewWith: "CA",
        assumption: disclosure,
      });
    }
  }

  // Business income observation
  if ((h.taxProfile?.businessIncomeShare ?? 0) > 0.25) {
    out.push({
      id: "TAX-BIZ",
      title: "Business income share warrants posture review",
      body: "Business/consulting income is a meaningful share of household income. The dividend-vs-salary posture and deductions profile can be optimized with your CA's specific facts in hand.",
      severity: "MEDIUM",
      reviewWith: "CA",
      assumption: disclosure,
    });
  }

  // Real estate concentration note (tax-relevant for capital gains planning)
  const reShare = alloc.total > 0 ? (alloc.byClass["REAL_ESTATE"] ?? 0) / alloc.total : 0;
  if (reShare > 0.5) {
    out.push({
      id: "TAX-RE-CONC",
      title: "Real estate concentration has tax-on-exit implications",
      body: "A property-heavy household has specific capital-gains and indexation considerations when exiting. Plan exits carefully across fiscal years where feasible.",
      severity: "LOW",
      reviewWith: "CA",
      assumption: disclosure,
    });
  }

  return out;
}
