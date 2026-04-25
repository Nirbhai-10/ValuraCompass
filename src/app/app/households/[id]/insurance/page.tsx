"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate } from "@/lib/store";
import { selectHousehold, selectPolicies } from "@/lib/selectors";
import { addPolicy, removePolicy, updatePolicy } from "@/lib/mutations";
import { parsePolicy } from "@/lib/validation";
import { formatMoney } from "@/lib/format";
import { POLICY_TYPES, Policy } from "@/lib/types";
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

export default function InsurancePage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const toast = useToast();
  const household = selectHousehold(db, householdId);
  const policies = selectPolicies(db, householdId);
  const dialog = useDialog<Policy>();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      policies.filter((p) =>
        matchesQuery(query, p.label, p.type, p.insurer, p.notes),
      ),
    [policies, query],
  );

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const totalCover = policies.reduce((s, p) => s + p.sumAssured, 0);
  const totalPremium = policies.reduce((s, p) => s + (p.premiumAnnual ?? 0), 0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = parsePolicy(new FormData(e.currentTarget));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (dialog.item) {
      update(updatePolicy(dialog.item.id, result.value));
      toast.success(`Updated ${result.value.label}.`);
    } else {
      update(addPolicy(householdId, result.value));
      toast.success(`Added ${result.value.label}.`);
    }
    dialog.close();
  }

  function handleDelete(item: Policy) {
    if (!window.confirm(`Remove ${item.label}?`)) return;
    update(removePolicy(item.id));
    toast.success(`Removed ${item.label}.`);
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
          <Button variant="primary" onClick={() => { setError(null); dialog.openFor(null); }}>
            Add policy
          </Button>
        }
      />

      {policies.length === 0 ? (
        <EmptyState
          title="No policies yet"
          description="Life, health, critical illness, disability, accident, home, vehicle — track them all."
          action={
            <Button variant="primary" onClick={() => { setError(null); dialog.openFor(null); }}>
              Add the first policy
            </Button>
          }
        />
      ) : (
        <>
          <SearchInput
            placeholder="Search policies…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {filtered.length === 0 ? (
            <p className="text-sm text-ink-500">No matches for "{query}".</p>
          ) : (
            <EntityList>
              {filtered.map((p) => (
                <EntityRow
                  key={p.id}
                  primary={p.label}
                  secondary={
                    <>
                      {p.type}
                      {p.insurer ? ` · ${p.insurer}` : ""}
                      {p.premiumAnnual ? ` · ${fmt(p.premiumAnnual)} / yr` : ""}
                      {p.notes ? ` · ${p.notes}` : ""}
                    </>
                  }
                  trailing={fmt(p.sumAssured)}
                  onEdit={() => { setError(null); dialog.openFor(p); }}
                  onDelete={() => handleDelete(p)}
                />
              ))}
            </EntityList>
          )}
        </>
      )}

      <Dialog
        open={dialog.open}
        onClose={dialog.close}
        title={dialog.item ? "Edit policy" : "Add policy"}
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
              placeholder="e.g. LIC term plan"
              defaultValue={dialog.item?.label ?? ""}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Type" htmlFor="type">
              <Select id="type" name="type" defaultValue={dialog.item?.type ?? "Term life"}>
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
            <Field label={`Sum assured (${household.currency})`} htmlFor="sumAssured">
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
          <Field label="Notes" htmlFor="notes">
            <Textarea id="notes" name="notes" defaultValue={dialog.item?.notes ?? ""} />
          </Field>
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
