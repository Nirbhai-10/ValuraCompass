"use client";

import { FormEvent } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate } from "@/lib/store";
import { selectHousehold, selectTaxProfile } from "@/lib/selectors";
import { upsertTaxProfile } from "@/lib/mutations";
import { TAX_REGIME_LABELS, TaxRegime } from "@/lib/types";
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
  useToast,
} from "@/components/ui";

export default function TaxPage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const toast = useToast();
  const household = selectHousehold(db, householdId);
  const profile = selectTaxProfile(db, householdId);

  if (!household) return null;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const regime = String(fd.get("regime") ?? "OLD") as TaxRegime;
    const businessIncomeShareInput = String(fd.get("businessIncomeShare") ?? "").trim();
    const businessIncomeShare = businessIncomeShareInput
      ? Math.max(0, Math.min(1, Number(businessIncomeShareInput) / 100))
      : undefined;
    const notes = String(fd.get("notes") ?? "").trim() || undefined;
    update(
      upsertTaxProfile(householdId, {
        regime,
        businessIncomeShare,
        notes,
      }),
    );
    toast.success("Saved.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tax"
        subtitle="A short profile so the rest of Compass can frame observations correctly."
      />

      <Card>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <Field label="Regime / status" htmlFor="regime">
            <Select
              id="regime"
              name="regime"
              defaultValue={profile?.regime ?? (household.region === "IN" ? "NEW" : "NA")}
            >
              {(Object.keys(TAX_REGIME_LABELS) as TaxRegime[]).map((r) => (
                <option key={r} value={r}>
                  {TAX_REGIME_LABELS[r]}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Business / professional income share %"
            hint="Share of total household income that comes from business or consulting (vs. salary). Helps Compass tag complexity."
            htmlFor="businessIncomeShare"
          >
            <Input
              id="businessIncomeShare"
              name="businessIncomeShare"
              inputMode="decimal"
              placeholder="e.g. 25"
              defaultValue={
                typeof profile?.businessIncomeShare === "number"
                  ? Math.round(profile.businessIncomeShare * 100)
                  : ""
              }
            />
          </Field>
          <Field
            label="Notes"
            hint="Anything special — presumptive scheme, capital-gains pending, foreign income, etc."
            htmlFor="notes"
          >
            <Textarea id="notes" name="notes" defaultValue={profile?.notes ?? ""} />
          </Field>
          <div className="pt-2">
            <Button variant="primary" type="submit">
              Save profile
            </Button>
          </div>
        </form>
      </Card>

      {profile ? (
        <Card>
          <p className="text-sm font-semibold">Current snapshot</p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-ink-500">Regime</dt>
              <dd className="mt-0.5">{TAX_REGIME_LABELS[profile.regime]}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-500">Business income</dt>
              <dd className="mt-0.5 tabular-nums">
                {typeof profile.businessIncomeShare === "number"
                  ? `${(profile.businessIncomeShare * 100).toFixed(0)}%`
                  : "—"}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-ink-500">Updated</dt>
              <dd className="mt-0.5">
                {new Date(profile.updatedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </Card>
      ) : null}
    </div>
  );
}
