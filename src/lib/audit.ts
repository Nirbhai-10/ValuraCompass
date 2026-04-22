import { prisma } from "./prisma";

export async function audit(params: {
  householdId?: string | null;
  actorUserId?: string | null;
  kind: string;
  objectType?: string | null;
  objectId?: string | null;
  action: "CREATE" | "UPDATE" | "DELETE" | "VIEW" | "RUN";
  before?: unknown;
  after?: unknown;
  reason?: string;
}) {
  try {
    await prisma.auditEvent.create({
      data: {
        householdId: params.householdId ?? null,
        actorUserId: params.actorUserId ?? null,
        kind: params.kind,
        objectType: params.objectType ?? null,
        objectId: params.objectId ?? null,
        action: params.action,
        before: params.before ? JSON.stringify(params.before) : null,
        after: params.after ? JSON.stringify(params.after) : null,
        reason: params.reason ?? null,
      },
    });
  } catch {
    // Audit failures must not break primary flow.
  }
}
