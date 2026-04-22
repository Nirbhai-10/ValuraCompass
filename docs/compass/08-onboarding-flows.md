# 8. Onboarding Flows

Onboarding in Compass is designed around one principle: **earn value fast, reduce friction, never leak trust.** Each flow below is a specified sequence with copy, decision logic, and exit criteria.

> All flows share a **Trust Header** (minimal) on the first screen: Valura logo, "Your data is yours. Private by default. Edit anytime." A 15s first impression is assumed.

---

## Flow 1 — Advisor-led first meeting

**Entry.** Advisor starts a new household from their dashboard and begins with a client on a video call or in-person.

**Steps.**
1. **Create Household.** Advisor enters household name, region (default IN), currency, who's in the room.
2. **Choose mode.** Advisor picks Basic (default for first meeting).
3. **Meeting Mode on.** Advisor toggles Meeting Mode so the screen is screenshare-safe.
4. **Warm-up.** First screen: "Let's start with what matters most to you." A 2-minute conversation prompt, captured as "urgent concerns" (free-text chips such as "affording kids' education," "retiring by 60," "parents' health").
5. **Household snapshot.** Advisor captures members (chip UI), picks household structure template, confirms region.
6. **Basic data pass.** Advisor walks through the Basic Mode flow (Section 9) while talking.
7. **First insight reveal.** Mid-flow, Compass shows the earliest available insight (e.g., "Emergency resilience looks tight — let's come back to this").
8. **Close.** Basic one-pager is generated on-screen. Advisor assigns 2 client tasks (e.g., upload policies, share bank statement), creates own follow-up tasks, and schedules Advanced session.

**Copy cues.**
- Opening line: "This tool helps us build a clear picture of your household in about 10 minutes. I'll drive; just tell me what feels right."
- Mid-flow nudge: "We can leave anything blank and come back."

**Exit criteria.** Basic Plan generated, tasks created for both parties, next meeting scheduled.

## Flow 2 — Self-serve individual

**Entry.** User lands on the Compass sign-up page. One CTA: "Start your plan."

**Steps.**
1. **Email + OTP.** Minimal auth. No credit card, no kyc-heavy questions.
2. **Region choice.** Default `IN`. A secondary CTA: "I live outside India →" with a dropdown.
3. **What brings you here?** Single-screen chip selector: "Figure out if I'm on track," "Plan a big goal," "Organize my finances," "Prepare for a life event." — sets priority order of insights and goals prompts.
4. **Household setup.** "Are you planning for just yourself, with a partner, or for a family?" — picks Individual / Couple / Family templates. Individual starts with one person only; partner can be added later.
5. **Start Basic Mode.** Go straight into Section 9 flow.
6. **First insight hook.** After the first section (income) is captured, a small card reveals: "Good start — next few questions will unlock your first scores."
7. **Finish Basic.** Basic Plan + top 3 insights + top 3 actions.
8. **Next step choice.** Options: "Invite my partner," "Invite my advisor," "Continue to Advanced," "Come back later."

**Copy cues.**
- Opening: "Let's build a plan that's useful in 10 minutes, not 10 meetings."
- Reassurance: "You won't be pitched anything here. This is planning, not selling."

**Exit criteria.** Account created, Basic Plan generated, at least one action assigned.

## Flow 3 — Self-serve couple

**Entry.** Either partner initiates; may invite the other via email.

**Steps.**
1. **Individual onboarding** for the first partner (Flow 2 through household setup).
2. **Invite partner.** "Want to plan together?" — email invite.
3. **Consent model.** Explicit screen: "Shared by default for household items; health, salary details, and personal notes stay private unless you choose to share."
4. **Each partner answers their own Basic.** Parallel sessions; progress is visible to both.
5. **Joint Basic Plan.** Once both have completed their pieces, a couple-level Basic Plan shows combined cash flow, joint goals, two-column KPI comparison where appropriate.
6. **Disagreement affordance.** If partners gave divergent priority rankings for goals, the plan surfaces a gentle "you two ranked these differently — here's a view of each" card, not an alarm.

**Exit criteria.** Both partners have completed Basic; joint one-pager generated.

## Flow 4 — Advisor sends intake link

**Entry.** Advisor creates household + sends an intake link to client.

**Steps.**
1. **Advisor pre-fills.** Region, members, any known data.
2. **Link dispatched.** Email with secure single-use link and a short Loom-style explainer (optional).
3. **Client opens link.** No password: magic link + OTP for first login.
4. **Scope shown clearly.** "Your advisor Riya will see what you enter. Some fields stay private unless you share them."
5. **Guided intake.** Basic Mode flow, with advisor's notes inline where relevant (e.g., "Riya added a note here").
6. **Gaps reported.** Advisor sees a completeness meter per section, with a "nudge client" button.

**Exit criteria.** Client has submitted Basic data; advisor sees a filled household.

## Flow 5 — Family discovery session

**Entry.** Advisor with multi-member family in a session.

**Steps.**
1. **Household template.** Select "Nuclear with Parents" / "Joint Family" / custom.
2. **Members captured as chips.** Relationships drawn live.
3. **Household Map appears as it's built.** Visually reinforces depth.
4. **Per-member minimal.** For each non-primary member, capture only what matters (dependency status, relevant goals, nominee relevance).
5. **Dependency flags set.** Any member flagged "special-needs" or "elderly with medical" triggers a delicate follow-up question with plain wording and privacy emphasis.
6. **Basic Plan (family).** One-pager reflects family view with dependency map and flagged gaps.

## Flow 6 — Advanced live planning interview

**Entry.** Advanced Mode, Meeting Mode on, existing household.

**Steps.**
1. **Narrative rail loaded.** Advisor sets session agenda (3 bullets).
2. **Jump-navigation** across modules (no forced order).
3. **Live tasks.** Advisor adds tasks as they go (keyboard shortcut `T`).
4. **Live notes.** Advisor-only notes captured with timestamp.
5. **Scenario drafted live.** Advisor creates a named scenario in front of client (e.g., "Retire at 58 with 2 dependents").
6. **Session summary.** At close, Compass offers a meeting summary (AI-drafted, advisor-reviewed) and list of tasks.

## Flow 7 — NRI / cross-border onboarding

**Entry.** Advisor or self-serve NRI.

**Steps.**
1. **Region set at household level.** Default `IN` if the planning anchor is in India; `GCC` if anchored in GCC.
2. **Per-member residency and tax residency.** Explicit, separate fields.
3. **Jurisdictional disclosures.** Plain-English note: "Some topics require local professional input. Compass will flag them."
4. **Currency setup.** Primary + reporting currency chosen.
5. **Obligations in other countries.** Captured (e.g., parents in India, property in India, children's school fees in UK).
6. **Basic Plan with cross-border view.** Currency exposure, obligation map.

## Flow 8 — Annual review return journey

**Entry.** Existing household, prompted by anniversary trigger.

**Steps.**
1. **"Welcome back" card.** Advisor or client-facing version.
2. **Delta capture.** "What changed?" one-screen chip UI (new child, new job, home purchase, big market event, health event, loan, none).
3. **Confirm still-true items.** Compact list of key facts to confirm or update.
4. **Re-score.** All scores recomputed; previous-year comparison shown.
5. **New insights.** Prioritized; clearly labeled "new this year."
6. **Review deck.** Advisor generates the annual review deck (Section 20).

## Flow 9 — Quick prospect discovery

**Entry.** Advisor with a prospect (15–20 min window).

**Steps.**
1. **New household with "Prospect" tag.**
2. **Ultra-short Basic.** A curated 6-minute subset (skip insurance details and estate snapshot, capture income/expenses/goals/risk/concerns).
3. **One-pager immediately.** Shareable; the prospect's key insight is highlighted.
4. **Next step CTA.** Option to book Advanced session.
5. **Upgrade gracefully.** If the prospect converts, the household transitions from Prospect → Client with a status change in audit log (no data re-entry).

## Flow 10 — High-complexity HNI discovery

**Entry.** Senior planner with an HNI family, often in a 2-hour block.

**Steps.**
1. **Household creation with HNI template.** Pre-configures instrument scope, entity ownership, estate prompts.
2. **Principal + key members captured.** The principal gets a detailed profile; other members minimal unless required.
3. **Assets approached by pockets.** Pocket-by-pocket (self-managed / advisor-managed / offshore / private investments / real estate / business) rather than instrument-by-instrument.
4. **Liabilities and obligations.** Personal + entity-linked.
5. **Estate and succession prompts surface early.** (HNI households often start with this.)
6. **Meeting Mode screens used throughout.** Internal-only panels hidden.
7. **Deliverable at close.** An executive one-pager + advisor-internal full plan.

---

## 8.11 Shared onboarding principles

- **First screen never asks for money.** Always asks for intent or identity.
- **Progress is always visible.** A subtle progress arc or breadcrumb.
- **Skipping is always an option.** Skipped fields are tracked as tasks.
- **Value appears before the end.** At least one insight by 40% completion.
- **Consent is explicit for sensitive data.** Inline, not buried.
- **Advisor can hand off.** At any point, convert a self-serve household into advisor-managed via invitation.
- **Mobile onboarding.** All flows run on mobile for Basic; Advanced pushes users to desktop.
- **Accessibility.** All forms keyboard-navigable; color not the only signal; copy at grade-8 reading level for client microcopy.

## 8.12 Common friction anti-patterns to avoid

- Long T&C wall before seeing the product.
- "Verify your phone" before showing value.
- Demanding PAN / ID at sign-up.
- Asking for full estate details in the first 5 minutes.
- Forcing goals before asking concerns.
- Treating risk tolerance as a 1-question quiz.
