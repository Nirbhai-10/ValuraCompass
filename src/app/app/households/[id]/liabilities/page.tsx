"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate, uid } from "@/lib/store";
import { formatMoney, parseAmount } from "@/lib/format";
import { LIABILITY_TYPES } from "@/lib/types";

export default function LiabilitiesPage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const household = db.households.find((h) => h.id === householdId);
  const liabilities = db.liabilities.filter((l) => l.householdId === householdId);
  const [open, setOpen] = useState(false);

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const total = liabilities.reduce((s, l) => s + l.outstanding, 0);
  const totalEmi = liabilities.reduce((s, l) => s + (l.emiMonthly ?? 0), 0);

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const label = String(fd.get("label") ?? "").trim();
    const type = String(fd.get("type") ?? "Other");
    const outstanding = parseAmount(String(fd.get("outstanding") ?? ""));
    const emi = parseAmount(String(fd.get("emi") ?? ""));
    const rate = parseAmount(String(fd.get("rate") ?? ""));
    if (!label || outstanding <= 0) return;

    update((curr) => ({
      ...curr,
      liabilities: [
        ...curr.liabilities,
        {
          id: uid("lia"),
          householdId,
          label,
          type,
          outstanding,
          emiMonthly: emi > 0 ? emi : undefined,
          interestRate: rate > 0 ? rate : undefined,
        },
      ],
    }));
    form.reset();
    setOpen(false);
  }

  function handleRemove(id: string) {
    update((curr) => ({
      ...curr,
      liabilities: curr.liabilities.filter((l) => l.id !== id),
    }));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Liabilities</h2>
          <p className="text-sm text-ink-500 mt-1">
            Total: <span className="font-semibold tabular-nums">{fmt(total)}</span>
            {totalEmi > 0 ? <> · EMIs <span className="font-semibold tabular-nums">{fmt(totalEmi)}</span> / mo</> : null}
          </p>
        </div>
        {!open ? (
          <button onClick={() => setOpen(true)} className="btn-primary text-sm">
            Add liability
          </button>
        ) : null}
      </div>

      {open ? (
        <form onSubmit={handleAdd} className="card card-pad grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Label</label>
            <input className="input" name="label" required placeholder="e.g. Home loan" autoFocus />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" name="type" defaultValue="Home loan">
              {LIABILITY_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Outstanding ({household.currency})</label>
            <input className="input" name="outstanding" inputMode="decimal" required placeholder="0" />
          </div>
          <div>
            <label className="label">EMI / month (optional)</label>
            <input className="input" name="emi" inputMode="decimal" placeholder="0" />
          </div>
          <div>
            <label className="label">Interest rate % (optional)</label>
            <input className="input" name="rate" inputMode="decimal" placeholder="0" />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button className="btn-primary text-sm" type="submit">
              Save liability
            </button>
            <button type="button" className="btn-ghost text-sm" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {liabilities.length === 0 ? (
        <div className="card card-pad text-center text-sm text-ink-500">
          No liabilities added yet.
        </div>
      ) : (
        <ul className="card divide-y divide-line-100">
          {liabilities.map((l) => (
            <li key={l.id} className="px-5 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{l.label}</p>
                <p className="text-xs text-ink-500 mt-0.5">
                  {l.type}
                  {l.emiMonthly ? ` · ${fmt(l.emiMonthly)} / mo` : ""}
                  {l.interestRate ? ` · ${l.interestRate}%` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="text-sm font-semibold tabular-nums">{fmt(l.outstanding)}</p>
                <button onClick={() => handleRemove(l.id)} className="btn-danger text-xs">
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
