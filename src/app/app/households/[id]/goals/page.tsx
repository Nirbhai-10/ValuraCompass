"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate, uid } from "@/lib/store";
import { formatMoney, parseAmount } from "@/lib/format";
import { GOAL_TYPES } from "@/lib/types";

const PRIORITIES = [
  { value: 1, label: "Highest" },
  { value: 2, label: "High" },
  { value: 3, label: "Medium" },
  { value: 4, label: "Low" },
  { value: 5, label: "Lowest" },
];

export default function GoalsPage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const household = db.households.find((h) => h.id === householdId);
  const goals = db.goals.filter((g) => g.householdId === householdId);
  const [open, setOpen] = useState(false);

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const total = goals.reduce((s, g) => s + g.targetAmount, 0);
  const currentYear = new Date().getFullYear();

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const label = String(fd.get("label") ?? "").trim();
    const type = String(fd.get("type") ?? "Other");
    const targetAmount = parseAmount(String(fd.get("targetAmount") ?? ""));
    const targetYear = Number(String(fd.get("targetYear") ?? "")) || currentYear + 5;
    const priority = Number(String(fd.get("priority") ?? "3")) || 3;
    if (!label || targetAmount <= 0) return;

    update((curr) => ({
      ...curr,
      goals: [
        ...curr.goals,
        {
          id: uid("goal"),
          householdId,
          label,
          type,
          targetAmount,
          targetYear,
          priority,
        },
      ],
    }));
    form.reset();
    setOpen(false);
  }

  function handleRemove(id: string) {
    update((curr) => ({
      ...curr,
      goals: curr.goals.filter((g) => g.id !== id),
    }));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Goals</h2>
          <p className="text-sm text-ink-500 mt-1">
            Total target: <span className="font-semibold tabular-nums">{fmt(total)}</span>
          </p>
        </div>
        {!open ? (
          <button onClick={() => setOpen(true)} className="btn-primary text-sm">
            Add goal
          </button>
        ) : null}
      </div>

      {open ? (
        <form onSubmit={handleAdd} className="card card-pad grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Label</label>
            <input className="input" name="label" required placeholder="e.g. Anya's college" autoFocus />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" name="type" defaultValue="Retirement">
              {GOAL_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Target amount ({household.currency})</label>
            <input className="input" name="targetAmount" inputMode="decimal" required placeholder="0" />
          </div>
          <div>
            <label className="label">Target year</label>
            <input
              className="input"
              name="targetYear"
              type="number"
              defaultValue={currentYear + 10}
              min={currentYear}
              max={currentYear + 60}
            />
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input" name="priority" defaultValue="3">
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button className="btn-primary text-sm" type="submit">
              Save goal
            </button>
            <button type="button" className="btn-ghost text-sm" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {goals.length === 0 ? (
        <div className="card card-pad text-center text-sm text-ink-500">
          No goals added yet.
        </div>
      ) : (
        <ul className="card divide-y divide-line-100">
          {[...goals]
            .sort((a, b) => a.priority - b.priority || a.targetYear - b.targetYear)
            .map((g) => {
              const yearsAway = g.targetYear - currentYear;
              const priorityLabel =
                PRIORITIES.find((p) => p.value === g.priority)?.label ?? "Medium";
              return (
                <li key={g.id} className="px-5 py-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{g.label}</p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {g.type} · {priorityLabel} · {g.targetYear}
                      {yearsAway > 0 ? ` (in ${yearsAway} yr${yearsAway === 1 ? "" : "s"})` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-sm font-semibold tabular-nums">{fmt(g.targetAmount)}</p>
                    <button onClick={() => handleRemove(g.id)} className="btn-danger text-xs">
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
