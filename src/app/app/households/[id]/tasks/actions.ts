"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateSchema = z.object({
  householdId: z.string(),
  title: z.string().min(1),
  body: z.string().optional(),
  type: z.string(),
  ownerType: z.enum(["ADVISOR", "CLIENT", "SPOUSE", "SPECIALIST", "COMPLIANCE"]),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  dueDate: z.string().optional(),
});

async function ensure(householdId: string, userId: string) {
  const m = await prisma.householdMembership.findUnique({
    where: { householdId_userId: { householdId, userId } },
  });
  if (!m) throw new Error("FORBIDDEN");
}

export async function createTaskAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const data = {
    householdId: String(formData.get("householdId")),
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim() || undefined,
    type: String(formData.get("type") ?? "RECOMMENDATION"),
    ownerType: String(formData.get("ownerType") ?? "CLIENT") as any,
    priority: String(formData.get("priority") ?? "MEDIUM") as any,
    dueDate: String(formData.get("dueDate") ?? "").trim() || undefined,
  };
  const parsed = CreateSchema.parse(data);
  await ensure(parsed.householdId, session.userId);
  const created = await prisma.task.create({
    data: {
      ...parsed,
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      createdBy: "USER",
    },
  });
  await audit({ actorUserId: session.userId, householdId: parsed.householdId, kind: "TASK", objectType: "Task", objectId: created.id, action: "CREATE", after: created });
  revalidatePath(`/app/households/${parsed.householdId}/tasks`);
}

export async function updateTaskStatusAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const householdId = String(formData.get("householdId"));
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["OPEN", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELLED"].includes(status)) return;
  await ensure(householdId, session.userId);
  const before = await prisma.task.findUnique({ where: { id } });
  const updated = await prisma.task.update({ where: { id }, data: { status } });
  await audit({ actorUserId: session.userId, householdId, kind: "TASK", objectType: "Task", objectId: id, action: "UPDATE", before, after: updated });
  revalidatePath(`/app/households/${householdId}/tasks`);
}

export async function deleteTaskAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const householdId = String(formData.get("householdId"));
  const id = String(formData.get("id"));
  await ensure(householdId, session.userId);
  const before = await prisma.task.findUnique({ where: { id } });
  await prisma.task.delete({ where: { id } });
  await audit({ actorUserId: session.userId, householdId, kind: "TASK", objectType: "Task", objectId: id, action: "DELETE", before });
  revalidatePath(`/app/households/${householdId}/tasks`);
}
