import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { createGoalAction, deleteGoalAction } from "./actions";
import { formatCurrency } from "@/lib/utils";
import { projectGoals } from "@/lib/analytics/engine";

const TYPES = [
  "EMERGENCY", "RETIREMENT", "CHILD_EDUCATION", "CHILD_MARRIAGE", "HOME_PURCHASE", "VEHICLE",
  "TRAVEL", "PARENTAL_SUPPORT", "HEALTHCARE_RESERVE", "PASSIVE_INCOME", "LEGACY",
  "BUSINESS_LAUNCH", "DEBT_FREEDOM", "CHARITABLE", "OTHER",
];

export default async function GoalsPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");
  const region = h.region as "IN" | "GCC" | "GLOBAL";

  const projections = projectGoals(h as any);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold">Goals</h2>
          <span className="text-xs text-ink-500">{h.goals.length} goal(s)</span>
        </div>
        <div className="card-body">
          {h.goals.length === 0 ? (
            <p className="text-sm text-ink-500">No goals yet. Add one below.</p>
          ) : (
            <table className="w-full table">
              <thead>
                <tr>
                  <th>Label</th><th>Type</th><th>Priority</th><th>Horizon</th>
                  <th className="text-right">Today</th><th className="text-right">Future</th>
                  <th className="text-right">Required SIP</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {h.goals.map((g) => {
                  const proj = projections.find((p) => p.goalId === g.id);
                  return (
                    <tr key={g.id}>
                      <td className="font-medium">{g.label}</td>
                      <td className="text-ink-500">{g.type.replace(/_/g, " ")}</td>
                      <td>{g.priority}</td>
                      <td className="text-ink-500">{proj?.yearsToGoal} yrs</td>
                      <td className="text-right tabular-nums">{formatCurrency(g.targetAmountToday, g.currency ?? h.currency, region)}</td>
                      <td className="text-right tabular-nums">{proj ? formatCurrency(proj.futureTarget, g.currency ?? h.currency, region) : "—"}</td>
                      <td className="text-right tabular-nums">{proj ? formatCurrency(proj.monthlySIPRequired, g.currency ?? h.currency, region) : "—"}</td>
                      <td>
                        {proj?.onTrack ? <span className="chip-positive">On track</span>
                          : (proj?.feasibility ?? 0) >= 0.6 ? <span className="chip-low">Watch</span>
                          : <span className="chip-warn">At risk</span>}
                      </td>
                      <td className="text-right">
                        <form action={deleteGoalAction}>
                          <input type="hidden" name="householdId" value={h.id} />
                          <input type="hidden" name="id" value={g.id} />
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
        <div className="card-header"><h2 className="font-semibold">Add goal</h2></div>
        <form action={createGoalAction} className="card-body grid gap-3 md:grid-cols-2">
          <input type="hidden" name="householdId" value={h.id} />
          <div>
            <label className="label">Label</label>
            <input className="input" name="label" required />
          </div>
          <div>
            <label className="label">Type</label>
            <select name="type" className="input" defaultValue="RETIREMENT">
              {TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Target amount in today&apos;s {h.currency}</label>
            <input className="input tabular-nums" name="targetAmountToday" type="number" required min="0" step="1" />
          </div>
          <div>
            <label className="label">Target year</label>
            <input className="input tabular-nums" name="targetYear" type="number" required min={new Date().getFullYear() + 1} defaultValue={new Date().getFullYear() + 10} />
          </div>
          <div>
            <label className="label">Priority (1 = highest)</label>
            <input className="input tabular-nums" name="priority" type="number" min="1" max="5" defaultValue="3" />
          </div>
          <div>
            <label className="label">Inflation category</label>
            <select name="inflationCategory" className="input" defaultValue="GENERAL">
              <option value="GENERAL">General</option>
              <option value="HEALTHCARE">Healthcare</option>
              <option value="EDUCATION">Education</option>
            </select>
          </div>
          <div>
            <label className="label">Flexibility</label>
            <select name="flexibility" className="input" defaultValue="SOFT">
              <option value="FIXED">Fixed</option>
              <option value="SOFT">Soft</option>
              <option value="HIGHLY_FLEXIBLE">Highly flexible</option>
            </select>
          </div>
          <div>
            <label className="label">Linked to person (optional)</label>
            <select name="linkedPersonId" className="input" defaultValue="">
              <option value="">—</option>
              {h.persons.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <button className="btn-primary">Add goal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
