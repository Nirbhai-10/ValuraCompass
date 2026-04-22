import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { getAssumptions } from "@/lib/assumptions";
import { saveAssumptionsAction, resetAssumptionsAction } from "./actions";

export default async function AssumptionsPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");
  const { base, effective, overrides, regionPack } = await getAssumptions(h.id, h.region);

  const rows: { key: keyof typeof effective; label: string; suffix: string; step?: string }[] = [
    { key: "retirementAge", label: "Retirement age", suffix: "yrs" },
    { key: "longevity", label: "Longevity", suffix: "yrs" },
    { key: "inflationGeneral", label: "General inflation", suffix: "p.a.", step: "0.001" },
    { key: "inflationHealthcare", label: "Healthcare inflation", suffix: "p.a.", step: "0.001" },
    { key: "inflationEducation", label: "Education inflation", suffix: "p.a.", step: "0.001" },
    { key: "equityNominalReturn", label: "Equity nominal return", suffix: "p.a.", step: "0.001" },
    { key: "debtNominalReturn", label: "Debt nominal return", suffix: "p.a.", step: "0.001" },
    { key: "goldNominalReturn", label: "Gold nominal return", suffix: "p.a.", step: "0.001" },
    { key: "realEstateAppreciation", label: "Real estate appreciation", suffix: "p.a.", step: "0.001" },
    { key: "wageGrowth", label: "Wage growth", suffix: "p.a.", step: "0.001" },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Assumption set</h2>
          <p className="text-xs text-ink-500 mt-1">
            Region default: {regionPack.displayName}. Overrides are applied only to this household.
            Rates are shown as decimals (e.g., 0.06 = 6% per year).
          </p>
        </div>
        <form action={saveAssumptionsAction} className="card-body">
          <input type="hidden" name="householdId" value={h.id} />
          <table className="w-full table">
            <thead>
              <tr><th>Assumption</th><th className="text-right">Region default</th><th className="text-right">Your override</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key as string}>
                  <td>{r.label} <span className="text-ink-500">({r.suffix})</span></td>
                  <td className="text-right tabular-nums text-ink-500">{r.key === "retirementAge" || r.key === "longevity" ? base[r.key] : (Number(base[r.key]) * (r.suffix.includes("p.a.") ? 1 : 1)).toFixed(r.step ? 3 : 1)}</td>
                  <td className="text-right tabular-nums">
                    <input
                      name={String(r.key)}
                      type="number"
                      step={r.step ?? "1"}
                      className="input tabular-nums max-w-[140px] ml-auto"
                      defaultValue={overrides[r.key] !== undefined ? String(overrides[r.key]) : String(effective[r.key])}
                    />
                  </td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex gap-3">
            <button className="btn-primary">Save overrides</button>
          </div>
        </form>
      </div>

      <form action={resetAssumptionsAction}>
        <input type="hidden" name="householdId" value={h.id} />
        <button className="btn-secondary">Reset to region defaults</button>
      </form>
    </div>
  );
}
