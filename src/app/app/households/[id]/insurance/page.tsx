import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { createPolicyAction, deletePolicyAction } from "./actions";
import { formatCurrency } from "@/lib/utils";

const TYPES = [
  "TERM", "ULIP", "ENDOWMENT", "FAMILY_FLOATER", "INDIVIDUAL_HEALTH", "CRITICAL_ILLNESS",
  "ACCIDENTAL", "DISABILITY", "HOME", "VEHICLE", "LIABILITY", "KEYMAN", "EMPLOYER_GROUP",
];

export default async function InsurancePage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");
  const region = h.region as "IN" | "GCC" | "GLOBAL";

  const totalSA = h.policies.reduce((s, p) => s + p.sumAssured, 0);
  const totalPremium = h.policies.reduce((s, p) => s + (p.premiumAnnual ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="kpi"><p className="kpi-title">Total sum assured</p><p className="kpi-value">{formatCurrency(totalSA, h.currency, region)}</p></div>
        <div className="kpi"><p className="kpi-title">Total annual premium</p><p className="kpi-value">{formatCurrency(totalPremium, h.currency, region)}</p></div>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold">Policies</h2>
          <span className="text-xs text-ink-500">{h.policies.length} policy/policies</span>
        </div>
        <div className="card-body">
          {h.policies.length === 0 ? (
            <p className="text-sm text-ink-500">No policies captured.</p>
          ) : (
            <table className="w-full table">
              <thead>
                <tr><th>Label</th><th>Type</th><th>Insurer</th><th className="text-right">Sum assured</th><th className="text-right">Premium/yr</th><th></th></tr>
              </thead>
              <tbody>
                {h.policies.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.label}</td>
                    <td className="text-ink-500">{p.type.replace(/_/g, " ")}</td>
                    <td className="text-ink-500">{p.insurer ?? "—"}</td>
                    <td className="text-right tabular-nums">{formatCurrency(p.sumAssured, p.currency ?? h.currency, region)}</td>
                    <td className="text-right tabular-nums">{formatCurrency(p.premiumAnnual ?? 0, p.currency ?? h.currency, region)}</td>
                    <td className="text-right">
                      <form action={deletePolicyAction}>
                        <input type="hidden" name="householdId" value={h.id} />
                        <input type="hidden" name="id" value={p.id} />
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
        <div className="card-header"><h2 className="font-semibold">Add policy</h2></div>
        <form action={createPolicyAction} className="card-body grid gap-3 md:grid-cols-2">
          <input type="hidden" name="householdId" value={h.id} />
          <div>
            <label className="label">Label</label>
            <input className="input" name="label" required />
          </div>
          <div>
            <label className="label">Type</label>
            <select name="type" className="input" defaultValue="TERM">
              {TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Insurer</label>
            <input className="input" name="insurer" />
          </div>
          <div>
            <label className="label">Sum assured ({h.currency})</label>
            <input className="input tabular-nums" name="sumAssured" type="number" required min="0" step="1" />
          </div>
          <div>
            <label className="label">Annual premium ({h.currency})</label>
            <input className="input tabular-nums" name="premiumAnnual" type="number" min="0" step="1" />
          </div>
          <div>
            <label className="label">Policy term (years)</label>
            <input className="input tabular-nums" name="policyTermYears" type="number" min="0" />
          </div>
          <div className="md:col-span-2">
            <button className="btn-primary">Add policy</button>
          </div>
        </form>
      </div>
    </div>
  );
}
