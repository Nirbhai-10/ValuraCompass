# 7. Deep Data Model

This section defines the canonical data model. It is intentionally rich. Every field carries metadata:

```
field_id
purpose                     one-line description
data_type                   string | enum | int | decimal | date | range | list<...> | object
mode                        basic | advanced | both
visibility                  client | advisor | shared | internal
validation                  constraints
privacy                     normal | sensitive | highly_sensitive
ocr_extractable             true | false
region_dependent            true | false
source                      user_entered | ocr | imported | derived | assumed_default
confidence                  0.0..1.0
derived_metrics             list of scores/insights that use it
```

Derived-metric references use score abbreviations from Section 11: **FHS, ERS, CFS, IDS, PAS, DSS, GFS, RRS, LAS, HFS, FDRS, TES, CRS, ESS, RPS, ISS, DCS, PCS, FTS, AUI.**

All monetary amounts are stored with `{amount, currency, as_of_date}`.

---

## A. Personal Profile (`person`)

Each household has ≥ 1 `person`. Every person has:

| Field | Purpose | Type | Mode | Visibility | Privacy | OCR | Region | Feeds |
|---|---|---|---|---|---|---|---|---|
| `full_name` | Identity | string | both | shared | sensitive | ✓ (from ID/statements) | ✗ | — |
| `preferred_name` | Address in UI copy | string | both | shared | normal | ✗ | ✗ | — |
| `dob` | Age, horizon, longevity | date | both | shared | sensitive | ✓ | ✗ | RRS, IDS |
| `age_derived` | Derived from `dob` | int | both | shared | normal | n/a | ✗ | many |
| `gender` | Optional, used for longevity only if user opts in | enum | advanced | shared | sensitive | ✗ | ✗ | RRS |
| `citizenship` | Jurisdiction for compliance | enum | advanced | shared | sensitive | ✓ | ✓ | — |
| `residency_country` | Physical residence | enum | both | shared | sensitive | ✓ | ✓ | — |
| `tax_residency_country` | Tax jurisdiction | enum | advanced | shared | sensitive | ✓ | ✓ | TES |
| `nri_status` | NRI flag for Indian context | enum | both | shared | normal | derived | ✓ | — |
| `marital_status` | Household structure | enum | both | shared | sensitive | ✗ | ✗ | — |
| `employment_type` | Salaried / Business / Professional / Retired / Student / Other | enum | both | shared | normal | ✗ | ✓ | IDS |
| `profession` | Free + standardized taxonomy | string + enum | advanced | shared | normal | ✗ | ✗ | IDS |
| `career_stage` | Early / Mid / Late / Post-career | enum | advanced | shared | normal | derived | ✗ | IDS |
| `career_growth_outlook` | Conservative / Stable / Growing / Uncertain | enum | advanced | shared | normal | ✗ | ✗ | IDS |
| `career_change_risk` | Low / Medium / High | enum | advanced | advisor | normal | ✗ | ✗ | IDS |
| `health_flags` | Structured health considerations relevant for planning only | enum list | advanced | advisor (consent gated) | highly_sensitive | ✗ | ✗ | PAS, RPS |
| `disability_considerations` | Planning-relevant considerations | structured | advanced | advisor | highly_sensitive | ✗ | ✗ | PAS, ESS |
| `financial_literacy_level` | Low / Medium / High | enum | advanced | advisor | normal | ✗ | ✗ | AUI |
| `risk_attitude_stated` | Conservative / Balanced / Growth / Aggressive | enum | both | shared | normal | ✗ | ✗ | RPS |
| `decision_style` | Analytical / Intuitive / Collaborative / Avoidant | enum | advanced | advisor | normal | ✗ | ✗ | FTS |
| `communication_style` | Brief / Detailed / Visual / Conversational | enum | advanced | advisor | normal | ✗ | ✗ | — |
| `planning_confidence` | 1–5 | int | both | shared | normal | ✗ | ✗ | AUI |
| `life_stage` | Derived tag | enum | both | shared | normal | derived | ✗ | — |
| `intended_retirement_age` | Goal | int | both | shared | normal | ✗ | ✗ | RRS |
| `mobility_plans` | Relocation intent | enum | advanced | advisor | normal | ✗ | ✓ | — |
| `cross_border_links` | Other jurisdictions relevant | list | advanced | advisor | sensitive | ✗ | ✓ | TES |

Validation: `dob` required for primary; privacy defaults "shared" across household only when couple consent is granted.

## B. Family and Household (`household`, `relationship`)

### Household
- `household_id`
- `name` (display)
- `region_id`
- `primary_currency`
- `household_structure_type` (enum: nuclear, nuclear_with_parents, joint, single, single_parent, dink, multi_gen, cross_border)
- `shared_vs_separate_finances` (enum: shared, mostly_shared, mostly_separate, separate)
- `inheritance_expectations` (enum: none, modest, significant, unknown; advanced only)
- `cross_border_links_summary` (derived)

### Relationship (`relationship`)
Directed edges between `person`s with type and attributes:
- `from_person_id`, `to_person_id`
- `relationship_type` (spouse, parent, child, sibling, in_law, partner, guardian, caregiver, ward, nominee)
- `financially_linked` (bool)
- `dependency` (enum: independent, partial_support, full_support, reverse_support)
- `caregiver_role` (bool)
- `special_needs_flag` (bool, sensitive)
- `elderly_flag` (bool)
- `household_member` (bool)
- `inheritance_expectation_from` (bool)
- `inheritance_expectation_to` (bool)
- `cross_border` (bool)

Derived aggregates per person:
- `is_primary_earner` (bool)
- `is_dependent` (bool)
- `dependency_months_remaining` (int; used by life cover adequacy)
- `vulnerability_score` (low/med/high; derived)

Feeds: FDRS, HFS, PAS, ESS, Family Map, Dependency Map.

## C. Income (`income_source`)

Per-source:

- `person_id`
- `type` (enum: salary, business, consulting, commission, bonus, rental, dividends, interest, pension, annuity, rsu_esop_vest, family_support_in, variable, irregular, other)
- `label`
- `amount_monthly` (decimal)
- `amount_annual` (decimal; derived)
- `currency`
- `variability` (enum: stable, moderate, high)
- `seasonality_pattern` (enum: flat, seasonal, project_based, n/a)
- `stability_horizon_years` (int; "how long this is expected to continue")
- `source_diversification_rank` (derived across sources)
- `payer_concentration_flag` (bool; advanced)
- `dependency_risk_note` (text; advanced)
- `currency_of_pay`
- `tax_treatment_ref` (instrument dictionary link)
- `region_applicability`

Derived:
- Monthly and annualized household income
- **Income Durability Score (IDS)** components

## D. Expenses (`expense_line`)

- `household_id`
- `category` (standard taxonomy: housing, utilities, groceries, transport, insurance_premiums, education, healthcare, parental_support, special_needs_care, household_staff, entertainment, dining, travel, subscriptions, debt_service, charitable, children_costs, other)
- `subcategory` (optional, advanced)
- `amount_monthly` (decimal)
- `amount_annual` (decimal)
- `essential` (bool)
- `non_negotiable` (bool; subtly stronger than essential, advanced)
- `inflation_sensitivity` (enum: general, healthcare, education, custom)
- `variability` (enum: fixed, variable, lumpy)
- `linked_person_id` (for care, child-specific, spouse-only etc.)
- `emi_linked` (bool)
- `hidden_leakage_flag` (derived; advanced)

Derived:
- `essential_monthly_run_rate` (core input for ERS, PAS)
- Inflation-adjusted projection series

## E. Assets (`asset`)

- `asset_id`
- `owner_person_ids` (list)
- `ownership_type` (enum: sole, joint_spouse, joint_other, huf, trust, entity, firm)
- `instrument_id` (from instrument dictionary; region-aware label)
- `asset_class` (derived; equity, debt, cash, gold, real_estate, alternative, retirement, insurance_linked_savings, collectible, private_investment, international)
- `label`
- `current_value` (decimal)
- `cost_basis` (decimal; advanced)
- `acquisition_date` (advanced)
- `valuation_method` (enum: market_live, statement_extracted, user_estimate, appraisal)
- `liquidity_bucket` (T+0, T+2, 30d, 90d, 1y_plus, illiquid)
- `nominee_person_ids` (list)
- `beneficiary_person_ids` (list; for insurance-linked, trusts)
- `nominee_status` (enum: correct, partial, outdated, missing)
- `concentration_group_id` (for concentration analysis; e.g., single stock, one employer RSU, one property)
- `tax_treatment_ref`
- `region_applicability`
- `linked_goal_ids` (list)
- `notes` (advisor)

Derived:
- Household allocation by class and by owner
- `concentration_risk_components`
- `liquidity_profile`

Feeds: CRS, LAS, ESS, GFS, RRS, TES.

## F. Liabilities (`liability`)

- `liability_id`
- `owner_person_ids`
- `type` (home_loan, vehicle_loan, personal_loan, education_loan, business_loan, credit_card, secured_other, unsecured_other, family_loan, informal)
- `lender`
- `outstanding_principal`
- `original_principal` (advanced)
- `interest_type` (fixed, floating)
- `current_rate`
- `tenure_remaining_months`
- `emi_monthly`
- `prepayment_allowed` (bool)
- `prepayment_penalty_flag` (bool; advanced)
- `refinance_opportunity_flag` (derived; advanced)
- `collateral_asset_id` (optional)
- `guarantor_person_ids` (list)
- `linked_goal_id` (e.g., home loan ↔ home goal)

Feeds: DSS, CFS, HFS, GFS.

## G. Insurance and Protection (`policy`)

- `policy_id`
- `owner_person_ids`
- `insured_person_ids`
- `beneficiary_person_ids`
- `type` (enum per region: term, ulip, endowment, money_back, family_floater, individual_health, critical_illness, accidental, disability, home, liability, professional_indemnity, keyman, senior_cover, employer_group, other)
- `insurer_name`
- `sum_assured`
- `premium_annual`
- `premium_frequency`
- `policy_start_date`
- `maturity_date`
- `premium_paying_term`
- `policy_term`
- `renewal_flag` (annual_renewable, convertible, etc.)
- `riders` (list)
- `exclusions_summary` (text; advanced)
- `surrender_value_current` (advanced)
- `cash_value_current` (advanced)
- `nominee_consistency_check` (derived)
- `region_applicability`

Derived:
- **Protection Adequacy Score (PAS)** components
- Gap by type (life, health, critical illness, disability)

## H. Goals (`goal`)

- `goal_id`
- `type` (emergency, retirement, children_education, children_marriage, home_purchase, second_home, vehicle, travel, parental_support, healthcare_reserve, passive_income, legacy, business_launch, debt_freedom, charitable, aspiration, custom)
- `label`
- `linked_person_ids` (for child-specific etc.)
- `target_amount_today` (decimal, in household primary currency)
- `target_year`
- `priority` (1–5)
- `emotional_weight` (1–5)
- `flexibility` (enum: fixed, soft, highly_flexible)
- `life_event_dependency` (list of events it depends on)
- `funding_sources` (list of `funding_allocation`)
- `inflation_category` (general, healthcare, education, custom)
- `currency` (for goals denominated in foreign currency, e.g., US MS degree)
- `status` (not_started, on_track, at_risk, off_track, achieved)
- `notes`

`funding_allocation`:
- `asset_id` or `income_source_id`
- `allocation_percent` or `allocation_amount`
- `cadence`

Derived:
- **Goal Feasibility Score (GFS)** per goal
- Corpus required, SIP equivalent
- Scenario outcomes

## I. Tax-Aware Planning (`tax_profile`)

Per household and per person where needed:

- `tax_status` (per region enum)
- `tax_regime_active` (IN: old / new)
- `tax_regime_considered` (IN: which regime the user is exploring)
- `recurring_deductions` (list; e.g., 80C usage pattern — without claiming to be a tax filer)
- `exemptions_context` (list)
- `business_vs_salaried_split` (percent of income by type — derived)
- `capital_gains_context` (list of notes per asset class where relevant)
- `tax_loss_opportunity_flags` (derived)
- `retirement_tax_treatment_assumptions` (list)
- `policy_tax_status_notes` (linked to `policy` and `asset`)
- `jurisdictions_of_concern` (for cross-border)

Privacy: sensitive; visibility defaults to advisor; client view shows observations, not raw fields.

Feeds: **Tax Efficiency Score (TES)**, Insight Engine tax category.

## J. Risk Profiling & Suitability (`risk_profile`, `suitability_profile`)

### `risk_profile`
- `stated_risk_tolerance` (enum)
- `capacity_for_loss` (derived from assets, obligations, income, horizon)
- `need_for_risk` (derived from goals vs current trajectory)
- `liquidity_needs`
- `time_horizon_band`
- `behavior_under_drawdowns` (enum: panicky, disciplined, opportunistic, unknown)
- `income_stability_interaction` (derived)
- `household_dependency_interaction` (derived)
- `complexity_tolerance` (enum)
- `advice_sensitivity` (enum)
- `composite_score` (RPS)
- `rationale_notes` (advisor)
- `change_history` (versioned)

### `suitability_profile`
- `composite_score` (ISS)
- `goal_horizon_fit`
- `liquidity_fit`
- `dependency_fit`
- `product_guardrails` (list: allowed/flagged/restricted categories)
- `override_flags` (when advisor overrides)
- `rationale_notes`
- `version_history`

## K. Retirement (`retirement_profile`)

- `retirement_age_goal_per_person`
- `spouse_retirement_assumption`
- `essential_retirement_expense_monthly` (today's currency)
- `aspirational_retirement_expense_monthly`
- `healthcare_reserve_target`
- `inflation_assumptions_override`
- `longevity_override`
- `post_retirement_income_sources` (list of expected pensions, annuities, rentals)
- `pension_inflow_schedules`
- `retirement_gap_amount` (derived)
- `sequence_risk_flag` (derived)
- `survivorship_expense_profile` (when primary earner passes, how expenses shift — advanced)

Feeds: RRS, GFS (for retirement goal), LAS.

## L. Estate / Continuity / Document Readiness (`estate_profile`)

- `will_status` (enum: none, draft, registered, updated_recent, outdated)
- `trust_status` (enum)
- `poa_status`
- `guardianship_notes` (esp. for special-needs and minors)
- `nominee_coverage_summary` (derived)
- `beneficiary_consistency_summary` (derived)
- `succession_concerns_notes` (advanced)
- `continuity_plan_present` (bool)
- `document_completeness_score` (derived)
- `dispute_risk_flag` (advisor advanced)
- `legacy_intention_notes`

Feeds: **Estate Readiness Score (ESS)**, **Documentation Completeness Score (DCS)**.

## M. Behavioral Intelligence (`behavior_profile`)

Per household:

- `savings_discipline` (1–5)
- `impulsive_spending_risk` (1–5)
- `panic_selling_risk` (1–5)
- `procrastination_risk` (1–5)
- `follow_through_rate` (derived from task completion)
- `complexity_avoidance` (1–5)
- `need_for_reassurance` (1–5)
- `planning_fatigue` (1–5)
- `meeting_behavior` (enum: engaged, skeptical, avoidant, analytical)
- `nudging_preference` (enum: gentle, direct, data, narrative)
- `action_completion_style` (enum: burst, steady, externally_driven)

Feeds: **Follow-Through Probability Score (FTS)**, **Action Urgency Index (AUI)**.

---

## 7.2 Cross-cutting metadata

Every stored fact has:

- `source` (user_entered | ocr | imported | derived | assumed_default)
- `confidence` (0–1; user_entered defaults to 0.95, OCR varies, assumed_default is typically 0.5)
- `as_of_date`
- `last_updated_by`
- `last_updated_at`
- `region_at_entry`
- `version` (for fields with history, e.g., risk profile)

## 7.3 Privacy classes

- **Normal.** Household-shared by default.
- **Sensitive.** Default shared to couple/household; advisor access via grant; client can re-scope to "private to me."
- **Highly sensitive.** Health, disability, special-needs, behavioral notes. Default: visible only to the person it belongs to + advisor (if granted). Never used in client-facing reports unless explicitly enabled.

## 7.4 Derived / computed objects

- `cash_flow_snapshot` — monthly essential + discretionary + EMIs + insurance + goal SIPs + free cash.
- `allocation_snapshot` — by asset class, by owner, by liquidity, by concentration group.
- `dependency_graph` — structured edges used by Household Map.
- `scenario_set` — list of `scenario` objects each with: name, inputs, outputs, date, author.
- `insight_feed` — current top N insights (see Section 14).
- `score_set` — current scores with component breakdowns.

## 7.5 Data lineage

Each derived field keeps references to source fields and assumption set ids so the Audit Trail can reconstruct any output.

```
derived_field {
  value,
  formula_id,
  inputs: [{field_id, value_at_compute}],
  assumptions: [{assumption_id, value_at_compute, source_region_pack_version}],
  rule_pack_version,
  computed_at,
}
```

## 7.6 Identity and ownership

- `firm` (tenant)
- `workspace` (within firm, optional)
- `household` (belongs to firm; can be shared across multiple advisors within firm)
- `user` (individual login)
- `user_role` (within firm: admin, advisor, junior, compliance, support, client)
- `household_membership` (user ↔ household with scope: full, read-only, limited)

## 7.7 Storage and retention

- Households are multi-tenant isolated.
- Highly sensitive fields (health, disability, caregiver notes) are encrypted at rest with field-level keys.
- Retention follows firm policy; minimum default is indefinite for audit log with redaction controls; plan versions retained for the household lifetime.
- Export is supported; delete is subject to retention and legal hold.

## 7.8 Minimum required data sets

- **Basic Mode minimum.** 1 person, region, marital status, employment type, monthly net income, essential monthly expense estimate, total assets (bucketed), total liabilities (bucketed), insurance presence flags, up to 5 goals, risk comfort answer, urgent concerns list.
- **Advanced Mode minimum to unlock the full engine.** All Basic plus: complete household roster, income sources with variability, expenses categorized, line-item assets and liabilities with ownership + liquidity, policy inventory with sum assured and premium, full risk profile quiz answers, estate readiness snapshot.
