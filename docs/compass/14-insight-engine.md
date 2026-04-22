# 14. Insight Engine

The Insight Engine is the product's voice. It turns numbers into prioritized, plain-English, actionable observations. Every insight has **trigger logic**, **severity**, **plain-English templates**, **client vs advisor phrasing**, **one-click actions**, **mode visibility**, **audit explanation**, and an optional visual.

---

## 14.1 Insight object specification

```
insight {
  id
  category           (see 14.3)
  severity           (critical | high | medium | low | informational)
  confidence         (0..1; reflects data coverage + assumption sensitivity)
  mode_visibility    (basic | advanced | both)
  audience           (client | advisor | both)
  title              (short, plain English, ≤ 72 chars)
  body               (plain-English body, 40–120 words)
  advisor_body       (optional; advisor framing)
  why                (reasoning snippet; shows behind drawer)
  computed_from      (list of field_ids and score_ids)
  assumptions_used   (list of assumption_ids)
  actions            (list of action templates)
  related_scores     (list)
  related_module_links
  triggers           (rule(s) that produced it)
  life_stage_frame   (optional; adjusts tone)
  sensitivity_flag   (normal | sensitive)
  rule_pack_version
  created_at, last_evaluated_at
  status             (active | snoozed | resolved | dismissed)
}
```

All insights are produced by the engine's **rule library**. The library is region-scoped and versioned.

---

## 14.2 Production principles

- **Prioritized.** Each run produces a ranked list; AUI (Section 11) drives ranking.
- **Plain English.** ≤ 12th-grade reading level; ≤ 72-char title; body prefers rupee amounts over ratios.
- **Numerically grounded.** Every insight cites at least one number and its derivation.
- **Not generic.** No "consider reviewing your insurance" — always specific and action-linked.
- **Not fear-based.** Severity is encoded in chip color and language; language does not sensationalize.
- **Action-linked.** Every insight has a default `action` template (even if that action is "Schedule a review").
- **Explainable.** "Why this?" drawer shows inputs, assumptions, and formula.
- **Auditable.** Every insight stored with lineage.

---

## 14.3 Insight categories

1. **Urgent risk** — imminent or critical fragility (emergency, protection, debt).
2. **Important improvement** — non-urgent but high-value improvement (tax, allocation, insurance structure).
3. **Hidden opportunity** — something the user didn't ask about but materially helps (refinance, wrapper efficiency).
4. **Tax-aware opportunity** — regime, asset-location, wrapper utilization.
5. **Protection gap** — cover adequacy, nominee mapping, riders, exclusions awareness.
6. **Debt action** — prepayment, refinance, credit card revolve, rate exposure.
7. **Cash flow concern** — EMI burden, surplus deterioration, discretionary drift.
8. **Goal conflict** — tradeoffs across competing goals.
9. **Retirement action** — corpus gap, sequence risk, healthcare reserve.
10. **Family dependency alert** — concentration of earning, caregiver risk, special-needs continuity.
11. **Documentation gap** — will, nominees, beneficiaries, PoA, guardianship.
12. **Suitability mismatch** — portfolio or product inconsistent with RPS/ISS.
13. **Behavior warning** — procrastination risk, complexity avoidance, panic risk.
14. **Life-event trigger** — captured event that should re-baseline part of the plan.
15. **Advisor follow-up action** — advisor-specific next step.
16. **Client follow-up action** — client-specific next step.

---

## 14.4 Trigger logic patterns

Each insight rule follows: **Condition → Severity → Template → Actions → Visibility.** A few representative rules (region = `IN`):

### Emergency resilience — critical

- **Condition.** ERS < 40 AND dependents > 0.
- **Severity.** Critical.
- **Template (client).** "Your household can cover essentials for about {months} months without new income. For {dependent_count} dependents, we recommend at least 6. Starting with a ₹{monthly_amount}/month plan closes the gap in about {months_to_close} months."
- **Advisor template.** "ERS {ers} with {dependents} dependents. Essentials run-rate ₹{run_rate}/mo. Target buffer ₹{target_buffer}. Suggest SIP into {liquid|arbitrage} for {months_to_close} months."
- **Actions.** [Set up emergency plan]; [Create task: "Raise emergency buffer"].
- **Visibility.** Both (basic + advanced).

### Protection — term cover gap

- **Condition.** PAS.life_cover_ratio < 0.6 AND dependents > 0.
- **Severity.** Critical or High by magnitude.
- **Template (client).** "Your term cover funds {years_covered} years of essentials for your family. A target that funds {years_target} years would cost roughly ₹{premium_range}/year at your age band."
- **Actions.** [Review term options]; [Create task: "Evaluate term cover"].

### Insurance — savings-linked policy observation

- **Condition.** Presence of ULIP/endowment with premium > 10% of annual income AND PAS.life_cover_ratio < 1.0.
- **Severity.** Medium–High.
- **Template.** "You pay ₹{premium} per year into savings-linked insurance. Your protection cover is still low. These products mix investment with insurance and often do neither well for your stage. Before deciding, we'll compare continuing, paid-up, or surrender options carefully."
- **Actions.** [Compare options]; [Add task: "Policy review with advisor"].

### Debt — credit card revolve

- **Condition.** Credit card revolve present.
- **Severity.** High.
- **Template.** "Carrying ₹{balance} on your credit card at ~{rate}% is costing ~₹{interest_annual} per year. This is usually the first thing to clear."
- **Actions.** [Set payoff plan]; [Refinance options].

### Retirement — corpus gap

- **Condition.** RRS < 60 AND horizon > 10Y.
- **Severity.** High (medium if flex high).
- **Template.** "At today's pace, your retirement corpus meets about {success_rate} of what you'll need. A monthly bump of ₹{delta_sip} brings this closer to {target_rate}."

### Tax — regime consideration (India)

- **Condition.** Old regime + low 80C utilization OR New regime + high deduction pattern.
- **Severity.** Medium.
- **Template.** "{See Section 13 examples — with assumptions labeled.}"

### Concentration — single-holding risk

- **Condition.** Top holding > 30% of liquid net worth.
- **Severity.** Medium (High if > 50%).
- **Template.** "{Top holding} is {x}% of your investable assets. One setback there affects your plan a lot. A gradual diversification scenario is available."

### Goal conflict

- **Condition.** Two goals with P50 funding shortfall in the same 5-year window.
- **Severity.** Medium.
- **Template.** "Your {goal_a} and {goal_b} both fall due in {window}. Current surplus funds about {coverage_percent}% of both. We can show a tradeoff view."

### Family dependency — single earner

- **Condition.** Primary earner share of income > 80% AND dependents ≥ 2 AND PAS.life_cover_years < 3.
- **Severity.** Critical.

### Estate — nominee inconsistency

- **Condition.** Nominee mismatched across insurance and demat, or nominee status `missing/outdated` on any meaningful asset.
- **Severity.** Medium.

### Documentation gap

- **Condition.** Will absent + dependents > 0 + net worth > threshold.
- **Severity.** High.

### Suitability mismatch

- **Condition.** Portfolio allocation outside ISS guardrails for RPS band.
- **Severity.** Medium.

### Behavior warning

- **Condition.** `panic_selling_risk` = 4–5 + high-risk allocation.
- **Severity.** Medium.

### Life event — job change

- **Condition.** Life event recorded in last 90 days.
- **Severity.** High (time-sensitive triggers e.g., insurance portability decisions).

---

## 14.5 Severity logic

- **Critical.** Likely to cause household distress within 90 days if untreated. Red-tinted severity chip; never red banner.
- **High.** Likely to materially impair medium-term plan success.
- **Medium.** Meaningful improvement; not urgent.
- **Low.** Minor improvement or awareness.
- **Informational.** Educational or context-setting.

Severity color mapping: see Section 23; red reserved for severity-critical only; brand green never used for severity (to avoid misreading severity).

---

## 14.6 Plain-English phrasing rules

- Prefer **absolute rupee numbers** over ratios.
- Use **"about"** for derived and probabilistic numbers.
- Avoid **industry jargon** in client-facing copy; always offer a glossary tooltip.
- Sentences **≤ 20 words**.
- **Do not sensationalize.** No "disaster," "ruin," "catastrophe."
- **Name the lever.** Every insight suggests the single biggest lever that shifts it.

---

## 14.7 Example insight cards

### C-01 — Critical — Protection gap

> **Your family could run out of essentials in ~1.2 years**
> Your term cover would fund about 1.2 years of essential expenses for your household. That's low for a family with two children and one main earner. A cover funding ~8 years of essentials would cost roughly ₹22–28k/year at your age band.
> **Why this?** Based on term cover ₹50L, essential run-rate ₹3.4L/mo, dependents = 3.
> **Actions:** [Review term options] [Add to plan]

### C-02 — High — Tax regime observation (India)

> **Worth a regime comparison at your CA meeting**
> You're on the Old regime using about ₹1.2L of 80C. Based on rough FY brackets, the New regime may reduce your outlay by ~₹18–32k depending on specific items. This is illustrative, not a filing recommendation — review with your CA.
> **Why this?** Based on income ₹28L/yr, 80C ₹1.2L, 80D ₹25k, no home loan interest claim.
> **Actions:** [Discuss with CA] [Open Advanced Tax]

### C-03 — Medium — Concentration

> **One stock is 34% of your investments**
> {Ticker} is 34% of your liquid investable assets. One bad year there affects your plan a lot. A gradual, tax-aware diversification over 12–18 months could reduce this to ~18% without timing markets.
> **Actions:** [See diversification scenario]

### C-04 — Critical — Emergency

> **Your emergency buffer covers ~1.4 months**
> Essentials run-rate is ₹3.2L/mo; liquid cash is ₹4.5L (~1.4 months). For a family with parents supported, 6 months is a safer floor. A monthly plan of ₹40k into liquid funds closes the gap in ~10 months.
> **Actions:** [Start emergency plan] [Add task]

### C-05 — Medium — Cash flow

> **Discretionary spend has grown 18% year-over-year**
> Discretionary went from ₹58k to ₹69k/month on average. Not a problem if it's deliberate — but lifestyle drift here costs your retirement corpus about ₹22L over 20 years.
> **Actions:** [Open expense analysis]

### C-06 — High — Estate

> **No registered will and two minors in the household**
> A simple registered will is one of the highest-value hours a family can spend. Your nominee coverage also has 2 gaps across investments.
> **Actions:** [Add will task] [Fix nominee gaps]

---

## 14.8 Insight visuals

Insights may attach a visual, kept small and inline:

- Bar: months-of-coverage.
- Delta sparkline: score change.
- Stacked bar: allocation before/after suggested change.
- Two-bar comparison: current vs target.
- Tiny radial: gap to target.
- Donut: concentration.

Visuals are optional and only shown when they add clarity.

---

## 14.9 Dedup, rate limiting, and freshness

- **Dedup.** Same `category` + `computed_from` set within 48h is treated as one insight (latest wins).
- **Rate limiting.** Maximum 12 active insights displayed at once in client view; 24 in advisor view. Lower-priority are archived to "More insights."
- **Freshness.** Each insight re-evaluates on data change or scheduled run. Stale insights older than 30 days are re-validated or retired with a reason.

---

## 14.10 Client vs advisor visibility

- Some insights are **advisor-only** by default (e.g., suitability-override proposals, specialist referrals, internal notes).
- Clients see the softened, plain-English body. Advisors see the numeric-rich body and a "prep notes" subsection.
- Advisors can **stage** an insight (hide from client) until a meeting, with a log entry.

---

## 14.11 Next Best Action system

The NBA system picks the single most valuable action now per owner type:

- **Advisor next best action.** Driven by AUI + advisor workload + meeting calendar.
- **Client next best action.** Driven by severity, ease, and behavior profile (FTS).
- **Review this quarter.** Items that are important but not urgent; surfaces as "Plan for this quarter" card.
- **Needs specialist input.** CA / legal / insurance specialist referrals; surfaces in Action Center as referral tasks.
- **Data needed.** Missing inputs that would unlock material insight.
- **Accuracy blocked.** When assumptions dominate an output; prompts user to confirm or enter data.

### NBA ordering algorithm

```
score = 0.40 * severity_weight
      + 0.25 * deadline_proximity
      + 0.15 * ease_for_owner   (inverse of estimated effort)
      + 0.10 * score_delta_expected
      + 0.05 * recent_neglect
      + 0.05 * behavioral_fit (FTS interaction with owner)
```

NBA always returns **one primary and up to two alternates**, so a user is never shown a stack of equally-sized asks.

---

## 14.12 Life-event-driven insights

- Life events (Section 26) generate a dedicated **Life-Event Brief**: prioritized insights specifically scoped to what the event changes (e.g., "new child" produces Education goal, PAS recheck, nominee update, will review, daycare expense).
- Life-event briefs have a timestamp and a "resolved when" condition; they fade once all linked actions are complete.

---

## 14.13 Example Advisor Prep card (start of meeting)

> **Meeting prep — {Household name}**
> - Biggest lever since last session: protection (PAS 41 → 42; critical still).
> - Data changed: new home loan, new child flagged.
> - 3 insights to discuss: C-01 term cover · C-03 concentration · C-06 estate docs.
> - Pending client tasks: 2 (upload policy, confirm expenses).
> - Open advisor tasks: 1 (refinance scenario draft).

---

## 14.14 Compliance and audit

- Each insight logs: rule id, rule pack version, assumptions used, inputs snapshot, output copy variant.
- Advisor-edited insight copy (if editing is permitted in a given release) logs original and edited versions.
- AI-assisted insight generation (Section 21) is flagged separately; clients see only reviewed copy by default.
