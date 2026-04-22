"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const Schema = z.object({
  householdId: z.string(),
  personId: z.string(),
  type: z.string(),
  label: z.string().min(1),
  amountMonthly: z.number().nonnegative(),
  variability: z.enum(["STABLE", "MODERATE", "HIGH"]),
  stabilityYears: z.number().int().nonnegative().optional(),
});

async function ensureMember(householdId: string, userId: string) {
  const m = await prisma.householdMembership.findUnique({
    where: { householdId_userId: { householdId, userId } },
  });
  if (!m) throw new Error("FORBIDDEN");
}

export async function createIncomeAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const data = {
    householdId: String(formData.get("householdId")),
    personId: String(formData.get("personId")),
    type: String(formData.get("type")),
    label: String(formData.get("label") ?? "").trim(),
    amountMonthly: Number(formData.get("amountMonthly") ?? 0),
    variability: String(formData.get("variability") ?? "STABLE") as any,
    stabilityYears: formData.get("stabilityYears") ? Number(formData.get("stabilityYears")) : undefined,
  };
  const parsed = Schema.parse(data);
  await ensureMember(parsed.householdId, session.userId);
  const h = await prisma.household.findUnique({ where: { id: parsed.householdId } });
  const created = await prisma.income.create({
    data: {
      householdId: parsed.householdId,
      personId: parsed.personId,
      type: parsed.type,
      label: parsed.label,
      amountMonthly: parsed.amountMonthly,
      variability: parsed.variability,
      stabilityYears: parsed.stabilityYears,
      currency: h?.currency ?? "INR",
    },
  });
  await audit({
    actorUserId: session.userId,
    householdId: parsed.householdId,
    kind: "FIELD_WRITE",
    objectType: "Income",
    objectId: created.id,
    action: "CREATE",
    after: created,
  });
  revalidatePath(`/app/households/${parsed.householdId}/income`);
}

export async function deleteIncomeAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const householdId = String(formData.get("householdId"));
  const id = String(formData.get("id"));
  await ensureMember(householdId, session.userId);
  const before = await prisma.income.findUnique({ where: { id } });
  await prisma.income.delete({ where: { id } });
  await audit({
    actorUserId: session.userId,
    householdId,
    kind: "FIELD_WRITE",
    objectType: "Income",
    objectId: id,
    action: "DELETE",
    before,
  });
  revalidatePath(`/app/households/${householdId}/income`);
}
