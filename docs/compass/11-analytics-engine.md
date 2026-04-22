# 11. Analytics Engine

The analytics engine is the computational spine of Compass. It converts the data model (Section 7) into scores, projections, scenarios, and probabilistic outputs. It is **deterministic-first, explainable-always, assumption-transparent**. No output can leave the engine without lineage (inputs + formula + assumptions + rule pack version).

---

## 11.1 Architecture

```
Analytics Engine
├── Snapshot Service          (normalizes inputs, freezes per-compute state)
├── Assumption Binder         (attaches region pack + household overrides)
├── Formula Runtime           (pure functions; versioned)
├── Score Engine              (composite scores with component breakdowns)
├── Projection Engine         (cash flow, goals, retirement deterministic paths)
├── Scenario Engine           (named what-ifs; baseline + optimized + stress)
├── Probabilistic Engine      (Monte Carlo for key outputs)
├── Lineage Writer            (records inputs, formulas, assumptions, outputs)
└── Insight Ingestor          (emits events that the Insight Engine consumes)
```

- All outputs emit to the **Audit Trail** via Lineage Writer.
- All outputs carry a **confidence band** derived from input completeness and assumption volatility.
- Region rule pack version is attached to every computation.

---

## 11.2 Score specifications

Each score below is specified with: **Objective · Components & weights · Min data · Advanced data · Bands · Plain English · Visualization · Triggers · Visibility · Audit log.**

Weights are **V1 defaults**; they are configurable per region rule pack. Scores are 0–100 unless noted.

---

### S1. Financial Health Score — **FHS**

- **Objective.** A single, honest composite that reflects the household's overall financial health.
- **Components (weights).** ERS 12, PAS 18, DSS 12, RRS 15, CFS 10, LAS 8, CRS 6, TES 5, ESS 4, HFS 10.
- **Min data.** Basic mode complete.
- **Advanced data.** Boosts confidence; does not change formula.
- **Bands.** `<40 Needs Work · 40–59 Building · 60–79 Solid · 80+ Strong`.
- **Plain English.** "Your overall financial health is {band}. The biggest drags are {top-2 low components}; the biggest strengths are {top-2 high components}."
- **Visualization.** Radial score with component bars.
- **Triggers.** FHS drop ≥ 5 within 30 days → advisor notification.
- **Visibility.** Client sees narrative; advisor sees numeric detail.
- **Audit.** Component breakdown and inputs captured.

### S2. Emergency Resilience Score — **ERS**

- **Objective.** Can the household withstand an income shock for X months without distress?
- **Components (weights).** Months-of-essentials covered by liquid+ (40), speed-of-access (20), diversification-of-cash (10), health-buffer presence (15), secondary-support-network (15).
- **Min data.** Essentials run-rate, liquid cash.
- **Advanced.** Access-speed buckets, dependents count, health buffer specificity.
- **Bands.** `<40 Fragile · 40–59 Low · 60–79 Adequate · 80+ Strong`.
- **Plain English.** "Your household can cover essentials for roughly {X} months without new income. Aim for 6."
- **Viz.** Horizontal bar with month ticks.
- **Triggers.** ERS <40 → "Critical" insight.
- **Visibility.** Shared.

### S3. Cash Flow Stability Score — **CFS**

- **Objective.** Degree to which regular inflows exceed regular outflows predictably.
- **Components.** Surplus ratio (35), income variability (25), EMI-to-net-income ratio (25), discretionary-to-essential ratio (15).
- **Bands.** `<50 Stressed · 50–69 Tight · 70–84 Stable · 85+ Strong`.
- **Plain English.** "You save about {X}% of your net income each month. Your EMIs are {Y}% of what you take home."

### S4. Income Durability Score — **IDS**

- **Objective.** How reliable is household income over the planning horizon.
- **Components.** Source diversification (25), payer concentration (15), employment type stability (15), profession outlook (15), stated stability (15), benefit backstops (15).
- **Bands.** `<50 Fragile · 50–69 Moderate · 70–84 Durable · 85+ Very Durable`.

### S5. Protection Adequacy Score — **PAS**

- **Objective.** Are the people dependent on household income adequately protected?
- **Components.** Life cover adequacy (35), health cover adequacy (25), critical illness presence (10), disability cover (10), nominee consistency (10), exclusions awareness (10).
- **Bands.** `<50 Critical · 50–69 Inadequate · 70–84 Adequate · 85+ Strong`.
- **Plain English.** "Your term cover funds about {years} years of essentials for dependents. Health cover is {adequate/under}."

### S6. Debt Stress Score — **DSS**

- **Objective.** Household's burden from debt.
- **Components.** EMI-to-income (30), debt-to-asset (20), credit card revolve (20), floating-rate exposure (10), informal debt presence (10), guarantees exposure (10).
- **Bands.** `<40 High · 40–59 Elevated · 60–79 Manageable · 80+ Healthy`.

### S7. Goal Feasibility Score — **GFS** (per goal)

- **Objective.** Likelihood of meeting each declared goal under baseline assumptions.
- **Components.** Required-run-rate vs current surplus (40), committed corpus gap (25), horizon quality (15), flexibility (10), risk-capacity fit (10).
- **Bands.** `<40 Off Track · 40–69 At Risk · 70–84 On Track · 85+ Comfortable`.

### S8. Retirement Readiness Score — **RRS**

- **Objective.** Probability-adjusted readiness for retirement.
- **Components.** Corpus gap vs target (40), pension inflow coverage (20), healthcare reserve (15), longevity risk buffer (10), sequence-risk posture (10), dependents-at-retirement (5).
- **Probabilistic overlay (Advanced).** Monte Carlo success probability.

### S9. Liquidity Adequacy Score — **LAS**

- **Objective.** Can the household meet near-term obligations without distress sales?
- **Components.** T+0 liquid coverage of upcoming 12M outflows (40), 7-day coverage of next 3M EMIs (20), 30-day coverage of next big goal outflow (20), upcoming lock-in expiries (10), contingent support availability (10).

### S10. Household Fragility Score — **HFS**

- **Objective.** How vulnerable is the household to a single adverse event?
- **Components.** Earner dependency (30), caregiver dependency (15), health concentration (15), asset concentration (15), liability guarantees (10), cross-border fragility (10), estate incompleteness (5).
- **Bands.** `<40 Fragile · 40–59 Vulnerable · 60–79 Resilient · 80+ Robust`.

### S11. Family Dependency Risk Score — **FDRS**

- **Objective.** Obligation intensity relative to the primary earners' capacity.
- **Components.** Dependents-to-earner ratio (25), support duration (20), special-needs presence (15), elderly support (15), nominee gaps (10), contingent supporters (10), caregiver burden (5).

### S12. Tax Efficiency Score — **TES**

- **Objective.** Relative tax awareness in the plan (not a tax filing score).
- **Components.** Regime posture alignment (20), deduction awareness (20), asset location efficiency (20), policy tax context (15), capital gains planning awareness (15), cross-border awareness (10).

### S13. Concentration Risk Score — **CRS**

- **Objective.** Degree of single-point exposure (holding, employer, property, payer).
- **Components.** Top holding share (25), employer stock share (20), real estate share (20), payer concentration (15), business stake share (20).
- **Bands.** inverted — higher share → lower score.

### S14. Estate Readiness Score — **ESS**

- **Components.** Will in place/updated (25), nominee coverage (20), beneficiary consistency (15), guardianship clarity (15), PoA presence (10), succession notes (10), document accessibility (5).

### S15. Risk Profile Score — **RPS**

- **Objective.** Composite risk profile.
- **Components.** Stated tolerance (25), capacity for loss (25), need for risk (20), behavior under stress (15), liquidity needs (15).
- **Bands.** Conservative / Moderately Conservative / Balanced / Growth / Aggressive.

### S16. Investment Suitability Score — **ISS**

- **Objective.** Per-product or per-strategy suitability given RPS and household.
- **Components.** RPS fit (30), goal horizon fit (25), liquidity fit (15), dependency fit (15), complexity tolerance (10), cost sensitivity (5).

### S17. Documentation Completeness Score — **DCS**

- **Components.** Will/trust docs (20), insurance docs (20), investment statements (20), loan docs (15), nominee forms (10), ID documents (10), digital access plan (5).

### S18. Planning Completeness Score — **PCS**

- **Objective.** How complete is this plan, as an artifact?
- **Components.** Data completeness (40), scenarios run (15), recommendations documented with rationale (15), actions assigned (15), review cadence (15).

### S19. Follow-Through Probability Score — **FTS**

- **Objective.** Likelihood the household completes the next 90 days of actions.
- **Components.** Historical completion rate (40), behavior profile (25), nudging fit (15), advisor engagement (10), complexity of tasks (10).

### S20. Action Urgency Index — **AUI**

- **Objective.** A single priority number used to sort the Action Center.
- **Components.** Severity (40), deadline proximity (25), score delta sensitivity (20), life-event adjacency (10), dependency impact (5).

---

## 11.3 Score interactions (examples)

- **FHS** sinks if ERS or PAS is critical regardless of other components.
- **RPS → ISS** is a dependency: ISS cannot be computed without RPS.
- **HFS** and **FDRS** feed PAS sizing and scenario triggers.
- **GFS (retirement)** uses RRS; a poor RRS can be an "opportunity" in GFS if corpus shortfall is modest and horizon is long.
- **TES** observations flow to Insight Engine but never directly downgrade RPS.

## 11.4 Projections

**Deterministic baseline.** For each horizon (1Y, 5Y, 10Y, to retirement, to longevity):

- Income path (inflation + wage growth).
- Expense path (by inflation category).
- Savings path (residual).
- Asset path (by asset class rate).
- Liability amortization.
- Insurance premium path.
- Goal outflows on target years.

**Outputs:**
- Household net worth curve.
- Cash flow surplus curve.
- Per-goal funding curve.
- Retirement corpus curve.

Assumptions are drawn from the active **Assumption Set** (region default + household overrides).

## 11.5 Scenarios

**Scenario model:**

```
scenario {
  id, name, author, created_at,
  base_inputs_snapshot_ref,
  overrides: [ {field_id, value, note} ],
  derived_outputs: { ... },
  comparison_to: baseline | scenario_id
}
```

Standard scenarios the engine provides out of the box:

- **Baseline** (current assumptions)
- **Optimized** (auto-generated with engine-suggested tweaks: e.g., refinance debt, raise term cover, redirect ULIP premiums)
- **Stress-Inflation** (inflation +2pp across categories)
- **Stress-Equity** (40% equity drawdown Y1, 5Y recovery)
- **Stress-Rates** (home loan rate +200 bps)
- **Job Loss** (primary earner loses income for 6M; 12M; 24M)
- **Business Decline** (business income −30% for 24M)
- **Medical Shock** (one-time ₹X expense + recovery)
- **Primary Earner Death** (survivor scenario)
- **Primary Earner Disability** (long-term disability)
- **Inheritance Event** (one-time inflow, modeled with uncertainty)
- **Delayed Goal** (shift goal by N years)
- **Retirement Delay / Early Retirement** (±3Y shifts)
- **Cross-Border Relocation** (residency & currency shift)

Scenarios support:
- What-if sliders for inflation, return, horizon, savings rate, allocation.
- Saved comparisons (two or three scenarios side-by-side).
- Per-scenario Insight Engine pass (scenarios can emit scenario-only insights).

## 11.6 Probabilistic analysis (Monte Carlo)

- **Use cases.** Retirement success probability; major goal success probability.
- **Method.** Return distributions per asset class per region; correlation matrix; path-dependent sampling; sequence-risk modeling.
- **Settings.** N = 5,000 paths default (configurable); seed stored for reproducibility.
- **Outputs.** P(success), percentile corpus paths (P10 / P50 / P90), shortfall magnitude at P10, time-at-ruin distribution.
- **Explainability.** Every probability shown alongside: "Based on 5,000 simulated paths using the current assumption set. Change assumptions → these numbers update."
- **Never shown without:** confidence language, range, and a "what drove this?" drawer.

## 11.7 Stress tests

Parametric stress tests apply one-off shocks to the baseline:

| Test | Shock | Reported impact |
|---|---|---|
| Inflation +2pp | persistent | RRS delta, GFS delta |
| Healthcare +4pp | persistent | Healthcare reserve gap |
| Education +3pp | persistent | Education goal gap |
| Equity −40% Y1 | recovery over 5Y | Corpus path P10 |
| Rate +200 bps | persistent | DSS delta, cash flow delta |
| Job loss 12M | one-off | ERS usage, goal slippage |
| Business −30% 24M | sustained | IDS stress |
| Primary earner death | instant | Survivor corpus + cover gap |
| Primary earner disability | sustained | Income replacement gap |
| Medical ₹X shock | one-off | LAS drawdown |

Each stress test outputs: "Before → After" of impacted scores, projections, and gaps.

## 11.8 Assumptions model

- **Region defaults** (Section 5.6) are the fallback.
- **Household overrides** are stored in an `assumption_set` scoped to the household.
- **Scenario overrides** are stored on the scenario itself (don't touch defaults).
- **Advisor overrides** require a `note` field.
- **Assumption versioning.** Each set has `version`, `created_by`, `effective_from`, and an auto-generated change note.
- **UI affordance.** A persistent "Based on..." footer on any screen that shows outputs, with one-click drill-down to the assumption set and a "why these?" explanation.

## 11.9 Confidence ranges

Every computed output is shown with a confidence indicator derived from:

- Completeness of inputs it depends on (data coverage %).
- Stability of inputs (user-entered → higher confidence than assumed-default).
- Assumption sensitivity (probabilistic outputs inherit path variance).
- Time since last refresh.

UI treats confidence as a subtle band/indicator (e.g., a thin label: "High confidence" / "Medium — we assumed X" / "Low — consider filling Y").

## 11.10 Explainability layer

For every score and major output, a **"How this was computed"** drawer is available that shows:

1. The narrative: plain-English explanation.
2. The math: formula name and inputs.
3. Assumptions used.
4. The component breakdown (for composite scores).
5. The change since last compute (for recurring views).
6. The lineage link to the audit log entry.

This drawer is identical in client and advisor views; only the visibility of internal components may differ.

## 11.11 Advisor overrides

- Every score component can be **commented** by an advisor (not changed directly).
- Overrides that change outputs require:
  - a `reason` field,
  - a visibility flag (`internal`, `shared`),
  - audit log entry.
- Advisors can label a recommendation "against system default" with a rationale; this is preserved in the audit trail.

## 11.12 How the user sees uncertainty

- Ranges, not point estimates, where appropriate.
- Probability phrased as "about X in 10" in plain-English mode, with "X%" on advisor mode.
- A short caveat line: "Assumes current behavior continues. Changes in income or spending will change this."

## 11.13 Example: Retirement probability explanation card

> **Retirement readiness: about 7 in 10.**
> Based on 5,000 simulated paths using your current assumptions (6% inflation, 11% equity return, retirement at 60, longevity 85). In 3 out of 10 paths, your corpus runs out before age 82. The biggest lever is your savings rate: a ₹12,000 bump in monthly SIP moves this to about 8 in 10.
> *Assumptions → Adjust · See paths → Chart · Change scenario → Optimized*

## 11.14 Logging and versioning

- Every compute emits a lineage record with `rule_pack_version`, `assumption_set_version`, inputs snapshot, outputs, and timestamp.
- Score history is retained indefinitely; UI shows 24-month trailing trend.
- Scenarios are never auto-deleted; archive is supported.

## 11.15 Engine non-goals

- Not a portfolio optimizer (no efficient-frontier; no Markowitz outputs).
- Not a tax return computer.
- Not a direct trading engine.
- Not a market forecaster (no predictive calls on asset prices or index levels).

## 11.16 Performance expectations

- Score recompute under 300ms for Basic mode.
- Advanced mode full recompute under 1.2s.
- Monte Carlo run under 3s at N=5000 with caching.
- All computations resilient to partial data (degrade with clear confidence signal rather than throwing errors).
