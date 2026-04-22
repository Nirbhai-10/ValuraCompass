# 18. Action Center

The Action Center is the execution surface of Compass. Every insight that matters produces an action. Every data gap produces an action. Every recommendation produces an action. Every audit-relevant step produces an action. Actions are **owned, prioritized, reminded, completed with evidence, and logged**.

---

## 18.1 Task object

```
task {
  id
  household_id
  title                    (plain English, ≤ 72 chars)
  body                     (1–3 sentences of context)
  type                     (see 18.3)
  owner_type               (advisor | client | spouse | specialist | compliance)
  owner_user_id
  priority                 (critical | high | medium | low)
  due_date
  due_date_logic_ref       (how due date was set)
  dependency_task_ids      (must_complete_first)
  related_insight_ids
  related_module_links
  evidence_requirement     (none | confirmation | file_upload | approval)
  reminders                (schedule + channels)
  escalation_policy_id     (optional)
  created_by               (user | system)
  created_at
  last_updated_at
  status                   (open | in_progress | blocked | done | cancelled | stale)
  completion_evidence      (ref to file or confirmation record)
  notes                    (list of timestamped notes)
  audit_log_ref            (pointer to audit events for this task)
}
```

---

## 18.2 Owner separation

Ownership is strict:
- **Advisor tasks.** Advisor only. Visible to compliance if firm policy requires.
- **Client tasks.** Client (and spouse with consent). Hidden from advisor-only dashboards unless the advisor is subscribed to follow up.
- **Spouse tasks.** The non-primary partner; consented visibility to primary partner.
- **Specialist tasks.** CA / lawyer / insurance specialist / doctor referral — represented as an external task routed via email or link.
- **Compliance tasks.** Firm compliance — visible only to compliance role.

Shared tasks are modeled as linked tasks (one per owner) so each owner has an accountable task without ambiguity.

---

## 18.3 Task types

1. **Missing data** — data required to unlock an insight or score (e.g., "Enter policy term for LIC #1234").
2. **Missing documents** — document upload that would improve a score's confidence (e.g., "Upload latest CAMS statement").
3. **Recommendation follow-up** — advisor-created action derived from a recommendation (e.g., "Confirm decision: reduce ULIP, add term").
4. **Tax review needed** — escalation to CA for regime/cap gains/wrapper decisions.
5. **Insurance review needed** — adequacy or policy review.
6. **Debt optimization action** — prepayment, refinance, revolve cleanup.
7. **Goal funding action** — start SIP, rebalance toward goal, split corpus.
8. **Annual review due** — scheduled based on anniversary; per-client customizable.
9. **Life-event follow-up** — job change, marriage, child, home, inheritance, health event.
10. **Estate document completion** — will, PoA, trust, nominee updates.
11. **Nominee correction** — specific, per-instrument.
12. **Risk profile review** — triggered by life event or contradiction.
13. **Suitability reassessment** — periodic or triggered.
14. **Region / residency update** — residency change or tax residency update.
15. **Plan assumption confirmation** — confirm inferred defaults.
16. **Specialist referral** — CA, lawyer, insurance specialist.
17. **Compliance review** — firm-level review trigger.
18. **Meeting prep** — advisor-side preparation for an upcoming session.
19. **Communication** — client-outreach task (advisor-side).

---

## 18.4 Priority & due-date logic

### Priority
- **Critical.** Severity=critical or life-event-linked and time-sensitive (insurance portability window, regime election window, nominee after death).
- **High.** Severity=high or affecting primary earner's protection/cash flow.
- **Medium.** Important but not urgent; tax observations, concentration, allocation nudges.
- **Low.** Nice-to-have, cleanup, hygiene.

### Due-date calculation
- **Critical.** 7–14 days.
- **High.** 30 days.
- **Medium.** 60–90 days.
- **Low.** 120 days or "Review next quarter."
- **Event-driven.** Due date derived from the event: e.g., insurance portability has a 30-day window from a job change.
- **Anniversary-driven.** Annual review due date = household anniversary ± configurable window.

Every task stores a `due_date_logic_ref` so a user can see *why* a date was chosen.

---

## 18.5 Reminder logic

- In-app notifications (primary).
- Email reminders (default on for critical/high).
- SMS/WhatsApp reminders (opt-in; compliance considerations).
- Cadence:
  - Critical: 3 days before, day-of, 2 days after if not done.
  - High: 7 days before, day-of.
  - Medium: 14 days before.
  - Low: 30 days before.
- Honor **quiet hours** per user.
- **Never pester** — reminders auto-stop if a task is in progress (user explicitly marks) or blocked.

---

## 18.6 Escalation logic

- **Stale.** Any task not updated in 30 days beyond due date → auto-escalated.
- **Critical overdue by > 14 days.** Escalated to advisor (if client-owned) or to team lead (if advisor-owned) per firm policy.
- **Specialist referral unreplied > 14 days.** Re-ping template; alternate contact suggestion.
- **Compliance tasks.** Never close automatically; require explicit compliance officer completion.

Escalations never happen silently — they are logged with timestamp and recipient.

---

## 18.7 Completion evidence

Per task type, required evidence:

| Task type | Evidence |
|---|---|
| Missing data | Field value captured |
| Missing documents | File uploaded and tagged |
| Recommendation follow-up | Client confirmation (in-app) + advisor note |
| Tax review needed | CA note attached OR advisor confirmation "reviewed with CA" |
| Insurance review needed | Policy decision recorded (renew, cancel, amend) |
| Debt optimization | New EMI / refinance letter uploaded OR confirmation |
| Goal funding | SIP / lump-sum confirmation (external) |
| Annual review due | Annual review deck generated |
| Life-event follow-up | Life event resolved + related sub-tasks done |
| Estate document completion | Will / PoA / trust scanned and saved |
| Nominee correction | Updated form + acknowledgment |
| Risk profile review | New profile computed |
| Suitability reassessment | ISS refreshed |
| Region / residency update | Household region / member residency updated |
| Plan assumption confirmation | Confirmation click with timestamp |
| Specialist referral | Advisor note or reply thread |
| Compliance review | Compliance officer sign-off |

Tasks cannot be closed without the required evidence. "Close anyway" requires an `override_reason` and is recorded in the audit log.

---

## 18.8 Completion UX

- Small, clean completion modal:
  - Evidence upload or confirmation field.
  - Note (optional).
  - Confirmation button.
- Celebratory feedback kept subtle (no confetti).
- Score delta shown inline if relevant ("FHS +2 · PAS +4").
- Next suggested action offered gently.

---

## 18.9 Audit log requirements

Every task writes to audit:

- Creation (by whom, derived-from-insight-id if any).
- Any status change with timestamp and actor.
- Evidence submission (file hash + uploader).
- Override close (with reason and actor).
- Reminders sent.
- Escalations triggered.

---

## 18.10 Views & filters

- **By owner** tabs: Advisor, Client, Spouse, Specialist, Compliance.
- **By status.**
- **By priority.**
- **By due window** (overdue, this week, this month, later).
- **By household** (advisor dashboard).
- **By type.**

Quick filters: "Critical today," "Needs my approval," "Waiting on specialist," "Awaiting client."

---

## 18.11 Example task cards

### T-101 Missing data (Client)
- **Title.** "Confirm your essential monthly expenses"
- **Body.** "We used a rough estimate. A confirmed number sharpens every protection and retirement recommendation."
- **Owner.** Client · **Priority.** High · **Due.** 7 days · **Evidence.** Field value captured.
- **Related insights.** C-01 Protection gap.

### T-203 Insurance review (Client + Advisor linked)
- **Title.** "Decide on LIC Jeevan Anand #12345"
- **Body.** "Premium ₹48,000/yr. Paid-up vs surrender vs continue — we'll pick the best option together."
- **Owner (client).** Decision. · **Owner (advisor).** Prepare comparison.
- **Priority.** Medium · **Due.** 30 days · **Evidence (advisor).** Options memo attached; **(client).** Decision recorded.

### T-310 Debt optimization (Advisor)
- **Title.** "Model refinance for home loan at 150 bps lower"
- **Body.** "Current rate 9.1% floating. Draft a refinance scenario before the next meeting."
- **Priority.** Medium · **Due.** 14 days · **Evidence.** Scenario saved; link to the Scenarios module.

### T-401 Nominee correction (Client)
- **Title.** "Update nominee on Zerodha demat"
- **Body.** "Your nominee name on record differs from your stated beneficiary. Update via your broker's form."
- **Priority.** High · **Due.** 30 days · **Evidence.** Updated nominee form uploaded.

### T-505 Specialist referral (Specialist)
- **Title.** "Tax regime comparison and business-owner strategy"
- **Body.** "Please review regime switch implications and dividend-vs-salary posture; reply here."
- **Priority.** Medium · **Due.** 14 days · **Evidence.** Specialist reply captured.

### T-611 Compliance review (Compliance)
- **Title.** "Review suitability override: AIF Cat III allowed for {household}"
- **Body.** "Advisor override with rationale attached; please review and sign off."
- **Priority.** High · **Due.** 7 days · **Evidence.** Compliance sign-off recorded.

---

## 18.12 Interactions with Insight Engine

- Insights propose tasks via `actions` templates (Section 14).
- Accepting a proposed action creates a task scoped to its template owner and evidence.
- Tasks carry `related_insight_ids` so closing a task can resolve or update the insight's status.
- If an insight would produce a task that duplicates an existing open task, the insight is linked to the existing task rather than creating a new one.

---

## 18.13 Interactions with Reports

- The Action Center section of the Basic one-pager shows the top 2 client tasks + 2 advisor tasks.
- Full Plan reports include the current open task list grouped by owner.
- Annual Review decks include "what we completed since last year" and "what we're taking on this year" — each drawn from task history.

---

## 18.14 Behavior tuning per household

- Household behavior profile (Section 7.M) shapes reminder cadence and tone.
- `nudging_preference`:
  - **Gentle.** Softer copy; fewer reminders.
  - **Direct.** Short, pointed copy; on-time reminders.
  - **Data.** Reminders include numbers ("Every week of delay costs ~₹X").
  - **Narrative.** Longer, story-format reminders.

---

## 18.15 Ethics & safety

- No manipulative urgency in copy; "today only" language avoided.
- Sensitive tasks (eldercare, special-needs, estate) use calibrated copy that respects the subject matter.
- No dark-pattern nudges. Compass never uses loss-aversion framing for trivial tasks.
