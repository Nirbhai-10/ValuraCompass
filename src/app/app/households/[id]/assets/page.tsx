"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate } from "@/lib/store";
import { selectAssets, selectHousehold } from "@/lib/selectors";
import { addAsset, removeAsset, updateAsset } from "@/lib/mutations";
import { parseAsset } from "@/lib/validation";
import { formatMoney } from "@/lib/format";
import { ASSET_CLASSES, Asset } from "@/lib/types";
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

export default function AssetsPage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const toast = useToast();
  const household = selectHousehold(db, householdId);
  const assets = selectAssets(db, householdId);
  const dialog = useDialog<Asset>();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      assets.filter((a) =>
        matchesQuery(query, a.label, a.assetClass, a.notes),
      ),
    [assets, query],
  );

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const total = assets.reduce((s, a) => s + a.currentValue, 0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = parseAsset(new FormData(e.currentTarget));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (dialog.item) {
      update(updateAsset(dialog.item.id, result.value));
      toast.success(`Updated ${result.value.label}.`);
    } else {
      update(addAsset(householdId, result.value));
      toast.success(`Added ${result.value.label}.`);
    }
    dialog.close();
  }

  function handleDelete(item: Asset) {
    if (!window.confirm(`Remove ${item.label}?`)) return;
    update(removeAsset(item.id));
    toast.success(`Removed ${item.label}.`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assets"
        subtitle={
          <>
            Total value:{" "}
            <span className="font-semibold tabular-nums text-ink-900">{fmt(total)}</span>
          </>
        }
        action={
          <Button variant="primary" onClick={() => { setError(null); dialog.openFor(null); }}>
            Add asset
          </Button>
        }
      />

      {assets.length === 0 ? (
        <EmptyState
          title="No assets yet"
          description="Cash, equity, debt, gold, real estate, retirement, business — anything you own."
          action={
            <Button variant="primary" onClick={() => { setError(null); dialog.openFor(null); }}>
              Add the first asset
            </Button>
          }
        />
      ) : (
        <>
          <SearchInput
            placeholder="Search assets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {filtered.length === 0 ? (
            <p className="text-sm text-ink-500">No matches for "{query}".</p>
          ) : (
            <EntityList>
              {filtered.map((a) => (
                <EntityRow
                  key={a.id}
                  primary={a.label}
                  secondary={
                    <>
                      {a.assetClass}
                      {a.notes ? ` · ${a.notes}` : ""}
                    </>
                  }
                  trailing={fmt(a.currentValue)}
                  onEdit={() => { setError(null); dialog.openFor(a); }}
                  onDelete={() => handleDelete(a)}
                />
              ))}
            </EntityList>
          )}
        </>
      )}

      <Dialog
        open={dialog.open}
        onClose={dialog.close}
        title={dialog.item ? "Edit asset" : "Add asset"}
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
              placeholder="e.g. HDFC savings"
              defaultValue={dialog.item?.label ?? ""}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Class" htmlFor="assetClass">
              <Select
                id="assetClass"
                name="assetClass"
                defaultValue={dialog.item?.assetClass ?? "Cash"}
              >
                {ASSET_CLASSES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label={`Current value (${household.currency})`} htmlFor="value">
              <Input
                id="value"
                name="value"
                inputMode="decimal"
                required
                placeholder="0"
                defaultValue={dialog.item?.currentValue ?? ""}
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
              {dialog.item ? "Save changes" : "Add asset"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
