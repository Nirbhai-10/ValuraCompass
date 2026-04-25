"use client";

import { FormEvent } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate, uid } from "@/lib/store";
import { formatMoney, parseAmount } from "@/lib/format";
import { GOAL_TYPES, Goal } from "@/lib/types";
import {
  Button,
  Dialog,
  EmptyState,
  EntityList,
  EntityRow,
  Field,
  Input,
  Select,
  PageHeader,
  useDialog,
} from "@/components/ui";

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
  const dialog = useDialog<Goal>();
  const currentYear = new Date().getFullYear();

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const total = goals.reduce((s, g) => s + g.targetAmount, 0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const label = String(fd.get("label") ?? "").trim();
    const type = String(fd.get("type") ?? "Other");
    const targetAmount = parseAmount(String(fd.get("targetAmount") ?? ""));
    const targetYear = Number(String(fd.get("targetYear") ?? "")) || currentYear + 5;
    const priority = Number(String(fd.get("priority") ?? "3")) || 3;
    if (!label || targetAmount <= 0) return;

    update((curr) => {
      const next = { label, type, targetAmount, targetYear, priority };
      if (dialog.item) {
        return {
          ...curr,
          goals: curr.goals.map((g) =>
            g.id === dialog.item!.id ? { ...g, ...next } : g,
          ),
        };
      }
      return {
        ...curr,
        goals: [...curr.goals, { id: uid("goal"), householdId, ...next }],
      };
    });
    dialog.close();
  }

  function handleDelete(id: string) {
    if (!window.confirm("Remove this goal?")) return;
    update((curr) => ({ ...curr, goals: curr.goals.filter((g) => g.id !== id) }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        subtitle={
          <>
            Total target:{" "}
            <span className="font-semibold tabular-nums text-ink-900">{fmt(total)}</span>{" "}
            across {goals.length} goal{goals.length === 1 ? "" : "s"}.
          </>
        }
        action={
          <Button variant="primary" onClick={() => dialog.openFor(null)}>
            Add goal
          </Button>
        }
      />

      {goals.length === 0 ? (
        <EmptyState
          title="No goals yet"
          description="Retirement, child education, home, travel — anything you're saving toward."
          action={
            <Button variant="primary" onClick={() => dialog.openFor(null)}>
              Add the first goal
            </Button>
          }
        />
      ) : (
        <EntityList>
          {[...goals]
            .sort((a, b) => a.priority - b.priority || a.targetYear - b.targetYear)
            .map((g) => {
              const yearsAway = g.targetYear - currentYear;
              const priorityLabel =
                PRIORITIES.find((p) => p.value === g.priority)?.label ?? "Medium";
              return (
                <EntityRow
                  key={g.id}
                  primary={g.label}
                  secondary={
                    <>
                      {g.type} · {priorityLabel} ·{" "}
                      {yearsAway > 0
                        ? `in ${yearsAway} yr${yearsAway === 1 ? "" : "s"} (${g.targetYear})`
                        : `due ${g.targetYear}`}
                    </>
                  }
                  trailing={fmt(g.targetAmount)}
                  onEdit={() => dialog.openFor(g)}
                  onDelete={() => handleDelete(g.id)}
                />
              );
            })}
        </EntityList>
      )}

      <Dialog
        open={dialog.open}
        onClose={dialog.close}
        title={dialog.item ? "Edit goal" : "Add goal"}
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Label" htmlFor="label">
            <Input
              id="label"
              name="label"
              required
              autoFocus
              placeholder="e.g. Anya's college"
              defaultValue={dialog.item?.label ?? ""}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Type" htmlFor="type">
              <Select
                id="type"
                name="type"
                defaultValue={dialog.item?.type ?? "Retirement"}
              >
                {GOAL_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="Priority" htmlFor="priority">
              <Select
                id="priority"
                name="priority"
                defaultValue={String(dialog.item?.priority ?? 3)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label={`Target amount (${household.currency})`}
              htmlFor="targetAmount"
            >
              <Input
                id="targetAmount"
                name="targetAmount"
                inputMode="decimal"
                required
                placeholder="0"
                defaultValue={dialog.item?.targetAmount ?? ""}
              />
            </Field>
            <Field label="Target year" htmlFor="targetYear">
              <Input
                id="targetYear"
                name="targetYear"
                type="number"
                defaultValue={dialog.item?.targetYear ?? currentYear + 10}
                min={currentYear}
                max={currentYear + 60}
              />
            </Field>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={dialog.close} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {dialog.item ? "Save changes" : "Add goal"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
