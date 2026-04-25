"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { nowISO, uid, useUpdate } from "@/lib/store";
import {
  HouseholdStructure,
  REGION_LABELS,
  Region,
  STRUCTURE_LABELS,
} from "@/lib/types";
import { Button, Card, Field, Input, PageHeader, Select } from "@/components/ui";

const CURRENCIES = ["INR", "AED", "USD", "EUR", "GBP", "SAR", "QAR", "OMR"] as const;

export default function NewHouseholdPage() {
  const router = useRouter();
  const update = useUpdate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const region = String(fd.get("region") ?? "IN") as Region;
    const currency = String(fd.get("currency") ?? "INR");
    const structure = String(fd.get("structure") ?? "NUCLEAR") as HouseholdStructure;
    const primaryName = String(fd.get("primaryName") ?? "").trim();

    if (!name || !primaryName) {
      setError("Please fill in the household name and the primary person's name.");
      setSubmitting(false);
      return;
    }

    const householdId = uid("hh");
    const personId = uid("p");
    const ts = nowISO();

    update((db) => ({
      ...db,
      households: [
        ...db.households,
        {
          id: householdId,
          name,
          region,
          currency,
          structure,
          createdAt: ts,
          updatedAt: ts,
        },
      ],
      persons: [
        ...db.persons,
        {
          id: personId,
          householdId,
          fullName: primaryName,
          relation: "Self",
          isPrimary: true,
        },
      ],
    }));

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
