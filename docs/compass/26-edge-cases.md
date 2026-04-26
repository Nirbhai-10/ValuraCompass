# 26. Edge Cases and Special Scenarios

Edge cases define a product's quality. Each case here is specified with: **Detection · UX response · Analytics response · Insight response · Advisor guidance · Client guidance · Reporting · Audit / compliance.**

The tone across all cases: calm, respectful, non-judgmental, specific.

---

## 26.1 Incomplete data

- **Detection.** `completeness_ratio` per module below threshold; critical fields missing.
- **UX.** Use of "Completeness meter" chips; non-blocking; clear "add this" tasks.
- **Analytics.** Scores degrade confidence; probabilistic outputs widen confidence bands; some recommendations are suppressed until data is added.
- **Insights.** "Data needed" category insights ranked appropriately; never cause fear.
- **Advisor.** "Fill 3 fields to unlock X" prompts with deep links.
- **Client.** Friendly copy: "We've got a starting picture. A few more numbers sharpen it."
- **Report.** Plan completeness score shown on cover; appendix lists assumption defaults used.
- **Audit.** Fields recorded with `source=assumed_default`; report version metadata names the assumptions used.

## 26.2 Uncertain goals

- **Detection.** `flexibility=highly_flexible` OR target amount range width > 60% of midpoint.
- **UX.** Goals show "range" instead of a specific number; "we'll sharpen this with you" copy.
- **Analytics.** Goal feasibility presented as a range; probability bounds widened.
- **Insights.** Prefer "explore options" over "act now" framing.
- **Advisor.** Suggest a "goal sharpening" task in the next session.
- **Client.** Reassured that ranges are fine.
- **Report.** Present as ranges; clearly flagged.
- **Audit.** Uncertainty flags recorded on goal objects.

## 26.3 Couple disagreement

- **Detection.** Divergent answers on goal priorities, risk tolerance, shared finances, inheritance expectations.
- **UX.** "You approach this differently" chip (calm, neutral). A side-by-side view is available; no winner/loser framing.
- **Analytics.** Household RPS presents a range; dependent outputs widen appropriately.
- **Insights.** "Joint alignment opportunity" insight with a path forward; never a conflict alert.
- **Advisor.** Suggest a "joint conversation" task; sample talking points.
- **Client.** Respectful copy: "We'll map a plan both of you can live with."
- **Report.** Shows both perspectives on divergent items; final plan documents the agreed path.
- **Audit.** Both inputs preserved; any consensus captured with timestamp.

## 26.4 Hidden debt

- **Detection.** Credit card revolve detected; informal debt indicated; surplus vs EMI ratio off.
- **UX.** Neutral chip; never shaming.
- **Analytics.** DSS recomputes; LAS and ERS widen ranges.
- **Insights.** "This is the first thing to clear" framing.
- **Advisor.** Discrete advisor task to discuss; "note only" on audit log (not client-visible).
- **Client.** "This matters more than people think — let's plan this" copy.
- **Report.** Included in debt section; sensitive phrasing.
- **Audit.** Standard.

## 26.5 Underreported expenses

- **Detection.** Essentials + discretionary + EMIs + premiums + goal SIPs ≠ net income ± variability band; big gap.
- **UX.** "Looks like your monthly picture might be under-captured — let's sharpen." Non-judgmental.
- **Analytics.** Expense underrun flagged; scenarios accommodate a range.
- **Insights.** Propose a 60-day expense sharpening task.
- **Advisor.** Suggest using 2 months of statements via OCR to reconcile.
- **Client.** Reassured that it's common.

## 26.6 Irregular income

- **Detection.** `variability=high`, seasonality detected, or variance > 40% across last 12 months.
- **UX.** Income shown as a range with 12-month average; "stabilization buffer" suggestion.
- **Analytics.** CFS widens; emergency buffer target scaled up; GFS accommodates lumpiness.
- **Insights.** "Consider a 4–6 month stabilization buffer" recommendation; SIPs sized to minimum expected income.
- **Advisor.** Scenario modeling for 3 income regimes.
- **Client.** Sensible framing.

## 26.7 Job loss

- **Detection.** Life event recorded; primary earner income paused.
- **UX.** "Steady the ship" view; simplified dashboard focusing on cash flow and immediate actions.
- **Analytics.** Emergency drawdown simulated; portability windows surfaced.
- **Insights.** Prioritize insurance portability, COBRA-equivalent (region-appropriate), EMI moratorium/restructure considerations, expense triage.
- **Advisor.** High-urgency check-in task; 30/60/90-day plan.
- **Client.** Plain steps, short list.
- **Report.** "Interim plan" output for this period.

## 26.8 Business income volatility

- **Detection.** Business income share > 30% AND variability > 30%.
- **UX.** Business-owner toggle revealed; household and business financial separation emphasized.
- **Analytics.** Conservative household essentials pegged to floor; higher emergency and liquidity targets.
- **Insights.** Separate personal accounts; keyman cover; personal guarantee exposure review.
- **Advisor.** Business continuity tasks; specialist referrals (CA/legal).
- **Client.** Clear separation of household vs business.

## 26.9 Special-needs dependent

- **Detection.** Flagged in household composition.
- **UX.** Dedicated Special-Needs module surfaced; language tested for respect; privacy reinforced.
- **Analytics.** Special-needs reserve modeled; lifetime support cost scenarios; parent survivorship scenarios.
- **Insights.** Continuity plan, guardianship, trust readiness — not sales of products.
- **Advisor.** Specialist referral tasks (legal specialists familiar with special-needs planning).
- **Client.** Framed as "making sure your loved one is protected always."
- **Report.** Dedicated section; privacy-respecting.
- **Audit.** Field-level encryption; access logs strict.

## 26.10 Elderly care burden

- **Detection.** Parents supported OR elderly household members.
- **UX.** Eldercare panel surfaced on Family view.
- **Analytics.** Healthcare reserve target modeled; longevity stress; caregiver loss scenario.
- **Insights.** Senior cover review; super top-up consideration; healthcare inflation awareness.
- **Advisor.** Suggest a quarterly healthcare check-in task.
- **Client.** Respectful framing.

## 26.11 One earning spouse with many dependents

- **Detection.** Primary-earner income share > 80% AND dependents ≥ 3 AND PAS < 70.
- **UX.** HFS and FDRS chips on dashboard with calm severity.
- **Analytics.** Scenario for earner loss critical; cover sizing foregrounded.
- **Insights.** Protection first, everything else second — until baseline is established.
- **Advisor.** Priority protection action plan.

## 26.12 NRI with Indian obligations

- **Detection.** Residency country ≠ India AND Indian obligations flagged (parents supported, property, loans).
- **UX.** Cross-border filter on Household Map; currency breakdown visible; region-aware labels.
- **Analytics.** Currency exposure analysis; repatriation considerations; property-centric liquidity modeling.
- **Insights.** "Review NRE/NRO/FCNR posture" (if relevant); "plan for parents' healthcare reserve"; "return-to-India scenario."
- **Advisor.** Specialist referrals for cross-border tax.
- **Client.** Clear, practical copy.

## 26.13 Cross-border tax ambiguity

- **Detection.** Multiple tax residencies; visa-based residency edge case; recent relocation.
- **UX.** Tax module shows "review with cross-border specialist" flags prominently.
- **Analytics.** Tax-aware observation engine is conservative; no specific liability numbers.
- **Insights.** "Planning observation only" wording foregrounded.
- **Advisor.** Specialist referral task; cross-border tax observation summary.

## 26.14 High income but poor savings behavior

- **Detection.** High income + low savings rate + high discretionary + procrastination/impulsive profile.
- **UX.** Non-judgmental; "opportunity with big uplift" framing.
- **Analytics.** Retirement gap may be high despite income.
- **Insights.** Behavioral nudges; small-but-consistent SIP framing; automation.
- **Advisor.** Behavior profile-aware task design.
- **Client.** Empowering, not shaming.

## 26.15 High net worth but illiquid assets

- **Detection.** Net worth high; LAS low.
- **UX.** Liquidity view emphasized; concentration warnings for real estate and business share.
- **Analytics.** Liquidity scenarios; cash ladder modeling.
- **Insights.** Targeted liquidity buffer; structured exits for concentrated holdings.
- **Advisor.** Longer-horizon diversification plan.

## 26.16 No estate planning

- **Detection.** Will absent; nominee gaps; dependents present.
- **UX.** Estate readiness appears front and center on the dashboard with calm copy.
- **Analytics.** ESS low; DCS low.
- **Insights.** "A registered will is one of the highest-value hours you'll spend."
- **Advisor.** Template-guided estate tasks; legal specialist referral where appropriate.
- **Client.** Reassuring framing.

## 26.17 Conflicting nominees

- **Detection.** Nominee mismatch across policies and accounts; beneficiary inconsistency.
- **UX.** Dashed edges on the Household Map where inconsistencies exist; specific tasks per instrument.
- **Analytics.** ESS and PAS components adjust.
- **Insights.** List of specific corrections.
- **Advisor.** Bulk-correction workflow.

## 26.18 No insurance awareness

- **Detection.** PAS low, minimal policy inventory, endowment/ULIP with low protection ratio.
- **UX.** Protection-first view.
- **Analytics.** Adequacy gap spelled out in years-of-essentials.
- **Insights.** Term-first framing; separate savings from protection.
- **Advisor.** Structured protection review.
- **Client.** Not sold to; educated and guided.

## 26.19 Client refusing Advanced Mode

- **Detection.** Explicit choice; abandoned Advanced entry.
- **UX.** Respect it. Basic Mode remains fully functional; Advanced invitation tucked away without nagging.
- **Analytics.** Continue operating in Basic with assumption defaults; honestly communicate limits.
- **Insights.** Highlight the top 3 items Basic is missing and what Advanced would add.
- **Advisor.** Schedule a later conversation if desired.
- **Client.** "Your pace is fine."

## 26.20 Self-serve user intimidated by complexity

- **Detection.** High skip rate, low completion, complexity_avoidance high.
- **UX.** Further simplify; shorter sessions; more encouragement; module dismissals remembered.
- **Analytics.** Confidence bands wider.
- **Insights.** Micro-actions (2-minute tasks).
- **Advisor.** If an advisor is in scope, trigger an offer of help.
- **Client.** Warm copy; no judgment; explicit control.

## 26.21 Advisor needing quick first-meeting value

- **Detection.** Prospect tag + first meeting + Basic Mode active.
- **UX.** Prospect one-pager on the Dashboard; scheduling CTA; clear "what's next."
- **Analytics.** Focused on the top insight (e.g., protection gap) for meeting leverage.
- **Insights.** Curated for a meeting reveal.
- **Advisor.** Live meeting narrative rail pre-populated.
- **Client.** Clear next-meeting CTA.

## 26.22 Life event after plan completion

- **Detection.** Event captured post-plan (birth, death, marriage, divorce, job change, health event, inheritance, relocation).
- **UX.** Life-event banner on the Dashboard with a "let's update your plan" CTA.
- **Analytics.** Re-baseline; affected scores recompute; new scenarios offered.
- **Insights.** Life-event brief (Section 14.12).
- **Advisor.** High-urgency check-in task; decision windows flagged (insurance portability, tax regime elections).
- **Client.** Sensitive, practical guidance.
- **Report.** Post-event one-pager; audit event recorded for the life event and plan adjustment.

---

## 26.23 Meta-pattern: safety on sensitive topics

Across eldercare, disability, illness, mortality, divorce, job loss:

- Language uses neutral, respectful framing.
- Severity colors restrained.
- Default privacy tighter.
- Advisor notes never leak into client-facing outputs.
- AI outputs on these topics always advisor-approved.
- Reports on these topics can be redacted per recipient.

## 26.24 Meta-pattern: uncertainty

When the engine is uncertain:

- Show ranges instead of points.
- Increase confidence visibility (chips and footers).
- Suppress high-specificity recommendations.
- Offer the single most impactful data point to fill.

## 26.25 Meta-pattern: honesty

Compass never invents precision. If an insight can't be produced responsibly with current data, the engine says so: "We're not comfortable giving you this number yet. Add {X} and we'll update."
