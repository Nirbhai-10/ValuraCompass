# 3. Core Product Principles

These are the non-negotiable rules of Compass. Every screen, model change, insight, and report must pass these tests. Each principle has: **Statement · Operational meaning · Concrete checks · Anti-patterns.**

---

## P1. India-first with region-aware expansion
- **Statement.** India is the default operating context in V1; the architecture abstracts region so GCC and Global plug in cleanly.
- **Operational meaning.** Tax logic, currency, instrument labels, insurance categories, retirement assumptions, household norms, and disclosure templates live in region packs, not in screen code.
- **Checks.** (a) No region-specific string in UI components. (b) All calculators accept region context. (c) Toggling region recomputes labels, currency, tax logic, and assumptions without page reload. (d) Region rule packs are versioned and auditable.
- **Anti-patterns.** Hardcoded `₹`, `PPF`, or `80C` inside UI components; a second product for GCC.

## P2. Advisor-grade and self-serve capable
- **Statement.** One product, two default experiences.
- **Operational meaning.** Copy, depth, gating, severity language, and defaults shift by user class without forking features.
- **Checks.** Every screen has a `client | advisor` microcopy pair; every flow has a self-serve and an advisor-led variant defined in Section 16.
- **Anti-patterns.** Client screens leaking advisor-only scores; advisor screens condescending to clients.

## P3. Compliance-heavy and audit-friendly
- **Statement.** Every material change, override, recommendation, suitability conclusion, and AI contribution is logged and exportable.
- **Operational meaning.** The audit log is a platform service, not a module.
- **Checks.** (a) Zero recommendations without a rationale stored. (b) Every AI-written line has a citation set. (c) Every manual override has a reason field. (d) Export of audit trail is first-class.
- **Anti-patterns.** Silent overwrites; AI-generated text mixed into reports without provenance.

## P4. Plain-English explainability
- **Statement.** No output is final until a non-expert can understand it.
- **Operational meaning.** Every score, chart, and recommendation has a plain-English layer and a "how this was computed" drawer.
- **Checks.** All insights pass a Flesch-style readability check and a jargon scanner (allowlist with glossary tooltips).
- **Anti-patterns.** "Your Sortino is suboptimal." "Your XIRR indicates…"

## P5. Minimal but information-rich UI
- **Statement.** Density through hierarchy, not clutter.
- **Operational meaning.** Above-the-fold is curated; everything else is progressive disclosure.
- **Checks.** KPI cards limited to five above fold; chart density rules defined in Section 23; one primary CTA per surface.
- **Anti-patterns.** 12-tile dashboards; dashboards that try to "show everything."

## P6. Modular but not fragmented
- **Statement.** Modules are discoverable, connected, and composable; they don't feel like separate apps.
- **Operational meaning.** Navigation is context-aware; modules share a universal household shell (header, household switcher, insights rail, action rail).
- **Checks.** No module has its own login, its own navigation model, or its own data silo.
- **Anti-patterns.** Insurance feels like a different product from retirement.

## P7. Progressive disclosure
- **Statement.** Ask only for what you need for the output you are about to show.
- **Operational meaning.** Field reveal is driven by answers, not by a monolithic form.
- **Checks.** Every field declares its dependency (`shown_if`), mode (`basic | advanced | both`), and importance.
- **Anti-patterns.** 50-field forms on first contact.

## P8. High actionability
- **Statement.** No insight is shipped without a next step.
- **Operational meaning.** Every insight has a default `action` object, an owner, a priority, and a completion evidence requirement.
- **Checks.** Insights with no action template fail validation in code review.
- **Anti-patterns.** "Consider reviewing…"

## P9. Strong family intelligence
- **Statement.** The household, not the individual, is the unit of planning.
- **Operational meaning.** Family members, dependencies, obligations, and cross-links are first-class; a single-person household is simply a family of one.
- **Checks.** Household Intelligence Map is available at every view level; all goals, assets, liabilities, and insurance policies can be tagged to people.
- **Anti-patterns.** Spouse treated as "additional income."

## P10. Tax-aware planning
- **Statement.** Planning choices always consider tax context; Compass never pretends to be a tax return tool.
- **Operational meaning.** Tax observations are advisory-tone, regime-aware, and linked to planning implications — never "file this."
- **Checks.** Every tax observation carries a "review needed" level and a jurisdiction stamp.
- **Anti-patterns.** "You owe X in taxes."

## P11. Risk profiling and investment suitability
- **Statement.** Risk is a composite, not a quiz; suitability is a living judgment, not a one-time score.
- **Operational meaning.** Risk profile = stated + capacity + need + behavior; suitability = profile + goal horizon + liquidity + dependency context.
- **Checks.** Every profile and suitability score has a component breakdown and a rationale log.
- **Anti-patterns.** Single-number risk profile with no capacity check.

## P12. Scenario and probability-based analysis
- **Statement.** Every major plan output exists alongside at least one alternative scenario; probabilistic analysis is available in Advanced.
- **Operational meaning.** Scenarios are named, saved, comparable, and exportable.
- **Checks.** Retirement and goal feasibility always support at least one alternative and one stress scenario.
- **Anti-patterns.** "If markets return 12% CAGR, you're fine." (without a second scenario)

## P13. Separate client and advisor tasking
- **Statement.** The Action Center distinguishes `advisor | client | spouse | compliance | specialist`.
- **Operational meaning.** Ownership, due dates, reminders, and escalation are per-owner.
- **Checks.** Every task has exactly one owner; shared tasks are modeled as linked tasks.
- **Anti-patterns.** "Someone should do this."

## P14. Region-aware logic
- **Statement.** All computational logic accepts a region context and uses region-specific assumptions and rule packs.
- **Operational meaning.** Calculators, severity thresholds, insurance adequacy multipliers, retirement assumptions all derive from region config.
- **Checks.** A region rule pack diff shows exactly what changed.
- **Anti-patterns.** Magic constants in code.

## P15. OCR-ready manual-first intake
- **Statement.** Manual entry is the default path; OCR and document ingestion accelerate it, not replace it.
- **Operational meaning.** Users never wait on an ingestion pipeline to see value.
- **Checks.** Every field can be entered manually; OCR extraction always goes through a review step.
- **Anti-patterns.** "Please upload your statement to proceed."

## P16. Scalable backend architecture
- **Statement.** Compass scales by household, not by user.
- **Operational meaning.** Multi-tenant, household-scoped data; stateless services; rules engine isolated from UI.
- **Checks.** Firm, household, and user are distinct scopes in auth and data.
- **Anti-patterns.** Cross-household data coupling; advisor-user coupling in auth.

## P17. Integration-friendly design
- **Statement.** Compass is built to live inside Valura.ai's platform and to expose stable planning APIs outward.
- **Operational meaning.** Public API surfaces for households, plans, insights, actions; event bus for life events and plan changes.
- **Checks.** Every module has an API contract documented.
- **Anti-patterns.** UI-only features without a model backing.

## P18. Meeting-friendly interface
- **Statement.** Every advisor-relevant screen is designed to be screen-shared without cleanup.
- **Operational meaning.** Meeting Mode hides internal-only scores, increases type size, shows one thing at a time.
- **Checks.** Every advisor screen has a Meeting Mode toggle with tested defaults.
- **Anti-patterns.** Advisors hiding their screen on Zoom.

## P19. Premium trust aesthetic
- **Statement.** Compass looks like it belongs in a private banking conversation, not a retail app.
- **Operational meaning.** Calm color use (see Section 23), disciplined typography, clean cards, tasteful motion.
- **Checks.** Brand green used sparingly; deep green for structure; severity colors used only for severity.
- **Anti-patterns.** Big green CTAs everywhere; gradient overload.

## P20. Intelligence-driven, not just form-driven
- **Statement.** Compass asks only the questions whose answers shift the plan; it infers where safe and asks where necessary.
- **Operational meaning.** The intake engine is rule-driven; the Insight Engine is the front face.
- **Checks.** Intake metrics tracked: avg fields per insight produced; median time to first insight.
- **Anti-patterns.** Forms that demand answers unrelated to any output.

## P21. Household consent and privacy
- **Statement.** Sensitive data is shared only with explicit consent; couples' data follows a couple consent model.
- **Operational meaning.** Field-level visibility settings; "private to me" vs "shared with household" vs "shared with advisor."
- **Checks.** Couple view never silently exposes a spouse's private field.
- **Anti-patterns.** "By signing up, you agree to share everything."

## P22. Honest uncertainty
- **Statement.** When the system doesn't know, it says so.
- **Operational meaning.** Every derived number carries a confidence band; every assumption is labeled.
- **Checks.** No screen shows a precise rupee number for an inherently uncertain quantity without a range.
- **Anti-patterns.** "Your retirement corpus will be ₹4,32,87,612."

## P23. Live plan, not a PDF event
- **Statement.** The plan is a living object continuously ranked by "what matters most now."
- **Operational meaning.** Next best action is always current; annual reviews re-score in place.
- **Checks.** No state of the plan is "frozen" except archived versions for audit.
- **Anti-patterns.** "Your plan is in the PDF we sent you."

## P24. Mobile-friendly summaries, desktop-first depth
- **Statement.** Summaries work beautifully on mobile; deep workspaces stay desktop-first in V1.
- **Operational meaning.** Dashboards, insights, and action center are fully mobile; Advanced workspace is desktop-optimized with mobile read-only.
- **Checks.** No data entry task in Advanced is blocked on mobile silently — either supported or explicitly redirected.
- **Anti-patterns.** Broken modal forms on mobile.

## P25. Safety on sensitive topics
- **Statement.** Eldercare, disability, illness, divorce, and death are handled with care and without euphemism.
- **Operational meaning.** Copy is reviewed for tone; mandatory fields avoid triggering phrasing; severity colors are muted in these modules.
- **Checks.** Sensitive modules pass a content review checklist.
- **Anti-patterns.** Red alarms on "disabled dependent" screens.

---

## Principle conflict resolution

When principles conflict, Compass resolves in this priority order:

1. **Safety & consent (P21, P25)**
2. **Compliance & audit (P3, P22)**
3. **Plain-English explainability (P4)**
4. **Actionability (P8)**
5. **Family intelligence (P9)**
6. **Progressive disclosure (P7)**
7. **Aesthetic minimalism (P5, P19)**

Example: if actionability pushes toward a blunt message but safety requires soft framing, safety wins and copy is reshaped without losing the action.
