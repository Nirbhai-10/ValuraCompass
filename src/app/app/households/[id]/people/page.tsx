"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { useDatabase, useUpdate, uid } from "@/lib/store";
import { PERSON_RELATIONS } from "@/lib/types";

export default function PeoplePage() {
  const params = useParams<{ id: string }>();
  const householdId = params?.id ?? "";
  const db = useDatabase();
  const update = useUpdate();
  const persons = db.persons.filter((p) => p.householdId === householdId);

  const [open, setOpen] = useState(false);

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fullName = String(fd.get("fullName") ?? "").trim();
    const relation = String(fd.get("relation") ?? "Other");
    const dob = String(fd.get("dob") ?? "").trim();
    if (!fullName) return;

    update((curr) => ({
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
    }));

    e.currentTarget.reset();
    setOpen(false);
  }

  function handleRemove(personId: string) {
    update((curr) => ({
      ...curr,
      persons: curr.persons.filter((p) => p.id !== personId),
      incomes: curr.incomes.map((i) =>
        i.personId === personId ? { ...i, personId: undefined } : i,
      ),
    }));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">People</h2>
          <p className="text-sm text-ink-500 mt-1">
            Family members and dependents in this household.
          </p>
        </div>
        {!open ? (
          <button onClick={() => setOpen(true)} className="btn-primary text-sm">
            Add person
          </button>
        ) : null}
      </div>

      {open ? (
        <form onSubmit={handleAdd} className="card card-pad grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="label">Full name</label>
            <input className="input" name="fullName" required autoFocus />
          </div>
          <div>
            <label className="label">Relation</label>
            <select className="input" name="relation" defaultValue="Spouse">
              {PERSON_RELATIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Date of birth (optional)</label>
            <input className="input" name="dob" type="date" />
          </div>
          <div className="sm:col-span-3 flex gap-2">
            <button className="btn-primary text-sm" type="submit">
              Save person
            </button>
            <button type="button" className="btn-ghost text-sm" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {persons.length === 0 ? (
        <div className="card card-pad text-center text-sm text-ink-500">
          No one added yet. Add your first person above.
        </div>
      ) : (
        <ul className="card divide-y divide-line-100">
          {persons.map((p) => (
            <li
              key={p.id}
              className="px-5 py-4 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{p.fullName}</p>
                <p className="text-xs text-ink-500 mt-0.5">
                  {p.relation}
                  {p.isPrimary ? " · primary" : ""}
                  {p.dob ? ` · DOB ${p.dob}` : ""}
                </p>
              </div>
              {!p.isPrimary ? (
                <button onClick={() => handleRemove(p.id)} className="btn-danger text-xs">
                  Remove
                </button>
              ) : (
                <span className="chip">Primary</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
