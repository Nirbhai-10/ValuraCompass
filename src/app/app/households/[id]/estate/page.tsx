"use client";

import { FormEvent } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate } from "@/lib/store";
import { selectEstateProfile } from "@/lib/selectors";
import { upsertEstateProfile } from "@/lib/mutations";
import { WILL_STATUS_LABELS, WillStatus } from "@/lib/types";
import {
  Button,
  Card,
  Field,
  PageHeader,
  Select,
  Textarea,
  useToast,
} from "@/components/ui";

export default function EstatePage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const toast = useToast();
  const profile = selectEstateProfile(db, householdId);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const willStatus = String(fd.get("willStatus") ?? "NONE") as WillStatus;
    const poaStatus = String(fd.get("poaStatus") ?? "NONE") as WillStatus;
    const guardianshipNotes = String(fd.get("guardianshipNotes") ?? "").trim() || undefined;
    const legacyIntent = String(fd.get("legacyIntent") ?? "").trim() || undefined;
    update(
      upsertEstateProfile(householdId, {
        willStatus,
        poaStatus,
        guardianshipNotes,
        legacyIntent,
      }),
    );
    toast.success("Saved.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estate"
        subtitle="Will, power of attorney, guardianship, and any plain-English notes about how you want things to land."
      />

      <Card>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Will status" htmlFor="willStatus">
              <Select
                id="willStatus"
                name="willStatus"
                defaultValue={profile?.willStatus ?? "NONE"}
              >
                {(Object.keys(WILL_STATUS_LABELS) as WillStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {WILL_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Power of attorney" htmlFor="poaStatus">
              <Select
                id="poaStatus"
                name="poaStatus"
                defaultValue={profile?.poaStatus ?? "NONE"}
              >
                {(Object.keys(WILL_STATUS_LABELS) as WillStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {WILL_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Guardianship notes" htmlFor="guardianshipNotes">
            <Textarea
              id="guardianshipNotes"
              name="guardianshipNotes"
              defaultValue={profile?.guardianshipNotes ?? ""}
              placeholder="Who's been agreed for the kids if needed?"
            />
          </Field>
          <Field label="Legacy intent" htmlFor="legacyIntent">
            <Textarea
              id="legacyIntent"
              name="legacyIntent"
              defaultValue={profile?.legacyIntent ?? ""}
              placeholder="Equal split between kids? Anything specific to the family home, business, or charitable giving?"
            />
          </Field>
          <div className="pt-2">
            <Button variant="primary" type="submit">
              Save estate profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
