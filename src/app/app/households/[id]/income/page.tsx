"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate } from "@/lib/store";
import { selectHousehold, selectIncomes, selectPersons } from "@/lib/selectors";
import { addIncome, removeIncome, updateIncome } from "@/lib/mutations";
import { parseIncome } from "@/lib/validation";
import { formatMoney } from "@/lib/format";
import { INCOME_TYPES, Income } from "@/lib/types";
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

export default function IncomePage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const toast = useToast();
  const household = selectHousehold(db, householdId);
  const persons = selectPersons(db, householdId);
  const incomes = selectIncomes(db, householdId);
  const dialog = useDialog<Income>();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      incomes.filter((i) => matchesQuery(query, i.label, i.type, i.notes)),
    [incomes, query],
  );

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const total = incomes.reduce((s, i) => s + i.amountMonthly, 0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = parseIncome(new FormData(e.currentTarget));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (dialog.item) {
      update(updateIncome(dialog.item.id, result.value));
      toast.success(`Updated ${result.value.label}.`);
    } else {
      update(addIncome(householdId, result.value));
      toast.success(`Added ${result.value.label}.`);
    }
    dialog.close();
  }

  function handleDelete(item: Income) {
    if (!window.confirm(`Remove ${item.label}?`)) return;
    update(removeIncome(item.id));
    toast.success(`Removed ${item.label}.`);
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
          <Button variant="primary" onClick={() => { setError(null); dialog.openFor(null); }}>
            Add income
          </Button>
        }
      />

      {incomes.length === 0 ? (
        <EmptyState
          title="No income added yet"
          description="Add salary, business income, rental, or anything that comes in regularly."
          action={
            <Button variant="primary" onClick={() => { setError(null); dialog.openFor(null); }}>
              Add the first income
            </Button>
          }
        />
      ) : (
        <>
          <SearchInput
            placeholder="Search income…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {filtered.length === 0 ? (
            <p className="text-sm text-ink-500">No matches for "{query}".</p>
          ) : (
            <EntityList>
              {filtered.map((i) => {
                const earner = persons.find((p) => p.id === i.personId);
                return (
                  <EntityRow
                    key={i.id}
                    primary={i.label}
                    secondary={
                      <>
                        {i.type}
                        {earner ? ` · ${earner.fullName}` : ""}
                        {i.notes ? ` · ${i.notes}` : ""}
                      </>
                    }
                    trailing={`${fmt(i.amountMonthly)} / mo`}
                    onEdit={() => { setError(null); dialog.openFor(i); }}
                    onDelete={() => handleDelete(i)}
                  />
                );
              })}
            </EntityList>
          )}
        </>
      )}

      <Dialog
        open={dialog.open}
        onClose={dialog.close}
        title={dialog.item ? "Edit income" : "Add income"}
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
          </div>
          <Field label="Earner" htmlFor="personId">
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
          <Field label="Notes" htmlFor="notes">
            <Textarea id="notes" name="notes" defaultValue={dialog.item?.notes ?? ""} />
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
