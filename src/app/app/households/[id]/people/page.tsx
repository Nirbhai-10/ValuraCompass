import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { createPersonAction, deletePersonAction, addRelationshipAction, deleteRelationshipAction } from "./actions";
import { FamilyMap } from "@/components/family-map";
import { prisma } from "@/lib/prisma";

export default async function PeoplePage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");

  const relationships = await prisma.relationship.findMany({
    where: { householdId: h.id },
    include: { from: true, to: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Household Intelligence Map</h2>
          <p className="text-xs text-ink-500">People, earners, dependents, and relationships.</p>
        </div>
        <div className="card-body">
          <FamilyMap persons={h.persons} relationships={relationships} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold">People</h2>
            <span className="text-xs text-ink-500">{h.persons.length} total</span>
          </div>
          <div className="card-body">
            <table className="w-full text-sm table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Residency</th>
                  <th>Tags</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {h.persons.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.fullName}</td>
                    <td>
                      {p.isPrimary ? <span className="chip-positive">Primary</span> : null}
                      {p.isDependent ? <span className="chip-default ml-1">Dependent</span> : null}
                      {p.isCaregiver ? <span className="chip-default ml-1">Caregiver</span> : null}
                    </td>
                    <td className="text-ink-500">{p.residencyCountry ?? "—"}</td>
                    <td className="text-ink-500">
                      {p.specialNeedsFlag ? <span className="chip-warn mr-1">Special needs</span> : null}
                      {p.elderlyFlag ? <span className="chip-default mr-1">Elderly</span> : null}
                      {p.nriStatus && p.nriStatus !== "NONE" ? <span className="chip-default mr-1">{p.nriStatus}</span> : null}
                    </td>
                    <td className="text-right">
                      {!p.isPrimary ? (
                        <form action={deletePersonAction}>
                          <input type="hidden" name="householdId" value={h.id} />
                          <input type="hidden" name="personId" value={p.id} />
                          <button className="btn-ghost text-xs">Remove</button>
                        </form>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold">Add person</h2>
          </div>
          <form action={createPersonAction} className="card-body space-y-3">
            <input type="hidden" name="householdId" value={h.id} />
            <div>
              <label className="label">Full name</label>
              <input className="input" name="fullName" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Date of birth</label>
                <input className="input" name="dob" type="date" />
              </div>
              <div>
                <label className="label">Residency</label>
                <input className="input" name="residencyCountry" placeholder="IN / AE / US" maxLength={2} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isDependent" /> Dependent</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isCaregiver" /> Caregiver</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="specialNeedsFlag" /> Special needs (sensitive)</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="elderlyFlag" /> Elderly</label>
            </div>
            <button className="btn-primary w-full">Add person</button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold">Relationships</h2>
            <span className="text-xs text-ink-500">{relationships.length} edge(s)</span>
          </div>
          <div className="card-body">
            {relationships.length === 0 ? (
              <p className="text-sm text-ink-500">No relationships yet. Add one on the right to enable dependency analytics.</p>
            ) : (
              <table className="w-full table">
                <thead>
                  <tr><th>From</th><th>To</th><th>Type</th><th>Dependency</th><th>Linked</th><th></th></tr>
                </thead>
                <tbody>
                  {relationships.map((r) => (
                    <tr key={r.id}>
                      <td>{r.from.fullName}</td>
                      <td>{r.to.fullName}</td>
                      <td>{r.type}</td>
                      <td>{r.dependency.replace(/_/g, " ")}</td>
                      <td>{r.financiallyLinked ? "Yes" : "No"}</td>
                      <td className="text-right">
                        <form action={deleteRelationshipAction}>
                          <input type="hidden" name="householdId" value={h.id} />
                          <input type="hidden" name="relId" value={r.id} />
                          <button className="btn-ghost text-xs">Remove</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h2 className="font-semibold">Add relationship</h2></div>
          <form action={addRelationshipAction} className="card-body space-y-3">
            <input type="hidden" name="householdId" value={h.id} />
            <div className="grid grid-cols-2 gap-3">
              <PersonSelect name="fromId" label="From" persons={h.persons} />
              <PersonSelect name="toId" label="To" persons={h.persons} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Type</label>
                <select name="type" className="input" defaultValue="PARENT">
                  {["SPOUSE", "PARENT", "CHILD", "SIBLING", "IN_LAW", "PARTNER", "GUARDIAN", "CAREGIVER", "WARD"].map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Dependency</label>
                <select name="dependency" className="input" defaultValue="INDEPENDENT">
                  {["INDEPENDENT", "PARTIAL_SUPPORT", "FULL_SUPPORT", "REVERSE_SUPPORT"].map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="financiallyLinked" />
              Financially linked
            </label>
            <button className="btn-primary w-full">Add relationship</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PersonSelect({ name, label, persons }: { name: string; label: string; persons: { id: string; fullName: string }[] }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select name={name} className="input" required>
        <option value="">Select…</option>
        {persons.map((p) => (
          <option key={p.id} value={p.id}>{p.fullName}</option>
        ))}
      </select>
    </div>
  );
}
