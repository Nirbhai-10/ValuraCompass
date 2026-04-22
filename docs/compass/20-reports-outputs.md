# 20. Reports and Outputs

Reports in Compass are **not the deliverable of last resort**; they are a crystallized view of a living plan. Every report is generated from the same data and engine; they differ in audience, tone, structure, and level of disclosure.

Every report supports three formats:
- **Web view** (primary, interactive).
- **PDF** (fixed, branded, archivable).
- **Presentation deck** (PPT / PDF) for meeting flow.

Every report carries:
- Branding (Valura logo + optional firm co-brand).
- Region-specific disclosures at the footer.
- Version stamp and audit link (PDF includes an embedded version id).

---

## 20.1 Report inventory

Each report is specified with: **Audience · Purpose · Tone · Structure · Visuals · Plain-English sections · Technical sections · Advisor commentary · Compliance notes · Brand placement · Web/PDF/Deck behavior.**

---

### R1. One-page client summary

- **Audience.** Client (and spouse in couple view).
- **Purpose.** A premium, elegant at-a-glance view of the plan.
- **Tone.** Warm, clear, confident.
- **Structure.**
  1. Household header (name, region, date).
  2. Three sentences of narrative: where the household is, what's strong, what matters next.
  3. Three KPI cards: FHS, ERS, PAS (or RRS if more material).
  4. Top 3 insights (plain-English titles only).
  5. Top 3 actions (with owners).
  6. Small Household Map.
  7. Footer disclosure.
- **Visuals.** Score ring, 3 chips, small map.
- **Technical sections.** None (hidden).
- **Advisor commentary.** Not visible in this variant; included in an internal twin.
- **Compliance.** "Planning observation only. Not investment or tax advice."
- **Brand.** Valura logo top-left; firm co-brand optional top-right.
- **Formats.** Web + PDF; one-page landscape PDF.

### R2. Basic Mode quick plan

- **Audience.** Self-serve client or prospect in an advisor meeting.
- **Purpose.** The output of Basic Mode.
- **Tone.** Friendly, direct, confident.
- **Structure.** Household overview · Financial Health Summary · Top Risks · Top Opportunities · Tax-Aware Flags · Protection Flags · Debt Flags · Goal Readiness · Next Best Actions · Mode recommendation.
- **Formats.** Web + PDF; 2–3 pages; can be printed from mobile.

### R3. Advanced full plan report

- **Audience.** Advisor-led delivery to client; archival.
- **Purpose.** Comprehensive plan.
- **Tone.** Professional, calm, precise.
- **Structure.**
  1. Executive summary (narrative + KPIs).
  2. Household profile (Household Map + members).
  3. Cash flow and expenses (trend + composition).
  4. Assets (allocation, concentration, liquidity, nominees).
  5. Liabilities (inventory, schedule, scenarios).
  6. Insurance and protection (adequacy, gaps, renewals).
  7. Risk profile and suitability (RPS, ISS, rationale).
  8. Goals (list, feasibility, funding plan).
  9. Retirement (corpus curve, probability, healthcare reserve).
  10. Tax-aware planning observations.
  11. Estate and continuity.
  12. Scenarios (baseline, optimized, selected stresses).
  13. Action plan (advisor + client tasks).
  14. Appendix (assumptions, definitions, disclosures).
- **Visuals.** Fan charts, tornado sensitivities, allocation donuts, timeline, map.
- **Technical sections.** Assumptions, detailed data tables (collapsible in web; appendix in PDF).
- **Advisor commentary.** Shown as clearly labeled "Advisor notes" inserts (toggleable for client-facing variant).
- **Compliance.** Per-region disclosure footer; suitability rationale appendix.
- **Formats.** Web + PDF (multi-page); advisor can deliver PDF with or without notes.

### R4. Annual review deck

- **Audience.** Client (advisor-led meeting).
- **Purpose.** Structured annual re-baseline and path forward.
- **Tone.** Calm, positive, direct.
- **Structure.**
  1. "What's changed since last year" (life events, income, family).
  2. Score deltas (FHS and sub-scores).
  3. What we completed (closed tasks).
  4. What's on track, what's at risk.
  5. New insights this year.
  6. Next 12 months focus.
- **Formats.** Web + Deck (PPT/PDF); 8–12 slides; big type, sparse per slide.

### R5. Goal feasibility report

- **Audience.** Client.
- **Purpose.** Deep look at specific goals.
- **Structure.** Goal summary · required corpus · funding plan · probability · scenarios.
- **Visuals.** Goal timeline; cumulative required vs committed.
- **Formats.** Web + PDF.

### R6. Retirement readiness report

- **Audience.** Client.
- **Purpose.** Focused retirement picture.
- **Structure.** Expense model · expected inflows · corpus requirement · probabilistic picture · healthcare reserve · sequence risk note · scenarios (delay, early, aspirational).
- **Formats.** Web + PDF.

### R7. Tax-aware planning observations report

- **Audience.** Advisor + Client (client-safe copy).
- **Purpose.** Consolidated view of tax observations with "for review" framing.
- **Structure.** Regime observations · asset location · capital gains context · policy tax notes · cross-border · specialist referrals.
- **Compliance.** Explicit "not tax advice" framing; review flags visible per item.
- **Formats.** Web + PDF.

### R8. Risk and protection report

- **Audience.** Client.
- **Structure.** Risk profile band + components · suitability summary · protection inventory · adequacy analysis · nominee map · gaps and recommendations.
- **Formats.** Web + PDF.

### R9. Debt and cash flow report

- **Audience.** Client.
- **Structure.** Monthly cash flow breakdown · EMI schedule · prepayment/refinance scenarios · credit card revolve (if any) · debt reduction plan.
- **Formats.** Web + PDF.

### R10. Suitability summary

- **Audience.** Advisor + compliance.
- **Purpose.** Compliance artifact capturing the suitability logic for this household.
- **Structure.** RPS with components · ISS per category · guardrail decisions · overrides with rationale · sign-off lines.
- **Formats.** PDF (primary); Web read-only.

### R11. Family financial map (standalone)

- **Audience.** Client.
- **Purpose.** The Household Intelligence Map exported with annotations.
- **Formats.** PDF (standalone); image for client portal.

### R12. Meeting summary

- **Audience.** Client (advisor-sent).
- **Purpose.** Output of a live meeting.
- **Structure.** Agenda covered · decisions made · tasks created · next session.
- **Formats.** Email + attached 1-pager PDF.

### R13. Next-step summary

- **Audience.** Client.
- **Purpose.** Concise "what you can do this month" email-ready view.
- **Formats.** Web + shareable link.

### R14. Advisor internal summary

- **Audience.** Advisor (and team).
- **Purpose.** Advisor prep notes + internal rationale + tasks pipeline.
- **Formats.** Web only (not exported).

### R15. Client-facing summary

- **Audience.** Client.
- **Purpose.** Softer, digest-style view of the plan (like a newsletter).
- **Formats.** Web + Email.

---

## 20.2 Report generation & versioning

- Reports are generated from the current plan snapshot at a point in time.
- Each generation creates an immutable **report version** with an id, timestamp, rule pack version, and assumption set version.
- Superseded versions remain retrievable for audit.
- Clients see the latest by default; advisors can view history.

---

## 20.3 Plain-English vs technical sections

- Every report has a **plain-English lead** per section: 2–4 sentences that summarize in non-expert language.
- Below the lead, technical content is presented with charts and tables.
- In PDF, technical sections can be toggled (include/exclude) by the advisor before export; defaults per template.

---

## 20.4 Advisor commentary

- Advisors can add **inline commentary** per section.
- Commentary is clearly labeled "Advisor note."
- Commentary can be marked `internal` (never in client-facing exports) or `shared`.
- Annual Review decks especially leverage advisor commentary to contextualize the year.

---

## 20.5 Compliance notes

- Every client-facing report footer includes:
  - Region-specific disclosures (from region pack).
  - "Compass is a planning intelligence tool. This document is a plan observation, not investment, tax, or legal advice."
  - Advisor firm name and registration (if applicable).
  - Generated version id.
- Tax observations include the "for review" language inline.
- Suitability rationale is summarized in client-facing variants and detailed in the Suitability Summary R10.

---

## 20.6 Brand placement

- Valura logo top-left on cover and each page of PDFs.
- Firm co-brand top-right (if firm has enabled it).
- Color discipline: deep green accents; never heavy brand-color backgrounds.
- Typography: clean hierarchy; serif only as an accent on cover if firm brand allows.
- Imagery: restrained; small illustrations (line art) when helpful.

---

## 20.7 Logo usage

- Logo never stretched.
- Minimum size defined in Section 23.
- Always on a clean background; no on-photo logo.
- PDF headers: small mark + "Valura Compass" wordmark; firm logo on the right.

---

## 20.8 Color scheme usage in reports

- Backgrounds: mostly `#FFFFFF` with `#F5F7FA` panels.
- Primary accent: `#0F5132` for headers and structural elements.
- Brand green `#4CAF50` reserved for positive chips and success states.
- Mint `#D4EDDA` used subtly for highlights; not for backgrounds on dense text areas.
- Severity colors: see Section 23; not brand-green.

---

## 20.9 Report UX behaviors

- **Web view.** Fully interactive; expandable; chart hover detail; on-demand scenario toggle.
- **PDF.** Static, paginated, printable; hyperlinks to web views where helpful.
- **Deck.** Simplified layout, 1 idea per slide; speaker notes auto-drafted from advisor commentary.
- **Shareability.** Unique, access-controlled link; optional expiry; redacted export option.
- **Accessibility.** All PDFs tagged; alt text on charts; color-independent severity encoding.

---

## 20.10 Automated reports

- **Annual review deck.** Generated automatically on household anniversary; advisor reviews and publishes.
- **Post-meeting summary.** Drafted automatically from meeting notes and tasks created.
- **Quarterly nudge digest.** Light-touch email digest for self-serve users with next best actions.

---

## 20.11 Customization per firm

- Firm admin can configure:
  - Default color co-brand.
  - Logo placements.
  - Footer disclosures (additive to region defaults; firm cannot remove core disclosures).
  - Default templates enabled for firm.
- User (advisor) can:
  - Toggle sections.
  - Add commentary.
  - Choose variants (client-facing vs internal).

---

## 20.12 Non-goals

- No regulatory filing outputs.
- No signed legal documents.
- No automatic broker-ready recommendation reports in V1; recommendations with specific product names require advisor sign-off and live in the Recommendation Center.
