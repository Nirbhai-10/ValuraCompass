import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { computeScores } from "@/lib/analytics/engine";
import { categorySuitability } from "@/lib/analytics/suitability";
import { saveRiskAction } from "./actions";
import { ScoreCard } from "@/components/score-card";

export default async function RiskPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");
  const scores = computeScores(h as any);
  const rows = categorySuitability(h as any, scores);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <ScoreCard score={scores.RPS} emphasis />
        <ScoreCard score={scores.ISS} />
      </div>

      <div className="card">
        <div className="card-header"><h2 className="font-semibold">Risk profile (stated)</h2></div>
        <form action={saveRiskAction} className="card-body grid gap-3 md:grid-cols-2">
          <input type="hidden" name="householdId" value={h.id} />
          <div>
            <label className="label">Stated tolerance</label>
            <select name="stated" className="input" defaultValue={h.riskProfile?.stated ?? "BALANCED"}>
              <option value="CONSERVATIVE">Conservative</option>
              <option value="MOD_CONSERVATIVE">Moderately Conservative</option>
              <option value="BALANCED">Balanced</option>
              <option value="GROWTH">Growth</option>
              <option value="AGGRESSIVE">Aggressive</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Rationale / notes (advisor)</label>
            <textarea className="textarea" name="rationale" rows={3} defaultValue={h.riskProfile?.rationale ?? ""}></textarea>
          </div>
          <div className="md:col-span-2">
            <button className="btn-primary">Save risk profile</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Investment suitability (category guardrails)</h2>
          <p className="text-xs text-ink-500 mt-1">
            Planning-level guidance only. Specific product recommendations require advisor sign-off.
          </p>
        </div>
        <div className="card-body">
          <table className="w-full table">
            <thead>
              <tr><th>Category</th><th>Decision</th><th>Rationale</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.category}>
                  <td>{r.label}</td>
                  <td>
                    {r.decision === "ALLOWED" ? <span className="chip-positive">Allowed</span>
                      : r.decision === "FLAGGED" ? <span className="chip-warn">Flagged</span>
                      : <span className="chip-critical">Restricted</span>}
                  </td>
                  <td className="text-ink-500">{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
