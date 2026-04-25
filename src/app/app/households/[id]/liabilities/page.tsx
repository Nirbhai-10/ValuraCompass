"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate } from "@/lib/store";
import { selectHousehold, selectLiabilities } from "@/lib/selectors";
import { addLiability, removeLiability, updateLiability } from "@/lib/mutations";
import { parseLiability } from "@/lib/validation";
import { formatMoney } from "@/lib/format";
import { LIABILITY_TYPES, Liability } from "@/lib/types";
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

export default function LiabilitiesPage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const toast = useToast();
  const household = selectHousehold(db, householdId);
  const liabilities = selectLiabilities(db, householdId);
  const dialog = useDialog<Liability>();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      liabilities.filter((l) =>
        matchesQuery(query, l.label, l.type, l.notes),
      ),
    [liabilities, query],
  );

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const total = liabilities.reduce((s, l) => s + l.outstanding, 0);
  const totalEmi = liabilities.reduce((s, l) => s + (l.emiMonthly ?? 0), 0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = parseLiability(new FormData(e.currentTarget));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (dialog.item) {
      update(updateLiability(dialog.item.id, result.value));
      toast.success(`Updated ${result.value.label}.`);
    } else {
      update(addLiability(householdId, result.value));
      toast.success(`Added ${result.value.label}.`);
    }
    dialog.close();
  }

  function handleDelete(item: Liability) {
    if (!window.confirm(`Remove ${item.label}?`)) return;
    update(removeLiability(item.id));
    toast.success(`Removed ${item.label}.`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Liabilities"
        subtitle={
          <>
            Outstanding:{" "}
            <span className="font-semibold tabular-nums text-ink-900">{fmt(total)}</span>
            {totalEmi > 0 ? (
              <>
                {" "}
                · EMIs{" "}
                <span className="font-semibold tabular-nums text-ink-900">
                  {fmt(totalEmi)}
                </span>{" "}
                / mo
              </>
            ) : null}
          </>
        }
        action={
          <Button variant="primary" onClick={() => { setError(null); dialog.openFor(null); }}>
            Add liability
          </Button>
        }
      />

      {liabilities.length === 0 ? (
        <EmptyState
          title="No liabilities"
          description="Loans, credit-card balances, family or informal borrowing — anything you owe."
          action={
            <Button variant="primary" onClick={() => { setError(null); dialog.openFor(null); }}>
              Add the first liability
            </Button>
          }
        />
      ) : (
        <>
          <SearchInput
            placeholder="Search liabilities…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {filtered.length === 0 ? (
            <p className="text-sm text-ink-500">No matches for "{query}".</p>
          ) : (
            <EntityList>
              {filtered.map((l) => (
                <EntityRow
                  key={l.id}
                  primary={l.label}
                  secondary={
                    <>
                      {l.type}
                      {l.emiMonthly ? ` · ${fmt(l.emiMonthly)} / mo` : ""}
                      {l.interestRate ? ` · ${l.interestRate}%` : ""}
                      {l.notes ? ` · ${l.notes}` : ""}
                    </>
                  }
                  trailing={fmt(l.outstanding)}
                  onEdit={() => { setError(null); dialog.openFor(l); }}
                  onDelete={() => handleDelete(l)}
                />
              ))}
            </EntityList>
          )}
        </>
      )}

      <Dialog
        open={dialog.open}
        onClose={dialog.close}
        title={dialog.item ? "Edit liability" : "Add liability"}
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
              placeholder="e.g. Home loan"
              defaultValue={dialog.item?.label ?? ""}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Type" htmlFor="type">
              <Select id="type" name="type" defaultValue={dialog.item?.type ?? "Home loan"}>
                {LIABILITY_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label={`Outstanding (${household.currency})`} htmlFor="outstanding">
              <Input
                id="outstanding"
                name="outstanding"
                inputMode="decimal"
                required
                placeholder="0"
                defaultValue={dialog.item?.outstanding ?? ""}
              />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="EMI / month" htmlFor="emi">
              <Input
                id="emi"
                name="emi"
                inputMode="decimal"
                placeholder="0"
                defaultValue={dialog.item?.emiMonthly ?? ""}
              />
            </Field>
            <Field label="Interest rate %" htmlFor="rate">
              <Input
                id="rate"
                name="rate"
                inputMode="decimal"
                placeholder="0"
                defaultValue={dialog.item?.interestRate ?? ""}
              />
            </Field>
          </div>
          <Field label="Notes" htmlFor="notes">
            <Textarea id="notes" name="notes" defaultValue={dialog.item?.notes ?? ""} />
          </Field>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={dialog.close} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {dialog.item ? "Save changes" : "Add liability"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
