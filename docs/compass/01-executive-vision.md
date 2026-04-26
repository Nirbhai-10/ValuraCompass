# 1. Executive Product Vision

## 1.1 What Compass is

**Financial Planning Compass** (hereafter "Compass") is a web-first, advisor-grade and client-friendly **planning intelligence platform** from Valura.ai. It converts the messy reality of a household's finances — income, expenses, assets, liabilities, insurance, taxes, goals, people, obligations — into a **living plan** that produces plain-English insight, explicit risk and suitability signals, and prioritized next actions for both the advisor and the client.

Compass is **not** a portfolio management terminal, a trading app, a robo-advisor, or a product marketplace. It is a **planning and advisory intelligence system** that can optionally feed suitability-aware allocation guidance into whatever execution stack an advisor or firm already uses.

The product has two operating modes that share one data model:

- **Basic Mode** — a premium, under-10-minute guided snapshot that creates genuinely useful planning output for prospects, first meetings, quick check-ins, or self-serve users.
- **Advanced Mode** — a deep, advisor-grade live planning workspace capable of handling HNI/UHNI households, NRI/cross-border cases, special-needs dependents, business owners, eldercare obligations, tax-aware planning, scenarios, and probability-based analysis.

Compass is designed to be the planning layer that sits **inside** Valura.ai's broader platform — integratable, modular, and region-aware.

## 1.2 Who it is for

Two primary user classes, each with sub-segments:

**A. Advisor-led users**
- Registered Investment Advisers (RIAs) running structured advisory
- Wealth managers serving affluent and HNI families
- Mutual fund distributors (MFDs) deepening engagement beyond transactions
- Insurance advisors running protection-led conversations
- CA offices combining tax and financial planning
- Research advisors who need planning + suitability context
- Large-firm planners running live planning interviews

**B. Self-serve users**
- Young professionals starting to organize finances
- Couples planning major life goals
- Mass affluent households
- HNI/UHNI households self-managing with occasional advisor help
- NRI / cross-border families
- Families supporting elderly parents
- Families with dependents with disabilities or special needs
- Business-owner / promoter households

Compass must make **both** classes feel this is built for them, at the same time, from the same codebase.

## 1.3 Why Compass exists

Today, most households — and most advisors — operate between two broken extremes:

1. **Shallow calculators** (retirement calculators, SIP calculators, goal calculators) that give a number but no plan, no context, no household view, no compliance artifact, and no action.
2. **Legacy planning suites** that are technically deep but:
   - feel like insurance-era software from 1998,
   - are unusable in a live client meeting,
   - hide insights under 40 tabs of inputs,
   - have no concept of family dependency or cross-border reality,
   - produce long PDFs nobody reads,
   - and give the advisor no leverage between meetings.

Self-serve tools are worse. They either over-simplify (one slider for "risk") or drop the user into a form-heavy wasteland and call it "comprehensive." Neither builds trust, neither leads to action.

Compass exists to close this gap. It is the first planning product built around three simultaneous truths:

1. **A plan is only as good as the household it understands.** Compass is household-native, not account-native.
2. **A plan is only as useful as the next action it produces.** Compass is insight- and action-first, not form-first.
3. **A plan must be explainable and auditable.** Compass makes assumptions, overrides, suitability rationale, and AI contributions fully legible.

## 1.4 Exact planning & advisory problem it solves

Compass solves the following operational problems in one system:

- **Discovery fatigue** — reduces the cost of a complete household discovery from hours of disjointed forms to a structured, progressively-disclosed interview.
- **Planning blindness** — converts raw data into scored, prioritized, plain-English observations (e.g., "Your household income depends 92% on one earner; protection cover funds only 1.2 years of essential expenses").
- **Basic-to-advanced friction** — gives a single data model that starts thin and deepens without restart.
- **Advisor-in-meeting tooling** — presents a screen that an advisor can confidently share on Zoom, Teams, or in-person without scrolling through technical clutter.
- **Compliance documentation burden** — automatically captures assumption trails, suitability rationale, recommendation justification, and override logs.
- **Family complexity** — models spouses, children, parents, in-laws, dependents, caregivers, cross-border links, and special-needs obligations as first-class citizens, not footnotes.
- **Tax-aware planning gaps** — weaves tax status, regime, and treatment into insights without pretending to be a tax return preparer.
- **Regional misfit** — embeds region-specific tax, account labels, insurance terms, retirement assumptions, and household structures as configurable rules, not hardcoded logic.
- **Life-event drift** — tracks the plan as a living object and re-prioritizes when a life event occurs.

## 1.5 Why existing planning tools still leave gaps

| Gap | Typical tool behavior | Compass response |
|---|---|---|
| Family reality | Individual-centric or spouse-as-afterthought | Household Intelligence Map as core primitive |
| Insight quality | "Your retirement corpus is X" only | Prioritized, plain-English, action-linked insights with severity and explainability |
| Basic → Advanced | Separate products or forced restart | Same data model, progressive disclosure, zero re-entry |
| Advisor live use | Busy screens, reveal bad numbers in front of client | Meeting Mode screens, curated visuals, safe disclosure toggles |
| Audit | PDF archive only | Assumption log, override log, AI contribution log, suitability rationale log |
| NRI / cross-border | Ignored or bolt-on | First-class residency, tax-residency, and jurisdictional structure |
| Special-needs / eldercare | Ignored | Dedicated dependent planning blocks and dependency map |
| Tax awareness | Superficial | Observation engine (not a tax opinion) linked to planning choices |
| AI | Chatbot gimmicks | Scoped, citation-bound, advisor-reviewed, compliance-logged |

## 1.6 Why this matters especially in the Indian market

India's planning market has structural specificity that global-first tools chronically mishandle:

- **Joint family realities.** Financial decisions frequently involve parents, in-laws, siblings, and multi-generational obligations.
- **Salaried + business owner mix.** Many households blend salary, professional income, promoter stakes, and agricultural/rental income — often in one PAN.
- **Dual tax regimes.** The Old vs New regime optionality needs planning-layer awareness, not just CA-layer awareness.
- **Mandatory / semi-mandatory accounts.** EPF, PPF, NPS, Sukanya Samriddhi, Gratuity, and ESOPs are ubiquitous and regionally specific.
- **Insurance distortions.** The market is overfit with endowment/ULIP/traditional-savings insurance that masks protection gaps.
- **Real estate concentration.** Households commonly hold 50–80% of net worth in one or two illiquid properties.
- **Informal debt.** Family loans, unrecorded business advances, and hand loans are common and matter for resilience.
- **NRI flows back to India.** A material share of Indian household wealth is built, routed, or supported through NRI relatives.
- **Elderly parent obligations.** Formal long-term-care is immature; household planning must absorb it.
- **Aspiration density.** Multiple simultaneous major goals (home, children's education, marriage, retirement, parents' care) compete for the same cash flow.
- **Distribution channel plurality.** RIAs, MFDs, insurance agents, banks, and CAs all do some planning; the tool must meet them where they are.

An India-first design encodes these as first-class assumptions, then abstracts them into a region framework that can plug in GCC and global without a rewrite.

## 1.7 How India-first design differs from global-first planning tools

- **Terminology is Indian by default:** PPF, EPF, NPS, ULIP, HUF, ESOPs (Indian treatment), LTCG/STCG, Section 80C/80D context, indexation rules — with a glossary layer for self-serve users.
- **Currency default INR** with locale-aware number formatting (lakh/crore toggle).
- **Household modeling** treats parents and in-laws as potentially financially linked entities, not ignored.
- **Tax regime toggle** at the household level with Old vs New treatment visible in planning outputs.
- **Insurance** separates protection from savings-linked policies explicitly, with adequacy scoring based on essential expense run-rate.
- **Goals** include culturally salient categories (children's marriage, home purchase, parental care) without making them mandatory.
- **Document intake** is ITR-aware, policy-document-aware, and CAMS/KFintech-statement-aware (via OCR / manual).
- **Compliance** defaults align with SEBI / IRDAI-style expectations around suitability rationale and risk profiling (without claiming to be a regulator-certified product on day one).

## 1.8 Expansion into GCC and Global

The product is region-aware from day one. The **Region Framework** (Section 5) encapsulates:

- tax logic layers,
- retirement assumptions,
- instrument labels and mappings,
- residency and nationality modeling,
- insurance term variations,
- document type dictionaries,
- reporting localization (currency, number format, date format),
- region-specific compliance disclosures,
- default assumption sets.

**GCC** adds: expatriate-dominant households, end-of-service benefit modeling, zero-personal-income-tax contexts with remittance-heavy flows, repatriation-ready planning, multi-jurisdictional goals (education in UK/US, home back in India/Pakistan/Egypt/Philippines).

**Global** is a generic fallback profile: no regional tax logic, neutral instrument labels, conservative assumption defaults, and explicit disclaimers. It exists so unknown jurisdictions can still use Compass without the product silently using India-specific logic.

Region expansion is **configuration + rule packs**, not a fork.

## 1.9 What makes the product differentiated

Nine concrete differentiators (expanded in Section 24):

1. **Household Intelligence Map** — a core feature, not a decoration.
2. **Basic↔Advanced single-fabric experience** — no restart, no data loss.
3. **Insight Engine** — prioritized, plain-English, severity-tagged, explainable, action-linked.
4. **Live-meeting-grade UI** — advisor can screenshare without apologizing.
5. **Tax-aware observation layer** (India-first) that is planning-aware but never pretends to file returns.
6. **Suitability rationale + audit log** that makes compliance quiet and continuous.
7. **Manual-first, OCR-assisted** intake, with confidence display and reviewable provenance.
8. **Region framework** baked in from day one.
9. **AI that is scoped, cited, and compliance-aware**, not a chatbot.

## 1.10 What Basic Mode means in this product

Basic Mode is a **premium, under-10-minute guided snapshot** that:

- captures the minimum viable household picture,
- respects users' time,
- produces a real one-page plan (not a teaser),
- surfaces top risks, top opportunities, and next actions,
- can be completed self-serve or in a 15-minute prospect meeting,
- feeds directly into Advanced Mode without re-entry,
- is intelligent enough to infer where possible and honest about what it assumed.

Basic Mode is **not** a stripped marketing funnel. It is a clinically curated subset that still satisfies a real planning conversation.

## 1.11 What Advanced Mode means in this product

Advanced Mode is a **live planning interview + deep workspace** that:

- supports complex households, cross-border cases, business owners, special-needs dependents, and eldercare,
- captures the full data model in Section 7,
- runs scenarios and probabilistic analysis,
- produces advisor-grade reports,
- logs everything for audit,
- can be curated on-screen for a live meeting (Meeting Mode),
- lets advisors toggle depth per section without the user ever falling off a cliff.

Advanced Mode is a **workspace**, not a long form.

## 1.12 Advisor-led and self-serve coexistence

One product. Same data model. Different defaults, guardrails, and microcopy.

- **Advisor-led sessions** default to Meeting Mode screens, use advisor microcopy, expose override capabilities, and show advisor-only panels (compliance, notes, rationale drafts).
- **Self-serve sessions** default to plain-English microcopy, glossary tooltips, Basic Mode entry, and gentle nudges instead of dense dashboards. Advanced modules are available but gated behind short, encouraging interstitials.
- **Handoff is first-class.** An advisor can take over a self-serve household (with consent) or assign specific sections back to the client. A self-serve user can invite an advisor into their household.

## 1.13 Mass affluent vs HNI/UHNI support

- **Mass affluent** experiences are calibrated for: 1–3 earners, 2–5 goals, 5–20 holdings, straightforward tax status. Basic Mode and a lean Advanced Mode will feel complete.
- **HNI/UHNI** experiences unlock: promoter/business income, complex asset categories (private equity, unlisted holdings, offshore structures, family trusts), multi-entity liabilities, estate complexity, succession modeling, and multi-generation planning. Advanced Mode's capacity is what makes Compass viable for these households; Basic Mode still works as a prospect-conversion tool.

## 1.14 Individual, couple, and family planning

Compass is household-first. Views stack cleanly:

- **Individual view:** one person. Own profile, income, goals, assets, liabilities, insurance, risk, tax.
- **Couple view:** two individuals linked by a household, with shared vs separate finances, joint goals, combined cash flow, combined risk profile aggregation, and a couple-specific consent model.
- **Family view:** adds children, parents, dependents, and caregivers. Introduces the Household Intelligence Map, dependency flows, and family-level risk aggregation.

A single user can toggle views without changing the underlying plan. The plan is one object; the views are lenses.

## 1.15 Young starters, complex households, and aging families

- **Young starters** get: emergency-first framing, salary-structure optimization nudges, protection-before-investment logic, starter goals, and a short Basic Mode that is actually useful.
- **Complex households** (HNI, business owners, cross-border) get: full Advanced Mode, advisor-grade analytics, tax-aware observations, estate readiness, and structured succession modules.
- **Aging families** get: eldercare planning blocks, healthcare reserve planning, longevity stress, caregiver burden tracking, and nominee/beneficiary consistency checks.

## 1.16 Product philosophy

Compass is designed around these stated beliefs. They are evaluation criteria for every design decision:

1. **Planning should feel human, not bureaucratic.** The product speaks plain English. It knows families are complicated.
2. **Complexity should be hidden until needed.** Progressive disclosure is a design law, not a nice-to-have.
3. **Insights must lead to action.** If a screen produces no next step, that screen is wrong.
4. **Outputs must be understandable to non-experts.** Jargon is allowed only with a glossary tooltip and a plain-English re-statement.
5. **Advisors must feel empowered, not slowed down.** Every advisor-facing screen has a "what to do in this meeting" affordance.
6. **Clients must feel guided, not judged.** Copy, tone, severity, and framing are calibrated to build agency, not anxiety.
7. **Household complexity should become financial clarity.** One clear household view is the product's signature deliverable.
8. **The product should continuously identify what matters most now.** The system ranks, doesn't just report.
9. **Assumptions are always visible.** The product names what it doesn't know.
10. **The plan is a living object.** Not a one-shot PDF.

## 1.17 North-star statement

> Compass turns the lived complexity of a household — people, money, obligations, taxes, goals — into the clearest, most actionable, most defensible financial plan either side of an advisor's desk has ever seen.

## 1.18 Positioning statement

> Compass is the planning intelligence layer for modern Indian and cross-border households — advisor-grade in depth, client-friendly in voice, compliance-ready by default, and built for both a 10-minute prospect meeting and a two-hour HNI live planning interview, without switching products.
