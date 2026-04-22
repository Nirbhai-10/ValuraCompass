"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PersonSchema = z.object({
  householdId: z.string(),
  fullName: z.string().min(1),
  dob: z.string().optional(),
  residencyCountry: z.string().max(2).optional(),
  isDependent: z.boolean().optional(),
  isCaregiver: z.boolean().optional(),
  specialNeedsFlag: z.boolean().optional(),
  elderlyFlag: z.boolean().optional(),
});

async function ensureMember(householdId: string, userId: string) {
  const m = await prisma.householdMembership.findUnique({
    where: { householdId_userId: { householdId, userId } },
  });
  if (!m) throw new Error("FORBIDDEN");
}

export async function createPersonAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const data = {
    householdId: String(formData.get("householdId")),
    fullName: String(formData.get("fullName") ?? "").trim(),
    dob: String(formData.get("dob") ?? "").trim() || undefined,
    residencyCountry: (String(formData.get("residencyCountry") ?? "").toUpperCase().trim() || undefined) as string | undefined,
    isDependent: formData.get("isDependent") === "on",
    isCaregiver: formData.get("isCaregiver") === "on",
    specialNeedsFlag: formData.get("specialNeedsFlag") === "on",
    elderlyFlag: formData.get("elderlyFlag") === "on",
  };
  const parsed = PersonSchema.parse(data);
  await ensureMember(parsed.householdId, session.userId);
  const created = await prisma.person.create({
    data: {
      householdId: parsed.householdId,
      fullName: parsed.fullName,
      dob: parsed.dob ? new Date(parsed.dob) : null,
      residencyCountry: parsed.residencyCountry,
      isDependent: parsed.isDependent ?? false,
      isCaregiver: parsed.isCaregiver ?? false,
      specialNeedsFlag: parsed.specialNeedsFlag ?? false,
      elderlyFlag: parsed.elderlyFlag ?? false,
    },
  });
  await audit({
    actorUserId: session.userId,
    householdId: parsed.householdId,
    kind: "FIELD_WRITE",
    objectType: "Person",
    objectId: created.id,
    action: "CREATE",
    after: created,
  });
  revalidatePath(`/app/households/${parsed.householdId}/people`);
}

export async function deletePersonAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const householdId = String(formData.get("householdId"));
  const personId = String(formData.get("personId"));
  await ensureMember(householdId, session.userId);
  const person = await prisma.person.findUnique({ where: { id: personId } });
  if (!person || person.householdId !== householdId) return;
  if (person.isPrimary) return;
  await prisma.person.delete({ where: { id: personId } });
  await audit({
    actorUserId: session.userId,
    householdId,
    kind: "FIELD_WRITE",
    objectType: "Person",
    objectId: personId,
    action: "DELETE",
    before: person,
  });
  revalidatePath(`/app/households/${householdId}/people`);
}

const RelSchema = z.object({
  householdId: z.string(),
  fromId: z.string(),
  toId: z.string(),
  type: z.string(),
  dependency: z.string(),
  financiallyLinked: z.boolean().optional(),
});

export async function addRelationshipAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const data = {
    householdId: String(formData.get("householdId")),
    fromId: String(formData.get("fromId")),
    toId: String(formData.get("toId")),
    type: String(formData.get("type")),
    dependency: String(formData.get("dependency")),
    financiallyLinked: formData.get("financiallyLinked") === "on",
  };
  const parsed = RelSchema.parse(data);
  await ensureMember(parsed.householdId, session.userId);
  if (parsed.fromId === parsed.toId) return;
  const created = await prisma.relationship.create({ data: parsed });
  await audit({
    actorUserId: session.userId,
    householdId: parsed.householdId,
    kind: "FIELD_WRITE",
    objectType: "Relationship",
    objectId: created.id,
    action: "CREATE",
    after: created,
  });
  revalidatePath(`/app/households/${parsed.householdId}/people`);
}

export async function deleteRelationshipAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const householdId = String(formData.get("householdId"));
  const relId = String(formData.get("relId"));
  await ensureMember(householdId, session.userId);
  await prisma.relationship.delete({ where: { id: relId } });
  await audit({
    actorUserId: session.userId,
    householdId,
    kind: "FIELD_WRITE",
    objectType: "Relationship",
    objectId: relId,
    action: "DELETE",
  });
  revalidatePath(`/app/households/${householdId}/people`);
}
