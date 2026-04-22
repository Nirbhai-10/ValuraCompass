# 10. Advanced Mode Discovery Framework

Advanced Mode is a **workspace**, not a form. The discovery framework below is organized as **blocks**. Each block is a self-contained, jumpable section. An advisor can drive them in any order; the Narrative Rail keeps the conversation coherent.

> Each block specifies: **Purpose · Sub-questions · Advisor rationale · Signal revealed · Planning logic impact · Suitability impact · Action prioritization impact · Emotional sensitivity · Best timing · Helper text? · Follow-ups.**

Helper text is plain-English explanation written for the client, shown on tap. Emotional sensitivity: `low | medium | high | very_high` determines tone, color restraint, and default privacy.

---

## B1. Household structure (deep)

**Purpose.** Build a faithful household graph.

**Sub-questions.**
1. Who lives with you?
2. Who financially depends on you?
3. Who financially supports you?
4. Anyone outside the home you support (parents, siblings, in-laws)?
5. Any dependents with ongoing care needs (elderly / disability / chronic illness)?
6. Is any member a caregiver?
7. Are finances shared, mostly shared, separate, or mixed in the household?
8. Any expected changes (marriage, new child, parent moving in)?

**Rationale.** Everything else depends on this.

**Signal.** Dependency intensity; earners-to-dependents ratio; caregiver load; fragility points.

**Planning impact.** Life cover adequacy, healthcare reserve, emergency buffer, risk capacity.

**Suitability impact.** Liquidity and income stability constraints.

**Action impact.** Protection and estate priorities.

**Emotional sensitivity.** `medium → high` (special-needs/elderly).

**Timing.** First in the live interview.

**Helper text.** "This shapes everything that follows. If anything feels too personal, skip — we'll come back."

**Follow-ups.** For each dependent, capture age, support type, duration expectation.

## B2. Family financial dependencies

**Purpose.** Who relies on whom, for what, for how long.

**Sub-questions.**
1. For each dependent: nature of support (living costs, school, medical, housing, none).
2. Expected duration of dependency (numeric or "indefinite").
3. For any dependent: "If you couldn't support them tomorrow, what would happen?"
4. Any contingent supporters (siblings, extended family) who would step in?

**Signal.** FDRS drivers; life cover sizing.

**Impact.** PAS, survivorship modeling, ESS.

**Sensitivity.** `high`.

**Follow-ups.** For indefinite dependency, prompt for special-needs continuity block (B6).

## B3. Cross-border structures

**Purpose.** Accurate residency/tax-residency and obligation mapping.

**Sub-questions.**
1. Per member: residency country, tax residency, visa/residence permit basis, duration expected.
2. Assets and liabilities in other jurisdictions (home, rental, investments, loans, family).
3. Expected return-to-home-country timeline (if applicable).
4. Remittances in/out, frequency, currency.
5. Multi-currency goals (e.g., education in the UK).

**Signal.** Regulatory, tax observation, currency exposure.

**Impact.** TES, LAS, goal currency handling, retirement framing.

**Sensitivity.** `medium`.

**Timing.** Early if the household has any non-trivial cross-border link.

## B4. Income durability

**Purpose.** Separate "how much" from "how reliable" and "how long."

**Sub-questions.**
1. Source-by-source: amount, variability (stable/moderate/high), pattern (monthly/seasonal/project), dependency on a single employer/client/customer.
2. Expected durability: "Do you expect this income to continue for: <3 yrs / 3–7 yrs / 7+ yrs?"
3. Concentration by payer (top client share).
4. Planned exits/retirements per earner.
5. Benefits: employer insurance, gratuity, EoSB (GCC), stock vesting schedule.
6. Any sabbatical or career break expected?

**Signal.** IDS.

**Impact.** Risk capacity, protection sizing, goal funding.

**Sensitivity.** `medium`.

**Helper text.** "Durability = how reliable this income will be for the next few years."

## B5. Profession and career risk

**Purpose.** Context around earner stability beyond salary numbers.

**Sub-questions.**
1. Industry (taxonomy).
2. Role type (IC, people manager, executive, self-employed, promoter).
3. Years in profession.
4. Last job change (years ago).
5. Self-assessed replaceability (easy / moderate / hard).
6. Current market for your skills (demand perception).
7. Any signals of restructuring, regulatory change, cyclical downturn?

**Signal.** Career-change risk; income stability interaction.

**Impact.** IDS, capacity for loss.

**Sensitivity.** `medium`.

## B6. Special-needs dependent planning

**Purpose.** Ensure lifelong care is planned and continuity is modeled.

**Sub-questions.**
1. Nature of ongoing care needs (captured sensitively, user-defined if preferred).
2. Expected duration (usually indefinite).
3. Monthly care costs today.
4. Expected inflation band (healthcare, therapies, specialized education).
5. Is there a trust or legal structure?
6. Who is the designated guardian if parents are unavailable?
7. Are siblings expected to participate in continuity?
8. Known government programs or benefits considered?

**Signal.** Continuity plan completeness; ESS; PAS sizing.

**Impact.** Dedicated Special-Needs Reserve goal; estate readiness; insurance (life + critical illness for parents).

**Sensitivity.** `very_high`.

**Helper text.** "We plan this with care. Share only what helps. This is private by default."

**Follow-ups.** If no guardianship or trust, create advisor task for specialist referral.

## B7. Elderly parent support

**Purpose.** Model healthcare reserve, senior cover, caregiver burden.

**Sub-questions.**
1. Parents' ages, residence, own income (if any), own insurance.
2. Current monthly support.
3. Chronic conditions known (with consent).
4. Senior-citizen health policy in place? Any riders?
5. Who is the primary decision-maker and caregiver?
6. Long-term care plan (home-based vs professional vs uncertain).
7. Any siblings sharing the load?

**Signal.** Healthcare reserve; PAS (critical illness for parents where applicable).

**Impact.** Eldercare goal; emergency buffer sizing; scenarios.

**Sensitivity.** `high`.

## B8. Caregiving burden

**Purpose.** Recognize that caregiving is a hidden planning variable.

**Sub-questions.**
1. Who is the primary caregiver?
2. Hours/week of caregiving (rough).
3. Opportunity cost (reduced work, career pause).
4. External support (paid help, family rotation, community programs).
5. Caregiver health and resilience.
6. What would happen if the caregiver were unavailable for 3 months?

**Signal.** Household Fragility Score component.

**Impact.** Scenario modeling; insurance (primary caregiver health); contingency planning.

**Sensitivity.** `high`.

## B9. Expense quality and hidden leakage

**Purpose.** Go beyond the essential/discretionary split.

**Sub-questions.**
1. Subscriptions currently active (list).
2. Lifestyle inflation perceived over last 3 years.
3. One-off yearly large expenses (insurance premiums, school capitations, travel, events).
4. Expenses paid by others that you'll need to pay later (parents' accounts, employer perks ending).
5. Non-negotiable expenses identified.
6. Any categories you suspect are "leaking" (late fees, excess delivery, lifestyle drift).

**Signal.** CFS, non-negotiable run-rate; realistic essential level for PAS.

**Impact.** Budget stress, target setting.

**Sensitivity.** `low → medium`.

## B10. Tax inefficiencies (India-context examples)

**Purpose.** Surface regime-related, deduction-related, asset-location-related, policy-related observations.

**Sub-questions.**
1. Current regime chosen; rationale (default, recommended by CA, unsure).
2. Deductions used this year (80C, 80D, HRA, NPS, home loan interest context).
3. Capital gains realized this year and carried forward (awareness).
4. Holdings across tax-efficient wrappers (PPF, EPF, NPS, ELSS, insurance-linked).
5. Policy-in-force list with age-band triggers (e.g., LTCG on switches in ULIPs).
6. Business-owner: dividend vs salary strategy considered?
7. Cross-border: any FTC / DTAA context you're aware of?

**Signal.** TES; "review with CA" flags.

**Impact.** Tax observation engine; Advanced insights.

**Sensitivity.** `medium`.

## B11. Concentration risk

**Purpose.** Detect over-dependence on a single asset, security, employer, property, or payer.

**Sub-questions.**
1. Top holding as share of net worth.
2. Top single employer share of household income.
3. Home / real estate share of net worth.
4. Business / promoter stake share of net worth.
5. RSUs/ESOPs from current employer as share of liquid net worth.
6. Any single payer > 60% of a business/consulting income?

**Signal.** CRS.

**Impact.** Diversification actions; liquidity planning.

**Sensitivity.** `low → medium`.

## B12. Asset-liability mismatch

**Purpose.** Check if debts are well-matched to assets and horizons.

**Sub-questions.**
1. Short-term debts funded by long-term assets?
2. Credit card revolve present?
3. Business loans guaranteed personally?
4. Any floating rate that could shock cash flow?
5. Home loan tenure vs intended retirement age.

**Impact.** DSS; refinance / prepayment scenarios.

**Sensitivity.** `low`.

## B13. Emergency fragility

**Purpose.** Go beyond "6 months of expenses."

**Sub-questions.**
1. What access speed do you have to the first ₹X? (T+0, T+2, 7 days, 30 days, longer).
2. Who else has legal access to that money?
3. What happens in first 30 days if primary earner loses income?
4. Any built-in resilience (EoSB, severance, bonus timing)?
5. Health and accident buffer separate from emergency fund?

**Impact.** ERS; LAS.

**Sensitivity.** `low`.

## B14. Insurance inadequacy

**Purpose.** Produce a precise adequacy gap, with exclusions awareness.

**Sub-questions.**
1. Life cover: per earner, sum assured, nominee status, term type.
2. Health cover: individual vs floater, sum insured, top-up, pre-existing disease waiting status.
3. Critical illness: presence, sum, waiting period, renewability.
4. Disability: presence, benefit type, income replacement.
5. Personal accident: presence, type (temporary / permanent / partial).
6. Riders considered/active.
7. Employer group cover specifics — portable? Continues post-retirement?
8. Home cover, business cover, professional indemnity where relevant.

**Impact.** PAS; specific gap actions.

**Sensitivity.** `low`.

## B15. Debt quality

**Purpose.** Classify debt on health, not just amount.

**Sub-questions.**
1. Purpose of each loan (asset-building, lifestyle, business, bridge).
2. Interest rate and type.
3. Prepayment/refinance options.
4. Covenants (business debt).
5. Personal guarantee exposure.
6. Informal debt and its social/interpersonal implications.

**Impact.** DSS; concentration via guarantees.

**Sensitivity.** `medium` (informal debt).

## B16. Estate incompleteness

**Purpose.** Ensure continuity and intent alignment.

**Sub-questions.**
1. Will in place? Registered? Updated?
2. Trust / structures in place?
3. Nominee updated across policies, bank accounts, demat, MF folios, real estate?
4. Beneficiary coverage on insurance (and consistency with nominees)?
5. Guardianship for minors / special-needs dependents?
6. PoA arrangements?
7. Succession concerns (family dynamics)?
8. Legacy intentions (charitable, family, community)?

**Impact.** ESS; DCS.

**Sensitivity.** `high` (mortality framing).

**Helper text.** "This is about making sure your wishes are carried out and your family isn't stuck. We'll keep it practical."

## B17. Retirement realism

**Purpose.** Test retirement goal against constraints.

**Sub-questions.**
1. Expected retirement age per primary earner.
2. Essential vs aspirational retirement expenses (today's currency).
3. Expected dependents at retirement and beyond.
4. Pension inflows expected (EPF, NPS, annuities, employer pension).
5. Post-retirement rental/consulting income intent.
6. Healthcare reserve intent.
7. Longevity assumption (with the user's comfort level).
8. Potential second career or phased retirement.

**Impact.** RRS; RRS probabilistic analysis.

**Sensitivity.** `medium`.

## B18. Goal conflict

**Purpose.** Surface tradeoffs where goals compete for the same cash flow.

**Sub-questions.**
1. If we had to prioritize 2 of your goals, which 2?
2. Which goals would you reduce, delay, or drop first?
3. Is there a goal you'd never move?
4. Any goal with emotional weight disproportionate to its cost?

**Impact.** GFS ranking; scenario selection.

**Sensitivity.** `medium`.

## B19. Liquidity risk

**Purpose.** Ensure the household can access cash when it needs it.

**Sub-questions.**
1. Immediate (T+0) liquid amount.
2. 7-day liquid amount.
3. 30-day liquid amount.
4. Assets requiring >1 year to realize.
5. Any upcoming lock-in expirations?

**Impact.** LAS.

**Sensitivity.** `low`.

## B20. Documentation gaps

**Purpose.** Identify missing or stale documents.

**Sub-questions.**
1. PAN / ID available across members?
2. Will and estate docs available?
3. Insurance policy copies available?
4. Loan sanction letters available?
5. Investment statements retrievable?
6. Nominee forms completed?
7. Digital-asset access plan (passwords, keys)?

**Impact.** DCS; Action tasks.

**Sensitivity.** `low`.

## B21. Behavioral constraints

**Purpose.** Understand how the household actually behaves with money.

**Sub-questions.**
1. When markets fall 20%, what do you actually do?
2. Do automatic debits work for you or do you dismiss them?
3. How often do you actually review finances?
4. Do you make decisions alone, with partner, with family, with advisor?
5. Do you prefer gentle nudges or direct instructions?

**Impact.** FTS; communication style; AUI.

**Sensitivity.** `low`.

## B22. Business-owner complexities

**Purpose.** Properly separate household from business.

**Sub-questions.**
1. Entity structure (proprietorship, partnership, LLP, Pvt Ltd, group).
2. Your stake %, others' stakes.
3. Personal guarantees on business debt.
4. Salary-vs-dividend strategy.
5. Director loans in/out.
6. Keyman insurance present?
7. Business continuity plan?
8. Separation of personal and business accounts?

**Impact.** CRS; IDS; ESS; succession prompts.

**Sensitivity.** `medium`.

## B23. Succession issues

**Purpose.** Go beyond "will."

**Sub-questions.**
1. Named successors / trustees / executors.
2. Family dynamics that might complicate succession.
3. Multi-jurisdictional estate complexity.
4. Business succession plan.
5. Disputes known or expected.

**Impact.** ESS; scenario modeling; advisor task.

**Sensitivity.** `high`.

## B24. Legacy goals

**Purpose.** Capture aspirational legacy beyond the family.

**Sub-questions.**
1. Charitable intentions (specific beneficiaries, amounts, timing).
2. Family office / multi-gen wealth planning.
3. Community / institutional commitments.

**Impact.** Goals taxonomy; estate readiness.

**Sensitivity.** `low`.

## B25. Life-event preparedness

**Purpose.** Anticipate near-term life events.

**Sub-questions.**
1. Any likely events in the next 12–24 months (marriage, child, home, job change, health event expected, retirement, inheritance, relocation)?
2. Any ongoing events that haven't been fully accounted for?

**Impact.** AUI; scenario queuing.

**Sensitivity.** `medium`.

## B26. Unknown risk areas

**Purpose.** Invite the client to say what they're worried about but can't articulate.

**Sub-questions.**
1. "What's the financial question that keeps you up?"
2. "What do you wish you understood better?"
3. "If you had one wish for this plan, what would it be?"

**Impact.** Narrative; insight framing; trust.

**Sensitivity.** `medium`.

---

## 10.2 Meeting Mode behaviors

- Each block can be presented as a **one-card** view in Meeting Mode; advisor expands details with keyboard shortcut `E`.
- Every block has an **advisor rationale drawer** (not shown on screenshare) describing why the block exists and what signals to watch for.
- Every answer immediately updates scores in the background; the advisor can show updated scores mid-conversation.

## 10.3 Follow-up rules

- Any `very_high` sensitivity block requires an explicit consent microprompt on first visit ("This is private by default. Can we discuss?").
- Any block with missing critical inputs creates a **completion task** automatically.
- Any flag triggering a specialist review (CA, lawyer, insurance specialist) creates a referral task.

## 10.4 Example block ordering for common sessions

- **First comprehensive planning session.** B1 → B4 → B9 → B14 → B15 → B17 → B18 → B11 → B13 → B16.
- **Annual review.** Start with B25 → B1 (delta) → B9 (delta) → B14 (delta) → B17 → B18.
- **HNI discovery.** B1 → B22 → B11 → B16 → B23 → B17 → B3 (if relevant).
- **NRI discovery.** B1 → B3 → B7 (parents) → B17 → B14 → B16.

## 10.5 Helper-text examples (client-facing, plain English)

- **B6 (special-needs):** "We plan differently when someone in the family needs ongoing care. This section makes sure no one slips through."
- **B9 (expense leakage):** "Not a judgment — just a look at where money tends to leak."
- **B16 (estate):** "Making sure your wishes are carried out. Nothing morbid — this protects the people you love."
- **B26 (open question):** "No wrong answer. Most people have one."

## 10.6 Data-to-insight linkage (sample)

| Block | Example insight it produces |
|---|---|
| B1 + B14 | "Household depends on 1 earner; cover funds 1.2 years of essentials. Life cover sizing priority." |
| B7 | "Parents' healthcare reserve is 40% of a safer floor. Consider super top-up and earmarked healthcare fund." |
| B11 | "Top holding is 58% of liquid net worth. Diversification scenario available." |
| B17 | "Retirement at 60 has 62% probability of meeting essentials; 48% for aspirational. Options available." |
| B22 | "Personal guarantees exceed household liquid net worth. Business continuity review recommended." |
