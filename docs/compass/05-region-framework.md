# 5. Region Framework

Compass supports multiple jurisdictions via **region rule packs**. India (`IN`) is the default in V1. GCC (`GCC`) and Global (`GLOBAL`) are designed for but not implemented at parity in V1. The framework is built so a new region can ship as a rule-pack release, without any UI or core-code changes.

---

## 5.1 Region concept model

```
Region
├── id               (IN | GCC | GLOBAL | future codes)
├── version          (semver, e.g., 2026.04.1)
├── display_name
├── currency_default (INR | AED | USD | ...)
├── numeric_format   (lakh_crore | international)
├── date_format
├── language_defaults (en-IN, en-AE, en-US, ...)
├── tax_module_ref   (reference to tax rule pack)
├── assumptions_ref
├── instrument_dictionary_ref
├── insurance_terms_ref
├── household_norms_ref
├── compliance_disclosures_ref
├── retirement_defaults_ref
├── documents_ref    (recognized document types & OCR templates)
└── feature_flags    (per-region toggles for scenarios available)
```

A **Household** stores:
- `region_id` (active region for the plan)
- `residency_country` per member
- `tax_residency_country` per member
- `citizenship` per member
- `primary_currency`
- additional `reporting_currencies` (for NRI/cross-border cases)
- `household_structure_type` (nuclear, extended, joint, cross-border, single-parent, etc.)

Region logic is **household-scoped, not user-scoped.** An advisor in Dubai serving an Indian NRI runs that household under `IN` region but with NRI flags on the members; a GCC-resident household with Indian parents uses `GCC` region with cross-border obligations.

## 5.2 Region switch behavior

- Global admin can enable/disable regions per tenant.
- Tenant admin can set the tenant's default region (V1: `IN`).
- Household creators choose the household region at creation; changeable with an audit log entry and a recompute of assumptions.
- Region switch triggers:
  - currency label refresh,
  - number formatting refresh,
  - instrument dictionary refresh,
  - tax logic rebind,
  - assumption defaults rebind,
  - insurance adequacy recompute,
  - disclosure template refresh.
- Switching region **never deletes** data; it re-maps labels and recomputes scores. Mapping conflicts produce tasks in the Action Center for advisor review.

## 5.3 Currency logic

- Each household has a `primary_currency` (default = region currency).
- Each monetary field can be stored in any ISO currency, with a `reporting_currency` view.
- FX handling:
  - Spot rate is pulled from a configured FX provider at entry time; users can override.
  - Historical values preserve their entry-time rate unless re-valued; a "refresh rate" affordance exists on asset detail.
  - Reports allow a secondary currency column for cross-border households (e.g., INR and AED).
- Number formatting:
  - `IN` default: lakh/crore with a user toggle to "international" formatting.
  - `GCC` and `GLOBAL`: international formatting by default.

## 5.4 Tax logic layers

Tax is represented as **observations, not filings**. Layered as:

1. **Tax status fields** on household/members:
   - India: salaried / business / professional / pensioner / NRI / HUF; tax regime (old / new); PAN presence; tax slab band (derived, not filed).
   - GCC: resident / non-resident; country of tax residence; source-country obligations.
   - Global: generic tax status; jurisdictions of concern.
2. **Tax treatment mapping per instrument** via the instrument dictionary (e.g., PPF = EEE in India; NPS partial; equity LTCG threshold; indexation for debt funds per latest applicable rule).
3. **Planning-level observations** (see Section 13) that translate data into planning-relevant tax observations like:
   - "Two ongoing ULIPs with overlapping surrender windows; surrender economics differ under your current regime."
   - "Home loan interest deduction logic in your current regime is limited; verify with a CA if you are considering regime switch."
4. **Compliance guardrails**: Compass never files, never computes a final tax liability, and never writes tax opinions into a client-facing report without an "advisor/CA review required" flag.

## 5.5 Account / instrument labels

The **Instrument Dictionary** is versioned per region:

- `IN`: Savings A/C, Current A/C, FD, RD, PPF, EPF, VPF, NPS Tier I/II, Sukanya Samriddhi, SCSS, Gold (physical, SGB, ETF), Equity, Equity MF, ELSS, Debt MF, Liquid Funds, Arbitrage Funds, International Funds, Hybrid Funds, REITs/InvITs, Direct Bonds, NCDs, Tax-Free Bonds, AIF (Cat I/II/III), PMS, Unlisted Equity, ESOPs/RSUs, Real Estate (residential / commercial / land / agricultural), ULIPs, Endowment/Traditional Savings Policies, Annuities, Term Insurance, Health Insurance (individual / family floater / critical illness / top-up / senior citizen), Personal Accident, Home Insurance, Vehicle Insurance, Professional Indemnity, Keyman, Gratuity, etc.
- `GCC`: End-of-Service Benefits (gratuity), NRE/NRO/FCNR (for NRIs), local brokerage holdings, offshore trusts, common international instruments, local insurance variants.
- `GLOBAL`: Generic labels (Cash, Equity, Fixed Income, Property, Alternatives, Retirement Account, Pension, Term Insurance, Health Insurance, Life Insurance).

Every instrument has:
- `id`, `label`, `region`, `asset_class`, `sub_class`, `liquidity_bucket`, `tax_treatment_ref`, `ownership_types_allowed`, `nominee_relevant`, `valuation_method`, `related_documents`.

## 5.6 Retirement assumptions by region

Default assumption sets (editable per household):

| Parameter | `IN` default | `GCC` default | `GLOBAL` default |
|---|---|---|---|
| Retirement age | 60 | 60 | 65 |
| Longevity | 85 | 85 | 90 |
| General inflation | 6.0% | 2.5% | 3.0% |
| Healthcare inflation | 10% | 6% | 6% |
| Education inflation | 8% | 6% | 6% |
| Equity nominal return | 11% | 7% | 7% |
| Debt nominal return | 6.5% | 3% | 3% |
| Gold nominal return | 7% | 5% | 5% |
| Real estate appreciation | 5% | 3% | 3% |
| Wage growth default | 7% | 4% | 3% |

All defaults are documented and editable. A household can have an **Assumption Set** that overrides region defaults; all overrides are logged and versioned.

## 5.7 Insurance term variations

- `IN`: Term / ULIP / Endowment / Money-Back / Health Individual / Family Floater / Critical Illness / Top-Up / Super Top-Up / Senior Citizen / Personal Accident / Home / Motor / Professional Indemnity / Keyman / Gratuity / Group Employer Cover.
- `GCC`: Term (if available) / Group Life / Critical Illness / Private Health (often employer-linked) / End-of-Service (quasi-benefit, not insurance).
- `GLOBAL`: Generic: Term Life / Whole Life / Health / Critical Illness / Disability / Long-Term Care / Home / Auto / Liability / Umbrella.

Adequacy computation:

- Life cover adequacy targets:
  - `IN`: essential household run-rate × (years to dependency end) + outstanding debts + major goal reserves, minus liquid investable assets.
  - `GCC`: similar, plus explicit treatment of End-of-Service benefits as a floor.
  - `GLOBAL`: generic multiplier baseline with override.
- Health cover adequacy by region:
  - `IN`: family floater floor per tier (metro / tier-2) with top-up accommodation.
  - `GCC`: employer cover often present; floor adjusts accordingly.
  - `GLOBAL`: generic.

## 5.8 Documentation requirements

Recognized document types (drives OCR templates, tagging, and task creation):

- `IN`: ITR (1/2/3/4), Form 16, Form 26AS, AIS, salary slips, bank statements, CAMS/KFintech statements, Zerodha/ICICIDirect holding statements, policy documents (LIC/HDFC/etc.), loan sanction letters, EPF passbook, PPF passbook, NPS statements, property documents, will, nominee forms.
- `GCC`: salary certificates, end-of-service statements, bank statements (UAE/KSA etc.), brokerage statements, policy documents, Emirates ID / Iqama copies (optional), tax residency certificates (TRC) if required.
- `GLOBAL`: generic statements and policy docs.

## 5.9 Household structures (common templates)

- `IN`: Nuclear with Parents Supported; Joint Family; DINK; Single Earner with Many Dependents; Business Promoter Household; NRI with Indian Parents; Salaried + Side Business.
- `GCC`: Expat with Home-Country Family; Expat with Spouse & Kids in GCC; Mixed-Residency Household; Returning Resident (planning return).
- `GLOBAL`: Generic templates (Individual; Couple; Nuclear Family; Multi-Generational Household).

Templates pre-wire the Household Map and dependency defaults; they are editable.

## 5.10 Advisor terminology differences

- `IN`: "RIA", "MFD", "Distributor", "CA", "Planner", "Research Analyst".
- `GCC`: "Financial Adviser", "Wealth Manager", "Insurance Broker".
- `GLOBAL`: "Advisor", "Planner".

The role taxonomy for tasks and reports uses local terms per region.

## 5.11 Compliance and disclosure variations

- `IN`: SEBI-style risk profiling language, IRDAI-appropriate framing for protection, MFD regulatory scope, "Review with your CA" flags, "This is a planning observation, not tax or legal advice" disclosure.
- `GCC`: jurisdiction-specific disclosures (e.g., DFSA, SCA), VAT and zakat treatment where relevant (as observation, not calculation).
- `GLOBAL`: generic disclosure template with placeholders for jurisdiction-specific additions.

Every client-facing export embeds the applicable regional disclosure template footer automatically.

## 5.12 Output and reporting localization

- Currency symbol and formatting per region.
- Number system (lakh/crore vs international).
- Date format (DD-MM-YYYY for `IN`, configurable for others).
- Report sections re-ordered per region norms (e.g., Protection first in `IN` because protection is commonly underweighted; Retirement first in `GLOBAL` where protection is often embedded).

## 5.13 India-specific modeling depth

India region includes first-class support for:

- **Joint family realities.** Household templates that include parents, in-laws; dependency flows modeled; shared-finance patterns recognized (e.g., parents' medical paid by adult children).
- **Salaried + business mix.** A single member can carry salary, business income, rental, and capital gains simultaneously; the household profile captures this without forcing a single "employment type."
- **Dual tax regime.** Old vs New regime is a household-level attribute; observations acknowledge both where relevant.
- **Indian asset categories.** PPF, EPF, NPS, Sukanya Samriddhi, ULIP, ELSS, SGB, etc., are first-class instruments.
- **Indian insurance realities.** Endowment/ULIP classified honestly as savings-linked protection with low protection-per-rupee ratio; term insurance highlighted separately.
- **Retirement patterns.** Family obligation extending post-retirement; possibility of "second career" modeled.
- **NRI links back to India.** Indian property + parental obligations + future return modeling are first-class.

## 5.14 Abstraction in data model and rules engine

- **Data model.** All region-specific values stored as `{value, unit, currency, region_at_entry}`. Labels are lookups against the instrument dictionary; never hardcoded strings.
- **Rules engine.** All business rules are parameterized by region; rule code loads the appropriate pack on context. Rule packs are delivered as versioned JSON/YAML files with typed schemas and change logs.
- **Testing.** Each region pack is tested with golden households (reference cases). Adding a new region requires producing golden households + expected outputs.

## 5.15 V1 region scope

- **V1 default.** `IN` fully implemented.
- **V1 support.** `GCC` as lean pack: currency, basic retirement defaults, instrument dictionary subset, disclosure template. Tax logic limited to structure; no Indian-depth tax observations in GCC pack.
- **V1 fallback.** `GLOBAL` as neutral pack for everything unknown.
- **V2+.** GCC deepens; individual country packs split out as needed (UAE, KSA, Qatar).
- **Never.** Silent use of India-specific logic for non-India regions.
