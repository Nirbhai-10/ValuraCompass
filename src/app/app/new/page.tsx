"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useUpdate } from "@/lib/store";
import { addHousehold } from "@/lib/mutations";
import { parseHousehold } from "@/lib/validation";
import {
  HouseholdMode,
  HouseholdStructure,
  MODE_LABELS,
  REGION_LABELS,
  Region,
  STRUCTURE_LABELS,
} from "@/lib/types";
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  useToast,
} from "@/components/ui";

const CURRENCIES = ["INR", "AED", "USD", "EUR", "GBP", "SAR", "QAR", "OMR"] as const;

export default function NewHouseholdPage() {
  const router = useRouter();
  const update = useUpdate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    const result = parseHousehold(new FormData(e.currentTarget));
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSubmitting(true);
    const { mutator, householdId } = addHousehold(
      result.value.household,
      result.value.primaryName,
    );
    update(mutator);
    toast.success(`Created ${result.value.household.name}.`);
    router.push(`/app/households/${householdId}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 sm:py-10 space-y-6">
      <PageHeader
        title="Create a household"
        subtitle="Set the basics. You can edit everything later from Settings."
      />
      <Card>
        <form onSubmit={handleSubmit} className="grid gap-5">
          {error ? (
            <div className="text-xs text-severity-critical bg-red-50 px-3 py-2 rounded-button">
              {error}
            </div>
          ) : null}

          <Field label="Household name" htmlFor="name">
            <Input
              id="name"
              name="name"
              required
              autoFocus
              placeholder="e.g. The Sharma family"
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Region" htmlFor="region">
              <Select id="region" name="region" defaultValue="IN">
                {Object.keys(REGION_LABELS).map((r) => (
                  <option key={r} value={r}>
                    {REGION_LABELS[r as Region]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Currency" htmlFor="currency">
              <Select id="currency" name="currency" defaultValue="INR">
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Structure" htmlFor="structure">
              <Select id="structure" name="structure" defaultValue="NUCLEAR">
                {(Object.keys(STRUCTURE_LABELS) as HouseholdStructure[]).map((s) => (
                  <option key={s} value={s}>
                    {STRUCTURE_LABELS[s]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Mode"
              hint="Basic covers the everyday picture. Advanced unlocks retirement Monte Carlo, insights, risk profile, tax, estate."
              htmlFor="mode"
            >
              <Select id="mode" name="mode" defaultValue="BASIC">
                {(Object.keys(MODE_LABELS) as HouseholdMode[]).map((m) => (
                  <option key={m} value={m}>
                    {MODE_LABELS[m]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field
            label="Primary person's name"
            hint="The person whose financial picture this primarily represents."
            htmlFor="primaryName"
          >
            <Input
              id="primaryName"
              name="primaryName"
              required
              placeholder="e.g. Rohan Sharma"
            />
          </Field>

          <div className="flex items-center gap-3 pt-2">
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create household"}
            </Button>
            <Button variant="ghost" type="button" onClick={() => router.push("/app")}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
