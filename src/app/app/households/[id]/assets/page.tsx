"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate, uid } from "@/lib/store";
import { formatMoney, parseAmount } from "@/lib/format";
import { ASSET_CLASSES } from "@/lib/types";

export default function AssetsPage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const household = db.households.find((h) => h.id === householdId);
  const assets = db.assets.filter((a) => a.householdId === householdId);
  const [open, setOpen] = useState(false);

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const total = assets.reduce((s, a) => s + a.currentValue, 0);

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const label = String(fd.get("label") ?? "").trim();
    const assetClass = String(fd.get("assetClass") ?? "Cash");
    const value = parseAmount(String(fd.get("value") ?? ""));
    const notes = String(fd.get("notes") ?? "").trim();
    if (!label || value <= 0) return;

    update((curr) => ({
      ...curr,
      assets: [
        ...curr.assets,
        {
          id: uid("ast"),
          householdId,
          label,
          assetClass,
          currentValue: value,
          notes: notes || undefined,
        },
      ],
    }));
    form.reset();
    setOpen(false);
  }

  function handleRemove(id: string) {
    update((curr) => ({
      ...curr,
      assets: curr.assets.filter((a) => a.id !== id),
    }));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Assets</h2>
          <p className="text-sm text-ink-500 mt-1">
            Total: <span className="font-semibold tabular-nums">{fmt(total)}</span>
          </p>
        </div>
        {!open ? (
          <button onClick={() => setOpen(true)} className="btn-primary text-sm">
            Add asset
          </button>
        ) : null}
      </div>

      {open ? (
        <form onSubmit={handleAdd} className="card card-pad grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Label</label>
            <input className="input" name="label" required placeholder="e.g. HDFC savings" autoFocus />
          </div>
          <div>
            <label className="label">Class</label>
            <select className="input" name="assetClass" defaultValue="Cash">
              {ASSET_CLASSES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Current value ({household.currency})</label>
            <input className="input" name="value" inputMode="decimal" required placeholder="0" />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input" name="notes" />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button className="btn-primary text-sm" type="submit">
              Save asset
            </button>
            <button type="button" className="btn-ghost text-sm" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {assets.length === 0 ? (
        <div className="card card-pad text-center text-sm text-ink-500">
          No assets added yet.
        </div>
      ) : (
        <ul className="card divide-y divide-line-100">
          {assets.map((a) => (
            <li key={a.id} className="px-5 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{a.label}</p>
                <p className="text-xs text-ink-500 mt-0.5">
                  {a.assetClass}
                  {a.notes ? ` · ${a.notes}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="text-sm font-semibold tabular-nums">{fmt(a.currentValue)}</p>
                <button onClick={() => handleRemove(a.id)} className="btn-danger text-xs">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
