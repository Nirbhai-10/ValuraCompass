"use client";

import { FormEvent } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate, uid } from "@/lib/store";
import { formatMoney, parseAmount } from "@/lib/format";
import { ASSET_CLASSES, Asset } from "@/lib/types";
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

export default function AssetsPage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const household = db.households.find((h) => h.id === householdId);
  const assets = db.assets.filter((a) => a.householdId === householdId);
  const dialog = useDialog<Asset>();

  if (!household) return null;
  const fmt = (n: number) => formatMoney(n, household.currency, household.region);
  const total = assets.reduce((s, a) => s + a.currentValue, 0);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const label = String(fd.get("label") ?? "").trim();
    const assetClass = String(fd.get("assetClass") ?? "Cash");
    const value = parseAmount(String(fd.get("value") ?? ""));
    const notes = String(fd.get("notes") ?? "").trim();
    if (!label || value <= 0) return;

    update((curr) => {
      if (dialog.item) {
        return {
          ...curr,
          assets: curr.assets.map((a) =>
            a.id === dialog.item!.id
              ? {
                  ...a,
                  label,
                  assetClass,
                  currentValue: value,
                  notes: notes || undefined,
                }
              : a,
          ),
        };
      }
      return {
        ...curr,
        assets: [
          ...curr.assets,
          {
            id: uid("ast"),
            householdId,
            label,
            assetClass,
            currentValue: value,
            notes: notes || undefined,
          },
        ],
      };
    });
    dialog.close();
  }

  function handleDelete(id: string) {
    if (!window.confirm("Remove this asset?")) return;
    update((curr) => ({ ...curr, assets: curr.assets.filter((a) => a.id !== id) }));
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
          <Button variant="primary" onClick={() => dialog.openFor(null)}>
            Add asset
          </Button>
        }
      />

      {assets.length === 0 ? (
        <EmptyState
          title="No assets yet"
          description="Cash, equity, debt, gold, real estate, retirement, business — anything you own."
          action={
            <Button variant="primary" onClick={() => dialog.openFor(null)}>
              Add the first asset
            </Button>
          }
        />
      ) : (
        <EntityList>
          {assets.map((a) => (
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
              onEdit={() => dialog.openFor(a)}
              onDelete={() => handleDelete(a.id)}
            />
          ))}
        </EntityList>
      )}

      <Dialog
        open={dialog.open}
        onClose={dialog.close}
        title={dialog.item ? "Edit asset" : "Add asset"}
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
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
            <Field
              label={`Current value (${household.currency})`}
              htmlFor="value"
            >
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
          <Field label="Notes" hint="Account number, holding details, anything useful." htmlFor="notes">
            <Input id="notes" name="notes" defaultValue={dialog.item?.notes ?? ""} />
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
