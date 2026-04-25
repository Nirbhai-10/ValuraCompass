"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate, uid } from "@/lib/store";
import { formatMoney, parseAmount } from "@/lib/format";
import { POLICY_TYPES } from "@/lib/types";

export default function InsurancePage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const household = db.households.find((h) => h.id === householdId);
  const policies = db.policies.filter((p) => p.householdId === householdId);
  const [open, setOpen] = useState(false);

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const totalCover = policies.reduce((s, p) => s + p.sumAssured, 0);
  const totalPremium = policies.reduce((s, p) => s + (p.premiumAnnual ?? 0), 0);

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const label = String(fd.get("label") ?? "").trim();
    const type = String(fd.get("type") ?? "Term life");
    const insurer = String(fd.get("insurer") ?? "").trim();
    const sumAssured = parseAmount(String(fd.get("sumAssured") ?? ""));
    const premium = parseAmount(String(fd.get("premium") ?? ""));
    if (!label || sumAssured <= 0) return;

    update((curr) => ({
      ...curr,
      policies: [
        ...curr.policies,
        {
          id: uid("pol"),
          householdId,
          label,
          type,
          insurer: insurer || undefined,
          sumAssured,
          premiumAnnual: premium > 0 ? premium : undefined,
        },
      ],
    }));
    form.reset();
    setOpen(false);
  }

  function handleRemove(id: string) {
    update((curr) => ({
      ...curr,
      policies: curr.policies.filter((p) => p.id !== id),
    }));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Insurance</h2>
          <p className="text-sm text-ink-500 mt-1">
            Total cover: <span className="font-semibold tabular-nums">{fmt(totalCover)}</span>
            {totalPremium > 0 ? <> · Annual premium <span className="font-semibold tabular-nums">{fmt(totalPremium)}</span></> : null}
          </p>
        </div>
        {!open ? (
          <button onClick={() => setOpen(true)} className="btn-primary text-sm">
            Add policy
          </button>
        ) : null}
      </div>

      {open ? (
        <form onSubmit={handleAdd} className="card card-pad grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Label</label>
            <input className="input" name="label" required placeholder="e.g. LIC term plan" autoFocus />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" name="type" defaultValue="Term life">
              {POLICY_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Insurer (optional)</label>
            <input className="input" name="insurer" placeholder="e.g. LIC, HDFC Life" />
          </div>
          <div>
            <label className="label">Sum assured ({household.currency})</label>
            <input className="input" name="sumAssured" inputMode="decimal" required placeholder="0" />
          </div>
          <div>
            <label className="label">Annual premium (optional)</label>
            <input className="input" name="premium" inputMode="decimal" placeholder="0" />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button className="btn-primary text-sm" type="submit">
              Save policy
            </button>
            <button type="button" className="btn-ghost text-sm" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {policies.length === 0 ? (
        <div className="card card-pad text-center text-sm text-ink-500">
          No policies added yet.
        </div>
      ) : (
        <ul className="card divide-y divide-line-100">
          {policies.map((p) => (
            <li key={p.id} className="px-5 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{p.label}</p>
                <p className="text-xs text-ink-500 mt-0.5">
                  {p.type}
                  {p.insurer ? ` · ${p.insurer}` : ""}
                  {p.premiumAnnual ? ` · ${fmt(p.premiumAnnual)} / yr` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="text-sm font-semibold tabular-nums">{fmt(p.sumAssured)}</p>
                <button onClick={() => handleRemove(p.id)} className="btn-danger text-xs">
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
