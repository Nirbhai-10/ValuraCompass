"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { storeUpload } from "@/lib/services/storage";
import { getOcrService } from "@/lib/services/ocr";
import { revalidatePath } from "next/cache";

async function ensure(householdId: string, userId: string) {
  const m = await prisma.householdMembership.findUnique({
    where: { householdId_userId: { householdId, userId } },
  });
  if (!m) throw new Error("FORBIDDEN");
}

export async function uploadDocumentAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const householdId = String(formData.get("householdId"));
  await ensure(householdId, session.userId);
  const type = String(formData.get("type") ?? "OTHER");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  if (file.size > 5 * 1024 * 1024) throw new Error("FILE_TOO_LARGE");

  const stored = await storeUpload(file, householdId);
  const doc = await prisma.document.create({
    data: {
      householdId,
      filename: stored.storagePath.split("/").pop() ?? "file",
      originalName: stored.originalName,
      type,
      size: stored.size,
      mimeType: stored.mimeType,
      uploadedByUserId: session.userId,
      privacyClass: type === "ID" || type === "WILL" ? "HIGHLY_SENSITIVE" : "SENSITIVE",
      storagePath: stored.storagePath,
    },
  });
  await audit({ actorUserId: session.userId, householdId, kind: "DOC_UPLOAD", objectType: "Document", objectId: doc.id, action: "CREATE", after: { type, size: stored.size, originalName: stored.originalName } });
  revalidatePath(`/app/households/${householdId}/documents`);
}

export async function runOcrAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const householdId = String(formData.get("householdId"));
  const id = String(formData.get("id"));
  await ensure(householdId, session.userId);
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return;
  await prisma.document.update({ where: { id }, data: { ocrStatus: "PENDING" } });
  try {
    const svc = getOcrService();
    const result = await svc.extract(doc.storagePath, doc.type);
    await prisma.document.update({
      where: { id },
      data: { ocrStatus: "DONE", ocrResult: JSON.stringify(result) },
    });
    await audit({ actorUserId: session.userId, householdId, kind: "DOC_UPLOAD", objectType: "Document", objectId: id, action: "RUN", reason: "OCR run (placeholder)", after: { providerMeta: result.providerMeta } });
  } catch (e) {
    await prisma.document.update({ where: { id }, data: { ocrStatus: "FAILED" } });
  }
  revalidatePath(`/app/households/${householdId}/documents`);
}

export async function deleteDocumentAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const householdId = String(formData.get("householdId"));
  const id = String(formData.get("id"));
  await ensure(householdId, session.userId);
  const before = await prisma.document.findUnique({ where: { id } });
  await prisma.document.delete({ where: { id } });
  await audit({ actorUserId: session.userId, householdId, kind: "DOC_UPLOAD", objectType: "Document", objectId: id, action: "DELETE", before });
  revalidatePath(`/app/households/${householdId}/documents`);
}
