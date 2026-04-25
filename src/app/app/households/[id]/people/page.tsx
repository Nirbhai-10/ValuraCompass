"use client";

import { FormEvent } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate, uid } from "@/lib/store";
import { PERSON_RELATIONS, Person } from "@/lib/types";
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

export default function PeoplePage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const persons = db.persons.filter((p) => p.householdId === householdId);
  const dialog = useDialog<Person>();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fullName = String(fd.get("fullName") ?? "").trim();
    const relation = String(fd.get("relation") ?? "Other");
    const dob = String(fd.get("dob") ?? "").trim();
    if (!fullName) return;

    update((curr) => {
      if (dialog.item) {
        return {
          ...curr,
          persons: curr.persons.map((p) =>
            p.id === dialog.item!.id
              ? { ...p, fullName, relation, dob: dob || undefined }
              : p,
          ),
        };
      }
      return {
        ...curr,
        persons: [
          ...curr.persons,
          {
            id: uid("p"),
            householdId,
            fullName,
            relation,
            dob: dob || undefined,
            isPrimary: false,
          },
        ],
      };
    });
    dialog.close();
  }

  function handleDelete(personId: string) {
    if (!window.confirm("Remove this person?")) return;
    update((curr) => ({
      ...curr,
      persons: curr.persons.filter((p) => p.id !== personId),
      incomes: curr.incomes.map((i) =>
        i.personId === personId ? { ...i, personId: undefined } : i,
      ),
    }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="People"
        subtitle="Family members and dependents in this household."
        action={
          <Button variant="primary" onClick={() => dialog.openFor(null)}>
            Add person
          </Button>
        }
      />

      {persons.length === 0 ? (
        <EmptyState
          title="No one yet"
          description="Add the primary person and anyone else who shares this financial picture."
          action={
            <Button variant="primary" onClick={() => dialog.openFor(null)}>
              Add the first person
            </Button>
          }
        />
      ) : (
        <EntityList>
          {persons.map((p) => (
            <EntityRow
              key={p.id}
              primary={p.fullName}
              secondary={
                <>
                  {p.relation}
                  {p.isPrimary ? " · primary" : ""}
                  {p.dob ? ` · DOB ${p.dob}` : ""}
                </>
              }
              onEdit={() => dialog.openFor(p)}
              onDelete={p.isPrimary ? undefined : () => handleDelete(p.id)}
            />
          ))}
        </EntityList>
      )}

      <Dialog
        open={dialog.open}
        onClose={dialog.close}
        title={dialog.item ? "Edit person" : "Add a person"}
        description={
          dialog.item
            ? "Update the details for this person."
            : "Track another family member or dependent."
        }
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Full name" htmlFor="fullName">
            <Input
              id="fullName"
              name="fullName"
              required
              autoFocus
              defaultValue={dialog.item?.fullName ?? ""}
            />
          </Field>
          <Field label="Relation" htmlFor="relation">
            <Select
              id="relation"
              name="relation"
              defaultValue={dialog.item?.relation ?? "Spouse"}
            >
              {PERSON_RELATIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
          </Field>
          <Field label="Date of birth" hint="Optional, but helps later." htmlFor="dob">
            <Input id="dob" name="dob" type="date" defaultValue={dialog.item?.dob ?? ""} />
          </Field>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={dialog.close} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {dialog.item ? "Save changes" : "Add person"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
