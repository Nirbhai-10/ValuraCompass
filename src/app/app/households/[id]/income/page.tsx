"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate, uid } from "@/lib/store";
import { formatMoney, parseAmount } from "@/lib/format";
import { INCOME_TYPES } from "@/lib/types";

export default function IncomePage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const household = db.households.find((h) => h.id === householdId);
  const persons = db.persons.filter((p) => p.householdId === householdId);
  const incomes = db.incomes.filter((i) => i.householdId === householdId);
  const [open, setOpen] = useState(false);

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const total = incomes.reduce((s, i) => s + i.amountMonthly, 0);

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const label = String(fd.get("label") ?? "").trim();
    const type = String(fd.get("type") ?? "Salary");
    const amount = parseAmount(String(fd.get("amount") ?? ""));
    const personId = String(fd.get("personId") ?? "") || undefined;
    if (!label || amount <= 0) return;

    update((curr) => ({
      ...curr,
      incomes: [
        ...curr.incomes,
        {
          id: uid("inc"),
          householdId,
          label,
          type,
          amountMonthly: amount,
          personId,
        },
      ],
    }));
    form.reset();
    setOpen(false);
  }

  function handleRemove(id: string) {
    update((curr) => ({
      ...curr,
      incomes: curr.incomes.filter((i) => i.id !== id),
    }));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Income</h2>
          <p className="text-sm text-ink-500 mt-1">
            Total: <span className="font-semibold tabular-nums">{fmt(total)}</span> / month
          </p>
        </div>
        {!open ? (
          <button onClick={() => setOpen(true)} className="btn-primary text-sm">
            Add income
          </button>
        ) : null}
      </div>

      {open ? (
        <form onSubmit={handleAdd} className="card card-pad grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Label</label>
            <input className="input" name="label" required placeholder="e.g. Salary" autoFocus />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" name="type" defaultValue="Salary">
              {INCOME_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Monthly amount ({household.currency})</label>
            <input className="input" name="amount" inputMode="decimal" required placeholder="0" />
          </div>
          <div>
            <label className="label">Earner (optional)</label>
            <select className="input" name="personId" defaultValue="">
              <option value="">— Unassigned —</option>
              {persons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button className="btn-primary text-sm" type="submit">
              Save income
            </button>
            <button type="button" className="btn-ghost text-sm" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {incomes.length === 0 ? (
        <div className="card card-pad text-center text-sm text-ink-500">
          No income added yet.
        </div>
      ) : (
        <ul className="card divide-y divide-line-100">
          {incomes.map((i) => {
            const earner = persons.find((p) => p.id === i.personId);
            return (
              <li key={i.id} className="px-5 py-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{i.label}</p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {i.type}
                    {earner ? ` · ${earner.fullName}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="text-sm font-semibold tabular-nums">{fmt(i.amountMonthly)}</p>
                  <button onClick={() => handleRemove(i.id)} className="btn-danger text-xs">
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
