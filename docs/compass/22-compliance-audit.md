# 22. Compliance, Auditability, and Governance

Compass is built to operate comfortably in a compliance-heavy environment: RIAs, wealth managers, MFDs, insurance advisors, CA offices, bank-owned WM units, and firms that will be audited externally. Compliance is treated as a **platform property**, not a module.

This section specifies permissions, consent, source-of-truth rules, audit design, and governance artifacts.

---

## 22.1 Role and scope model

### Scopes
- **Global (system).** Platform admin functions.
- **Tenant (firm).** Firm admin, settings, branding, policies.
- **Workspace (team).** Sub-grouping within a firm (optional).
- **Household.** Primary data scope.
- **User.** Individual login.

### Roles (tenant-scope)
- **Firm Admin.** Manage firm settings, users, permissions, branding.
- **Compliance Officer.** Read everything within firm; approve overrides; export audit.
- **Advisor.** Manage assigned households; create/edit plans.
- **Junior / Analyst.** Edit data in assigned households; limited recommend/override.
- **Support Staff.** Upload documents, limited data entry.
- **Client.** Access own household only.
- **Client Spouse / Partner.** Access own household with consent-bound visibility.
- **Specialist (external).** View-only invited for a specific referral; time-boxed.

Roles map to **permissions**; permissions are attached to scopes. Fine-grained permissions (`read`, `edit`, `approve`, `override`, `export`) are supported.

---

## 22.2 Advisor vs client edit rights

Default rules:

- **Client.** Can edit own profile, own income, own expenses (if individual or if consented in couple). Can edit goals tagged to self; can edit their own policies and assets (owner fields).
- **Advisor.** Can edit any household data in assigned households unless a field is locked as "client-only."
- **Shared fields** (household-level cash flow categories, shared goals) are editable by either advisor or primary client, with audit trail.
- **Sensitive fields** (health, behavior notes, special-needs details) require explicit permission.

Conflict resolution: last-write wins with an explicit conflict chip when two edits occur within a short window.

---

## 22.3 Household permissioning

- **Household members** (people) have `household_membership` records with scopes: `full_access`, `read_only`, `limited_to_own_view`.
- **Advisor access** to a household is explicit — via invitation or firm assignment; assignments are logged.
- **Delegation** (e.g., team member of the advisor) is supported, with explicit scope.
- **Revocation** removes the access immediately; reads from that point forward fail.

---

## 22.4 Couple consent logic

- On adding a partner to a household, each partner is prompted to set **consent levels** on their private fields.
- Default: `share_with_partner = true` for household-level items; `share_with_partner = false` for personal health and personal behavior notes.
- **Joint goals** are editable by either; audit trail shows author.
- **Divergence** in answers (e.g., risk profile) is recorded with both inputs preserved.
- **Consent can be revoked**; revocation hides new changes from the other partner going forward and is recorded.

---

## 22.5 Document access controls

- Documents inherit sensitivity class (Section 19.9).
- Access derived from:
  - Uploader's sharing settings.
  - Role (advisor default access unless highly sensitive).
  - Compliance-officer firm-level read access.
- Views of highly sensitive documents are logged (who/when).

---

## 22.6 Sensitive data masking

- IDs (PAN, Aadhaar, Emirates ID, etc.) masked by default in UI; "Reveal" requires a user action and is logged.
- Bank account numbers masked; full value available on hover with audit log entry.
- Health fields never shown in reports unless explicitly included.

---

## 22.7 Source of truth rules

- For each field, one **owner role** is defined (e.g., client owns life-stage; advisor owns advisor notes).
- Other roles can propose edits via tasks; the owner accepts/rejects.
- Exceptional edits are allowed with `override_reason`.
- Derived fields have a formula and cannot be edited directly; their drivers can be adjusted.

---

## 22.8 Assumptions vs confirmed facts labeling

- Every field carries `source` (Section 7.2).
- UI chips show:
  - Confirmed (user-entered or imported from document).
  - Assumed (engine default).
  - OCR (with confidence).
  - Derived (computed).
- Reports show assumption lists in the appendix.
- Scores visibly derate confidence when too many inputs are `assumed_default`.

---

## 22.9 Audit trail design

Immutable, append-only, filterable, exportable. Stored in a dedicated audit store.

### Event kinds
- Auth events (login, logout, failed login, impersonation).
- Household create/update/archive.
- Membership changes (invite, revoke, delegate).
- Field writes with `before → after`.
- Document upload, view, delete.
- OCR extraction and field application.
- Score recomputes (with inputs snapshot).
- Insight creation/transitions.
- Task lifecycle events.
- Recommendation creation/acceptance/rejection.
- Suitability decision and overrides.
- Risk profile changes.
- Assumption set changes.
- Region changes.
- Exports.
- AI contributions (prompt template version, model version, output text, citations).
- Compliance approvals and escalations.
- Deletions (with retention guardrails).

### Per-event fields
- `event_id`, `timestamp`, `actor_user_id`, `actor_role`, `scope (household/firm)`, `object_type`, `object_id`, `action`, `before`, `after`, `reason`, `ip`, `user_agent`, `client_version`, `rule_pack_version (if relevant)`.

### Immutability
- Append-only; redactions produce a new "redaction" event that hides content in UI but preserves the log's integrity.

### UI
- **Audit Trail screen** (Section 16.36). Filter by actor, object, action, date. Detail drawer with before/after diffs.

### Export
- PDF (summary) and CSV / JSON (machine-readable). Exports themselves produce audit events.

---

## 22.10 Profile change logs

- Dedicated view of **profile changes** on Risk & Suitability screen: a timeline of RPS / ISS history with reasons.
- Used in regulated client meetings.

---

## 22.11 Score change logs

- Score history per score with change triggers:
  - Data change (which fields).
  - Assumption change.
  - Rule pack update.
  - Time-based re-evaluation.

---

## 22.12 Suitability rationale logs

- Every suitability decision (Allowed / Flagged / Restricted) is logged with components and rationale.
- Overrides require 80+ characters of reason and a compliance escalation toggle when Restricted → Allowed.

---

## 22.13 Recommendation rationale logs

- Every advisor recommendation in the Recommendation Center includes:
  - Household context snapshot.
  - Current RPS / ISS.
  - Category chosen and (optionally) specific product.
  - Alternatives considered.
  - Rationale text.
  - Client acknowledgment (if captured).
  - Compliance approval (if required by firm policy).

---

## 22.14 AI contribution logs

- Per AI output:
  - Prompt template id and version.
  - Model name and version.
  - Input context (references, not bulk).
  - Output text.
  - Citations.
  - Advisor edits (before and after).
  - Approvals.

---

## 22.15 Document ingestion logs

- Upload, classification, OCR extraction, field-level confidence, applied fields, corrections, re-extractions, deletions.

---

## 22.16 Override logs

- Fields and decisions that were overridden against system defaults:
  - Override reason.
  - Actor.
  - Previous and new values.
  - Visibility flag.

---

## 22.17 Version history

- Plan: versioned with named snapshots (e.g., `v1 — 2026-02-14`, `annual_review_2026`).
- Reports: versioned; prior versions retained.
- Rule packs: versioned; diffs available.
- Assumption sets: versioned; diffs available.

---

## 22.18 Review history

- Annual reviews and other formal reviews are stored as structured events with outcomes, decisions, and linked reports.

---

## 22.19 Export history

- Every export is an audit event: who, when, what, channel (download/email).
- For client-facing exports, the approving advisor is recorded.

---

## 22.20 Data retention principles

- Plan and household data retained indefinitely by default while a household is active.
- Archived households: data retained per firm policy (typical default: 7 years).
- Audit log retained per firm policy (typical default: 7+ years).
- Highly sensitive documents have minimal retention defaults; uploader can set retention per document.
- Deletion requests handled per jurisdictional privacy law and tenant policy; legal holds respected.

---

## 22.21 Security posture

- Encryption in transit (TLS 1.2+).
- Encryption at rest (AES-256 or platform equivalent).
- Field-level encryption for highly sensitive data.
- Key management via a managed KMS per region.
- Strict role separation in data access (principle of least privilege).
- Multi-factor authentication required for advisors and compliance roles.
- Session management with idle timeouts.

---

## 22.22 Privacy

- Data minimization across AI prompts and analytics.
- Customer data not used to train external models (provider contracts required).
- Data residency configurable per tenant/region.
- Client-visible privacy notice with links to firm's privacy policy.

---

## 22.23 Compliance-heavy use cases supported

- RIA suitability documentation.
- MFD planning context (within MFD scope; product recommendations captured only to the extent allowed).
- Bank WM / wealth house compliance: audit export per household.
- CA offices: separation of planning vs filing artifacts.
- Cross-border observation with explicit specialist review flags.

---

## 22.24 Advisor notes vs client-facing outputs

- **Advisor notes** live in a separate object; never auto-included in client-facing outputs.
- Any inclusion of advisor notes in client-facing outputs requires explicit action and is logged.

---

## 22.25 Auditable but not ugly

- The Audit Trail screen is designed with the same care as the rest of the product: filters, chips, detail drawers, export — not a log dump.
- Report appendices present assumptions and rationales cleanly with collapsible sections.
- Insight/recommendation lineage is always accessible behind a "Why this?" drawer, not a text blob.

---

## 22.26 Governance artifacts

- **Firm policy panel.** Configure firm-level rules (reminder cadence, override thresholds, AI approval requirements, report footers).
- **Compliance dashboard.** A view for compliance officers: outstanding overrides, suitability exceptions, annual review adherence, flagged edits.
- **Policy change log.** Firm-level policy changes are logged.
- **User change log.** Access grants/revocations are logged.

---

## 22.27 Incident readiness

- Access anomaly detection (unusual logins, bulk exports).
- Alerts to firm admin and compliance.
- Breach response runbook referenced from product settings.

---

## 22.28 Non-goals (clarified)

- Compass is not a compliance-filing system (not a SEBI/IRDAI filing tool).
- Compass is not a KYC provider.
- Compass is not a CRM; it integrates with CRMs via API.
