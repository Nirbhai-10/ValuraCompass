"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { nowISO, uid, useUpdate } from "@/lib/store";
import { HouseholdStructure, Region } from "@/lib/types";

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
      setError("Please fill in the household name and the primary person.");
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
    <div className="mx-auto max-w-2xl p-6">
      <div className="card">
        <div className="px-6 py-5 border-b border-line-200">
          <h1 className="text-xl font-semibold">Create a household</h1>
          <p className="text-sm text-ink-500 mt-1">
            Set the basics. You can edit everything later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 grid gap-5">
          {error ? (
            <div className="text-xs text-severity-critical bg-red-50 px-3 py-2 rounded-button">
              {error}
            </div>
          ) : null}

          <div>
            <label className="label" htmlFor="name">Household name</label>
            <input
              id="name"
              className="input"
              name="name"
              required
              placeholder="The Sharma family"
              defaultValue=""
              autoFocus
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="region">Region</label>
              <select id="region" name="region" className="input" defaultValue="IN">
                <option value="IN">India</option>
                <option value="GCC">GCC</option>
                <option value="GLOBAL">Global</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="currency">Currency</label>
              <select id="currency" name="currency" className="input" defaultValue="INR">
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="structure">Structure</label>
            <select id="structure" name="structure" className="input" defaultValue="NUCLEAR">
              <option value="SINGLE">Single</option>
              <option value="DINK">Couple, no kids</option>
              <option value="NUCLEAR">Nuclear (you + spouse + kids)</option>
              <option value="NUCLEAR_WITH_PARENTS">Nuclear with parents</option>
              <option value="JOINT">Joint family</option>
              <option value="SINGLE_PARENT">Single parent</option>
              <option value="MULTI_GEN">Multi-generational</option>
              <option value="CROSS_BORDER">Cross-border</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="primaryName">Primary person&apos;s name</label>
            <input
              id="primaryName"
              className="input"
              name="primaryName"
              required
              placeholder="e.g. Rohan Sharma"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create household"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => router.push("/app")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
