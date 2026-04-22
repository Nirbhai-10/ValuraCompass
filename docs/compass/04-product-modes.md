# 4. Product Modes — Basic and Advanced

Compass runs two modes over one data model. The modes are **not different products**; they are different depths of the same plan. Mode is a property of the user's current working context, not of the household record.

---

## 4.1 Basic Mode

### Purpose
A premium, under-10-minute guided snapshot usable for:
- advisor prospect conversations,
- first meetings,
- annual check-ins,
- quick health checks,
- self-serve individuals and couples,
- post-life-event re-baselining.

### Experience requirements
- **Time.** Median completion ≤ 8 minutes. Max expected ≤ 12 minutes.
- **Friction.** Only short-answer questions, chips, sliders, and ranges. No free-text required.
- **Intelligence.** Inference where safe; each inferred value is visibly labeled (e.g., "Assumed 6% inflation"). Users can accept or override in one tap.
- **Output.** A one-page household snapshot with five KPI scores, top 3 risks, top 3 opportunities, and a next-best-action list (2 for advisor, 2 for client). Shareable and exportable.
- **Upgrade path.** "Open in Advanced" is a single click; everything carries over.

### Visible modules (Basic)
- Household snapshot (people, region, residency basics)
- Income snapshot
- Expense snapshot
- Assets snapshot (bucketed, not line-item)
- Liabilities snapshot
- Insurance snapshot (existence + broad adequacy)
- Tax snapshot (regime + basic status)
- Goals snapshot (up to 5 priority goals with range inputs)
- Risk comfort snapshot (5-item short questionnaire)
- Urgent concerns & life-event triggers
- **Output:** Basic Plan (one-pager), scores, insights, actions

### Hidden in Basic (but intentionally teased)
- Deep scenario engine (shown as "see advanced scenarios →")
- Probabilistic analysis
- Tax observations beyond basic regime
- Estate readiness depth (only completion score is shown)
- Suitability engine depth
- Advanced analytics
- Compliance audit export (available to advisors only)

### Inference rules in Basic
- Inflation: region default (India 6% general, 8% education, 10% healthcare) — editable.
- Retirement age: default 60, editable.
- Longevity: default 85, editable.
- Market return assumptions: conservative equity/debt defaults per region.
- All inferred values are flagged `source = assumed_default`; the Insight Engine reduces confidence where assumptions drive outputs.

---

## 4.2 Advanced Mode

### Purpose
A live planning workspace capable of handling the full complexity of any household — HNI/UHNI, business owners, NRIs, eldercare, special-needs dependents, promoter structures, cross-border cases.

### Experience requirements
- **Structure.** Workspace-based, not wizard-based. Advisor or user can jump across modules, save partial progress, and resume.
- **Live interview capability.** Meeting Mode offers curated, screenshare-safe screens.
- **Depth.** Full data model (Section 7) accessible.
- **Scenarios.** Named, saved, comparable; baseline and optimized plan surfaced by default.
- **Probabilistic analysis.** Monte Carlo for retirement and major goals, with confidence ranges and explainability.
- **Compliance.** Full audit log active by default.
- **Outputs.** Full plan reports (Section 20), annual review decks, suitability summaries, meeting summaries.

### Visible modules (Advanced — includes all Basic modules plus)
- Household map and dependency map (deep)
- Detailed asset/liability modeling (line-item, ownership, nominee, tax, liquidity buckets)
- Tax-aware observation engine (regime, capital gains context, deductions, policy tax status)
- Risk profiling engine (full questionnaire + capacity + behavior)
- Suitability engine (full)
- Insurance adequacy engine (survivor income, critical illness, disability)
- Scenario workspace (what-if, stress tests, probabilistic)
- Estate / continuity / nominee / beneficiary consistency
- Business and promoter household modeling
- Cross-border / NRI modeling
- Eldercare and special-needs planning
- Caregiver burden modeling
- Documents & OCR workspace
- Advisor notes (internal)
- Reports center
- Audit trail
- Permissions
- Assumptions engine (edit defaults, save per-household assumption sets)

### Advanced data points not present in Basic
- Ownership type (single / joint / nominee / trust / entity)
- Liquidity bucket (T+0, T+2, 30-day, 90-day, >1-year)
- Tax treatment per instrument
- Concentration groupings
- Cross-border residency, tax residency, FEMA/repatriation status
- Estate documents (will, trust, PoA) status
- Behavioral intelligence fields
- Detailed policy terms (exclusions, renewability, riders)
- Business income modeling (promoter stake, distribution policy, entity structure)
- Special-needs continuity & guardianship data
- Detailed goal economics (priority weight, emotional weight, flexibility, dependency on life events)
- Household obligation map entries
- Assumption overrides (per-household)

---

## 4.3 Toggle behavior

- **Location.** Top-right of the Household shell, beside the household switcher.
- **Visual.** A segmented control: `Basic  |  Advanced`. Deep green (`#0F5132`) background on active, with a subtle slide animation. Not a dominant element.
- **Persistence.** Mode is remembered per `user × household`. An advisor who prefers Advanced on HNI families and Basic on prospects is respected.
- **No data loss.** Toggling never deletes, never hides permanently. Switching to Basic **hides** Advanced modules from the shell but keeps the data intact. Switching to Advanced reveals them.
- **Transition copy.**
  - Basic → Advanced: "Opening the full planning workspace. Everything you've entered is carried over." (2s toast)
  - Advanced → Basic: "Switching to the simplified view. Your advanced data is safe — it will reappear when you switch back." (2s toast)
- **Animation.** 240ms ease-out; module cards that disappear fade, modules that appear slide in from right. Never jarring.

## 4.4 Data carry-over

- **Fields.** All fields are the same in both modes; Basic only surfaces a curated subset. Advanced adds fields but doesn't rewrite anything captured in Basic.
- **Scores.** Recomputed automatically on mode change if new fields were populated. Score history logs the trigger (mode change, manual edit, recurring recompute).
- **Insights.** Basic insights remain valid; Advanced adds deeper insights. No insight is "deleted" by switching modes — it is re-ranked by the updated data context.
- **Actions.** Tasks are mode-agnostic. Switching never drops tasks.
- **Reports.** Basic Report and Advanced Report are two outputs from the same plan; both remain available.

## 4.5 Partially filled Advanced data

When Advanced has some fields filled and some empty:

1. **Don't block.** No Advanced screen requires all fields to render.
2. **Mark what's missing.** Each score card shows: "Using X of Y inputs (confidence: Medium)."
3. **Suggest smartly.** The Action Center auto-creates "Complete assumption set" tasks for the advisor and "Add these numbers" tasks for the client, with clear direct-links.
4. **Degrade gracefully.** Scenarios that need specific fields show a "need this to proceed" CTA rather than a blank chart.
5. **Never silently infer critical fields.** If a missing input would materially change a recommendation, Compass refuses to show that recommendation and explains why.

## 4.6 Recommending the upgrade to Advanced

Triggers (displayed as a gentle banner inside Basic output, not a modal):

- Household complexity score ≥ threshold (e.g., ≥3 earners, ≥3 dependents, cross-border flag, business income detected, special-needs dependent, ≥5 active goals).
- Any "critical" severity insight.
- Protection gap flagged as critical.
- Risk-capacity mismatch detected.
- Tax regime ambiguity (business + salary combo, dual regime relevance).
- Advisor-led session explicitly.
- Request for scenario analysis.

Copy (client): "Your household has more going on than Basic can fully capture. Advanced Mode will add depth where it actually matters — no re-entry."

Copy (advisor): "Recommend Advanced for this household: business income, 3 dependents, and an insurance gap flagged. Open workspace →"

## 4.7 Curating Advanced for a live meeting

- **Meeting Mode toggle** inside Advanced.
- Meeting Mode:
  - Hides internal-only panels (notes, compliance logs, audit trail, assumption engine).
  - Enlarges type (+2 steps).
  - Simplifies each module into a single "this is what matters here" card with a "go deeper" affordance.
  - Surfaces a persistent **Narrative Rail** with 3 bullets: "what we've learned, what we're deciding, what to do next."
  - Offers a one-tap "send this view to the client" at the end.

## 4.8 Protecting self-serve users from overload

- Advanced is available to self-serve users, but never defaulted for them in V1.
- Entry to Advanced modules from self-serve context shows a short, friendly interstitial ("This section is deeper. Take 3 minutes, or invite an advisor.").
- Every self-serve Advanced screen has a "not sure? skip" chip.
- The Action Center curates only self-actionable tasks for self-serve; advisor-facing tasks are hidden until an advisor joins the household.

## 4.9 Advisor control over exposed complexity

Advisors can toggle per-household:

- Visibility of audit log in client portal (default: hidden).
- Visibility of suitability rationale (default: hidden; summary visible).
- Visibility of specific scores (e.g., Household Fragility Score — by default, client view shows the narrative, not the number).
- Visibility of specific modules to clients (e.g., hide Concentration Risk until the advisor has framed it in a meeting).

All toggles are logged and reversible. Clients see a visible "some sections are being prepared by your advisor" state — never a blank.

## 4.10 Mode summary (at-a-glance)

| Dimension | Basic | Advanced |
|---|---|---|
| Time to first output | ≤ 10 min | Live / workspace |
| Data captured | Curated subset | Full model |
| Scenarios | Single baseline | Baseline + optimized + stress + probabilistic |
| Insights | Top-tier only, plain English | Full insight engine |
| Tax | Regime + basic | Tax-aware observation engine |
| Risk/Suitability | Short quiz | Full engine |
| Reports | One-page plan | Full plan + suitability + annual review |
| Audit | Minimal | Full |
| Target time horizon | First meeting / quick review | Comprehensive / recurring |
| Default for self-serve | Yes | Opt-in |
| Default for advisors | For prospects / quick use | For real clients |
