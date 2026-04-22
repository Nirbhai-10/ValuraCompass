"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const Schema = z.object({
  householdId: z.string(),
  category: z.string(),
  label: z.string().optional(),
  amountMonthly: z.number().nonnegative(),
  essential: z.boolean().optional(),
  nonNegotiable: z.boolean().optional(),
  inflationSensitivity: z.enum(["GENERAL", "HEALTHCARE", "EDUCATION", "CUSTOM"]).optional(),
});

async function ensure(householdId: string, userId: string) {
  const m = await prisma.householdMembership.findUnique({
    where: { householdId_userId: { householdId, userId } },
  });
  if (!m) throw new Error("FORBIDDEN");
}

export async function createExpenseAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const data = {
    householdId: String(formData.get("householdId")),
    category: String(formData.get("category")),
    label: String(formData.get("label") ?? "").trim() || undefined,
    amountMonthly: Number(formData.get("amountMonthly") ?? 0),
    essential: formData.get("essential") === "on",
    nonNegotiable: formData.get("nonNegotiable") === "on",
    inflationSensitivity: String(formData.get("inflationSensitivity") ?? "GENERAL") as any,
  };
  const parsed = Schema.parse(data);
  await ensure(parsed.householdId, session.userId);
  const h = await prisma.household.findUnique({ where: { id: parsed.householdId } });
  const created = await prisma.expense.create({
    data: {
      ...parsed,
      currency: h?.currency ?? "INR",
    },
  });
  await audit({ actorUserId: session.userId, householdId: parsed.householdId, kind: "FIELD_WRITE", objectType: "Expense", objectId: created.id, action: "CREATE", after: created });
  revalidatePath(`/app/households/${parsed.householdId}/expenses`);
}

export async function deleteExpenseAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const householdId = String(formData.get("householdId"));
  const id = String(formData.get("id"));
  await ensure(householdId, session.userId);
  const before = await prisma.expense.findUnique({ where: { id } });
  await prisma.expense.delete({ where: { id } });
  await audit({ actorUserId: session.userId, householdId, kind: "FIELD_WRITE", objectType: "Expense", objectId: id, action: "DELETE", before });
  revalidatePath(`/app/households/${householdId}/expenses`);
}
