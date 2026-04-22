# 12. Risk Profiling and Investment Suitability

Risk and suitability are treated as **living, composite, auditable** judgments — not one-shot quizzes. This section specifies the framework, the scoring logic, the relationships that matter, the guardrails, and the compliance artifacts.

Compass does **not** issue buy/sell recommendations in V1. It issues **suitability judgments** (what categories are appropriate, flagged, or restricted for this household) and **planning-linked allocation guidance** that an advisor or the firm's execution stack can act on.

---

## 12.1 Framework

The risk profile is a composite of four dimensions. The suitability profile layers six dimensions on top.

### Risk (RPS)

1. **Stated risk tolerance** — what the client says.
2. **Capacity for loss** — what their financial position can absorb.
3. **Need for risk** — how much return they need to meet their goals given time horizon and resources.
4. **Behavior under stress** — what they actually do in drawdowns.

### Suitability (ISS)

1. **RPS fit**
2. **Goal horizon fit**
3. **Liquidity fit**
4. **Dependency fit** (family obligations and concentration)
5. **Complexity tolerance**
6. **Cost sensitivity**

---

## 12.2 Risk profile questionnaire

### Basic Mode (5 items — Section 9 Group K)

Short, used for baseline RPS only. Flags when contradictions are detected against capacity and need.

### Advanced Mode (full RPS questionnaire, 18 items)

Organized in 4 clusters; each item is scored 1–5.

**Cluster 1: Stated tolerance (4 items)**
1. "Imagine your investments dropped 30% in a year. You would: sell most / sell some / hold / buy a little more / buy a lot more."
2. "Pick the portfolio shape you can live with over 10 years."
   (Show 5 illustrative portfolios with average return and biggest drawdown bands — chart, not jargon.)
3. "When markets are volatile, I…"
4. "I think of investing as…"

**Cluster 2: Capacity for loss (5 items)**
1. Self-assessed: "A loss of 20% of investable assets would be: fine / uncomfortable / painful / devastating."
2. Derived from data: dependents-to-earner ratio band.
3. Derived: liquid coverage months.
4. Derived: debt-to-income band.
5. Derived: income stability band (IDS).

**Cluster 3: Need for risk (5 items)**
1. Derived: required-return-to-meet-goals given current savings.
2. Derived: flex in goal targets (user-captured).
3. Derived: horizon quality weighted across goals.
4. Behavioral: "I prefer to undershoot my goals with low risk rather than overshoot with high risk. Agree / Disagree."
5. Behavioral: "I would rather stretch a goal by 3 years than take higher risk."

**Cluster 4: Behavior under stress (4 items)**
1. Historical: "In the last 3 years, during a sharp market drop, you: sold / held / bought / wasn't investing."
2. Scenario: "If your portfolio fell by 40% in 6 months, how likely are you to stay invested?"
3. Emotional: "Frequent dips would cause me significant stress. Agree / Disagree."
4. Review: "I check my portfolio: daily / weekly / monthly / quarterly / rarely."

---

## 12.3 Scoring logic

### RPS composite

```
RPS = 0.25 * Stated
    + 0.25 * Capacity
    + 0.20 * Need
    + 0.15 * Behavior
    + 0.15 * Liquidity
```

Each cluster yields a 0–100 sub-score. `Liquidity` is taken from LAS (see Section 11).

**RPS bands.**
- 0–24 Conservative
- 25–44 Moderately Conservative
- 45–59 Balanced
- 60–79 Growth
- 80–100 Aggressive

### ISS composite

```
ISS = 0.30 * RPS_fit
    + 0.25 * Horizon_fit
    + 0.15 * Liquidity_fit
    + 0.15 * Dependency_fit
    + 0.10 * Complexity_tolerance
    + 0.05 * Cost_sensitivity
```

Applied per **product family or strategy** (not per security). Examples:

- Large-cap equity MF: wide suitability bands.
- Small-cap or thematic: narrower; dependency- and horizon-sensitive.
- Direct equity: caps on concentration; requires complexity tolerance.
- PMS/AIF Cat III: higher thresholds for complexity, liquidity, cost tolerance; dependency-sensitive.
- International funds: currency and horizon fit.
- Unlisted / private investments: strict guardrails.
- ULIPs: flagged due to protection-vs-investment mix; suitability requires confirmation of protection covered elsewhere.

---

## 12.4 Relationships that matter

### Stated vs capacity

- **Stated > Capacity by >2 bands** → "Overstretch warning." Requires advisor note to proceed with higher-risk suitability.
- **Stated < Capacity by >2 bands** → "Potentially under-utilizing capacity." Shown as an opportunity, not a push.

### Capacity vs household context

- Capacity cannot exceed a cap set by dependents and obligations. E.g., a single-earner household with 3 dependents and inadequate protection is capped at "Balanced" regardless of portfolio numbers.

### Suitability vs goal horizon

- Goals <3Y: Conservative default regardless of RPS.
- Goals 3–7Y: Balanced default.
- Goals 7–15Y: RPS respected.
- Goals 15Y+: RPS respected with higher ceiling.

### Risk vs liquidity

- If LAS < target floor, suitability restricts illiquid categories until LAS is corrected.

### Risk vs dependency burden

- High FDRS caps suitability ceiling; specific caps per product family.

### Risk vs income stability

- IDS < 50 caps suitability ceiling and triggers a capacity review note.

### Risk vs behavior under stress

- Divergent behavior vs stated tolerance is a flag. E.g., "panicked in 2020" + "stated Aggressive" → downgrade RPS to Balanced with a note.

---

## 12.5 Contradiction detection

The engine continuously checks for contradictions:

- **Stated vs Capacity mismatch** (either direction).
- **Stated vs Behavior contradiction.**
- **RPS vs goal horizon mismatch** (e.g., Conservative profile + 20Y goals — opportunity).
- **RPS vs current allocation mismatch** (e.g., Conservative profile + 85% equity — flag).
- **Dependency mismatch** (e.g., sole earner, high RPS, low cover — flag).

Each contradiction becomes a **contradiction card** with plain-English explanation and resolution options.

### Plain-English contradiction example

> "You described yourself as 'Aggressive' but your plan's capacity for loss right now looks 'Moderately Conservative.' That usually happens when household obligations are high or emergency buffer is thin. We'll treat your usable risk profile as 'Balanced' until either the buffer or the cover improves — so recommendations stay safe. You can change this with your advisor."

---

## 12.6 Suitability guardrails (illustrative)

Guardrails are region-configurable. Example for `IN`:

| Category | Baseline guardrail |
|---|---|
| Liquid / Arbitrage | Allowed at all RPS bands. Min. cash floor respected. |
| Large-cap / Flexi-cap MF | Allowed for Balanced and above. Allowed for Moderately Conservative with caps. |
| Mid / Small-cap MF | Growth and above; caps on single-scheme exposure. |
| Thematic / Sectoral | Growth and above; dependency caps apply. |
| Direct equity | Growth and above; concentration caps; complexity tolerance required. |
| International funds | Balanced and above; currency-horizon fit required. |
| Gold (physical / SGB / ETF) | Allowed; upper cap on share. |
| Real estate direct | Advisor note required; liquidity cap. |
| REIT / InvIT | Balanced and above; liquidity fit required. |
| PMS / AIF Cat I-II | Growth and above; net-worth & complexity thresholds. |
| AIF Cat III | Aggressive only; strict thresholds. |
| Unlisted equity | Aggressive; strict thresholds; advisor override + note required. |
| ULIPs | Flagged; allowed only with protection-covered-elsewhere confirmation. |
| Endowment / traditional savings | Flagged; allowed only with explicit savings preference + acknowledgment. |
| Term insurance | Protection — no suitability restriction (subject to underwriting). |

Guardrails produce three results per category: **Allowed · Flagged (with reason) · Restricted (with reason)**. Advisors can override `Flagged` → `Allowed` with a required note; overriding `Restricted` requires a compliance note and escalation flag.

---

## 12.7 When to flag mismatch

Automatic flags:

- Portfolio composition outside suitability by more than N%.
- Stated tolerance changed by more than 1 band without trigger (e.g., no life event).
- Goals changed that shift need-for-risk materially.
- Life event recorded (Section 26) that changes capacity.
- Annual review due.

Flags surface as:
- A chip on the Suitability dashboard card.
- An insight card.
- A task for the advisor with a link to the rationale drawer.

---

## 12.8 Plain-English explanation templates

### Example: downgrade from Aggressive to Balanced

> "We've set your working risk profile to **Balanced** instead of Aggressive. Two reasons: (1) your household has 3 people depending on you, and (2) your emergency buffer is about 1.5 months. This keeps your recommendations safe while you build those back up. Your advisor can change this with a note."

### Example: upgrade opportunity from Conservative to Balanced

> "Your stated comfort is Conservative. Given your long horizon and strong income stability, you have room to be Balanced. This isn't pressure — just an option. You'd likely need a bigger savings pot for your retirement goal if you stayed fully conservative."

---

## 12.9 Separation of planning insight from product recommendation

Compass is explicit:

- **Planning insight** says: "Given your situation, consider X category for Y purpose."
- **Product recommendation** says: "Buy fund Z / policy W."

V1 Compass issues only **category-level guidance** (suitability). Specific product recommendations, where applicable, are the advisor's responsibility and captured in the **Recommendation Center** with:

- rationale,
- suitability reference (ISS component breakdown),
- alternatives considered,
- client acknowledgment.

---

## 12.10 Rationale logging for compliance

Every RPS and ISS computation logs:

- Inputs used (with snapshot).
- Question answers with timestamps.
- Derivations for Capacity and Need.
- Behavioral cluster inputs.
- Resulting composite score and band.
- Rule pack version.
- Advisor overrides (with note).

Every **Recommendation** logs:

- Household context at the time.
- Current RPS and ISS.
- Chosen category and specific product (if any).
- Suitability decision: Allowed / Flagged (with reason) / Overridden (with reason).
- Client acknowledgment receipt (if collected).

All logs are exportable (PDF + machine-readable).

---

## 12.11 Advisor override workflow

1. Advisor opens suitability for the category.
2. Sees the system's verdict with component breakdown.
3. Clicks "Override" → modal with:
   - Reason (required, ≥ 80 chars),
   - Visibility (internal / shared with client),
   - Compliance escalation toggle (for Restricted → Allowed).
4. Override saves with author, timestamp, and cannot be silently deleted.
5. A **Suitability Override Log** is accessible in the Audit Trail.

---

## 12.12 Audit trail for profile changes over time

The Audit Trail maintains:

- RPS history: every change with trigger (questionnaire, life event, system reclassification, advisor override) and delta.
- ISS history: per category per date.
- Recommendation history: with status (proposed / acknowledged / executed / rejected).

UI: "Profile changes" timeline within the Risk & Suitability screen; entries include a one-line reason and an expand-to-detail.

---

## 12.13 Risk profile re-assessment triggers

- Life event (birth, marriage, death, divorce, job change, health event).
- Income change > 20% YoY.
- Goal added or materially changed.
- Annual review anniversary.
- Contradiction detected by the engine.
- Advisor request.

Each trigger produces an automatic task; reassessment requires a short delta questionnaire, not the full 18-item set, unless the advisor chooses full.

---

## 12.14 Couple and family considerations

- Couple: each spouse has individual RPS; a household RPS is derived as weighted-by-contribution (to net worth and income) unless the advisor sets otherwise.
- Joint goals inherit the household RPS bounded by the more constrained member's capacity.
- Divergent RPS between spouses produces a "Risk Profile Divergence" observation, surfaced neutrally ("you two approach risk differently; here's a path you can both live with").

---

## 12.15 Visual design

- RPS shown as a 5-band scale with current band highlighted; components displayed as a radial component chart.
- ISS per category shown as a heatmap with `Allowed / Flagged / Restricted` chips.
- Contradictions as outlined cards with calm severity, never red banners unless critical.
- Behavior cluster shown as a short narrative, not a score alone.

---

## 12.16 Compliance framing

- Copy avoids regulatory claims.
- The risk profile is labeled as "planning risk profile" not "investment advice."
- All outputs carry a footer disclosure per region ("Planning observations only. Specific product recommendations are subject to advisor suitability assessment.").
