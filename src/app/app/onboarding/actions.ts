"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(2).max(80),
  region: z.enum(["IN", "GCC", "GLOBAL"]),
  currency: z.string().min(3).max(4),
  structure: z.enum([
    "SINGLE",
    "DINK",
    "NUCLEAR",
    "NUCLEAR_WITH_PARENTS",
    "JOINT",
    "SINGLE_PARENT",
    "MULTI_GEN",
    "CROSS_BORDER",
  ]),
  mode: z.enum(["BASIC", "ADVANCED"]),
  primaryName: z.string().min(1),
});

export async function createHouseholdAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const parsed = Schema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    region: String(formData.get("region") ?? "IN"),
    currency: String(formData.get("currency") ?? "INR"),
    structure: String(formData.get("structure") ?? "NUCLEAR"),
    mode: String(formData.get("mode") ?? "BASIC"),
    primaryName: String(formData.get("primaryName") ?? "").trim(),
  });
  if (!parsed.success) redirect("/app/onboarding?error=" + encodeURIComponent("Invalid input"));

  const hh = await prisma.household.create({
    data: {
      name: parsed.data.name,
      region: parsed.data.region,
      currency: parsed.data.currency,
      structure: parsed.data.structure,
      mode: parsed.data.mode,
      firmId: session.firmId,
      members: { create: { userId: session.userId, scope: "FULL" } },
      persons: {
        create: {
          fullName: parsed.data.primaryName,
          preferredName: parsed.data.primaryName.split(" ")[0],
          isPrimary: true,
          residencyCountry: parsed.data.region === "IN" ? "IN" : null,
        },
      },
    },
  });

  await audit({
    actorUserId: session.userId,
    householdId: hh.id,
    kind: "OTHER",
    action: "CREATE",
    objectType: "Household",
    objectId: hh.id,
    reason: "Household created via onboarding",
  });

  if (parsed.data.mode === "BASIC") {
    redirect(`/app/households/${hh.id}/basic`);
  } else {
    redirect(`/app/households/${hh.id}`);
  }
}
