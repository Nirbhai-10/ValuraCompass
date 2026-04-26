# 13. Tax-Aware Planning Engine

Compass is **tax-aware**, not a tax filer. It produces **observations** that connect a household's tax context to planning choices. It is careful, region-scoped, and explicitly framed as planning output, not tax advice.

---

## 13.1 Design posture

- **Observation, not computation of liability.** The engine flags planning-relevant context without declaring a filing position.
- **Plain English.** Every observation is written for a client with a glossary for technical terms.
- **Regime-aware** (India) and **jurisdiction-aware** (all regions).
- **Review-needed flags.** Any observation that would meaningfully change tax posture carries a "review with CA" or "review with local professional" flag.
- **No calculation of final tax liability** is shown in outputs. Ranges and illustrative values are used for planning purposes and clearly labeled.

---

## 13.2 Where tax data enters

### Basic Mode (minimal)

- Tax regime (India) — chip.
- Tax situation complexity — chips (business, RSUs, rental, NRI, capital gains).
- Tax residency (if region ≠ India).

Produces: one "Tax Snapshot" card with a short observation; flags to recommend Advanced Mode if complexity chips are set.

### Advanced Mode (deep)

- Full `tax_profile` fields (Section 7.I).
- Per-instrument tax treatment via the instrument dictionary.
- Policy and asset tax-status notes.
- Capital gains realized/carried forward context (awareness only).
- Cross-border: tax residencies, jurisdictions of concern, foreign income awareness.
- Business owner: income composition, dividend-vs-salary posture (awareness).

### Document-assisted inputs

- ITR (India) OCR extraction maps to structured context fields (e.g., regime chosen, deductions used, business income presence).
- Form 16 extraction maps to salary components and TDS summary.
- Policy documents extraction maps to premium, sum assured, tax wrapper status.

---

## 13.3 Tax observation categories

Each observation belongs to one or more of these categories:

1. **Regime posture** (India Old vs New)
2. **Deduction awareness** (80C, 80D, NPS, home loan context in India)
3. **Asset location** (tax-efficient wrapper utilization)
4. **Capital gains planning** (holding period awareness, loss harvesting awareness, indexation where applicable)
5. **Policy tax context** (insurance-linked savings products' tax behavior on surrender / switch / maturity)
6. **Retirement instruments** (EPF/PPF/NPS vs taxable alternatives)
7. **Cross-border** (residency status, DTAA awareness, FTC)
8. **Business-owner tax posture** (salary vs dividend vs distribution awareness)
9. **Exit and sequencing** (awareness of tax at withdrawal / redemption timing)
10. **Special wrappers** (ELSS, SSY, SCSS — India specifics)

---

## 13.4 India-specific observation examples

Observations are written in the voice of a calm advisor. They never issue filing directives.

- **Regime comparison (Old vs New).**
  > "You're on the Old regime with ~₹X in 80C and ~₹Y in 80D. A rough comparison suggests the New regime would reduce your outlay by ~₹{range} for your current income. This is an estimate, not a filing recommendation — we'd confirm with your CA."
- **ULIP/Endowment observation.**
  > "You have 2 savings-linked policies with premiums totaling ₹X/yr. Their tax wrapper has specific rules (policy term, sum assured multiples, switch/surrender tax). If you're considering exiting any, timing matters. Review with a CA for your specific policies."
- **ELSS vs PPF vs EPF tradeoff.**
  > "Most of your 80C bucket is filled by EPF + PPF. ELSS could diversify and add liquidity after 3 years, if it fits your risk profile — which currently is Balanced."
- **NPS additional ₹50,000.**
  > "You're eligible for an additional deduction up to ₹50,000 via NPS (India). Consider this against liquidity needs, because NPS has withdrawal rules."
- **Capital gains awareness.**
  > "You likely have equity MF holdings held > 1 year. LTCG tax mechanics apply above a threshold. We'll model goal withdrawals with this in mind."
- **Indexation (where still applicable).**
  > "Some of your debt holdings predate the indexation rule change — the tax treatment on exit could differ from newer holdings. Worth a careful exit plan."
- **Home loan interest.**
  > "Your home loan has a significant interest component this year. Under your current regime, there are specific rules on interest deduction for self-occupied vs let-out; review with your CA for your exact claim."
- **Business owner posture.**
  > "Your household income has a 60/40 split between salary and business dividends. The tax mechanics differ; the planning effect is stable cash flow vs retained profits. We'll model both."

**Each observation carries:**
- Severity (`informational | medium | high | critical`).
- Review-needed flag (`None`, `Review with CA`, `Review with cross-border specialist`).
- Jurisdiction stamp.
- Assumptions used (e.g., "Assumed FY2025–26 rules for illustrative ranges").

---

## 13.5 GCC context

- Observations focus on:
  - Zero-personal-income-tax contexts with remittance patterns.
  - EoSB accrual and treatment.
  - Home-country obligations for expats (India mainly in our scope).
  - VAT/zakat awareness where relevant.
- No regime comparison. Emphasis on cross-border coordination and home-country tax residency.

## 13.6 Global context

- Generic disclosures; tax observations limited to universally-true planning observations (e.g., "Tax-advantaged retirement wrappers tend to outperform taxable equivalents for long horizons.") with explicit "consult local professional" notes.

---

## 13.7 Interactions with other modules

### Goals and retirement

- Tax-aware engine adjusts **required-corpus** estimates using assumption sets (e.g., post-tax withdrawal modeling at retirement).
- Post-retirement income streams are shown net of assumed tax wrappers.

### Insurance

- Endowment/ULIP premium allocation is observed for tax wrapper utilization and displayed with an **adequacy vs wrapper tradeoff** note.

### Debt

- Home loan interest observation (India) and refinance scenarios account for planning impact, not filing strategy.

### Investment suitability

- Guardrails (Section 12) respect tax wrappers in scoring — e.g., ELSS considered for 80C, with lock-in and RPS fit.

### Concentration and asset location

- Tax-aware engine preserves a **location preference hierarchy** by asset class (e.g., long-duration debt in retirement wrappers where possible, given horizon).

### Estate

- Nominee and beneficiary consistency is a tax-aware concern (e.g., life insurance payouts tax-status; estate planning for policy benefits).

---

## 13.8 Outputs

### Planning-aware tax observation cards (client-safe)

Structure:

- **Title.** "Regime comparison — for review."
- **Plain-English body.** 40–120 words.
- **Severity chip.**
- **Review-needed chip.**
- **Assumptions line.** "Based on rough FY2025–26 brackets; your exact number depends on specific items."
- **Actions.** "Discuss with your CA" / "Open in Advanced Mode" / "Add to Action Center."

### Advisor-facing tax observations

- Same card plus:
- **Component breakdown.** Fields that drove the observation.
- **Alternative scenarios.** "If they switched regime, the order-of-magnitude savings is..."
- **Advisor note field.**

### Export

- Included in the Advanced Plan Report and in the Meeting Summary.
- Always footed with region-specific disclosure: "Planning observation only. Not tax advice. Subject to verification."

---

## 13.9 Assumption-driven outputs

Every tax observation that produces an illustrative rupee impact declares:

- Which assumption set drove it.
- Rate brackets used (illustrative).
- What the user can change to update the estimate.

No observation shows a precise rupee liability figure as a definitive value. Ranges, "order of magnitude," and "estimated band" phrasing are mandatory.

---

## 13.10 Review-needed and escalation triggers

Conditions that force a `Review with CA` or `Review with specialist` flag:

- Business income > 25% of household income.
- Capital gains activity material in the last 12 months.
- NRI / cross-border indicators set.
- Real estate let-out, multiple properties.
- Trust / HUF structure declared.
- Policy surrender considered within tax-sensitive windows.
- Inheritance event.
- Regime switch consideration.

The engine **never** auto-resolves these; it produces a referral task assigned to the advisor (who can loop in a CA) or a recommendation for the self-serve user to consult one.

---

## 13.11 Compliance-safety phrases (copy library)

- "This is a planning observation, not a tax opinion."
- "Final treatment depends on your specific facts; review with your CA."
- "Rules change; our assumptions may be out of date."
- "Illustrative ranges, not filing advice."

Every client-facing tax card ends with one of these phrases automatically, via copy library.

---

## 13.12 Audit & versioning

- Every observation records: rule pack version, assumption set version, inputs, derivation, and the copy template used.
- Changes in rule packs trigger a background re-evaluation; if an observation would change materially, an advisor notification is raised.

---

## 13.13 Non-goals (explicit)

- No ITR preparation.
- No filing workflows.
- No authoritative final tax calculation.
- No representation or assurance of regulatory compliance for the client's filing.
- No guarantee of tax savings; all observations are framed as "for review."
