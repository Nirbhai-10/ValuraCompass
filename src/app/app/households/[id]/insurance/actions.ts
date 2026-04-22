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
  insurer: z.string().optional(),
  sumAssured: z.number().nonnegative(),
  premiumAnnual: z.number().nonnegative().optional(),
  policyTermYears: z.number().int().nonnegative().optional(),
});

async function ensure(householdId: string, userId: string) {
  const m = await prisma.householdMembership.findUnique({
    where: { householdId_userId: { householdId, userId } },
  });
  if (!m) throw new Error("FORBIDDEN");
}

export async function createPolicyAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const data = {
    householdId: String(formData.get("householdId")),
    label: String(formData.get("label") ?? "").trim(),
    type: String(formData.get("type") ?? "TERM"),
    insurer: String(formData.get("insurer") ?? "").trim() || undefined,
    sumAssured: Number(formData.get("sumAssured") ?? 0),
    premiumAnnual: formData.get("premiumAnnual") ? Number(formData.get("premiumAnnual")) : undefined,
    policyTermYears: formData.get("policyTermYears") ? Number(formData.get("policyTermYears")) : undefined,
  };
  const parsed = Schema.parse(data);
  await ensure(parsed.householdId, session.userId);
  const h = await prisma.household.findUnique({ where: { id: parsed.householdId } });
  const created = await prisma.policy.create({
    data: {
      ...parsed,
      currency: h?.currency ?? "INR",
    },
  });
  await audit({ actorUserId: session.userId, householdId: parsed.householdId, kind: "FIELD_WRITE", objectType: "Policy", objectId: created.id, action: "CREATE", after: created });
  revalidatePath(`/app/households/${parsed.householdId}/insurance`);
}

export async function deletePolicyAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const householdId = String(formData.get("householdId"));
  const id = String(formData.get("id"));
  await ensure(householdId, session.userId);
  const before = await prisma.policy.findUnique({ where: { id } });
  await prisma.policy.delete({ where: { id } });
  await audit({ actorUserId: session.userId, householdId, kind: "FIELD_WRITE", objectType: "Policy", objectId: id, action: "DELETE", before });
  revalidatePath(`/app/households/${householdId}/insurance`);
}
