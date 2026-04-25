"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate } from "@/lib/store";
import { selectExpenses, selectHousehold } from "@/lib/selectors";
import { addExpense, removeExpense, updateExpense } from "@/lib/mutations";
import { parseExpense } from "@/lib/validation";
import { formatMoney } from "@/lib/format";
import { EXPENSE_CATEGORIES, Expense } from "@/lib/types";
import {
  Button,
  Dialog,
  EmptyState,
  EntityList,
  EntityRow,
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

export default function ExpensesPage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const toast = useToast();
  const household = selectHousehold(db, householdId);
  const expenses = selectExpenses(db, householdId);
  const dialog = useDialog<Expense>();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      expenses.filter((e) =>
        matchesQuery(query, e.label, e.category, e.notes),
      ),
    [expenses, query],
  );

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const total = expenses.reduce((s, e) => s + e.amountMonthly, 0);
  const essentialTotal = expenses
    .filter((e) => e.essential)
    .reduce((s, e) => s + e.amountMonthly, 0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = parseExpense(new FormData(e.currentTarget));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const display = result.value.label || result.value.category;
    if (dialog.item) {
      update(updateExpense(dialog.item.id, result.value));
      toast.success(`Updated ${display}.`);
    } else {
      update(addExpense(householdId, result.value));
      toast.success(`Added ${display}.`);
    }
    dialog.close();
  }

  function handleDelete(item: Expense) {
    const display = item.label || item.category;
    if (!window.confirm(`Remove ${display}?`)) return;
    update(removeExpense(item.id));
    toast.success(`Removed ${display}.`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        subtitle={
          <>
            <span className="font-semibold tabular-nums text-ink-900">{fmt(total)}</span> per
            month
            {essentialTotal > 0 ? (
              <>
                {" "}
                · <span className="tabular-nums">{fmt(essentialTotal)}</span> essential
              </>
            ) : null}
            .
          </>
        }
        action={
          <Button variant="primary" onClick={() => { setError(null); dialog.openFor(null); }}>
            Add expense
          </Button>
        }
      />

      {expenses.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          description="Recurring monthly outflows: rent, groceries, utilities, EMIs, subscriptions."
          action={
            <Button variant="primary" onClick={() => { setError(null); dialog.openFor(null); }}>
              Add the first expense
            </Button>
          }
        />
      ) : (
        <>
          <SearchInput
            placeholder="Search expenses…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {filtered.length === 0 ? (
            <p className="text-sm text-ink-500">No matches for "{query}".</p>
          ) : (
            <EntityList>
              {filtered.map((e) => (
                <EntityRow
                  key={e.id}
                  primary={e.label || e.category}
                  secondary={
                    <>
                      {e.category}
                      {e.essential ? " · essential" : " · discretionary"}
                      {e.notes ? ` · ${e.notes}` : ""}
                    </>
                  }
                  trailing={`${fmt(e.amountMonthly)} / mo`}
                  onEdit={() => { setError(null); dialog.openFor(e); }}
                  onDelete={() => handleDelete(e)}
                />
              ))}
            </EntityList>
          )}
        </>
      )}

      <Dialog
        open={dialog.open}
        onClose={dialog.close}
        title={dialog.item ? "Edit expense" : "Add expense"}
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
          {error ? (
            <div className="text-xs text-severity-critical bg-red-50 px-3 py-2 rounded-button">
              {error}
            </div>
          ) : null}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Category" htmlFor="category">
              <Select
                id="category"
                name="category"
                defaultValue={dialog.item?.category ?? "Housing"}
                autoFocus
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Label (optional)" htmlFor="label">
              <Input
                id="label"
                name="label"
                placeholder="e.g. Apartment rent"
                defaultValue={dialog.item?.label ?? ""}
              />
            </Field>
          </div>
          <Field label={`Monthly (${household.currency})`} htmlFor="amount">
            <Input
              id="amount"
              name="amount"
              inputMode="decimal"
              required
              placeholder="0"
              defaultValue={dialog.item?.amountMonthly ?? ""}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              name="essential"
              defaultChecked={dialog.item ? dialog.item.essential : true}
              className="size-4 accent-brand-deep"
            />
            Essential (hard to cut back)
          </label>
          <Field label="Notes" htmlFor="notes">
            <Textarea id="notes" name="notes" defaultValue={dialog.item?.notes ?? ""} />
          </Field>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={dialog.close} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {dialog.item ? "Save changes" : "Add expense"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
