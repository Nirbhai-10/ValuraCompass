"use client";

import { useRef } from "react";
import { exportAll, importAll, resetAll, useDatabase, useHydrated } from "@/lib/store";
import { Button, Card, PageHeader, useToast } from "@/components/ui";

export default function DataPage() {
  const hydrated = useHydrated();
  const db = useDatabase();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="h-32 animate-pulse rounded-card bg-white border border-line-200" />
      </div>
    );
  }

  function handleExport() {
    const json = exportAll();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compass-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded.");
  }

  async function handleImport(file: File) {
    const text = await file.text();
    const result = importAll(text);
    if (result.ok) {
      toast.success("Data imported. All households reloaded.");
    } else {
      toast.error(result.error);
    }
  }

  function handleReset() {
    if (
      !window.confirm(
        "Erase every household and start over? This cannot be undone.",
      )
    ) {
      return;
    }
    resetAll();
    toast.success("Everything has been reset.");
  }

  const totals = {
    households: db.households.length,
    persons: db.persons.length,
    incomes: db.incomes.length,
    expenses: db.expenses.length,
    assets: db.assets.length,
    liabilities: db.liabilities.length,
    policies: db.policies.length,
    goals: db.goals.length,
  };

  const totalRecords =
    Object.values(totals).reduce((s, n) => s + n, 0) - totals.households;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:py-10 space-y-6">
      <PageHeader
        title="Your data"
        subtitle="Compass stores everything in this browser's localStorage. Back it up or move it between devices from here."
      />

      <Card>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-ink-500">Households</p>
            <p className="text-2xl font-semibold tabular-nums mt-1">{totals.households}</p>
          </div>
          <div>
            <p className="text-xs text-ink-500">People</p>
            <p className="text-2xl font-semibold tabular-nums mt-1">{totals.persons}</p>
          </div>
          <div>
            <p className="text-xs text-ink-500">Records</p>
            <p className="text-2xl font-semibold tabular-nums mt-1">{totalRecords}</p>
          </div>
          <div>
            <p className="text-xs text-ink-500">Storage key</p>
            <p className="text-xs text-ink-700 font-mono mt-1.5">compass-data-v1</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Download backup</p>
            <p className="text-xs text-ink-500 mt-0.5 max-w-md">
              Saves a single JSON file with everything you've entered. Keep it somewhere
              safe.
            </p>
          </div>
          <Button onClick={handleExport}>Download JSON</Button>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Import backup</p>
            <p className="text-xs text-ink-500 mt-0.5 max-w-md">
              Replaces what's in this browser with the contents of the JSON file you upload.
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
              e.target.value = "";
            }}
          />
          <Button onClick={() => fileRef.current?.click()}>Choose file…</Button>
        </div>
      </Card>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-severity-critical">Reset everything</p>
            <p className="text-xs text-ink-500 mt-0.5 max-w-md">
              Erases every household and all related records from this browser. This cannot
              be undone.
            </p>
          </div>
          <Button variant="danger" onClick={handleReset}>
            Reset all data
          </Button>
        </div>
      </Card>
    </div>
  );
}
