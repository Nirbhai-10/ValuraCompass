# 16. Screen-by-Screen UX

This is the screen inventory and UX spec. Each screen is specified with: **Objective · User · Primary components · Optional components · Empty state · Loading state · Error state · Collaboration state · Accessibility · Microcopy · Advisor vs client · Mobile.**

Common elements (implicit on every screen) unless noted:
- Global top chrome (Section 6.1)
- Left rail nav
- Insights rail (right) and Action rail (right)
- Assumptions footer
- Breadcrumb

---

## 16.1 Login
- **Objective.** Secure entry; no friction for new users.
- **User.** Both.
- **Primary components.** Email, OTP/passkey, SSO options.
- **Optional.** Firm-branded banner for advisors.
- **Empty state.** N/A.
- **Loading.** Inline OTP resend timer.
- **Error.** "Code didn't work. Try again or request a new one."
- **Accessibility.** Keyboard-first; passkey where supported.
- **Microcopy.** "Sign in to your Compass."
- **Advisor vs client.** Advisors may see firm branding.
- **Mobile.** Yes.

## 16.2 Workspace / tenant selector
- **Objective.** Choose firm workspace (advisors with multiple affiliations).
- **User.** Advisor.
- **Primary.** List with search, last-used first.
- **Empty.** "No workspaces yet. Create one or ask your admin."

## 16.3 Region selector
- **Objective.** Confirm default region at first login; accessible later in settings.
- **User.** Both.
- **Primary.** Region chips (India, GCC, Global) with descriptions.
- **Microcopy.** "We'll tailor terms, currency, and tax context to your region."

## 16.4 New household creation
- **Objective.** Create a household in ≤ 60 seconds.
- **User.** Advisor (or self-serve new user).
- **Primary.** Household name · region · primary currency · who is this for (Individual/Couple/Family) · privacy defaults.
- **Optional.** Template (Nuclear, Nuclear-with-parents, Joint, DINK, HNI, NRI).
- **Empty.** "Let's create your first household."

## 16.5 Invite client
- **Objective.** Advisor invites a client via secure link.
- **Primary.** Email input · personal note · scope of intake · message preview · send.
- **Advisor-only.**

## 16.6 Intake landing page
- **Objective.** Client's first view after invite link.
- **Primary.** Warm welcome · "Your advisor has set this up for you" · what you'll do · privacy note · Start button.
- **Mobile.** Full mobile support.
- **Microcopy.** "10 minutes, mostly short answers. We'll pause anytime."

## 16.7 Basic mode flow
- **Objective.** Drive the Basic question framework (Section 9).
- **Primary.** One-idea-per-screen cards · progress arc · skip button · inferred-value chips.
- **Optional.** Voice-note capture for an answer (V2).
- **Empty.** First screen with a reassuring "no wrong answers."
- **Loading.** Short "calculating" transitions between groups.
- **Error.** Inline, specific.
- **Collaboration.** If couple-linked, show "partner started on Group D" chip.
- **Accessibility.** Each question a discrete, labeled form control.
- **Microcopy.** "Step 3 of 12 · about 3 minutes left."
- **Mobile.** Primary.
- **End.** Basic Plan one-pager (Section 20).

## 16.8 Advanced mode flow (workspace)
- **Objective.** Non-linear deep workspace.
- **Primary.** Module selector (left) · current module canvas · Narrative Rail (right) · Insights & Actions rails.
- **Optional.** Meeting Mode toggle · Keyboard cheatsheet.
- **Empty.** "Pick a module to begin, or continue where you left off."
- **Mobile.** Read-only.

## 16.9 Dashboard home
- See Section 15 (Advisor / Client / Individual / Couple / Family).

## 16.10 Individual view
- **Objective.** Show one person's details.
- **Primary.** Person header · tabs (Snapshot, Details, Income, Assets, Policies, Risk, Goals, Notes).
- **Advisor-only.** Notes tab.
- **Mobile.** Snapshot + Details + Income tabs only.

## 16.11 Couple view
- **Objective.** Joint planning surface.
- **Primary.** Couple header · tabs (Together, {Partner A}, {Partner B}, Divergences).
- **Interactions.** Private-field locks rendered visibly.

## 16.12 Family view
- **Objective.** Household-level surface.
- **Primary.** Household Map · tabs (Map, Members, Dependencies, Eldercare, Children, Special-Needs).
- **Sensitive.** Special-needs and Eldercare tabs open with consent/privacy reminder on first visit.

## 16.13 Household map
- **Objective.** Section 17 feature screen.
- **Primary.** Graph canvas · filter chips (earnings / obligations / insurance / goals / nominees / cross-border) · detail drawer.
- **Interactions.** Click a node → member drawer; click an edge → dependency drawer.
- **Mobile.** Simplified list view with toggle to map.

## 16.14 Family dependency map
- **Objective.** Focus on dependencies and vulnerabilities.
- **Primary.** Graph filtered to dependency edges · vulnerability chips.
- **Mobile.** List.

## 16.15 Assets screen
- **Objective.** Inventory, allocation, concentration, nominee mapping.
- **Primary.** Tabs: List · Allocation · Concentration · Ownership · Nominees.
- **Interactions.** Add asset flow · bulk import CSV (Advanced) · OCR-assisted add.
- **Advisor-only.** "Tax treatment" and "liquidity bucket" columns by default visible; hidden from client with firm option.

## 16.16 Liabilities screen
- **Objective.** Debt inventory, EMI schedule, prepayment/refi scenarios.
- **Primary.** Tabs: List · EMI schedule · Refinance options · Prepayment scenarios.

## 16.17 Income screen
- **Objective.** Source list and durability.
- **Primary.** Sources list · variability chips · IDS breakdown.
- **Advanced-only panels.** Payer concentration, dependency risk.

## 16.18 Expenses screen
- **Objective.** Category breakdown, essential vs discretionary, leakage.
- **Primary.** Category tree · monthly vs annual toggle · non-negotiable chip · inflation tag.
- **Visualization.** Stacked bars for essentials vs discretionary; sparkline for discretionary trend.

## 16.19 Tax planning screen
- **Objective.** Section 13 observations + tax-context inputs.
- **Primary.** Tabs: Snapshot · Regime (IN) · Observations · Documents · CA escalation log.

## 16.20 Risk profiling screen
- **Objective.** Section 12 RPS workflow.
- **Primary.** Questionnaire tabs (Stated / Capacity / Need / Behavior) · RPS band display · component chart · rationale notes.

## 16.21 Suitability screen
- **Objective.** Per-category ISS heatmap.
- **Primary.** Categories grid · ISS chip · guardrail note · override drawer (advisor).

## 16.22 Insurance screen
- **Objective.** Policy inventory + adequacy engine.
- **Primary.** Tabs: Inventory · Adequacy · Nominees · Gaps · Renewals.
- **Interactions.** Add policy via OCR or manual.

## 16.23 Goals screen
- **Objective.** Goal portfolio planning.
- **Primary.** Goal list (cards) · priority ordering · per-goal detail view with funding plan.
- **Mobile.** Supported.

## 16.24 Retirement screen
- **Objective.** Retirement picture with probabilistic overlay.
- **Primary.** Corpus curve · gap summary · P(success) headline · scenario toggles · healthcare reserve sub-section.

## 16.25 Scenarios screen
- **Objective.** Named what-ifs.
- **Primary.** Scenarios list · compare panel · what-if sliders · save as scenario · annotate.
- **Advisor-only.** Full controls; client sees simplified.

## 16.26 Insights panel
- **Objective.** Full list of insights, filter, detail drawer.
- **Primary.** Filters (category, severity, scope) · list · detail drawer with "why this?"
- **Interactions.** Stage/unstage (advisor); snooze/resolve/dismiss.

## 16.27 Action center
- See Section 18.

## 16.28 Reports center
- **Objective.** Generate, preview, version, share.
- **Primary.** Template list (Basic one-pager, Full Plan, Annual Review, etc.) · preview · version history · export.
- **Advisor-only.** Internal versions; compliance redaction toggle.

## 16.29 Annual review workspace
- **Objective.** Structured re-baseline + deck.
- **Primary.** Delta capture · confirm key facts · re-score · review deck draft.
- **Microcopy.** "Welcome back, {name}. Let's see what's changed."

## 16.30 Advisor notes
- **Objective.** Internal notes per household/meeting.
- **Primary.** Timeline · tagging · templates.
- **Advisor-only.**
- **Microcopy.** "Private to you and {team}."

## 16.31 Client portal
- **Objective.** Client-visible subset: their plan, actions, documents, messages.
- **Primary.** Home (client dashboard) · My plan · My actions · My documents · Messages · Settings.
- **Advisor-hidden.** Nothing here is advisor-only.

## 16.32 Document upload
- **Objective.** Add documents; tag; route to OCR.
- **Primary.** Drop zone · type picker (statement, ITR, policy, loan, ID, other) · privacy chip · tags.

## 16.33 OCR review screen
- **Objective.** Confirm or correct extracted fields.
- **Primary.** Document preview (left) · extracted fields (right) · confidence indicators · field-to-model mapping · approve/deny.
- **Microcopy.** "We extracted these fields. Please confirm the ones we weren't sure about."

## 16.34 Settings
- **Objective.** User and household settings.
- **Primary.** Tabs: Profile · Security · Notifications · Region & Assumptions · Privacy & Consent · Firm Branding (advisor) · API Tokens (admin).

## 16.35 Permissions
- **Objective.** Manage household membership, advisor access scopes, couple consent.
- **Primary.** Members list · roles · scope (full, read-only, limited) · couple consent settings · audit of permission changes.

## 16.36 Audit trail
- **Objective.** Browse, filter, and export logs.
- **Primary.** Event list with filters (type, actor, date) · detail drawer · export button (PDF + CSV).
- **Advisor/compliance-only.**

---

## 16.37 Shared UX states

### Empty state template

- Visual: a small restrained illustration (line art in deep green).
- Headline: 4–8 words explaining the state.
- Body: 1–2 sentences.
- Primary CTA: the one action most likely needed.
- Secondary CTA: "Learn what this means" → glossary/help.

Example (Assets empty):
> **Start building your assets picture.**
> You can enter a single item, upload a statement for OCR, or bulk add via CSV. We don't need everything in one go — start with what you know.
> [Add an asset] · [Upload a statement] · [Learn how this works]

### Loading state

- Skeletons mirror layout, animated shimmer.
- Never spinners on primary screens.
- Messages only appear after 1.2s: "Just a moment — recomputing with your latest data."

### Error state

- Icon: muted alert (not red).
- Body: plain English + next step.
- Retry button.
- "Report this" link.
- Error IDs stored locally for support.

### Collaboration state

- When another user is editing: small presence avatar; "Editing now" chip near affected card.
- Lock only when strict conflict risk; prefer merge.

### Accessibility

- WCAG AA at minimum; AAA color contrast on essential text.
- Every chart has a data table alternative.
- No meaning by color alone.
- Forms keyboard-navigable; every field labeled.
- Skip links on nav.

### Advisor vs client variation

- Copy dictionary `voice: 'client' | 'advisor'`.
- Visibility flags per component.
- Advisor-only panels live behind a tab or a disclosure drawer; never rendered on client-context.

### Mobile adaptation

- Dashboards and Client Portal fully mobile.
- Advanced workspace: read-only mobile view with "edit on desktop" chip.
- Basic Mode: mobile-first.
- Document upload: uses device camera.
