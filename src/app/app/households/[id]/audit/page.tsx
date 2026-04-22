import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { prisma } from "@/lib/prisma";

export default async function AuditPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");
  const events = await prisma.auditEvent.findMany({
    where: { householdId: h.id },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: true },
  });

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h2 className="font-semibold">Audit trail (last 200)</h2>
        <p className="text-xs text-ink-500 mt-1">Immutable log of changes, uploads, computations, and decisions.</p>
      </div>
      <div className="card">
        <div className="card-body">
          {events.length === 0 ? (
            <p className="text-sm text-ink-500">No events yet.</p>
          ) : (
            <table className="w-full table">
              <thead>
                <tr><th>When</th><th>Kind</th><th>Action</th><th>Object</th><th>Actor</th><th>Reason</th></tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td className="text-ink-500 tabular-nums">{new Date(e.createdAt).toLocaleString()}</td>
                    <td className="text-ink-500">{e.kind}</td>
                    <td>
                      {e.action}
                    </td>
                    <td className="text-ink-500">{e.objectType ?? "—"}{e.objectId ? ` / ${e.objectId.slice(-6)}` : ""}</td>
                    <td className="text-ink-500">{e.actor?.name ?? (e.actorUserId ?? "system")}</td>
                    <td className="text-ink-500">{e.reason ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
