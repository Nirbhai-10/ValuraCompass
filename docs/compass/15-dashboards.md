# 15. Dashboards

Dashboards in Compass are **orienting surfaces**, not report dumps. Each dashboard has one objective, an above-the-fold hierarchy, curated KPIs, insight/action rails, and progressive disclosure for depth.

Each dashboard is specified with: **Objective · Above-the-fold · KPI cards · Charts · Progress · Alerts · Expandable sections · Key interactions · Mobile · Premium details · Clutter avoidance · Advisor-only · Client-visible.**

---

## 15.1 Advisor Dashboard

- **Objective.** Give the advisor a 10-second read on their book: what needs attention today, which meetings matter, where risks are accumulating.
- **Above-the-fold.**
  - Today strip: meetings today, overdue tasks count, critical household alerts.
  - Books pulse: 3 widgets — "Households needing attention," "Annual reviews due this month," "Open critical insights."
- **KPI cards.** Households managed · Active plans · Critical insights (sum) · Annual reviews due · Avg score change (last 30 days).
- **Charts.** Rolling 30-day critical insights count (sparkline). Households by FHS band (bar).
- **Progress.** Completion meter per household (small list).
- **Alerts.** Critical-severity insights across households surfaced here as a card list; deep-link to household.
- **Expandable.** "Households list" (full table) with filters (status, FHS band, region, risk band, upcoming review, flagged).
- **Interactions.** Keyboard: `G H` go to Households, `N` new household.
- **Mobile.** A condensed "Today" view only.
- **Premium details.** Large type for counts; quiet iconography.
- **Clutter avoidance.** No portfolio-value displays; no non-advisor noise.
- **Advisor-only.** Everything here.
- **Client-visible.** Nothing.

## 15.2 Self-Serve Client Dashboard

- **Objective.** Give the client a warm, clear read on their household: their top 3 insights, top 2 actions, household snapshot, "how I'm doing."
- **Above-the-fold.**
  - Greeting + region chip.
  - FHS score ring (with band word, not number alone).
  - Top insight card.
  - Top action card.
- **KPI cards.** ERS (months of buffer), PAS (protection status word), Retirement readiness (probability word).
- **Charts.** FHS trend (small line). Allocation donut (collapsed by default).
- **Progress.** Plan completeness meter (subtle).
- **Alerts.** Critical severity only; never red banner, always a chip.
- **Expandable.** "See all insights" / "See all actions" / "Open my plan."
- **Interactions.** "Start / resume Basic Mode" button if incomplete. "Switch to Advanced" subtle link.
- **Mobile.** Fully supported.
- **Clutter avoidance.** No scores below FHS shown as numbers; only words.
- **Advisor-only.** None.

## 15.3 Individual Dashboard

- **Objective.** Zoom into one person's profile, income, risk, suitability, goals tagged to them.
- **Above-the-fold.** Person header; RPS band; their income, their assets share.
- **KPI cards.** Monthly net income · Share of household income · Their RPS · Their goals count.
- **Charts.** Income composition donut · Goals tagged to them list.
- **Expandable.** Their risk profile detail · Their policies · Their assets.
- **Mobile.** Yes.
- **Advisor-only.** Advisor notes on this person.

## 15.4 Couple Dashboard

- **Objective.** Joint planning: combined cash flow, shared vs separate, joint goals, divergence.
- **Above-the-fold.** Couple header; shared goals; combined FHS.
- **KPI cards.** Combined income · Combined essentials · Joint savings rate · Joint goals count.
- **Charts.** Cash flow (combined, with two-colored stacked bars for contributions) · Shared vs separate assets donut.
- **Alerts.** Risk profile divergence chip (calm).
- **Expandable.** Individual breakdowns.
- **Privacy.** Any member-private fields marked with a small lock; not shown.

## 15.5 Family Dashboard

- **Objective.** Family-level health with dependency map and per-member risk flags.
- **Above-the-fold.**
  - Household Intelligence Map (compact).
  - Family-level composite: FHS, HFS, FDRS.
  - Vulnerable members chips.
- **KPI cards.** Household net worth · Household essentials · Household protection status · Household retirement readiness · Emergency resilience.
- **Charts.** Dependency flow graph (small) · Concentration donut.
- **Expandable.** Eldercare block · Children's goals · Special-needs reserve (when relevant, with sensitivity framing).
- **Advisor-only.** Advisor notes tab.

## 15.6 Goal Dashboard

- **Objective.** Status of all goals at a glance.
- **Above-the-fold.** Goal list with status chips (On Track / Watch / At Risk / Off Track / Achieved), progress bars, target years.
- **KPI cards.** Total goal corpus required · Annualized SIP equivalent · Top at-risk goal.
- **Charts.** Goal timeline (horizontal timeline with dots for target years) · Funding composition per goal (small donut on expand).
- **Interactions.** Drag to re-prioritize (optional UX; otherwise priority chip).
- **Mobile.** Yes.

## 15.7 Advanced Analytics Dashboard

- **Objective.** Bring deep scenarios, probabilistic results, and stress tests into a controllable workspace.
- **Above-the-fold.** Scenario selector (baseline/optimized/custom), quick toggles for stress tests, one probability headline (e.g., retirement success).
- **KPI cards.** P(success) retirement · P(success) education · Corpus at P10/P50/P90 · Biggest sensitivity.
- **Charts.** Fan chart for corpus paths · Tornado chart for sensitivities · Side-by-side scenarios.
- **Expandable.** Per-goal probabilistic drawer.
- **Interactions.** Adjust assumptions inline; save as scenario.
- **Advisor-only.** Full controls; clients see a read-only simplified view.

## 15.8 Action Center Dashboard

- **Objective.** Single source of truth for all tasks, grouped by owner, sorted by AUI.
- **Above-the-fold.** Tabs: All · My tasks · Client · Advisor · Spouse · Specialist · Compliance. Filter: priority, due, status.
- **KPI cards.** Overdue · Due this week · Completed this month · Follow-through rate.
- **Charts.** Completion trend (tiny line).
- **Expandable.** Task detail drawer.
- **Mobile.** Yes.
- **Advisor-only.** Compliance tab.

## 15.9 Review Meeting Dashboard

- **Objective.** Structure a live review meeting in one place.
- **Above-the-fold.** Meeting agenda (editable, 3–5 items) · Narrative Rail · Household header.
- **KPI cards.** Score deltas since last meeting · New insights · Pending actions.
- **Charts.** Delta visuals only (sparkline per score).
- **Interactions.** Keyboard shortcut to add tasks (`T`), add notes (`N`), add scenarios (`S`). End-of-meeting produces a "Meeting Summary" draft.
- **Advisor-only.** Notes; internal analysis pane; end-of-meeting draft review.

## 15.10 Document / OCR Dashboard

- **Objective.** Track document intake, OCR confidence, mappings, and pending reviews.
- **Above-the-fold.** Upload area (drag-drop) · Recent extractions · Pending review queue.
- **KPI cards.** Documents this month · Extraction success rate · Pending reviews · Flagged discrepancies.
- **Charts.** Extraction confidence distribution (optional).
- **Expandable.** Per-document viewer + field mapping.
- **Mobile.** Read-only view; uploads limited to photo capture.

---

## 15.11 Shared dashboard rules

- **Above-the-fold ≤ 5 KPI cards**; prefer 3.
- **Scores displayed with a word first, number second.** Except advisor view where numbers come first.
- **Rails (right).** Insights rail and Action rail accompany every dashboard.
- **Assumptions footer.** Subtle line showing active assumption set.
- **Empty states.** Every dashboard has a designed empty state (see Section 16).
- **Loading states.** Skeletons, not spinners.
- **Error states.** Calm, actionable, with retry and "tell us" link.
- **Print / export.** Every dashboard has a "Share this view" that opens an export modal with a redacted option.

## 15.12 Personalization

- Users can pin up to 3 widgets to the top of their dashboard.
- Region controls are reflected in every dashboard header.
- Meeting Mode toggle on advisor dashboards.
