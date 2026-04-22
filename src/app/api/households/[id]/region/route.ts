import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await requireSession();
  const membership = await prisma.householdMembership.findUnique({
    where: { householdId_userId: { householdId: params.id, userId: session.userId } },
  });
  if (!membership) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const body = await req.json();
  const region = ["IN", "GCC", "GLOBAL"].includes(body?.region) ? body.region : "IN";
  const currency = typeof body?.currency === "string" ? body.currency : region === "IN" ? "INR" : region === "GCC" ? "AED" : "USD";
  const prev = await prisma.household.findUnique({ where: { id: params.id } });
  const updated = await prisma.household.update({
    where: { id: params.id },
    data: { region, currency },
  });
  await audit({
    actorUserId: session.userId,
    householdId: params.id,
    kind: "FIELD_WRITE",
    objectType: "Household",
    objectId: params.id,
    action: "UPDATE",
    before: { region: prev?.region, currency: prev?.currency },
    after: { region: updated.region, currency: updated.currency },
  });
  return NextResponse.json({ ok: true });
}
