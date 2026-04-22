"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

async function ensure(householdId: string, userId: string) {
  const m = await prisma.householdMembership.findUnique({
    where: { householdId_userId: { householdId, userId } },
  });
  if (!m) throw new Error("FORBIDDEN");
}

export async function createTaskFromInsightAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const householdId = String(formData.get("householdId"));
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim() || undefined;
  const taskType = String(formData.get("taskType") ?? "RECOMMENDATION");
  const ownerType = String(formData.get("ownerType") ?? "CLIENT") as any;
  const priority = String(formData.get("priority") ?? "MEDIUM") as any;
  await ensure(householdId, session.userId);
  const existing = await prisma.task.findFirst({ where: { householdId, title, status: { in: ["OPEN", "IN_PROGRESS"] } } });
  if (existing) {
    revalidatePath(`/app/households/${householdId}/tasks`);
    return;
  }
  const created = await prisma.task.create({
    data: { householdId, title, body, type: taskType, ownerType, priority, createdBy: "USER" },
  });
  await audit({ actorUserId: session.userId, householdId, kind: "TASK", objectType: "Task", objectId: created.id, action: "CREATE", after: created, reason: "From insight" });
  revalidatePath(`/app/households/${householdId}/tasks`);
  revalidatePath(`/app/households/${householdId}/insights`);
}
