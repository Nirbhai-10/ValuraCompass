"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

async function ensure(householdId: string, userId: string) {
  const m = await prisma.householdMembership.findUnique({
    where: { householdId_userId: { householdId, userId } },
  });
  if (!m) throw new Error("FORBIDDEN");
}

export async function saveEstateAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const householdId = String(formData.get("householdId"));
  await ensure(householdId, session.userId);
  const data = {
    willStatus: String(formData.get("willStatus") ?? "NONE") || null,
    trustStatus: String(formData.get("trustStatus") ?? "NONE") || null,
    poaStatus: String(formData.get("poaStatus") ?? "NONE") || null,
    guardianshipNotes: String(formData.get("guardianshipNotes") ?? "").trim() || null,
    legacyIntentNotes: String(formData.get("legacyIntentNotes") ?? "").trim() || null,
  };
  const before = await prisma.estateProfile.findUnique({ where: { householdId } });
  const after = await prisma.estateProfile.upsert({
    where: { householdId },
    create: { householdId, ...data },
    update: data,
  });
  await audit({ actorUserId: session.userId, householdId, kind: "FIELD_WRITE", objectType: "EstateProfile", objectId: after.id, action: before ? "UPDATE" : "CREATE", before, after });
  revalidatePath(`/app/households/${householdId}/estate`);
}
