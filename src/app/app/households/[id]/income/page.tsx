import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { createIncomeAction, deleteIncomeAction } from "./actions";
import { formatCurrency } from "@/lib/utils";

const INCOME_TYPES = [
  "SALARY",
  "BUSINESS",
  "CONSULTING",
  "RENTAL",
  "DIVIDENDS",
  "INTEREST",
  "PENSION",
  "ANNUITY",
  "RSU_VEST",
  "FAMILY_SUPPORT_IN",
  "VARIABLE",
  "OTHER",
];

export default async function IncomePage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");
  const region = h.region as "IN" | "GCC" | "GLOBAL";

  const total = h.incomes.reduce((s, i) => s + i.amountMonthly, 0);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold">Income sources</h2>
          <span className="text-xs text-ink-500">Total: {formatCurrency(total, h.currency, region)}/month</span>
        </div>
        <div className="card-body">
          {h.incomes.length === 0 ? (
            <p className="text-sm text-ink-500">No income captured yet. Add your first source on the right.</p>
          ) : (
            <table className="w-full table">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Type</th>
                  <th>Label</th>
                  <th>Variability</th>
                  <th className="text-right">Monthly</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {h.incomes.map((i) => {
                  const p = h.persons.find((x) => x.id === i.personId);
                  return (
                    <tr key={i.id}>
                      <td>{p?.fullName ?? "—"}</td>
                      <td className="text-ink-500">{i.type}</td>
                      <td>{i.label}</td>
                      <td className="text-ink-500">{i.variability}</td>
                      <td className="text-right tabular-nums">{formatCurrency(i.amountMonthly, i.currency ?? h.currency, region)}</td>
                      <td className="text-right">
                        <form action={deleteIncomeAction}>
                          <input type="hidden" name="householdId" value={h.id} />
                          <input type="hidden" name="id" value={i.id} />
                          <button className="btn-ghost text-xs">Remove</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="font-semibold">Add income source</h2></div>
        <form action={createIncomeAction} className="card-body grid gap-3 md:grid-cols-2">
          <input type="hidden" name="householdId" value={h.id} />
          <div>
            <label className="label">Person</label>
            <select className="input" name="personId" required>
              {h.persons.map((p) => (
                <option key={p.id} value={p.id}>{p.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Type</label>
            <select name="type" className="input" defaultValue="SALARY">
              {INCOME_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Label</label>
            <input className="input" name="label" required placeholder="e.g., Primary salary" />
          </div>
          <div>
            <label className="label">Monthly amount ({h.currency})</label>
            <input className="input tabular-nums" name="amountMonthly" type="number" required min="0" step="1" />
          </div>
          <div>
            <label className="label">Variability</label>
            <select name="variability" className="input" defaultValue="STABLE">
              <option value="STABLE">Stable</option>
              <option value="MODERATE">Moderate</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div>
            <label className="label">Expected stability (years)</label>
            <input className="input tabular-nums" name="stabilityYears" type="number" min="0" />
          </div>
          <div className="md:col-span-2">
            <button className="btn-primary w-full md:w-auto">Add income</button>
          </div>
        </form>
      </div>
    </div>
  );
}
