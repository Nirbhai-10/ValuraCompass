"use client";

import { FormEvent } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate, uid } from "@/lib/store";
import { formatMoney, parseAmount } from "@/lib/format";
import { POLICY_TYPES, Policy } from "@/lib/types";
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

export default function InsurancePage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const household = db.households.find((h) => h.id === householdId);
  const policies = db.policies.filter((p) => p.householdId === householdId);
  const dialog = useDialog<Policy>();

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const totalCover = policies.reduce((s, p) => s + p.sumAssured, 0);
  const totalPremium = policies.reduce((s, p) => s + (p.premiumAnnual ?? 0), 0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const label = String(fd.get("label") ?? "").trim();
    const type = String(fd.get("type") ?? "Term life");
    const insurer = String(fd.get("insurer") ?? "").trim();
    const sumAssured = parseAmount(String(fd.get("sumAssured") ?? ""));
    const premium = parseAmount(String(fd.get("premium") ?? ""));
    if (!label || sumAssured <= 0) return;

    update((curr) => {
      const next = {
        label,
        type,
        insurer: insurer || undefined,
        sumAssured,
        premiumAnnual: premium > 0 ? premium : undefined,
      };
      if (dialog.item) {
        return {
          ...curr,
          policies: curr.policies.map((p) =>
            p.id === dialog.item!.id ? { ...p, ...next } : p,
          ),
        };
      }
      return {
        ...curr,
        policies: [...curr.policies, { id: uid("pol"), householdId, ...next }],
      };
    });
    dialog.close();
  }

  function handleDelete(id: string) {
    if (!window.confirm("Remove this policy?")) return;
    update((curr) => ({ ...curr, policies: curr.policies.filter((p) => p.id !== id) }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insurance"
        subtitle={
          <>
            Cover:{" "}
            <span className="font-semibold tabular-nums text-ink-900">
              {fmt(totalCover)}
            </span>
            {totalPremium > 0 ? (
              <>
                {" "}
                · Premiums{" "}
                <span className="font-semibold tabular-nums text-ink-900">
                  {fmt(totalPremium)}
                </span>{" "}
                / yr
              </>
            ) : null}
          </>
        }
        action={
          <Button variant="primary" onClick={() => dialog.openFor(null)}>
            Add policy
          </Button>
        }
      />

      {policies.length === 0 ? (
        <EmptyState
          title="No policies yet"
          description="Life, health, critical illness, disability, accident, home, vehicle — track them all."
          action={
            <Button variant="primary" onClick={() => dialog.openFor(null)}>
              Add the first policy
            </Button>
          }
        />
      ) : (
        <EntityList>
          {policies.map((p) => (
            <EntityRow
              key={p.id}
              primary={p.label}
              secondary={
                <>
                  {p.type}
                  {p.insurer ? ` · ${p.insurer}` : ""}
                  {p.premiumAnnual ? ` · ${fmt(p.premiumAnnual)} / yr` : ""}
                </>
              }
              trailing={fmt(p.sumAssured)}
              onEdit={() => dialog.openFor(p)}
              onDelete={() => handleDelete(p.id)}
            />
          ))}
        </EntityList>
      )}

      <Dialog
        open={dialog.open}
        onClose={dialog.close}
        title={dialog.item ? "Edit policy" : "Add policy"}
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Label" htmlFor="label">
            <Input
              id="label"
              name="label"
              required
              autoFocus
              placeholder="e.g. LIC term plan"
              defaultValue={dialog.item?.label ?? ""}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Type" htmlFor="type">
              <Select
                id="type"
                name="type"
                defaultValue={dialog.item?.type ?? "Term life"}
              >
                {POLICY_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="Insurer" htmlFor="insurer">
              <Input
                id="insurer"
                name="insurer"
                placeholder="e.g. LIC, HDFC Life"
                defaultValue={dialog.item?.insurer ?? ""}
              />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label={`Sum assured (${household.currency})`}
              htmlFor="sumAssured"
            >
              <Input
                id="sumAssured"
                name="sumAssured"
                inputMode="decimal"
                required
                placeholder="0"
                defaultValue={dialog.item?.sumAssured ?? ""}
              />
            </Field>
            <Field label="Annual premium" htmlFor="premium">
              <Input
                id="premium"
                name="premium"
                inputMode="decimal"
                placeholder="0"
                defaultValue={dialog.item?.premiumAnnual ?? ""}
              />
            </Field>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={dialog.close} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {dialog.item ? "Save changes" : "Add policy"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
