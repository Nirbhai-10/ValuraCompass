"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate, uid } from "@/lib/store";
import { formatMoney, parseAmount } from "@/lib/format";
import { EXPENSE_CATEGORIES } from "@/lib/types";

export default function ExpensesPage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const household = db.households.find((h) => h.id === householdId);
  const expenses = db.expenses.filter((e) => e.householdId === householdId);
  const [open, setOpen] = useState(false);

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const total = expenses.reduce((s, e) => s + e.amountMonthly, 0);

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const category = String(fd.get("category") ?? "Other");
    const label = String(fd.get("label") ?? "").trim();
    const amount = parseAmount(String(fd.get("amount") ?? ""));
    const essential = fd.get("essential") === "on";
    if (amount <= 0) return;

    update((curr) => ({
      ...curr,
      expenses: [
        ...curr.expenses,
        {
          id: uid("exp"),
          householdId,
          category,
          label: label || undefined,
          amountMonthly: amount,
          essential,
        },
      ],
    }));
    form.reset();
    setOpen(false);
  }

  function handleRemove(id: string) {
    update((curr) => ({
      ...curr,
      expenses: curr.expenses.filter((e) => e.id !== id),
    }));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Expenses</h2>
          <p className="text-sm text-ink-500 mt-1">
            Total: <span className="font-semibold tabular-nums">{fmt(total)}</span> / month
          </p>
        </div>
        {!open ? (
          <button onClick={() => setOpen(true)} className="btn-primary text-sm">
            Add expense
          </button>
        ) : null}
      </div>

      {open ? (
        <form onSubmit={handleAdd} className="card card-pad grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <select className="input" name="category" defaultValue="Housing" autoFocus>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Label (optional)</label>
            <input className="input" name="label" placeholder="e.g. Apartment rent" />
          </div>
          <div>
            <label className="label">Monthly amount ({household.currency})</label>
            <input className="input" name="amount" inputMode="decimal" required placeholder="0" />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" name="essential" defaultChecked />
              Essential
            </label>
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button className="btn-primary text-sm" type="submit">
              Save expense
            </button>
            <button type="button" className="btn-ghost text-sm" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {expenses.length === 0 ? (
        <div className="card card-pad text-center text-sm text-ink-500">
          No expenses added yet.
        </div>
      ) : (
        <ul className="card divide-y divide-line-100">
          {expenses.map((e) => (
            <li key={e.id} className="px-5 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{e.label || e.category}</p>
                <p className="text-xs text-ink-500 mt-0.5">
                  {e.category}
                  {e.essential ? " · essential" : " · discretionary"}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="text-sm font-semibold tabular-nums">{fmt(e.amountMonthly)}</p>
                <button onClick={() => handleRemove(e.id)} className="btn-danger text-xs">
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
