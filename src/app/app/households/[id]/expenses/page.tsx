"use client";

import { FormEvent } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate, uid } from "@/lib/store";
import { formatMoney, parseAmount } from "@/lib/format";
import { EXPENSE_CATEGORIES, Expense } from "@/lib/types";
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

export default function ExpensesPage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const household = db.households.find((h) => h.id === householdId);
  const expenses = db.expenses.filter((e) => e.householdId === householdId);
  const dialog = useDialog<Expense>();

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const total = expenses.reduce((s, e) => s + e.amountMonthly, 0);
  const essentialTotal = expenses
    .filter((e) => e.essential)
    .reduce((s, e) => s + e.amountMonthly, 0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const category = String(fd.get("category") ?? "Other");
    const label = String(fd.get("label") ?? "").trim();
    const amount = parseAmount(String(fd.get("amount") ?? ""));
    const essential = fd.get("essential") === "on";
    if (amount <= 0) return;

    update((curr) => {
      if (dialog.item) {
        return {
          ...curr,
          expenses: curr.expenses.map((x) =>
            x.id === dialog.item!.id
              ? { ...x, category, label: label || undefined, amountMonthly: amount, essential }
              : x,
          ),
        };
      }
      return {
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
      };
    });
    dialog.close();
  }

  function handleDelete(id: string) {
    if (!window.confirm("Remove this expense?")) return;
    update((curr) => ({ ...curr, expenses: curr.expenses.filter((e) => e.id !== id) }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        subtitle={
          <>
            <span className="font-semibold tabular-nums text-ink-900">{fmt(total)}</span> per
            month{essentialTotal > 0 ? <> · {fmt(essentialTotal)} essential</> : null}.
          </>
        }
        action={
          <Button variant="primary" onClick={() => dialog.openFor(null)}>
            Add expense
          </Button>
        }
      />

      {expenses.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          description="Recurring monthly outflows: rent, groceries, utilities, EMIs, subscriptions."
          action={
            <Button variant="primary" onClick={() => dialog.openFor(null)}>
              Add the first expense
            </Button>
          }
        />
      ) : (
        <EntityList>
          {expenses.map((e) => (
            <EntityRow
              key={e.id}
              primary={e.label || e.category}
              secondary={
                <>
                  {e.category}
                  {e.essential ? " · essential" : " · discretionary"}
                </>
              }
              trailing={`${fmt(e.amountMonthly)} / mo`}
              onEdit={() => dialog.openFor(e)}
              onDelete={() => handleDelete(e.id)}
            />
          ))}
        </EntityList>
      )}

      <Dialog
        open={dialog.open}
        onClose={dialog.close}
        title={dialog.item ? "Edit expense" : "Add expense"}
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
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
