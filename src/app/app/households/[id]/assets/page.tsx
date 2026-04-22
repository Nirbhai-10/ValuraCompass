import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { createAssetAction, deleteAssetAction } from "./actions";
import { formatCurrency } from "@/lib/utils";

const CLASSES = [
  "CASH", "EQUITY", "DEBT", "GOLD", "REAL_ESTATE", "RETIREMENT",
  "INSURANCE_LINKED", "BUSINESS", "PRIVATE", "INTERNATIONAL", "COLLECTIBLE", "OTHER",
];

const INSTRUMENTS = [
  "SAVINGS", "FD", "PPF", "EPF", "NPS", "SSY", "SCSS", "MF_EQUITY", "MF_DEBT", "MF_HYBRID",
  "ELSS", "STOCKS", "BONDS", "NCD", "GOLD_PHY", "GOLD_SGB", "GOLD_ETF", "PROPERTY_RES",
  "PROPERTY_COM", "PROPERTY_LAND", "ULIP", "ENDOWMENT", "ANNUITY", "PMS", "AIF", "UNLISTED",
  "RSU", "ESOP", "OTHER",
];

export default async function AssetsPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");
  const region = h.region as "IN" | "GCC" | "GLOBAL";

  const total = h.assets.reduce((s, a) => s + a.currentValue, 0);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold">Assets</h2>
          <span className="text-xs text-ink-500">Total: {formatCurrency(total, h.currency, region)}</span>
        </div>
        <div className="card-body">
          {h.assets.length === 0 ? (
            <p className="text-sm text-ink-500">No assets yet. Add your first below.</p>
          ) : (
            <table className="w-full table">
              <thead>
                <tr>
                  <th>Label</th><th>Class</th><th>Instrument</th><th>Liquidity</th><th>Ownership</th><th className="text-right">Value</th><th></th>
                </tr>
              </thead>
              <tbody>
                {h.assets.map((a) => (
                  <tr key={a.id}>
                    <td className="font-medium">{a.label}</td>
                    <td className="text-ink-500">{a.assetClass}</td>
                    <td className="text-ink-500">{a.instrument ?? "—"}</td>
                    <td className="text-ink-500">{a.liquidityBucket}</td>
                    <td className="text-ink-500">{a.ownershipType}</td>
                    <td className="text-right tabular-nums">{formatCurrency(a.currentValue, a.currency ?? h.currency, region)}</td>
                    <td className="text-right">
                      <form action={deleteAssetAction}>
                        <input type="hidden" name="householdId" value={h.id} />
                        <input type="hidden" name="id" value={a.id} />
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
        <div className="card-header"><h2 className="font-semibold">Add asset</h2></div>
        <form action={createAssetAction} className="card-body grid gap-3 md:grid-cols-2">
          <input type="hidden" name="householdId" value={h.id} />
          <div>
            <label className="label">Label</label>
            <input className="input" name="label" required />
          </div>
          <div>
            <label className="label">Value ({h.currency})</label>
            <input className="input tabular-nums" name="currentValue" type="number" required min="0" step="1" />
          </div>
          <div>
            <label className="label">Asset class</label>
            <select name="assetClass" className="input" defaultValue="EQUITY">
              {CLASSES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Instrument</label>
            <select name="instrument" className="input" defaultValue="MF_EQUITY">
              {INSTRUMENTS.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Liquidity bucket</label>
            <select name="liquidityBucket" className="input" defaultValue="D30">
              <option value="T0">T+0 (same day)</option>
              <option value="T2">T+2</option>
              <option value="D30">30 days</option>
              <option value="D90">90 days</option>
              <option value="Y1">1 year</option>
              <option value="ILLIQUID">Illiquid</option>
            </select>
          </div>
          <div>
            <label className="label">Ownership</label>
            <select name="ownershipType" className="input" defaultValue="SOLE">
              <option value="SOLE">Sole</option>
              <option value="JOINT_SPOUSE">Joint with spouse</option>
              <option value="JOINT_OTHER">Joint with other</option>
              <option value="HUF">HUF</option>
              <option value="TRUST">Trust</option>
              <option value="ENTITY">Entity</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button className="btn-primary">Add asset</button>
          </div>
        </form>
      </div>
    </div>
  );
}
