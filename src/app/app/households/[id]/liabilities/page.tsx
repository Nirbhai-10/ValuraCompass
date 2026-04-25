"use client";

import { FormEvent } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate, uid } from "@/lib/store";
import { formatMoney, parseAmount } from "@/lib/format";
import { LIABILITY_TYPES, Liability } from "@/lib/types";
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

export default function LiabilitiesPage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const household = db.households.find((h) => h.id === householdId);
  const liabilities = db.liabilities.filter((l) => l.householdId === householdId);
  const dialog = useDialog<Liability>();

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const total = liabilities.reduce((s, l) => s + l.outstanding, 0);
  const totalEmi = liabilities.reduce((s, l) => s + (l.emiMonthly ?? 0), 0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const label = String(fd.get("label") ?? "").trim();
    const type = String(fd.get("type") ?? "Other");
    const outstanding = parseAmount(String(fd.get("outstanding") ?? ""));
    const emi = parseAmount(String(fd.get("emi") ?? ""));
    const rate = parseAmount(String(fd.get("rate") ?? ""));
    if (!label || outstanding <= 0) return;

    update((curr) => {
      const next = {
        label,
        type,
        outstanding,
        emiMonthly: emi > 0 ? emi : undefined,
        interestRate: rate > 0 ? rate : undefined,
      };
      if (dialog.item) {
        return {
          ...curr,
          liabilities: curr.liabilities.map((l) =>
            l.id === dialog.item!.id ? { ...l, ...next } : l,
          ),
        };
      }
      return {
        ...curr,
        liabilities: [...curr.liabilities, { id: uid("lia"), householdId, ...next }],
      };
    });
    dialog.close();
  }

  function handleDelete(id: string) {
    if (!window.confirm("Remove this liability?")) return;
    update((curr) => ({
      ...curr,
      liabilities: curr.liabilities.filter((l) => l.id !== id),
    }));
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
          <Button variant="primary" onClick={() => dialog.openFor(null)}>
            Add liability
          </Button>
        }
      />

      {liabilities.length === 0 ? (
        <EmptyState
          title="No liabilities"
          description="Loans, credit-card balances, family/informal borrowing — anything you owe."
          action={
            <Button variant="primary" onClick={() => dialog.openFor(null)}>
              Add the first liability
            </Button>
          }
        />
      ) : (
        <EntityList>
          {liabilities.map((l) => (
            <EntityRow
              key={l.id}
              primary={l.label}
              secondary={
                <>
                  {l.type}
                  {l.emiMonthly ? ` · ${fmt(l.emiMonthly)} / mo` : ""}
                  {l.interestRate ? ` · ${l.interestRate}%` : ""}
                </>
              }
              trailing={fmt(l.outstanding)}
              onEdit={() => dialog.openFor(l)}
              onDelete={() => handleDelete(l.id)}
            />
          ))}
        </EntityList>
      )}

      <Dialog
        open={dialog.open}
        onClose={dialog.close}
        title={dialog.item ? "Edit liability" : "Add liability"}
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
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
              <Select
                id="type"
                name="type"
                defaultValue={dialog.item?.type ?? "Home loan"}
              >
                {LIABILITY_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field
              label={`Outstanding (${household.currency})`}
              htmlFor="outstanding"
            >
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
