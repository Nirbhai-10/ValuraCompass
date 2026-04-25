"use client";

import { FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDatabase, useUpdate } from "@/lib/store";
import { selectHouseholdSnapshot } from "@/lib/selectors";
import { removeHousehold, updateHousehold } from "@/lib/mutations";
import {
  HouseholdStructure,
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

export default function SettingsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const toast = useToast();
  const snap = selectHouseholdSnapshot(db, id);

  if (!snap) return null;
  const { household } = snap;

  function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const region = String(fd.get("region") ?? "IN") as Region;
    const currency = String(fd.get("currency") ?? "INR");
    const structure = String(fd.get("structure") ?? "NUCLEAR") as HouseholdStructure;
    if (!name) {
      toast.error("Household name can't be empty.");
      return;
    }
    update(updateHousehold(id, { name, region, currency, structure }));
    toast.success("Saved.");
  }

  function handleDelete() {
    const ok = window.confirm(
      `Delete "${household.name}" and all of its data? This cannot be undone.`,
    );
    if (!ok) return;
    update(removeHousehold(id));
    toast.success(`Deleted ${household.name}.`);
    router.push("/app");
  }

  function handleExport() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      ...snap,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compass-${household.name.toLowerCase().replace(/\s+/g, "-")}-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded.");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Edit household basics, export, or delete it." />

      <Card>
        <form onSubmit={handleSave} className="grid gap-5">
          <Field label="Household name" htmlFor="name">
            <Input id="name" name="name" required defaultValue={household.name} autoFocus />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Region" htmlFor="region">
              <Select id="region" name="region" defaultValue={household.region}>
                {Object.keys(REGION_LABELS).map((r) => (
                  <option key={r} value={r}>
                    {REGION_LABELS[r as Region]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Currency" htmlFor="currency">
              <Select id="currency" name="currency" defaultValue={household.currency}>
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Structure" htmlFor="structure">
            <Select id="structure" name="structure" defaultValue={household.structure}>
              {(Object.keys(STRUCTURE_LABELS) as HouseholdStructure[]).map((s) => (
                <option key={s} value={s}>
                  {STRUCTURE_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-center gap-3 pt-2">
            <Button variant="primary" type="submit">
              Save changes
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Print or save as PDF</p>
            <p className="text-xs text-ink-500 mt-0.5 max-w-md">
              A clean one-page summary you can hand to an advisor or save for the file.
            </p>
          </div>
          <Button onClick={() => router.push(`/print/${id}`)}>
            Open report
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Export this household</p>
            <p className="text-xs text-ink-500 mt-0.5 max-w-md">
              Download all data for this household as JSON. Useful as a backup or to move
              between devices.
            </p>
          </div>
          <Button onClick={handleExport}>Download JSON</Button>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-severity-critical">
              Delete household
            </p>
            <p className="text-xs text-ink-500 mt-0.5 max-w-md">
              Removes this household and everything in it. This is permanent.
            </p>
          </div>
          <Button variant="danger" onClick={handleDelete}>
            Delete household
          </Button>
        </div>
      </Card>
    </div>
  );
}
