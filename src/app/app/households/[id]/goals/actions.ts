"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const Schema = z.object({
  householdId: z.string(),
  label: z.string().min(1),
  type: z.string(),
  targetAmountToday: z.number().nonnegative(),
  targetYear: z.number().int().min(new Date().getFullYear()),
  priority: z.number().int().min(1).max(5),
  inflationCategory: z.enum(["GENERAL", "HEALTHCARE", "EDUCATION", "CUSTOM"]).optional(),
  flexibility: z.enum(["FIXED", "SOFT", "HIGHLY_FLEXIBLE"]).optional(),
  linkedPersonId: z.string().optional(),
});

async function ensure(householdId: string, userId: string) {
  const m = await prisma.householdMembership.findUnique({
    where: { householdId_userId: { householdId, userId } },
  });
  if (!m) throw new Error("FORBIDDEN");
}

export async function createGoalAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const data = {
    householdId: String(formData.get("householdId")),
    label: String(formData.get("label") ?? "").trim(),
    type: String(formData.get("type") ?? "OTHER"),
    targetAmountToday: Number(formData.get("targetAmountToday") ?? 0),
    targetYear: Number(formData.get("targetYear") ?? new Date().getFullYear() + 1),
    priority: Number(formData.get("priority") ?? 3),
    inflationCategory: (String(formData.get("inflationCategory") ?? "GENERAL")) as any,
    flexibility: (String(formData.get("flexibility") ?? "SOFT")) as any,
    linkedPersonId: String(formData.get("linkedPersonId") ?? "") || undefined,
  };
  const parsed = Schema.parse(data);
  await ensure(parsed.householdId, session.userId);
  const h = await prisma.household.findUnique({ where: { id: parsed.householdId } });
  const created = await prisma.goal.create({
    data: {
      ...parsed,
      currency: h?.currency ?? "INR",
    },
  });
  await audit({ actorUserId: session.userId, householdId: parsed.householdId, kind: "FIELD_WRITE", objectType: "Goal", objectId: created.id, action: "CREATE", after: created });
  revalidatePath(`/app/households/${parsed.householdId}/goals`);
}

export async function deleteGoalAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const householdId = String(formData.get("householdId"));
  const id = String(formData.get("id"));
  await ensure(householdId, session.userId);
  const before = await prisma.goal.findUnique({ where: { id } });
  await prisma.goal.delete({ where: { id } });
  await audit({ actorUserId: session.userId, householdId, kind: "FIELD_WRITE", objectType: "Goal", objectId: id, action: "DELETE", before });
  revalidatePath(`/app/households/${householdId}/goals`);
}
