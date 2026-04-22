import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { createLiabilityAction, deleteLiabilityAction } from "./actions";
import { formatCurrency } from "@/lib/utils";

const TYPES = [
  "HOME_LOAN", "VEHICLE_LOAN", "PERSONAL_LOAN", "EDUCATION_LOAN", "BUSINESS_LOAN",
  "CREDIT_CARD", "FAMILY_LOAN", "INFORMAL", "OTHER",
];

export default async function LiabilitiesPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");
  const region = h.region as "IN" | "GCC" | "GLOBAL";

  const totalOut = h.liabilities.reduce((s, l) => s + l.outstanding, 0);
  const totalEMI = h.liabilities.reduce((s, l) => s + (l.emiMonthly ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="kpi"><p className="kpi-title">Total outstanding</p><p className="kpi-value">{formatCurrency(totalOut, h.currency, region)}</p></div>
        <div className="kpi"><p className="kpi-title">Total monthly EMI</p><p className="kpi-value">{formatCurrency(totalEMI, h.currency, region)}</p></div>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold">Liabilities</h2>
          <span className="text-xs text-ink-500">{h.liabilities.length} line{h.liabilities.length === 1 ? "" : "s"}</span>
        </div>
        <div className="card-body">
          {h.liabilities.length === 0 ? (
            <p className="text-sm text-ink-500">No liabilities captured.</p>
          ) : (
            <table className="w-full table">
              <thead>
                <tr><th>Label</th><th>Type</th><th>Lender</th><th>Rate</th><th className="text-right">Outstanding</th><th className="text-right">EMI</th><th></th></tr>
              </thead>
              <tbody>
                {h.liabilities.map((l) => (
                  <tr key={l.id}>
                    <td className="font-medium">{l.label}</td>
                    <td className="text-ink-500">{l.type.replace(/_/g, " ")}</td>
                    <td className="text-ink-500">{l.lender ?? "—"}</td>
                    <td className="text-ink-500">{l.interestRate != null ? `${l.interestRate}% ${l.interestType ?? ""}` : "—"}</td>
                    <td className="text-right tabular-nums">{formatCurrency(l.outstanding, l.currency ?? h.currency, region)}</td>
                    <td className="text-right tabular-nums">{formatCurrency(l.emiMonthly ?? 0, l.currency ?? h.currency, region)}</td>
                    <td className="text-right">
                      <form action={deleteLiabilityAction}>
                        <input type="hidden" name="householdId" value={h.id} />
                        <input type="hidden" name="id" value={l.id} />
                        <button className="btn-ghost text-xs">Remove</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="font-semibold">Add liability</h2></div>
        <form action={createLiabilityAction} className="card-body grid gap-3 md:grid-cols-2">
          <input type="hidden" name="householdId" value={h.id} />
          <div>
            <label className="label">Label</label>
            <input className="input" name="label" required />
          </div>
          <div>
            <label className="label">Type</label>
            <select name="type" className="input" defaultValue="HOME_LOAN">
              {TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Lender</label>
            <input className="input" name="lender" />
          </div>
          <div>
            <label className="label">Outstanding ({h.currency})</label>
            <input className="input tabular-nums" name="outstanding" type="number" required min="0" step="1" />
          </div>
          <div>
            <label className="label">Interest rate (%)</label>
            <input className="input tabular-nums" name="interestRate" type="number" step="0.01" min="0" />
          </div>
          <div>
            <label className="label">Interest type</label>
            <select name="interestType" className="input" defaultValue="FIXED">
              <option value="FIXED">Fixed</option>
              <option value="FLOATING">Floating</option>
            </select>
          </div>
          <div>
            <label className="label">Tenure remaining (months)</label>
            <input className="input tabular-nums" name="tenureMonths" type="number" min="0" />
          </div>
          <div>
            <label className="label">Monthly EMI</label>
            <input className="input tabular-nums" name="emiMonthly" type="number" min="0" step="1" />
          </div>
          <div className="md:col-span-2">
            <button className="btn-primary">Add liability</button>
          </div>
        </form>
      </div>
    </div>
  );
}
