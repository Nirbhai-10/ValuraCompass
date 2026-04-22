"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const Schema = z.object({
  householdId: z.string(),
  label: z.string().min(1),
  currentValue: z.number().nonnegative(),
  assetClass: z.string(),
  instrument: z.string().optional(),
  liquidityBucket: z.enum(["T0", "T2", "D30", "D90", "Y1", "ILLIQUID"]),
  ownershipType: z.string(),
});

async function ensure(householdId: string, userId: string) {
  const m = await prisma.householdMembership.findUnique({
    where: { householdId_userId: { householdId, userId } },
  });
  if (!m) throw new Error("FORBIDDEN");
}

export async function createAssetAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const data = {
    householdId: String(formData.get("householdId")),
    label: String(formData.get("label") ?? "").trim(),
    currentValue: Number(formData.get("currentValue") ?? 0),
    assetClass: String(formData.get("assetClass") ?? "OTHER"),
    instrument: String(formData.get("instrument") ?? "") || undefined,
    liquidityBucket: String(formData.get("liquidityBucket") ?? "D30") as any,
    ownershipType: String(formData.get("ownershipType") ?? "SOLE"),
  };
  const parsed = Schema.parse(data);
  await ensure(parsed.householdId, session.userId);
  const h = await prisma.household.findUnique({ where: { id: parsed.householdId } });
  const created = await prisma.asset.create({
    data: {
      ...parsed,
      currency: h?.currency ?? "INR",
    },
  });
  await audit({ actorUserId: session.userId, householdId: parsed.householdId, kind: "FIELD_WRITE", objectType: "Asset", objectId: created.id, action: "CREATE", after: created });
  revalidatePath(`/app/households/${parsed.householdId}/assets`);
}

export async function deleteAssetAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const householdId = String(formData.get("householdId"));
  const id = String(formData.get("id"));
  await ensure(householdId, session.userId);
  const before = await prisma.asset.findUnique({ where: { id } });
  await prisma.asset.delete({ where: { id } });
  await audit({ actorUserId: session.userId, householdId, kind: "FIELD_WRITE", objectType: "Asset", objectId: id, action: "DELETE", before });
  revalidatePath(`/app/households/${householdId}/assets`);
}
