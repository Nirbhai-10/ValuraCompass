import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { createExpenseAction, deleteExpenseAction } from "./actions";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES = [
  "HOUSING", "UTILITIES", "GROCERIES", "TRANSPORT", "INSURANCE_PREMIUMS", "EDUCATION", "HEALTHCARE",
  "PARENTAL_SUPPORT", "SPECIAL_NEEDS_CARE", "STAFF", "ENTERTAINMENT", "DINING", "TRAVEL",
  "SUBSCRIPTIONS", "DEBT_SERVICE", "CHARITABLE", "CHILDREN_COSTS", "OTHER",
];

export default async function ExpensesPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");
  const region = h.region as "IN" | "GCC" | "GLOBAL";

  const essential = h.expenses.filter((e) => e.essential).reduce((s, e) => s + e.amountMonthly, 0);
  const disc = h.expenses.filter((e) => !e.essential).reduce((s, e) => s + e.amountMonthly, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="kpi"><p className="kpi-title">Essential monthly</p><p className="kpi-value">{formatCurrency(essential, h.currency, region)}</p></div>
        <div className="kpi"><p className="kpi-title">Discretionary monthly</p><p className="kpi-value">{formatCurrency(disc, h.currency, region)}</p></div>
        <div className="kpi"><p className="kpi-title">Total monthly</p><p className="kpi-value">{formatCurrency(essential + disc, h.currency, region)}</p></div>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold">Expense lines</h2>
          <span className="text-xs text-ink-500">{h.expenses.length} line{h.expenses.length === 1 ? "" : "s"}</span>
        </div>
        <div className="card-body">
          {h.expenses.length === 0 ? (
            <p className="text-sm text-ink-500">No expenses captured yet. Add your first line below.</p>
          ) : (
            <table className="w-full table">
              <thead>
                <tr><th>Category</th><th>Label</th><th>Essential</th><th>Inflation</th><th className="text-right">Monthly</th><th></th></tr>
              </thead>
              <tbody>
                {h.expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="text-ink-500">{e.category.replace(/_/g, " ")}</td>
                    <td>{e.label ?? "—"}</td>
                    <td>{e.essential ? <span className="chip-positive">Essential</span> : <span className="chip-default">Discretionary</span>}</td>
                    <td className="text-ink-500">{e.inflationSensitivity}</td>
                    <td className="text-right tabular-nums">{formatCurrency(e.amountMonthly, e.currency ?? h.currency, region)}</td>
                    <td className="text-right">
                      <form action={deleteExpenseAction}>
                        <input type="hidden" name="householdId" value={h.id} />
                        <input type="hidden" name="id" value={e.id} />
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
        <div className="card-header"><h2 className="font-semibold">Add expense</h2></div>
        <form action={createExpenseAction} className="card-body grid gap-3 md:grid-cols-2">
          <input type="hidden" name="householdId" value={h.id} />
          <div>
            <label className="label">Category</label>
            <select name="category" className="input" defaultValue="HOUSING">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Label (optional)</label>
            <input className="input" name="label" placeholder="e.g., Rent / EMI / Groceries" />
          </div>
          <div>
            <label className="label">Monthly amount ({h.currency})</label>
            <input className="input tabular-nums" name="amountMonthly" type="number" required min="0" step="1" />
          </div>
          <div>
            <label className="label">Inflation sensitivity</label>
            <select name="inflationSensitivity" className="input" defaultValue="GENERAL">
              <option value="GENERAL">General</option>
              <option value="HEALTHCARE">Healthcare</option>
              <option value="EDUCATION">Education</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="essential" defaultChecked /> Essential (mandatory)</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="nonNegotiable" /> Non-negotiable</label>
          <div className="md:col-span-2">
            <button className="btn-primary">Add expense</button>
          </div>
        </form>
      </div>
    </div>
  );
}
