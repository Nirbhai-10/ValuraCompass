"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate } from "@/lib/store";
import { selectPersons } from "@/lib/selectors";
import {
  addPerson,
  removePerson,
  updatePerson,
} from "@/lib/mutations";
import { parsePerson } from "@/lib/validation";
import { PERSON_RELATIONS, Person } from "@/lib/types";
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

export default function PeoplePage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const toast = useToast();
  const persons = selectPersons(db, householdId);
  const dialog = useDialog<Person>();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () => persons.filter((p) => matchesQuery(query, p.fullName, p.relation, p.notes)),
    [persons, query],
  );

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = parsePerson(new FormData(e.currentTarget));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (dialog.item) {
      update(updatePerson(dialog.item.id, result.value));
      toast.success(`Updated ${result.value.fullName}.`);
    } else {
      update(addPerson(householdId, result.value));
      toast.success(`Added ${result.value.fullName}.`);
    }
    dialog.close();
  }

  function handleDelete(person: Person) {
    if (!window.confirm(`Remove ${person.fullName}?`)) return;
    update(removePerson(person.id));
    toast.success(`Removed ${person.fullName}.`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="People"
        subtitle={
          persons.length > 0
            ? `${persons.length} person${persons.length === 1 ? "" : "s"} tracked.`
            : "Family members and dependents in this household."
        }
        action={
          <Button variant="primary" onClick={() => { setError(null); dialog.openFor(null); }}>
            Add person
          </Button>
        }
      />

      {persons.length === 0 ? (
        <EmptyState
          title="No one yet"
          description="Add the primary person and anyone else who shares this financial picture."
          action={
            <Button variant="primary" onClick={() => { setError(null); dialog.openFor(null); }}>
              Add the first person
            </Button>
          }
        />
      ) : (
        <>
          <SearchInput
            placeholder="Search people…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {filtered.length === 0 ? (
            <p className="text-sm text-ink-500">No matches for "{query}".</p>
          ) : (
            <EntityList>
              {filtered.map((p) => (
                <EntityRow
                  key={p.id}
                  primary={p.fullName}
                  secondary={
                    <>
                      {p.relation}
                      {p.isPrimary ? " · primary" : ""}
                      {p.dob ? ` · DOB ${p.dob}` : ""}
                      {p.notes ? ` · ${p.notes}` : ""}
                    </>
                  }
                  onEdit={() => { setError(null); dialog.openFor(p); }}
                  onDelete={p.isPrimary ? undefined : () => handleDelete(p)}
                />
              ))}
            </EntityList>
          )}
        </>
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
          {error ? (
            <div className="text-xs text-severity-critical bg-red-50 px-3 py-2 rounded-button">
              {error}
            </div>
          ) : null}
          <Field label="Full name" htmlFor="fullName">
            <Input
              id="fullName"
              name="fullName"
              required
              autoFocus
              defaultValue={dialog.item?.fullName ?? ""}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
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
            <Field label="Date of birth" htmlFor="dob">
              <Input
                id="dob"
                name="dob"
                type="date"
                defaultValue={dialog.item?.dob ?? ""}
              />
            </Field>
          </div>
          <Field label="Notes" hint="Optional. Anything useful you'd want to remember." htmlFor="notes">
            <Textarea id="notes" name="notes" defaultValue={dialog.item?.notes ?? ""} />
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
