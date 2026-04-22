"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const Schema = z.object({
  householdId: z.string(),
  stated: z.enum(["CONSERVATIVE", "MOD_CONSERVATIVE", "BALANCED", "GROWTH", "AGGRESSIVE"]),
  rationale: z.string().optional(),
});

async function ensure(householdId: string, userId: string) {
  const m = await prisma.householdMembership.findUnique({
    where: { householdId_userId: { householdId, userId } },
  });
  if (!m) throw new Error("FORBIDDEN");
}

export async function saveRiskAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const data = Schema.parse({
    householdId: String(formData.get("householdId")),
    stated: String(formData.get("stated") ?? "BALANCED") as any,
    rationale: String(formData.get("rationale") ?? "").trim() || undefined,
  });
  await ensure(data.householdId, session.userId);
  const before = await prisma.riskProfile.findUnique({ where: { householdId: data.householdId } });
  const after = await prisma.riskProfile.upsert({
    where: { householdId: data.householdId },
    create: { householdId: data.householdId, stated: data.stated, rationale: data.rationale },
    update: { stated: data.stated, rationale: data.rationale },
  });
  await audit({
    actorUserId: session.userId,
    householdId: data.householdId,
    kind: "SUITABILITY",
    objectType: "RiskProfile",
    objectId: after.id,
    action: before ? "UPDATE" : "CREATE",
    before,
    after,
  });
  revalidatePath(`/app/households/${data.householdId}/risk`);
}
