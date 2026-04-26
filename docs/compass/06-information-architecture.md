# 6. Information Architecture

The platform is organized as a **household-scoped workspace** of connected modules over a shared data model. Navigation is deliberately shallow — three levels max — with context rails doing the heavy lifting.

---

## 6.1 Global navigation

```
Top chrome (always visible)
├── Valura logo (home)
├── Workspace switcher      (firm / tenant)
├── Household switcher      (current household, search, recents)
├── Region indicator        (IN / GCC / GLOBAL) with a tooltip
├── Mode toggle             (Basic | Advanced)
├── Meeting Mode toggle     (Advanced only)
├── Global search           (households, people, instruments, tasks, documents)
├── Notifications bell
└── Account menu

Left rail (collapsible)
├── Home / Dashboard
├── Households (advisor users only)
├── People
├── Planning
│   ├── Overview
│   ├── Cash Flow
│   ├── Assets
│   ├── Liabilities
│   ├── Insurance
│   ├── Goals
│   ├── Retirement
│   ├── Tax (Advanced)
│   ├── Risk & Suitability
│   ├── Estate & Continuity (Advanced)
│   ├── Scenarios (Advanced)
├── Insights
├── Action Center
├── Documents
├── Reports
├── Advisor Notes (Advanced, advisor only)
├── Audit Trail (Advanced, advisor/compliance)
└── Settings
    ├── Region & Assumptions
    ├── Permissions
    ├── Brand (firm)
    └── Profile
```

Self-serve clients see a trimmed version (no "Households" list, no "Advisor Notes", no "Audit Trail"; Advanced modules gated).

## 6.2 Shared shell elements

Every workspace screen uses:

- **Household header:** name, members avatars, region, primary currency, a completeness meter, last updated.
- **Insights rail (right, collapsible):** top 5 insights for this context.
- **Action rail (right, below insights):** top open tasks.
- **Assumptions footer (subtle):** "Based on: 6% inflation, 11% equity return, retirement at 60. Edit →" — visible on pages where outputs depend on assumptions.

## 6.3 Module catalog

Each entry is specified with: **Purpose · Target user · Mode · Min inputs · Advanced inputs · Outputs · Dependencies · Key UX · UI components · Visualization · Risks if done poorly.**

---

### 6.3.1 Dashboard / Home
- **Purpose.** Orient the user in under 3 seconds. Surface top scores, top insights, top actions, household snapshot.
- **Target user.** Both.
- **Mode.** Both.
- **Min inputs.** Household exists; at least Basic snapshot.
- **Advanced inputs.** Enables scenario panel, tax panel, estate panel.
- **Outputs.** Composite Financial Health Score, 3–5 KPI cards, top 3 insights, top 3 actions, household map preview.
- **Dependencies.** Analytics engine, Insight engine, Action center.
- **Key UX.** Above-the-fold is sacred. No scroll-to-meaning.
- **Components.** KPI cards, score ring, insight cards, task cards, household map preview, scenario teaser.
- **Visualization.** Score ring (radial), sparkline for score trend, severity chips.
- **Risks if done poorly.** Clutter; dashboards pretending to be reports.

### 6.3.2 Onboarding
- **Purpose.** Create a household, set region, invite members, choose advisor-led or self-serve, choose Basic or Advanced.
- **Mode.** Both (initial).
- **Min inputs.** Household name, region, primary user.
- **Outputs.** New household, initial members, first mode set.
- **Dependencies.** Auth, permissions, region framework.
- **UX.** Friendly, low-friction, under 3 steps. Explicit consent for data.
- **Risks.** Overly bureaucratic KYC-feel.

### 6.3.3 Basic Quick Planning flow
- **Purpose.** Produce a usable plan in under 10 minutes.
- **Mode.** Basic.
- **Min inputs.** As per Section 9.
- **Outputs.** Basic Plan one-pager + scores + insights + actions.
- **Dependencies.** Analytics, Insights, Action center, Reports.
- **UX.** Chat-style or card-stack, one idea per screen, progress visible, skip-friendly.
- **Visualization.** Progress arc, summary cards with inline severity chips.
- **Risks.** Feels like a calculator; feels like a pitch funnel.

### 6.3.4 Advanced Planning Workspace
- **Purpose.** Deep, non-linear planning across all modules.
- **Mode.** Advanced.
- **Outputs.** Full plan, scenarios, reports, audit log.
- **Dependencies.** All.
- **UX.** Workspace — modules accessible as a left rail; a Narrative Rail helps advisors drive a live interview.
- **Risks.** Becomes a 50-tab web form.

### 6.3.5 Individual Profile
- **Purpose.** Person-level attributes, preferences, employment, health, confidence, communication style.
- **Mode.** Both (Basic: subset).
- **Outputs.** Feeds income durability, risk capacity, behavior model.
- **UX.** Two tabs: Snapshot (Basic) and Details (Advanced).

### 6.3.6 Couple Profile
- **Purpose.** Link two individuals as a couple; shared/separate finances, joint goals, combined cash flow.
- **Mode.** Both.
- **Outputs.** Combined cash flow, joint goals, consent model.
- **UX.** A "Couple" panel on the Household Overview with clear "who owns what" chips.

### 6.3.7 Family Profile / Household Map
- **Purpose.** Model all members; feeds the Household Intelligence Map.
- **Mode.** Both (Basic: light).
- **Outputs.** Member roster, relationships, dependency edges, financial links.
- **UX.** Graph canvas with detail drawers (Section 17).

### 6.3.8 Family Dependency Map
- **Purpose.** Visualize obligations, earnings, supports, nominees, beneficiaries, goals-by-person.
- **Mode.** Both (Basic: summary; Advanced: full).
- **Outputs.** Dependency edges, vulnerability flags, gap flags.
- **UX.** Toggle filters: earnings / obligations / insurance / goals / nominees.

### 6.3.9 Income and Cash Flow
- **Purpose.** All inflows, variability, durability, sources.
- **Mode.** Both.
- **Outputs.** Monthly and annualized cash flow; durability score inputs.
- **Advanced inputs.** Variability bands, seasonality, dependency on a single payer/client.

### 6.3.10 Expense Analysis
- **Purpose.** Essential vs discretionary; inflation sensitivity; hidden leakage.
- **Mode.** Both.
- **Outputs.** Essential run-rate (used by protection adequacy, emergency targets).
- **Advanced inputs.** Category-level inflation sensitivity, non-negotiable flags.

### 6.3.11 Assets
- **Purpose.** All holdings by class, ownership, liquidity, nominee, tax treatment.
- **Mode.** Both (Basic: bucketed; Advanced: line-item).
- **Outputs.** Allocation, concentration, liquidity profile.

### 6.3.12 Liabilities
- **Purpose.** Debt inventory, EMIs, tenure, prepayment, refinance opportunities.
- **Mode.** Both.
- **Outputs.** Debt stress inputs, prepayment scenarios.

### 6.3.13 Tax-Aware Planning (Advanced)
- **Purpose.** Planning-level tax observations, regime implications, inefficiencies.
- **Mode.** Advanced.
- **Outputs.** Tax observation cards with "review with CA" flags where needed.

### 6.3.14 Insurance and Protection
- **Purpose.** Inventory of policies, adequacy analysis, gaps, nominee mapping, renewal risk.
- **Mode.** Both.
- **Outputs.** Protection Adequacy Score; gap recommendations.

### 6.3.15 Risk Profiling
- **Purpose.** Composite risk profile (stated + capacity + need + behavior).
- **Mode.** Both (Basic: short; Advanced: full).
- **Outputs.** Risk Profile Score; rationale log.

### 6.3.16 Investment Suitability
- **Purpose.** Link risk profile with goals, liquidity, dependency for product suitability guardrails.
- **Mode.** Advanced.
- **Outputs.** Suitability Score; guardrails; rationale.

### 6.3.17 Goals and Milestones
- **Purpose.** All life goals with priority, horizon, flexibility, dependency, emotional weight.
- **Mode.** Both.
- **Outputs.** Feasibility ranking, funding plan.

### 6.3.18 Retirement
- **Purpose.** Retirement expense model, pension inflows, corpus gap.
- **Mode.** Both.
- **Outputs.** Retirement Readiness Score; gap; probability of success (Advanced).

### 6.3.19 Education Planning
- **Purpose.** Per-child education cost and corpus planning.
- **Mode.** Both.
- **Outputs.** Required corpus, SIP equivalent, scenario shift (abroad vs domestic).

### 6.3.20 Major Purchase Planning
- **Purpose.** Home, second home, vehicle, major travel.
- **Mode.** Both.
- **Outputs.** Affordability, timing, EMI implications.

### 6.3.21 Eldercare & Dependent-Care Planning
- **Purpose.** Model parents' healthcare reserve, caregiver burden, critical illness coverage, senior citizen cover.
- **Mode.** Both.
- **Outputs.** Healthcare reserve target; caregiver burden flag.

### 6.3.22 Emergency Planning
- **Purpose.** Emergency fund target; liquidity; access speed.
- **Mode.** Both.
- **Outputs.** Emergency Resilience Score; months-of-coverage.

### 6.3.23 Estate / Nominee / Beneficiary Readiness
- **Purpose.** Will, trust, nominees, PoA, guardianship, succession plan.
- **Mode.** Advanced (Basic shows a 5-question readiness snapshot).
- **Outputs.** Estate Readiness Score; document completion.

### 6.3.24 Document Vault
- **Purpose.** Secure document storage with tagging, retention, versioning.
- **Mode.** Both.

### 6.3.25 OCR Ingestion Center
- **Purpose.** Upload, extract, review, apply to fields.
- **Mode.** Both.

### 6.3.26 Scenarios
- **Purpose.** Named what-ifs across household and goals.
- **Mode.** Advanced (with a light "what-if" slider teaser in Basic).

### 6.3.27 Advanced Analytics
- **Purpose.** Probabilistic and stress analysis; assumption sensitivity.
- **Mode.** Advanced.

### 6.3.28 Insights Engine
- **Purpose.** Continuous prioritized observations.
- **Mode.** Both.

### 6.3.29 Recommendation Center
- **Purpose.** Advisor-proposed recommendations with rationale, suitability context, and compliance fields.
- **Mode.** Advanced (advisor).

### 6.3.30 Action Center
- **Purpose.** Task system for advisor/client/spouse/specialist/compliance.
- **Mode.** Both.

### 6.3.31 Annual Review Workspace
- **Purpose.** Re-baseline data, re-score, produce annual deck.
- **Mode.** Both (Basic: quick; Advanced: full).

### 6.3.32 Advisor Notes
- **Purpose.** Private advisor notes per household/meeting.
- **Mode.** Advanced.

### 6.3.33 Client Portal
- **Purpose.** Secure space for clients to review plan, complete tasks, upload docs, approve recommendations.
- **Mode.** Both.

### 6.3.34 Reports Center
- **Purpose.** All generated reports, templates, versions.
- **Mode.** Both.

### 6.3.35 Settings
- **Purpose.** Household settings, user settings, region & assumptions, branding (firm), permissions.
- **Mode.** Both.

### 6.3.36 Permissions
- **Purpose.** Role and scope; couple consent; advisor access scopes.
- **Mode.** Both.

### 6.3.37 Audit Trails
- **Purpose.** Immutable log of changes, overrides, AI contributions, exports.
- **Mode.** Advanced (advisor/compliance).

### 6.3.38 Region Settings
- **Purpose.** Active region per household; view region rule pack version; override assumptions.
- **Mode.** Both (advanced editing for advisors).

### 6.3.39 Assumptions Engine
- **Purpose.** Central editor for assumption sets used in plan outputs.
- **Mode.** Advanced (advisor).

---

## 6.4 Navigation rules

- **Depth.** No module is more than two clicks from the Dashboard.
- **Context.** Selecting a household sets all subsequent navigation to that context; switching households is a single action.
- **State.** Every module remembers last-seen tab per household per user.
- **Deep links.** All screens are linkable (per household, per scenario, per insight, per task).
- **Search.** Global search jumps across households, people, instruments, tasks, and documents.

## 6.5 Mode × Module matrix (summary)

| Module | Basic | Advanced |
|---|---|---|
| Dashboard | ✓ (lean) | ✓ (full) |
| Onboarding | ✓ | ✓ |
| Basic Quick Planning | ✓ | — |
| Advanced Workspace | — | ✓ |
| Individual / Couple Profile | ✓ | ✓ |
| Family Profile / Map | ✓ (light) | ✓ |
| Family Dependency Map | ✓ (light) | ✓ |
| Income / Expenses | ✓ | ✓ |
| Assets / Liabilities | ✓ (bucketed) | ✓ (line-item) |
| Tax-Aware Planning | — (regime only) | ✓ |
| Insurance | ✓ | ✓ |
| Risk Profiling | ✓ (short) | ✓ (full) |
| Suitability | — | ✓ |
| Goals / Retirement / Education / Major Purchase / Emergency | ✓ | ✓ |
| Eldercare / Special-Needs | ✓ (capture) | ✓ (plan) |
| Estate / Continuity | ✓ (5-Q snapshot) | ✓ |
| Documents / OCR | ✓ | ✓ |
| Scenarios | — (teaser) | ✓ |
| Advanced Analytics | — | ✓ |
| Insights / Actions | ✓ | ✓ |
| Recommendation Center | — | ✓ (advisor) |
| Annual Review | ✓ (quick) | ✓ (full) |
| Advisor Notes | — | ✓ (advisor) |
| Client Portal | ✓ | ✓ |
| Reports Center | ✓ (Basic one-pager) | ✓ (all) |
| Audit Trails | — | ✓ |
| Settings / Permissions / Region / Assumptions | ✓ (basic) | ✓ (full) |

## 6.6 Design risks to watch

- **Menu sprawl.** Resist pushing every sub-area into nav; use tabs within modules.
- **Feature duplication.** A single Emergency score must not live in three modules with different numbers.
- **Client confusion.** Self-serve rail must look calm, not enterprise.
- **Advisor overload.** Advisor rail must surface "what matters most now" in the rail itself, not only on dashboards.
