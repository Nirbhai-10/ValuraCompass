import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { taxObservations } from "@/lib/analytics/tax";
import { saveTaxAction } from "./actions";
import { getRegion } from "@/lib/region";

export default async function TaxPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");
  const obs = taxObservations(h as any);
  const region = getRegion(h.region);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Tax-aware planning (observation only)</h2>
          <p className="text-xs text-ink-500 mt-1">{region.disclosures.taxObservation}</p>
        </div>
        <form action={saveTaxAction} className="card-body grid gap-3 md:grid-cols-3">
          <input type="hidden" name="householdId" value={h.id} />
          <div>
            <label className="label">Regime (India)</label>
            <select name="regime" className="input" defaultValue={h.taxProfile?.regime ?? ""} disabled={h.region !== "IN"}>
              <option value="">Not captured</option>
              <option value="OLD">Old</option>
              <option value="NEW">New</option>
            </select>
          </div>
          <div>
            <label className="label">Business income share (0–1)</label>
            <input className="input tabular-nums" name="businessIncomeShare" type="number" step="0.01" min="0" max="1" defaultValue={h.taxProfile?.businessIncomeShare ?? ""} />
          </div>
          <div>
            <label className="label">Complexity tags (comma-separated)</label>
            <input className="input" name="complexityTags" placeholder="RSU, rental, NRI, capital gains" defaultValue={(() => {
              try { return JSON.parse(h.taxProfile?.complexityTags ?? "[]").join(", "); } catch { return ""; }
            })()} />
          </div>
          <div className="md:col-span-3">
            <button className="btn-primary">Save tax context</button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Observations</h2>
        {obs.length === 0 ? (
          <div className="card p-6 text-sm text-ink-500">No tax observations yet.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {obs.map((o) => (
              <div key={o.id} className="card p-5">
                <div className="flex items-start gap-3 justify-between">
                  <h3 className="font-medium">{o.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={o.severity === "HIGH" ? "chip-high" : o.severity === "MEDIUM" ? "chip-warn" : "chip-low"}>{o.severity}</span>
                    {o.reviewWith !== "NONE" ? <span className="chip-default">Review with {o.reviewWith === "CA" ? "CA" : "specialist"}</span> : null}
                  </div>
                </div>
                <p className="text-sm text-ink-700 mt-2 leading-relaxed">{o.body}</p>
                <p className="text-[11px] text-ink-500 mt-2">{o.assumption}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
