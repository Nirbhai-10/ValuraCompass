# 19. Documents and OCR Ingestion

V1 Compass is **manual-first, OCR-assisted**. It does not rely on live account aggregation, open banking, or third-party feed APIs. Every data field can be entered manually; OCR accelerates intake; the user always sees the source.

---

## 19.1 Scope

### Supported document types

- **Statements.** Bank statements; credit card statements; broker statements; MF statements (CAMS/KFintech); EPF passbook; PPF passbook; NPS statements; retirement account statements.
- **Tax documents.** ITR (India: 1/2/3/4); Form 16; Form 26AS; AIS; salary certificates (GCC); TRC.
- **Policies.** Life, health, critical illness, accident, home, vehicle, business policies; annuity contracts; group policy certificates.
- **Loans.** Sanction letters; amortization schedules; current statement of account.
- **Portfolio holdings.** Stock/MF holding snapshots; PMS/AIF statements; offshore brokerage statements.
- **Identity / nominee.** ID documents (optional, minimal fields); nominee declaration forms; PoA documents.
- **Estate documents.** Will copies; trust deeds (as reference documents).

Region-aware document catalog defines expected fields and OCR templates.

### Out of scope (V1)

- Live account aggregation / AA (Account Aggregator) pipelines.
- Open banking connectors.
- Live market data feeds.
- Direct regulator integrations.

---

## 19.2 Ingestion workflow

1. **Upload.** Drag-drop, mobile photo, or bulk upload. Uploads accept PDF, PNG, JPG, HEIC, and DOC/X where relevant.
2. **Classification.** System attempts to classify the document type and shows its guess with a confidence chip; user can correct.
3. **OCR extraction.** Server-side OCR + document understanding pipeline extracts structured fields based on the template for that type.
4. **Review.** A side-by-side preview (original left, extracted fields right) with per-field confidence.
5. **Mapping.** Extracted fields map to the data model (Section 7). Fields with low confidence are highlighted for user confirmation.
6. **Apply.** User confirms; fields are written to the household with `source = ocr` and extracted confidence.
7. **Audit.** Document + extraction + mapping decisions logged.

The flow is designed so the user can approve high-confidence fields in one click and only touch the uncertain ones.

---

## 19.3 OCR extraction review UX

- **Preview pane.** Original document with bounding boxes highlighting extracted regions.
- **Fields pane.** Each field shows: `Field label · Extracted value · Confidence (chip) · Mapping target (data model path)`.
- **Confidence display.** High ≥ 0.85 (auto-confirm if user allows), Medium 0.6–0.85 (flagged), Low < 0.6 (required confirmation).
- **Manual correction.** Click field → edit in place; update source to `user_corrected` (subtype of `user_entered`).
- **Rejection.** User can reject an extracted field; the system learns from corrections per tenant (optional).
- **Batch review.** Approve all High, then walk through Medium/Low.
- **Undo.** Last applied extraction set can be undone from the Audit trail.

---

## 19.4 Confidence display

- Per-field chip: `High · Medium · Low` with a tooltip explaining what contributed to the score (text quality, template match, value format).
- Per-document chip: aggregate confidence shown at the top of the review screen.
- Downstream: fields applied from OCR inherit their confidence (0.0–1.0) into the data model's `confidence` attribute. Low-confidence inputs reduce dependent output confidence visibly.

---

## 19.5 Manual correction workflow

- Inline edit on the review screen.
- A "corrections used" counter per template informs ongoing extraction tuning (optional).
- Advisors can bulk-correct recurring extraction mistakes for their firm's templates.
- Every correction is logged with `before → after` and actor.

---

## 19.6 Source citation in the plan

Every field written from OCR includes:
- `source = ocr`
- `source_document_id`
- `source_document_page`
- `source_bounding_box` (where relevant)
- `extraction_template_id`

In the UI, a small "from document" chip appears next to fields. Clicking it reveals the document and the specific extraction region. This makes every plan field **traceable**.

---

## 19.7 Data-to-field mapping

- Each template defines a mapping: `extracted_field → data_model_path`.
- Mappings are versioned (templates can evolve; old mappings still apply to historical extractions).
- Custom mappings (firm-level) are supported for firm-specific statements.

Example: a CAMS statement template maps:
- `scheme_name → asset.label`
- `folio_number → asset.external_id`
- `current_value → asset.current_value`
- `scheme_category → asset.asset_class` (via lookup)
- `tax_status → asset.tax_treatment_ref`

---

## 19.8 Document tagging

Every uploaded document is tagged:
- `type` (statement, ITR, policy, etc.)
- `members_linked` (people it belongs to)
- `instruments_linked` (assets/policies/liabilities)
- `as_of_date`
- `privacy_class`
- `retention_policy`

Tags drive retrieval and audit. The Document Vault is searchable by any tag.

---

## 19.9 Sensitivity classification

- **Normal.** Tax-related summaries without IDs.
- **Sensitive.** Full statements, policy documents, loan sanction letters.
- **Highly sensitive.** ID documents, medical documents, special-needs-related documents, will copies.

Sensitivity governs:
- Encryption at rest (field-level encryption for highly sensitive).
- Default visibility in couple/household (highly sensitive default is private to the uploader unless explicitly shared).
- Exportability (highly sensitive documents redacted unless user explicitly includes).

---

## 19.10 Versioning

- Every document has `versions`:
  - `version_id`, `uploaded_by`, `uploaded_at`, `supersedes`, `notes`.
- Superseding a document does not delete the prior version; it archives it.
- Field-level history: each applied-from-document field records the document version id, enabling "what this value used to be" reconstruction.

---

## 19.11 Review / approval logic

- **Advisor households.** Extractions above High confidence can be auto-applied by policy; Medium/Low always require review. Advisor or client can do the review based on firm policy.
- **Self-serve.** Only High confidence auto-applied with user opt-in; default requires review.
- **Compliance review (optional).** For firm policy, any document tagged highly sensitive requires compliance review before field application.

---

## 19.12 User permissions

- **Uploader** gets default ownership of the document.
- **Household members** may or may not see a document based on sensitivity class and explicit sharing.
- **Advisor** default sees all documents in an advisor-managed household except highly sensitive documents marked private.
- **Compliance** sees all documents within their firm scope with audit logging on each view.

---

## 19.13 Mobile capture

- Mobile document capture uses the device camera with auto-crop.
- Photos are converted to PDF on device where possible; otherwise at upload time.
- Low-light detection and guidance ("move closer," "more light").
- Batch capture supported (multi-page).

---

## 19.14 Extraction quality expectations (V1)

- Structured documents (ITR, Form 16, common bank/broker statements, common policy formats): target high confidence on 80%+ of critical fields.
- Scanned/low-quality documents: degrade gracefully; user prompted to review more.
- Unknown templates: generic extraction for headings/values; no auto-apply.

Ongoing template library expansion is planned (Section 25).

---

## 19.15 Error handling

- Failed uploads: clear error with retry; local queue for transient network issues.
- Failed OCR: the document is still saved; the user can extract later or enter manually.
- Ambiguous document type: user chooses from a short list.

---

## 19.16 Retention & deletion

- Default retention aligned to firm policy; configurable per tenant.
- Deletion: documents can be deleted by the uploader or advisor (with logging). If a deleted document was source for derived fields, those fields remain with a "source removed" flag, and the audit trail retains the original reference.
- Legal hold supported for compliance scenarios.

---

## 19.17 Governance and compliance

- Every extraction action is logged.
- Every manual correction is logged with before/after.
- Every view of highly sensitive documents is logged (who/when).
- Exports of documents include a redaction option.

---

## 19.18 Interaction with data model

- Extracted fields write to the same paths as manual entry; `source` and `confidence` differ.
- Scores show "Based on OCR extraction — confidence Medium" when dependent on a low-confidence extracted value.
- The "Why this?" drawer for any insight exposes the document and specific page used.

---

## 19.19 Anti-patterns to avoid

- Blocking the plan until documents are uploaded.
- Treating extracted values as "final" without a review step.
- Hiding the source from the user.
- Forcing users to upload IDs to continue.
- Over-requesting documents on first visit.
