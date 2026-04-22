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

export async function saveTaxAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const householdId = String(formData.get("householdId"));
  const regime = String(formData.get("regime") ?? "") || null;
  const businessIncomeShareStr = String(formData.get("businessIncomeShare") ?? "").trim();
  const businessIncomeShare = businessIncomeShareStr ? Math.min(1, Math.max(0, Number(businessIncomeShareStr))) : null;
  const tags = String(formData.get("complexityTags") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  await ensure(householdId, session.userId);
  const before = await prisma.taxProfile.findUnique({ where: { householdId } });
  const after = await prisma.taxProfile.upsert({
    where: { householdId },
    create: {
      householdId,
      regime,
      businessIncomeShare,
      complexityTags: JSON.stringify(tags),
    },
    update: {
      regime,
      businessIncomeShare,
      complexityTags: JSON.stringify(tags),
    },
  });
  await audit({
    actorUserId: session.userId,
    householdId,
    kind: "FIELD_WRITE",
    objectType: "TaxProfile",
    objectId: after.id,
    action: before ? "UPDATE" : "CREATE",
    before,
    after,
  });
  revalidatePath(`/app/households/${householdId}/tax`);
}
