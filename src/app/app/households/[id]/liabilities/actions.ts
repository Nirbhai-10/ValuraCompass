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
  lender: z.string().optional(),
  outstanding: z.number().nonnegative(),
  interestRate: z.number().nonnegative().optional(),
  interestType: z.enum(["FIXED", "FLOATING"]).optional(),
  tenureMonths: z.number().int().nonnegative().optional(),
  emiMonthly: z.number().nonnegative().optional(),
});

async function ensure(householdId: string, userId: string) {
  const m = await prisma.householdMembership.findUnique({
    where: { householdId_userId: { householdId, userId } },
  });
  if (!m) throw new Error("FORBIDDEN");
}

export async function createLiabilityAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const data = {
    householdId: String(formData.get("householdId")),
    label: String(formData.get("label") ?? "").trim(),
    type: String(formData.get("type") ?? "OTHER"),
    lender: String(formData.get("lender") ?? "").trim() || undefined,
    outstanding: Number(formData.get("outstanding") ?? 0),
    interestRate: formData.get("interestRate") ? Number(formData.get("interestRate")) : undefined,
    interestType: (String(formData.get("interestType") ?? "FIXED")) as any,
    tenureMonths: formData.get("tenureMonths") ? Number(formData.get("tenureMonths")) : undefined,
    emiMonthly: formData.get("emiMonthly") ? Number(formData.get("emiMonthly")) : undefined,
  };
  const parsed = Schema.parse(data);
  await ensure(parsed.householdId, session.userId);
  const h = await prisma.household.findUnique({ where: { id: parsed.householdId } });
  const created = await prisma.liability.create({
    data: {
      ...parsed,
      currency: h?.currency ?? "INR",
    },
  });
  await audit({ actorUserId: session.userId, householdId: parsed.householdId, kind: "FIELD_WRITE", objectType: "Liability", objectId: created.id, action: "CREATE", after: created });
  revalidatePath(`/app/households/${parsed.householdId}/liabilities`);
}

export async function deleteLiabilityAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const householdId = String(formData.get("householdId"));
  const id = String(formData.get("id"));
  await ensure(householdId, session.userId);
  const before = await prisma.liability.findUnique({ where: { id } });
  await prisma.liability.delete({ where: { id } });
  await audit({ actorUserId: session.userId, householdId, kind: "FIELD_WRITE", objectType: "Liability", objectId: id, action: "DELETE", before });
  revalidatePath(`/app/households/${householdId}/liabilities`);
}
