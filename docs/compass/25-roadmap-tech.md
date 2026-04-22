# 25. MVP, Phased Roadmap, and Tech Direction

This section defines MVP, Phase 2, and Phase 3 for Compass. Instead of calendar estimates, each entry uses **technical characterization** — scope, dependencies, complexity, risk, and value. It also proposes a high-level technical architecture aligned to the blueprint.

---

## 25.1 MVP

The MVP is the **smallest scope that delivers a defensible, credible planning product** usable by real advisors and self-serve users in India, with an architecture that supports GCC and Global later.

### MVP scope

**Platform & region**
- Multi-tenant firm / workspace / household / user / role model (Section 22).
- Region framework with `IN` fully implemented; `GCC` lean pack; `GLOBAL` fallback.
- Assumption sets and rule-pack versioning (Section 11.8).

**Modes**
- Basic Mode (Section 9) end-to-end.
- Advanced Mode core modules: Household, Individual, Couple, Family, Income, Expenses, Assets, Liabilities, Insurance, Goals, Retirement, Risk, Suitability (core), Estate snapshot, Documents, OCR, Scenarios (deterministic), Insights, Action Center, Reports, Audit.

**Data & intake**
- Complete data model (Section 7).
- Manual entry everywhere; OCR-assisted intake for high-value templates: ITR (India), Form 16, CAMS/KFintech MF statement, EPF passbook, NPS statement, common term/health policy documents, common bank statements.
- Document vault with versioning and sensitivity classes.

**Analytics**
- Deterministic analytics engine with all 20 scores (Section 11.2).
- Scenario engine with baseline + optimized + named stress tests.
- Basic Monte Carlo for retirement and top-3 goals.

**Risk & suitability**
- Full RPS questionnaire (Advanced) and 5-item Basic.
- ISS guardrails for major India categories (Section 12.6).
- Suitability rationale and override workflow.
- Change history.

**Tax-aware layer**
- Regime awareness (India).
- Observation engine with primary observation templates (Section 13.4).
- Cross-border awareness where relevant.

**Insight engine**
- Rule library for the top 30 rules across categories (Section 14).
- NBA ranking with behavior-aware weights.
- Plain-English templates with advisor/client voice.

**Dashboards & screens**
- Advisor dashboard, Client dashboard, Individual/Couple/Family dashboards.
- Goals dashboard, Action Center, Documents/OCR screens.
- Household Intelligence Map (Section 17).

**Reports**
- One-page client summary, Basic Mode quick plan, Advanced full plan, Suitability summary, Meeting summary, Family financial map standalone.
- Web + PDF.

**AI layer**
- Summarization, translation, insight/recommendation narration, meeting summary drafting, missing-data suggestions.
- All approval-required narratives go through advisor review.
- Citation-bound, fact-checked.

**Compliance**
- Full audit log (fields, scores, insights, tasks, recommendations, AI, exports).
- Role-based access; couple consent.
- Assumptions vs confirmed facts labeling.

**Non-functional**
- Web-first, desktop-primary for Advanced; mobile for Basic, Client portal, dashboards.
- Accessibility AA baseline.
- Encryption at rest and in transit.

### What MVP deliberately skips

- Probabilistic analysis beyond retirement + top-3 goals.
- Advanced Monte Carlo sensitivity visualizations and tornado charts (basic version only).
- Deep NRI/GCC coverage beyond the lean pack.
- PMS/AIF category guardrails beyond basic.
- Succession deep workflows beyond Estate snapshot.
- Client messaging.
- In-product payments or execution.
- Integrations beyond REST API surfaces.

### MVP rationale

- Gives India advisors a complete, credible tool in Basic and Advanced on the same model.
- Gives self-serve users a beautiful Basic and a usable Advanced.
- Establishes compliance and audit from day one (non-negotiable).
- Establishes region framework so GCC expansion is a rule pack, not a rewrite.

### MVP dependencies
- Tenant auth; firm/user provisioning.
- OCR vendor selection and template authoring.
- Copy library and voice dictionary.
- Data model and rules engine with versioning.
- AI provider selection with data residency and no-training contract.

### MVP complexity characterization
- Invasive: data model, rules engine, audit trail, region framework, Household Map, suitability engine.
- Medium: dashboards, reports, OCR review UX, Action Center.
- Contained: Basic Mode flow, insight templates.

### MVP risk characterization
- **Rule library breadth vs depth.** Ship 30 well-tested rules rather than 100 shallow ones.
- **OCR quality variance.** Confidence display and manual review mitigate.
- **AI drift.** Hallucination controls and citation bindings mitigate.
- **India regulatory interpretation drift.** Compliance disclosures and "planning observation" framing mitigate.

### MVP value
- Advisor: prospect-to-plan in 20 minutes; compliant audit by default; live meeting-ready.
- Client: plain-English, actionable, family-aware plan.

---

## 25.2 Phase 2

Phase 2 deepens the product where MVP intentionally stayed lean.

**Features**
- **Probabilistic analysis expansion.** Fan charts, sensitivities, tornado visualizations across all major goals.
- **Full stress test suite.** Named stress scenarios with Before → After on all impacted scores.
- **GCC deepening.** Country-level packs (UAE, KSA), EoSB modeling, return planning module.
- **Special-needs module deepening.** Continuity planning templates, guardianship workflows, trust readiness checklists.
- **Business-owner household expansion.** Entity structure modeling, personal guarantee tracking, keyman insurance workflow, business continuity scenarios.
- **Estate & continuity expansion.** Will/trust/PoA/beneficiary consistency workflows with document templates (region-appropriate).
- **Advanced insurance adequacy.** Survivor income modeling, policy exclusions library, replacement vs continuation analysis, renewal risk.
- **Recommendation Center.** Advisor-proposed recommendations with rationale, alternatives considered, client acknowledgments, compliance routing.
- **Messaging & client portal enhancements.** In-product secure messaging, task commenting, document requests from advisor.
- **Annual review automation.** Delta capture improved; auto-drafted decks with advisor review.
- **OCR template expansion.** Additional statement providers, ITR schedules, policy document variants.
- **Integrations.** Public REST and webhook APIs for core resources; CRM sync patterns; basic aggregator adapters (optional).

**Dependencies on MVP.** All.

**Complexity.** Moderate to high across multiple subsystems. Probabilistic expansion and GCC deepening are the biggest investments.

**Risk.** Feature creep; keep scope disciplined. Resist execution features (trading, transactions).

**Value.**
- Advisor: handles HNI/UHNI/NRI meaningfully; stronger differentiation.
- Client: richer insight and more life-event coverage.

---

## 25.3 Phase 3

Phase 3 pushes Compass into the more advanced and integration-rich territory.

**Features**
- **Full GCC country packs and deeper Global rule packs.**
- **Multi-entity household modeling** (trusts, family offices) with consolidated household views.
- **Succession modeling across generations.**
- **Advanced AI assistance.** Prep, narration, and draft workflows across more surfaces with stronger evaluation suite.
- **Aggregator integrations.** Optional India AA-based data feeds; GCC bank integrations where viable; brokerage APIs.
- **Deeper tax-aware observations.** Capital gains planning workflows, loss harvesting awareness (still observation-only).
- **Goal-based execution orchestration** (optional, advisor-driven, non-transactional Compass still — orchestration hands off to firm rails).
- **Mobile Advanced (limited).** Specific modules on mobile for advisors.
- **Dark mode.**
- **Localization (languages).** English + Hindi as starting point; additional Indian languages (Tamil, Telugu, Marathi, Bengali, Gujarati) as research shows value.
- **Group-level analytics for firms.** Book-wide insights: at-risk households, review adherence, insight closure rates.

**Dependencies.** Phase 2 maturity; API surfaces stabilized.

**Complexity.** Deep integrations and multi-entity modeling are the biggest risks.

**Risk.** Integration quality and data residency. Multi-entity modeling can balloon scope.

**Value.**
- Advisor: firm-grade visibility; handles complex families.
- Client: streamlined intake via integrations.

---

## 25.4 What to avoid (dangerous to overbuild)

- **Execution / trading.** Keep Compass planning-only; integrate out.
- **Filing tools.** Keep Compass observation-only on tax.
- **Chatbot-as-core.** AI is assistive, not a primary UX.
- **Custom fund picking.** Category guidance only; product recommendations live in advisor's Recommendation Center, not Compass picks.
- **Overly wide initial rule library.** Ship well-tested rules; expand deliberately.
- **Rewriting the shell per firm.** Keep firm branding contained; no bespoke forks.

---

## 25.5 High-level backend architecture

```
Clients (web, mobile)
    ↓
API Gateway (authN/Z, rate limit, audit envelope)
    ↓
Application services (modular)
  ├─ Identity & Access Service (firm, user, role, scope)
  ├─ Household Service (household, members, relationships)
  ├─ Financial Data Service (income, expenses, assets, liabilities, policies, goals)
  ├─ Profile Service (personal, behavior, risk, suitability)
  ├─ Region Service (region packs, instrument dictionary, disclosures)
  ├─ Assumptions Service (assumption sets, versioning, per-household overrides)
  ├─ Rules Engine (deterministic score + insight rules; region-aware)
  ├─ Analytics Engine (projections, scenarios, probabilistic)
  ├─ Insight Service (templates, NBA, ranking, dedup)
  ├─ Action Service (tasks, reminders, escalation)
  ├─ Document Service (storage, metadata, versioning)
  ├─ OCR Service (extraction pipelines, templates, confidence)
  ├─ Report Service (templates, rendering, PDF/Deck)
  ├─ AI Service (prompt templates, citation binding, safety)
  ├─ Audit Service (event ingest, store, export)
  └─ Notification Service (in-app, email, SMS/WA where allowed)
    ↓
Storage
  ├─ Primary transactional store (multi-tenant isolation)
  ├─ Document object store (encrypted, field-keyed where sensitive)
  ├─ Audit store (append-only)
  ├─ Cache layer
  └─ Secrets / KMS
```

### Event bus

- Internal events: `field_changed`, `score_computed`, `insight_created`, `task_created`, `document_uploaded`, `report_generated`, `ai_contribution`, `suitability_decision`.
- Consumers: Insight Service, Analytics Engine, Audit Service, Notification Service, Report Service.

### Rules engine approach

- Deterministic, versioned, side-effect-free rules.
- Rule definitions in YAML/JSON with a typed schema.
- Rules reference `field_id`, `score_id`, `assumption_id` from a stable registry.
- Region-scoped rule packs with semver.
- Rules produce events consumed downstream.

### Analytics engine structure

- Pure-function formula runtime with memoization per plan snapshot.
- Projection engine using region-default assumption sets with household overrides.
- Scenario engine stores overrides against a baseline snapshot.
- Probabilistic engine uses precomputed return/correlation matrices per region; seed retained for reproducibility.

### Document processing architecture

- Upload → virus/integrity scan → classifier → OCR pipeline → template extraction → confidence tagging → review queue → field application → audit event.
- Extraction templates versioned per document type; corrections feed tuning (optional, per-tenant).

### API surfaces (MVP)

- REST JSON:
  - `/households/*`, `/persons/*`, `/assets/*`, `/liabilities/*`, `/policies/*`, `/goals/*`, `/profiles/*`
  - `/plans/*`, `/scenarios/*`, `/insights/*`, `/tasks/*`, `/reports/*`
  - `/documents/*`, `/audit/*`
- Webhooks for: tasks, insights, plan changes, report generation.

### Future integration readiness

- External CRMs: stable REST + webhooks; per-tenant integration secrets.
- Execution stacks: suitability export and "ready-for-action" tags, no execution.
- Tax preparation tools: one-way document export, no filing.
- AA / open banking: optional connectors in Phase 3, strictly opt-in.

### Existing platform integration considerations

- Compass is designed to **live inside** Valura.ai's platform as a planning module.
- Single sign-on with Valura platform identity; firm/workspace model inherited or mapped.
- Shared design tokens with Valura platform to reduce visual mismatch.
- Shared audit infrastructure with Valura platform where possible; Compass audit remains first-class in the Compass scope.
- API-first: any Valura platform surface can embed Compass views or consume Compass data.

---

## 25.6 Non-functional requirements

- **Performance.** Under 300ms for score recompute on Basic data; under 1.2s for Advanced full recompute; under 3s for standard Monte Carlo at N=5000.
- **Availability.** 99.9%+ target for V1.
- **Observability.** Trace-aware logging, structured metrics, SLO dashboards for key user flows (Basic completion, Advanced recompute, report generation).
- **Security.** MFA for advisors; principle-of-least-privilege; secrets manager; per-tenant encryption keys for sensitive data.
- **Privacy.** Data residency per tenant; no customer data training; minimized prompt payloads.
- **Accessibility.** AA baseline; AAA on key client surfaces.

---

## 25.7 Team / delivery shape (not time estimates)

- Platform squad: data model, region framework, identity, audit, rules engine.
- Planning squad: Basic Mode, Advanced Mode, Family Map, Goals, Retirement.
- Analytics squad: engine, scenarios, probabilistic, suitability.
- Intelligence squad: insight engine, NBA, tax-aware observation engine, AI layer.
- Docs & OCR squad: document vault, OCR review, templates.
- Experience squad: design system, shell, dashboards, reports.
- Compliance & governance: audit UX, compliance dashboards, export, policy settings.

---

## 25.8 Success metrics

- **Advisor.**
  - Time to produce Basic Plan in a first meeting.
  - Households-per-advisor managed.
  - Insight-to-task conversion rate.
  - Annual review cycle time.
- **Client.**
  - Basic completion rate (self-serve).
  - Actions completed in first 90 days.
  - NPS on plan clarity.
  - Plan-completeness score trajectory.
- **Platform.**
  - Score recompute latency.
  - Audit event integrity (failure rate near zero).
  - OCR high-confidence yield.
  - AI refusal rate vs hallucination incidents (target: zero hallucination incidents reaching client view).

---

## 25.9 Top product risks

1. **Scope sprawl across regions.** Disciplined rule-pack approach.
2. **AI overreach.** Strict citation binding and advisor approval.
3. **India regulatory shifts.** Rule-pack agility; conservative disclosures.
4. **OCR quality variance.** Manual review default + confidence display.
5. **Advisor trust in numbers.** Transparent assumptions and lineage.
6. **Insight fatigue.** Rate limiting and NBA ranking.
7. **Sensitive-topic copy missteps.** Dedicated copy review checklist.
8. **Compliance cost at scale.** Built-in audit reduces external cost; still requires governance discipline.
