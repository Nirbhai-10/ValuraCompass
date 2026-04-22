/*
 * OCR / Document Understanding Service — INTEGRATION PLACEHOLDER.
 *
 * V1 Compass is manual-first, OCR-assisted. Real document classification and
 * extraction are external dependencies (e.g., Google Document AI, Azure Form
 * Recognizer, AWS Textract, or a specialized ITR/policy OCR provider).
 *
 * This module exposes a stable interface so pages and actions can be built
 * against it today. Swap the implementation later without changing the caller.
 */

export type OcrStatus = "NOT_STARTED" | "PENDING" | "DONE" | "FAILED";

export interface OcrExtractedField {
  key: string;
  value: string | number | null;
  confidence: number; // 0..1
  bbox?: { x: number; y: number; w: number; h: number };
  page?: number;
}

export interface OcrResult {
  documentType: string;
  fields: OcrExtractedField[];
  rawText?: string;
  providerMeta?: Record<string, unknown>;
}

export interface OcrService {
  extract(filePath: string, hint?: string): Promise<OcrResult>;
}

class PlaceholderOcrService implements OcrService {
  async extract(filePath: string, hint?: string): Promise<OcrResult> {
    // Intentionally returns a minimal, honest placeholder so the UI flow works
    // end-to-end without external calls. Never invents fields or numbers.
    return {
      documentType: hint ?? "UNKNOWN",
      fields: [],
      providerMeta: {
        providerId: "placeholder",
        note: "OCR provider not configured. Connect Google Document AI, Textract, or equivalent to populate fields.",
        filePath,
      },
    };
  }
}

let instance: OcrService | null = null;

export function getOcrService(): OcrService {
  if (!instance) instance = new PlaceholderOcrService();
  return instance;
}

export function setOcrServiceForTests(svc: OcrService): void {
  instance = svc;
}
