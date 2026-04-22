import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { BasicWizard } from "./wizard";

export default async function BasicPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");

  // Minimal initial state derived from what's in the household today.
  const primary = h.persons.find((p) => p.isPrimary) ?? h.persons[0];

  const initial = {
    primaryName: primary?.fullName ?? "",
    dob: primary?.dob ? primary.dob.toISOString().slice(0, 10) : "",
    maritalStatus: primary?.maritalStatus ?? "SINGLE",
    employmentType: primary?.employmentType ?? "SALARIED",
    dependents: h.persons.filter((p) => p.isDependent).length,
    monthlyNetIncome: h.incomes.reduce((s, i) => s + i.amountMonthly, 0) || 0,
    essentialMonthlyExpenses: h.expenses.filter((e) => e.essential).reduce((s, e) => s + e.amountMonthly, 0) || 0,
    discretionaryMonthlyExpenses: h.expenses.filter((e) => !e.essential).reduce((s, e) => s + e.amountMonthly, 0) || 0,
    totalAssets: h.assets.reduce((s, a) => s + a.currentValue, 0) || 0,
    liquidCash: h.assets.filter((a) => a.assetClass === "CASH").reduce((s, a) => s + a.currentValue, 0) || 0,
    totalLiabilities: h.liabilities.reduce((s, l) => s + l.outstanding, 0) || 0,
    totalEMI: h.liabilities.reduce((s, l) => s + (l.emiMonthly ?? 0), 0) || 0,
    creditCardRevolve: h.liabilities.some((l) => l.type === "CREDIT_CARD" && l.outstanding > 0),
    termCover: h.policies.filter((p) => p.type === "TERM").reduce((s, p) => s + p.sumAssured, 0) || 0,
    healthCover: h.policies.filter((p) => p.type === "FAMILY_FLOATER" || p.type === "INDIVIDUAL_HEALTH").reduce((s, p) => s + p.sumAssured, 0) || 0,
    taxRegime: h.taxProfile?.regime ?? "",
    riskComfort: h.riskProfile?.stated ?? (primary?.riskAttitudeStated ?? "BALANCED"),
    retirementAge: primary?.intendedRetirementAge ?? 60,
    retirementTargetMonthly: 0,
    childEducationCost: 0,
    childEducationYear: new Date().getFullYear() + 15,
    homePurchaseCost: 0,
    homePurchaseYear: new Date().getFullYear() + 5,
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Basic Mode — quick planning</h2>
            <p className="text-xs text-ink-500">~10 minutes. Everything carries over to Advanced without re-entry.</p>
          </div>
          <span className="chip-default">Region: {h.region}</span>
        </div>
        <div className="card-body">
          <BasicWizard householdId={h.id} initial={initial} region={h.region} currency={h.currency} />
        </div>
      </div>
    </div>
  );
}
