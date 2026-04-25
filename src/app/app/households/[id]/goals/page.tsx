"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate } from "@/lib/store";
import { selectAssets, selectGoals, selectHousehold } from "@/lib/selectors";
import { addGoal, removeGoal, updateGoal } from "@/lib/mutations";
import { goalProgress } from "@/lib/metrics";
import { parseGoal } from "@/lib/validation";
import { formatMoney } from "@/lib/format";
import { GOAL_TYPES, Goal } from "@/lib/types";
import {
  Button,
  Card,
  Dialog,
  EmptyState,
  Field,
  Input,
  PageHeader,
  SearchInput,
  Select,
  Textarea,
  matchesQuery,
  useDialog,
  useToast,
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
  const toast = useToast();
  const household = selectHousehold(db, householdId);
  const goals = selectGoals(db, householdId);
  const assets = selectAssets(db, householdId);
  const dialog = useDialog<Goal>();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  const filtered = useMemo(
    () =>
      goals.filter((g) => matchesQuery(query, g.label, g.type, g.notes)),
    [goals, query],
  );

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const total = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalFunded = goals.reduce(
    (s, g) =>
      s +
      assets
        .filter((a) => g.linkedAssetIds.includes(a.id))
        .reduce((x, a) => x + a.currentValue, 0),
    0,
  );
  const overallPct = total > 0 ? Math.min(totalFunded / total, 1) : 0;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = parseGoal(new FormData(e.currentTarget));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (dialog.item) {
      update(updateGoal(dialog.item.id, result.value));
      toast.success(`Updated ${result.value.label}.`);
    } else {
      update(addGoal(householdId, result.value));
      toast.success(`Added ${result.value.label}.`);
    }
    dialog.close();
  }

  function handleDelete(item: Goal) {
    if (!window.confirm(`Remove ${item.label}?`)) return;
    update(removeGoal(item.id));
    toast.success(`Removed ${item.label}.`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        subtitle={
          <>
            <span className="font-semibold tabular-nums text-ink-900">{fmt(total)}</span>{" "}
            target
            {total > 0 ? (
              <>
                {" "}
                ·{" "}
                <span className="font-semibold tabular-nums text-ink-900">
                  {(overallPct * 100).toFixed(0)}%
                </span>{" "}
                funded ({fmt(totalFunded)})
              </>
            ) : null}
          </>
        }
        action={
          <Button variant="primary" onClick={() => { setError(null); dialog.openFor(null); }}>
            Add goal
          </Button>
        }
      />

      {goals.length === 0 ? (
        <EmptyState
          title="No goals yet"
          description="Retirement, child education, home, travel — anything you're saving toward."
          action={
            <Button variant="primary" onClick={() => { setError(null); dialog.openFor(null); }}>
              Add the first goal
            </Button>
          }
        />
      ) : (
        <>
          <SearchInput
            placeholder="Search goals…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {filtered.length === 0 ? (
            <p className="text-sm text-ink-500">No matches for "{query}".</p>
          ) : (
            <ul className="grid gap-3">
              {[...filtered]
                .sort((a, b) => a.priority - b.priority || a.targetYear - b.targetYear)
                .map((g) => {
                  const progress = goalProgress(db, householdId, g.id);
                  const pct = progress?.pct ?? 0;
                  const yearsAway = g.targetYear - currentYear;
                  const priorityLabel =
                    PRIORITIES.find((p) => p.value === g.priority)?.label ?? "Medium";
                  return (
                    <li key={g.id}>
                      <Card>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{g.label}</p>
                            <p className="text-xs text-ink-500 mt-0.5">
                              {g.type} · {priorityLabel} ·{" "}
                              {yearsAway > 0
                                ? `in ${yearsAway} yr${yearsAway === 1 ? "" : "s"} (${g.targetYear})`
                                : `due ${g.targetYear}`}
                              {g.notes ? ` · ${g.notes}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button size="sm" variant="ghost" onClick={() => { setError(null); dialog.openFor(g); }}>
                              Edit
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(g)}>
                              Delete
                            </Button>
                          </div>
                        </div>

                        <div className="mt-4 flex items-baseline justify-between text-xs text-ink-500">
                          <span>
                            {progress ? fmt(progress.funded) : fmt(0)} of {fmt(g.targetAmount)}
                          </span>
                          <span className="text-ink-700 font-medium">
                            {(pct * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 bg-line-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-deep rounded-full transition-all"
                            style={{ width: `${Math.max(pct * 100, 2)}%` }}
                          />
                        </div>

                        {g.linkedAssetIds.length > 0 ? (
                          <p className="text-[11px] text-ink-500 mt-2">
                            Funded by{" "}
                            {g.linkedAssetIds
                              .map((id) => assets.find((a) => a.id === id)?.label)
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        ) : assets.length > 0 ? (
                          <p className="text-[11px] text-ink-500 mt-2">
                            Edit this goal to link assets that fund it.
                          </p>
                        ) : null}
                      </Card>
                    </li>
                  );
                })}
            </ul>
          )}
        </>
      )}

      <Dialog
        open={dialog.open}
        onClose={dialog.close}
        title={dialog.item ? "Edit goal" : "Add goal"}
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
          {error ? (
            <div className="text-xs text-severity-critical bg-red-50 px-3 py-2 rounded-button">
              {error}
            </div>
          ) : null}
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
            <Field label={`Target amount (${household.currency})`} htmlFor="targetAmount">
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

          {assets.length > 0 ? (
            <Field
              label="Funded by"
              hint="Pick the assets that count toward this goal."
            >
              <div className="grid gap-1.5 max-h-40 overflow-y-auto border border-line-200 rounded-button p-2">
                {assets.map((a) => (
                  <label
                    key={a.id}
                    className="flex items-center justify-between gap-3 text-sm px-2 py-1 rounded-button hover:bg-brand-mint/30"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <input
                        type="checkbox"
                        name="linkedAssetIds"
                        value={a.id}
                        defaultChecked={dialog.item?.linkedAssetIds.includes(a.id) ?? false}
                        className="size-4 accent-brand-deep"
                      />
                      <span className="truncate">{a.label}</span>
                      <span className="text-xs text-ink-500">{a.assetClass}</span>
                    </span>
                    <span className="text-xs text-ink-500 tabular-nums">
                      {fmt(a.currentValue)}
                    </span>
                  </label>
                ))}
              </div>
            </Field>
          ) : null}

          <Field label="Notes" htmlFor="notes">
            <Textarea id="notes" name="notes" defaultValue={dialog.item?.notes ?? ""} />
          </Field>

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
