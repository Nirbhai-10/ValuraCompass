# 9. Basic Mode Question Framework

Basic Mode is a curated, intelligent, 10-minute flow. It produces a real plan. The question set below is **the exact framework**. Each question is specified as:

> **Q-ID · User-facing wording · Simpler wording · Answer type · Mandatory? · Why it matters · Metric it feeds · Region-varying? · Advisor-led vs self-serve variant.**

Groups are ordered as the user encounters them. Each group takes 30–90 seconds of real time.

---

## Group A — Who you are

**A1. Preferred name and primary user**
- *Wording (self):* "What should we call you?"
- *Wording (advisor):* "Who am I planning for today?"
- *Type:* short text
- *Mandatory.* Yes.
- *Why.* Personalizes copy; identifies primary person.
- *Feeds.* All copy.

**A2. Date of birth**
- *Wording (self):* "When were you born?"
- *Wording (advisor):* "Their DOB, please."
- *Type:* date
- *Mandatory.* Yes.
- *Why.* Age, horizon, longevity.
- *Feeds.* RRS, IDS, FHS.

**A3. Marital status**
- *Wording (self):* "What's your relationship status?" (single, in a relationship, married, partnered, divorced, widowed)
- *Type:* chip-select
- *Mandatory.* Yes.
- *Why.* Household structure.
- *Feeds.* Household structure template.

**A4. Employment type**
- *Wording (self):* "What best describes how you earn?" (salaried, business owner, professional/consultant, retired, student/other)
- *Type:* chip-select
- *Mandatory.* Yes.
- *Feeds.* IDS, TES context.

**A5. Life stage (derived confirmation)**
- *Wording (self):* "Does this feel right? You're in your {derived} life stage." Chip confirm/edit.
- *Type:* enum confirm
- *Mandatory.* No.
- *Feeds.* Insight engine framing.

## Group B — Region and residency

**B1. Country of residence**
- *Wording (self):* "Where do you live right now?"
- *Type:* country-select (defaults from browser locale)
- *Mandatory.* Yes.
- *Region-varying.* Sets region pack.
- *Feeds.* Region framework.

**B2. Tax residency**
- *Wording (self):* "Where do you pay income tax?" (usually same as above; tick if different)
- *Type:* country-select with "same as residence" default
- *Mandatory.* Basic: yes, but "unsure" is allowed.
- *Feeds.* TES, cross-border flags.

**B3. NRI / cross-border flag** (India context)
- *Wording (self):* "Do you have financial ties to India (NRI status, property, parents, investments)?"
- *Type:* yes/no + chip detail
- *Mandatory.* Only shown if residence ≠ India.
- *Feeds.* Household cross-border flags.

## Group C — Family snapshot

**C1. Household composition**
- *Wording (self):* "Who's in your household (financially)?" Chips: "just me," "partner/spouse," "children," "parents live with me," "parents I financially support," "others I support," "special-needs dependent" (opt-in), "elderly dependent."
- *Type:* multi-select chips
- *Mandatory.* Yes.
- *Feeds.* Household structure, FDRS, HFS.

**C2. Dependents**
- *Wording (self):* "How many people financially depend on you or your partner?" Numeric.
- *Type:* number
- *Mandatory.* Yes.
- *Feeds.* PAS, FDRS.

**C3. Children ages (only if C1 ⊃ children)**
- *Wording:* "Ages of kids?" Chip/number row.
- *Mandatory.* Yes.
- *Feeds.* Education planning.

**C4. Parental support (only if C1 ⊃ parents supported)**
- *Wording:* "Roughly how much do you spend on parents each month?"
- *Type:* currency range
- *Mandatory.* Yes if C1 indicated.
- *Feeds.* Expense essentials, PAS, FDRS.

**C5. Caregiver burden (only if special-needs or elderly)**
- *Wording:* "Is someone in your household a primary caregiver?" Chip.
- *Mandatory.* No.
- *Feeds.* Household fragility.

## Group D — Income snapshot

**D1. Primary monthly income (net, take-home)**
- *Wording (self):* "What's the monthly amount that lands in your account?"
- *Type:* currency range or exact
- *Mandatory.* Yes.
- *Feeds.* CFS, IDS.

**D2. Partner's monthly net income (if couple)**
- *Wording:* "And your partner's?"
- *Mandatory.* If couple.
- *Feeds.* CFS, IDS.

**D3. Other regular inflows**
- *Wording:* "Any other reliable monthly inflows (rent, freelance, family support)?" Chips.
- *Mandatory.* No.
- *Feeds.* CFS, IDS.

**D4. Income stability**
- *Wording (self):* "How steady is your income?" (very steady, mostly steady, variable, unpredictable)
- *Type:* chip-select
- *Mandatory.* Yes.
- *Feeds.* IDS.

**D5. Bonuses or lumpy inflows (per year)**
- *Wording:* "Approx. bonuses / lumpy inflows per year?"
- *Type:* currency range
- *Mandatory.* No.
- *Feeds.* CFS.

## Group E — Expense snapshot

**E1. Essential monthly expenses**
- *Wording (self):* "What do your 'must-pay' monthly expenses add up to (rent/EMI, food, utilities, school fees, insurance, help)?"
- *Type:* currency range
- *Mandatory.* Yes.
- *Feeds.* ERS, PAS.

**E2. Discretionary monthly spend**
- *Wording (self):* "Roughly how much of your 'nice-to-have' spend per month?"
- *Type:* currency range
- *Mandatory.* Yes.
- *Feeds.* CFS.

**E3. Big annual expenses**
- *Wording:* "Any big recurring yearly expenses (insurance premiums, big trips, school capitation)?" Chips/amounts.
- *Mandatory.* No.
- *Feeds.* CFS.

## Group F — Assets snapshot (bucketed, not line-item)

Ask for approximate values per bucket with honest "don't know" option.

**F1. Cash & emergency savings**
- *Wording (self):* "Approx money you could access in a week?"
- *Feeds.* ERS, LAS.

**F2. Investments (stocks, MFs, PMS, international)**
- *Wording:* "Total value of your investments?"

**F3. Retirement / long-term (EPF, NPS, PPF, annuities)**

**F4. Insurance-linked savings (ULIPs, endowments)**
- *Why separate:* to flag savings masquerading as protection.

**F5. Real estate (self-use + investment; rough market value)**

**F6. Gold**

**F7. Business / promoter stake (if applicable)**

**F8. International assets (if applicable)**

**F9. Other / unsure**

All Basic: honest ranges accepted; don't-know leads to a task.

*Feeds.* FHS, CRS, LAS, GFS, RRS, ESS.

## Group G — Liabilities snapshot

**G1. Active loans (home, car, personal, education, credit card)**
- *Wording (self):* "Any loans right now? If yes, total monthly EMI and rough outstanding amount."
- *Mandatory.* Yes/No. Yes → amounts.
- *Feeds.* DSS, CFS.

**G2. Credit card revolve**
- *Wording:* "Any credit card balances you carry month to month?"
- *Mandatory.* No.
- *Feeds.* DSS.

**G3. Informal or family loans**
- *Wording:* "Any informal or family loans to be aware of?" Optional, sensitive.
- *Mandatory.* No.

## Group H — Insurance snapshot

**H1. Life cover (term)**
- *Wording (self):* "Do you have a term insurance policy? If yes, how much is the cover?"
- *Mandatory.* Yes/No + amount.
- *Feeds.* PAS.

**H2. Savings-linked policies (ULIP, endowment)**
- *Wording:* "Any savings-linked life insurance (ULIP, endowment, LIC traditional)?" Count + rough premium.
- *Mandatory.* No.

**H3. Health cover (individual or family floater)**
- *Wording:* "Do you have health insurance? Family floater amount?"
- *Mandatory.* Yes.
- *Feeds.* PAS.

**H4. Employer cover**
- *Wording:* "Any cover from your employer (health, life)?" Chip.
- *Mandatory.* No.

**H5. Critical illness / personal accident**
- *Wording:* "Any critical illness or accident cover?" Chip.
- *Mandatory.* No.

## Group I — Tax snapshot

**I1. Tax regime (India households)**
- *Wording (self):* "Which tax regime are you on right now — Old or New (India)?" Chip.
- *Mandatory.* If region = IN.
- *Feeds.* TES.

**I2. Tax situation complexity (quick tag)**
- *Wording:* "Anything complex about your taxes (business, RSUs, rental, NRI, capital gains)?" Chips.
- *Mandatory.* No.
- *Feeds.* "Advanced recommended" trigger.

## Group J — Goals snapshot

**J1. Choose goals from a shortlist.**
- Chips: Retirement, Children's Education, Children's Marriage, Home Purchase, Emergency Fund, Parents' Care, Pay Off Debt, Passive Income, Business Launch, Legacy, Travel, Other.
- *Mandatory.* At least 1.
- *Feeds.* GFS, RRS, Goals module.

**J2. For top 3 goals: target year + rough target amount (today's currency) + priority.**
- *Type:* for each goal: year picker, currency range, priority chip.
- *Mandatory.* Yes for 3 goals.

## Group K — Risk comfort snapshot

A 5-item short set — not the full RPS questionnaire.

**K1.** "If your investments dropped 25% in a year, you would…" (chip: buy more / hold / get worried / sell).
**K2.** "I prefer investments that…" (stable / balanced / higher growth with ups and downs).
**K3.** "Losing a year's worth of savings would…" (be fine / be uncomfortable / be devastating).
**K4.** "My experience with investing is…" (none / some / significant).
**K5.** "I want my plan to be…" (safe and predictable / balanced / aggressive and growth-first).

*Feeds.* RPS baseline.

## Group L — Urgent concerns & life-event triggers

**L1.** Chip select: "What feels most pressing right now?"
- Options: Not enough emergency savings · Too much debt · Wondering if I can retire on time · Kids' education · Parents' health · Buying a home · Protecting my family · Taxes seem inefficient · Confused about my investments · Life change recently happened.

**L2.** "Anything that changed in the last 6 months?" Chips: Job change · Marriage · Baby · Home purchase · Loan · Inheritance · Health event · Relocation · None · Other.

*Feeds.* Insight priority, Action urgency.

---

## 9.2 Basic Mode UX details

- **One idea per screen.** No screens with more than one primary interaction.
- **Time cost visible.** "Step 3 of 12 · about 3 minutes left."
- **Skip-friendly.** Every non-mandatory question has a "skip" with an automatic follow-up task.
- **Inference disclosure.** When the engine infers a default, show a subtle chip: "Assumed {value}. Tap to change."
- **Microcopy tone.** Warm, direct, not cute. Contractions ok. No exclamation points beyond first screen.

### Example microcopy
- Progress reassurance (mid-flow): "You're 60% through. Great — this is going to be useful."
- Skip line: "Not sure? Skip and we'll add it to your to-do list."
- Insight tease (after F-group): "You're already unlocking insights. See them at the end."

---

## 9.3 Exact Basic Mode output

At the end of Basic Mode, generate and display a one-pager with the following sections:

1. **Household overview**
   - Family composition illustration (tiny Household Map).
   - Region, primary currency, life stage.
2. **Financial Health Summary**
   - Composite FHS score (0–100 with band: "Needs Work / Building / Solid / Strong") and top 3 sub-scores (ERS, PAS, DSS or RRS — whichever are most material).
   - Plain-English one-liner per score.
3. **Top Risks (3)**
   - Prioritized severity chips with plain-English explanation.
   - e.g., "Your protection cover funds ~1.2 years of essential expenses for your dependents. That's a critical gap."
4. **Top Opportunities (3)**
   - e.g., "Your emergency fund is 45% of a safer target — you could close this in ~7 months with a small monthly plan."
5. **Tax-Aware Planning Flags** (India: regime observation)
   - "You're on the Old regime with modest 80C usage. In Advanced Mode we'll show both sides side-by-side."
6. **Protection Flags**
   - Term cover adequacy, health cover adequacy, critical illness presence.
7. **Debt Flags**
   - Debt stress band; credit card revolve flag.
8. **Goal Readiness Summary**
   - For each declared goal: on-track / watch / off-track status with a short rationale.
9. **Next Best Actions**
   - Client: 2 actions with due windows (this week / this month).
   - Advisor: 2 actions (for advisor-led).
10. **Recommendation on mode**
   - "This household is a good fit for Advanced Mode because of [reasons]." or "Basic captures enough for now; revisit in 3 months or after a life event."
11. **Advisor Task List & Client Task List** (for advisor-led sessions).

---

## 9.4 Example Basic outputs (illustrative)

### Example 1 — Young professional (self-serve)

- **FHS 58 (Building).** ERS 38 (Low), PAS 22 (Low), DSS 70 (OK).
- **Top risks.**
  1. "Your emergency buffer is about 1.3 months of essential expenses. We recommend 6."
  2. "No term insurance. Even without dependents today, term now is cheap and protects future plans."
  3. "Credit card revolve detected — this alone can cost you a small fortune each year."
- **Top opportunities.**
  1. "At your current surplus, you could reach a healthy emergency fund in ~6 months."
  2. "Starting a ₹10,000 SIP now could outperform your biggest discretionary expense category over 15 years."
  3. "If you're on the Old regime, there's room to optimize 80C usage — we'll look at this in Advanced Mode."
- **Actions (you).** 1) Stop credit card revolve (1 week). 2) Set up emergency SIP (this week).

### Example 2 — Advisor-led couple with parents supported

- **FHS 64. PAS 41 critical. FDRS 55 high.**
- **Risks.** Primary earner carries 82% of income; term cover funds 1.8 years of essentials. Parents' medical inflation under-modeled.
- **Opportunities.** Raising term cover to a target amount; adding critical illness; adding super top-up health for parents.
- **Recommendation.** Move to Advanced Mode next meeting to model survivorship and eldercare reserve.

---

## 9.5 Region-varying questions

| Question | India default | GCC default | Global default |
|---|---|---|---|
| B1 country of residence | India | UAE / KSA / ... | user-selected |
| I1 tax regime | Old vs New chip | hidden | hidden |
| H1 labels | Term, endowment, ULIP | Term, Whole Life | Term, Whole Life |
| F3 labels | EPF, PPF, NPS | EoSB, Pension | Retirement account |
| J1 goals | includes Children's marriage, Parents' care | includes Return home, Schooling abroad | generic |

---

## 9.6 Advisor-led vs self-serve phrasing differences

| Field | Self-serve | Advisor-led |
|---|---|---|
| Monthly income | "What's the monthly amount that lands in your account?" | "Their take-home per month." |
| Essential expenses | "What do your 'must-pay' monthly expenses add up to?" | "Essentials run-rate per month." |
| Concerns | "What feels most pressing?" | "What's on their mind right now?" |
| Risk Q1 | "If your investments dropped 25%…" | "How would they typically react in a sharp drawdown?" |

Microcopy is loaded from a `voice` dictionary; a single flag (`voice: 'client' | 'advisor'`) controls phrasing.
