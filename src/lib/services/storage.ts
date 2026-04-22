/*
 * File storage service — works locally by default (public/uploads).
 * In production, swap to S3 / GCS / Azure Blob via env-configurable provider.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

const ROOT = path.join(process.cwd(), "public", "uploads");

export interface StoredFile {
  storagePath: string;    // logical path we persist
  absolutePath: string;   // server-side
  publicUrl: string | null; // null if not publicly served
  size: number;
  mimeType: string | null;
  originalName: string;
}

export async function storeUpload(file: File, householdId: string): Promise<StoredFile> {
  await mkdir(path.join(ROOT, householdId), { recursive: true });
  const ext = file.name.includes(".") ? "." + file.name.split(".").pop() : "";
  const filename = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
  const abs = path.join(ROOT, householdId, filename);
  const ab = await file.arrayBuffer();
  const buf = new Uint8Array(ab);
  await writeFile(abs, buf);
  return {
    storagePath: `uploads/${householdId}/${filename}`,
    absolutePath: abs,
    publicUrl: `/uploads/${householdId}/${filename}`,
    size: buf.length,
    mimeType: file.type || null,
    originalName: file.name,
  };
}
