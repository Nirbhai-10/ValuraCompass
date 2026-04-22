"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { saveAssumptionOverrides } from "@/lib/assumptions";
import { getRegion } from "@/lib/region";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const KEYS = [
  "retirementAge", "longevity", "inflationGeneral", "inflationHealthcare", "inflationEducation",
  "equityNominalReturn", "debtNominalReturn", "goldNominalReturn", "realEstateAppreciation", "wageGrowth",
] as const;

async function ensure(householdId: string, userId: string) {
  const m = await prisma.householdMembership.findUnique({
    where: { householdId_userId: { householdId, userId } },
  });
  if (!m) throw new Error("FORBIDDEN");
}

export async function saveAssumptionsAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const householdId = String(formData.get("householdId"));
  await ensure(householdId, session.userId);
  const h = await prisma.household.findUnique({ where: { id: householdId } });
  const base = getRegion(h?.region).assumptions;
  const overrides: Partial<typeof base> = {};
  for (const k of KEYS) {
    const raw = formData.get(k);
    if (raw == null) continue;
    const n = Number(raw);
    if (!Number.isFinite(n)) continue;
    // Keep only values that differ from region default (≥ 0.0005 diff)
    if (Math.abs(n - (base as any)[k]) > 0.0005) {
      (overrides as any)[k] = n;
    }
  }
  await saveAssumptionOverrides(householdId, overrides);
  await audit({ actorUserId: session.userId, householdId, kind: "FIELD_WRITE", objectType: "AssumptionOverride", action: "UPDATE", after: overrides });
  revalidatePath(`/app/households/${householdId}/assumptions`);
}

export async function resetAssumptionsAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const householdId = String(formData.get("householdId"));
  await ensure(householdId, session.userId);
  await prisma.assumptionOverride.deleteMany({ where: { householdId } });
  await audit({ actorUserId: session.userId, householdId, kind: "FIELD_WRITE", objectType: "AssumptionOverride", action: "DELETE", reason: "reset to region defaults" });
  revalidatePath(`/app/households/${householdId}/assumptions`);
}
