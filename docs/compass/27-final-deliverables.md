# 27. Final Deliverables

A consolidated wrap-up of Compass for leadership, design, engineering, compliance, and go-to-market teams. Every item references the deeper section in this blueprint.

---

## 27.1 Concise product summary

Compass is Valura.ai's planning intelligence platform: web-first, household-native, India-first with a region framework, built for both advisors and self-serve users, operating in Basic and Advanced modes on one data model, producing plain-English, action-linked, compliance-ready plans with a signature Household Intelligence Map and an insight engine that makes planning specific and actionable.

---

## 27.2 North-star statement

> Compass turns the lived complexity of a household — people, money, obligations, taxes, goals — into the clearest, most actionable, most defensible financial plan either side of an advisor's desk has ever seen.

---

## 27.3 Product positioning statement

> Compass is the planning intelligence layer for modern Indian and cross-border households — advisor-grade in depth, client-friendly in voice, compliance-ready by default, and built for both a 10-minute prospect meeting and a two-hour HNI live planning interview, without switching products.

---

## 27.4 User hierarchy

**Primary users.**
- Advisors: RIAs, wealth managers, MFDs, insurance advisors, CA offices, research advisors, senior planners.
- Self-serve clients: young professionals, couples, mass affluent, HNI/UHNI, NRI/cross-border families, families with elderly parents, families with special-needs dependents, business-owner households.

**Secondary users.**
- Compliance officers (firm-scope).
- Firm admins.
- Junior/analyst advisor staff.
- External specialists invited for referrals (CA, legal, insurance specialists).

**Tertiary.**
- Platform admins (Valura internal).

Reference: Section 2.

---

## 27.5 Feature hierarchy

1. **Core primitive:** Household with Household Intelligence Map.
2. **Experience primitives:** Basic Mode, Advanced Mode, Meeting Mode.
3. **Intelligence primitives:** Analytics Engine, Insight Engine, Action Center.
4. **Context primitives:** Region Framework, Assumption Engine.
5. **Data primitives:** Data model, OCR-assisted document ingestion, document vault.
6. **Decision primitives:** Risk Profile Engine, Suitability Engine, Scenarios.
7. **Compliance primitives:** Audit Trail, Permissions, Consent, AI Governance.
8. **Delivery primitives:** Reports, Client Portal, Annual Review Workspace.

Reference: Sections 6, 11, 14, 17, 18, 22.

---

## 27.6 Information architecture summary

- Global shell with workspace, household switcher, region indicator, mode toggle, search, notifications.
- Left-rail modules: Home, Households, People, Planning (Overview, Cash Flow, Assets, Liabilities, Insurance, Goals, Retirement, Tax, Risk & Suitability, Estate, Scenarios), Insights, Action Center, Documents, Reports, Advisor Notes, Audit, Settings.
- Right rails: Insights and Actions.
- Depth ≤ 2 levels from the dashboard; assumptions footer on output pages.

Reference: Section 6.

---

## 27.7 Data model summary

Core objects: `firm`, `workspace`, `household`, `person`, `relationship`, `income_source`, `expense_line`, `asset`, `liability`, `policy`, `goal`, `tax_profile`, `risk_profile`, `suitability_profile`, `retirement_profile`, `estate_profile`, `behavior_profile`, `assumption_set`, `scenario`, `insight`, `task`, `document`, `audit_event`.

Every stored fact carries: `source`, `confidence`, `as_of_date`, `last_updated_by/at`, `region_at_entry`, `version`. Privacy classes: normal, sensitive, highly sensitive. Derived fields carry lineage to inputs + assumptions.

Reference: Section 7.

---

## 27.8 Analytics summary

- 20 scores with component breakdowns, bands, plain-English interpretations, and visualizations.
- Deterministic projections (cash flow, net worth, goals, retirement).
- Scenarios: baseline, optimized, stress library (inflation, equity, rates, job loss, business decline, medical, primary earner death/disability, inheritance, relocation, delay/early).
- Probabilistic analysis for retirement and top goals.
- Assumption sets with region defaults + household overrides, fully versioned.
- Confidence bands on all outputs.
- Rule pack version attached to every output.

Reference: Section 11.

---

## 27.9 Basic Mode flow summary

Under 10 minutes, curated question framework in 12 groups: identity, region, family, income, expenses, assets (bucketed), liabilities, insurance, tax, goals, risk comfort, urgent concerns. Output: one-pager with household overview, financial health summary, top 3 risks, top 3 opportunities, tax/protection/debt flags, goal readiness, NBA, mode recommendation, and advisor/client tasks.

Reference: Section 9.

---

## 27.10 Advanced Mode flow summary

Workspace rather than wizard. 26 discovery blocks spanning household depth, cross-border, income durability, expenses, special-needs, eldercare, caregiver burden, tax inefficiencies, concentration, mismatches, emergency fragility, insurance, debt quality, estate, retirement realism, goal conflict, liquidity, documentation, behavior, business owner, succession, legacy, life events, and open questions. Non-linear navigation; Meeting Mode; live task/scenario creation; advisor notes.

Reference: Section 10.

---

## 27.11 Advisor journey summary

- Create household → choose mode → run Basic with prospect → assign tasks → schedule Advanced → run live interview → produce plan → generate reports → deliver via client portal → schedule annual review → automated life-event briefs → continuous insight engine.
- Meeting Mode at any time; advisor notes separate; audit default on.

Reference: Sections 8, 16, 18.

---

## 27.12 Client journey summary

- Sign up (self-serve) or accept invite (advisor-led) → Basic Mode → one-pager → optionally invite partner → optionally upgrade to Advanced → complete tasks → receive annual review → life-event updates trigger re-baseline.
- Plain-English everywhere; sensitive topics handled gently; privacy respected.

Reference: Sections 8, 16.

---

## 27.13 Individual / couple / family view summary

- **Individual.** Person-scoped lens (profile, income, risk, goals tagged to person, policies).
- **Couple.** Joint planning: combined cash flow, shared goals, shared/separate finance chips, consent rules; divergences surfaced calmly.
- **Family.** Household Intelligence Map as the centerpiece; eldercare and children-specific modules; dependency map.

Reference: Sections 6, 15, 17.

---

## 27.14 Region framework summary

Region rule packs encapsulate: currency, numeric format, tax logic, retirement defaults, instrument dictionary, insurance terms, household structure templates, documentation catalog, compliance disclosures, report localization. `IN` fully implemented in V1; `GCC` lean; `GLOBAL` fallback. Household region is the scope; residency/tax residency modeled per member.

Reference: Section 5.

---

## 27.15 Insight engine summary

Rule library → insights (category, severity, confidence, templates, actions, audience) → NBA ranking → dedup/rate limit → client/advisor surfaces. Plain English, numerically grounded, action-linked, fully auditable. Life-event briefs re-prioritize on events.

Reference: Section 14.

---

## 27.16 Risk and suitability engine summary

- **RPS:** stated, capacity, need, behavior, liquidity.
- **ISS:** RPS fit, horizon fit, liquidity fit, dependency fit, complexity, cost.
- Contradiction detection and plain-English explanations.
- Guardrails per category with advisor override workflow.
- Full audit and suitability rationale logs.

Reference: Section 12.

---

## 27.17 Tax-aware planning summary

Observation-not-filing posture. India regime-aware (Old/New). Per-instrument tax treatment via dictionary. Cross-border aware. Review-needed flags and specialist referral triggers. Reports include tax observations with conservative phrasing.

Reference: Section 13.

---

## 27.18 OCR / document intake summary

Manual-first, OCR-assisted. Document types catalog per region. Upload → classify → extract → review (preview + confidence) → map → apply → audit. Corrections logged. Source citations visible in the plan. Highly sensitive documents encrypted at field level; access logged.

Reference: Section 19.

---

## 27.19 Compliance and audit summary

Role-based scopes (firm/workspace/household/user/client). Couple consent model. Immutable audit across fields, scores, insights, tasks, recommendations, AI contributions, exports. Assumption and rule pack versioning on every output. Override logs with reasons. Export in PDF + machine-readable formats.

Reference: Section 22.

---

## 27.20 Design system summary

Premium, minimal. Deep green for structure; brand green for positive chips; severity palette distinct from brand; restrained motion; tabular numbers; strong hierarchy. Cards-and-chips paradigm. Progressive disclosure. AA accessibility baseline; AAA on key client surfaces. Design tokens centralized for theming.

Reference: Section 23.

---

## 27.21 MVP roadmap

India-first web app; Basic and Advanced core; full data model; deterministic analytics + probabilistic for retirement + top goals; 30-rule insight library; risk profiling and suitability core; tax-aware observations; manual + OCR ingestion (top India templates); dashboards (advisor, client, individual, couple, family); reports (one-pager, Basic plan, full plan, suitability, meeting summary, family map); audit trail; scalable backend; integration-ready APIs.

Reference: Section 25.1.

---

## 27.22 Phase roadmap

- **Phase 2.** Probabilistic expansion; full stress library; GCC deepening; special-needs deep; business-owner expansion; estate/continuity workflows; recommendation center; annual review automation; OCR template expansion; public APIs and webhooks; messaging.
- **Phase 3.** Full GCC/Global packs; multi-entity/family office; succession cross-gen; AI expansion with evaluation suite; aggregator integrations; goal-based execution orchestration (non-transactional); mobile Advanced (select); dark mode; multilingual.

Reference: Sections 25.2 and 25.3.

---

## 27.23 Standout differentiators

1. **Household Intelligence Map** as a working surface, not a diagram.
2. **Basic ↔ Advanced single-fabric experience** with zero re-entry.
3. **Prioritized, plain-English, action-linked insight engine.**
4. **Live-meeting-grade UI** (Meeting Mode, Narrative Rail, live tasks/scenarios).
5. **Tax-aware observation engine** (India-first) without overreach.
6. **Suitability rationale log + compliance-by-default audit trail.**
7. **Manual-first, OCR-assisted** intake with full provenance.
8. **Region framework** baked in from day one.
9. **AI that is scoped, cited, and compliance-aware**, not a chatbot.
10. **First-class support** for NRI / cross-border, eldercare, special-needs, and business-owner households.

Reference: Section 24.

---

## 27.24 Top product risks

1. **Scope sprawl** across regions, modules, and AI surfaces.
2. **AI overreach** into advisory language.
3. **India regulatory interpretation drift.**
4. **OCR variance** on low-quality documents.
5. **Advisor trust in numbers** if assumptions are not transparent.
6. **Insight fatigue** from over-surfacing.
7. **Sensitive-topic missteps** in copy or UI.
8. **Firm customization pressure** leading to forks.

Mitigations are embedded in Sections 11.8, 14.9, 19.14, 21.3, 22, 23, and 26.23.

Reference: Sections 25.9 and throughout.

---

## 27.25 Final recommendation on market positioning

Position Compass as the **planning intelligence layer for modern Indian and cross-border households** — a premium, advisor-grade, client-friendly system that is **compliant by default, household-native, and live-meeting-ready**. Lead with:

- the **Household Intelligence Map** as the sight-memorable differentiator,
- a **10-minute Basic Plan** as the prospect-conversion moment,
- **Advanced Mode** as the depth that HNI and serious advisors demand,
- **India-first realism** (PPF/EPF/NPS/ULIP/ELSS/ESOPs, dual regime, joint family, parental care, NRI links),
- **compliance and audit by default** as the trust anchor for firms.

Avoid competing on transactions, execution, filing, or market predictions. Compete on **clarity, credibility, and care** — the three things households and advisors actually reward.

Valura Compass is the product that makes the plan **about the family**, **about the next action**, and **about the future**, not about the spreadsheet.
