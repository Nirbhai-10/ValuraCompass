"use client";

import { FormEvent } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate, uid } from "@/lib/store";
import { formatMoney, parseAmount } from "@/lib/format";
import { INCOME_TYPES, Income } from "@/lib/types";
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

export default function IncomePage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const household = db.households.find((h) => h.id === householdId);
  const persons = db.persons.filter((p) => p.householdId === householdId);
  const incomes = db.incomes.filter((i) => i.householdId === householdId);
  const dialog = useDialog<Income>();

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const total = incomes.reduce((s, i) => s + i.amountMonthly, 0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const label = String(fd.get("label") ?? "").trim();
    const type = String(fd.get("type") ?? "Salary");
    const amount = parseAmount(String(fd.get("amount") ?? ""));
    const personId = String(fd.get("personId") ?? "") || undefined;
    if (!label || amount <= 0) return;

    update((curr) => {
      if (dialog.item) {
        return {
          ...curr,
          incomes: curr.incomes.map((i) =>
            i.id === dialog.item!.id
              ? { ...i, label, type, amountMonthly: amount, personId }
              : i,
          ),
        };
      }
      return {
        ...curr,
        incomes: [
          ...curr.incomes,
          { id: uid("inc"), householdId, label, type, amountMonthly: amount, personId },
        ],
      };
    });
    dialog.close();
  }

  function handleDelete(id: string) {
    if (!window.confirm("Remove this income?")) return;
    update((curr) => ({ ...curr, incomes: curr.incomes.filter((i) => i.id !== id) }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income"
        subtitle={
          <>
            <span className="font-semibold tabular-nums text-ink-900">{fmt(total)}</span> per
            month across {incomes.length} entr{incomes.length === 1 ? "y" : "ies"}.
          </>
        }
        action={
          <Button variant="primary" onClick={() => dialog.openFor(null)}>
            Add income
          </Button>
        }
      />

      {incomes.length === 0 ? (
        <EmptyState
          title="No income added yet"
          description="Add salary, business income, rental, or anything that comes in regularly."
          action={
            <Button variant="primary" onClick={() => dialog.openFor(null)}>
              Add the first income
            </Button>
          }
        />
      ) : (
        <EntityList>
          {incomes.map((i) => {
            const earner = persons.find((p) => p.id === i.personId);
            return (
              <EntityRow
                key={i.id}
                primary={i.label}
                secondary={
                  <>
                    {i.type}
                    {earner ? ` · ${earner.fullName}` : ""}
                  </>
                }
                trailing={`${fmt(i.amountMonthly)} / mo`}
                onEdit={() => dialog.openFor(i)}
                onDelete={() => handleDelete(i.id)}
              />
            );
          })}
        </EntityList>
      )}

      <Dialog
        open={dialog.open}
        onClose={dialog.close}
        title={dialog.item ? "Edit income" : "Add income"}
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Label" htmlFor="label">
            <Input
              id="label"
              name="label"
              required
              autoFocus
              placeholder="e.g. Salary"
              defaultValue={dialog.item?.label ?? ""}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Type" htmlFor="type">
              <Select id="type" name="type" defaultValue={dialog.item?.type ?? "Salary"}>
                {INCOME_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field
              label={`Monthly (${household.currency})`}
              htmlFor="amount"
            >
              <Input
                id="amount"
                name="amount"
                inputMode="decimal"
                required
                placeholder="0"
                defaultValue={dialog.item?.amountMonthly ?? ""}
              />
            </Field>
          </div>
          <Field label="Earner" hint="Who does this income belong to?" htmlFor="personId">
            <Select
              id="personId"
              name="personId"
              defaultValue={dialog.item?.personId ?? ""}
            >
              <option value="">— Unassigned —</option>
              {persons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={dialog.close} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {dialog.item ? "Save changes" : "Add income"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
