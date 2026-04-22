# 17. Family Map / Household Intelligence Map

The **Household Intelligence Map** (short: "Family Map") is Compass's signature feature. It is the single most useful surface for understanding a household. It replaces 40 rows of a spreadsheet with a graph that answers the questions advisors and clients actually ask: *who depends on whom, who earns, who is vulnerable, and what happens if something changes.*

---

## 17.1 What it represents

A live, editable, filterable graph of the household:

- **Members.** People and (where relevant) entities (e.g., a family trust, a company) as nodes.
- **Relationships.** Typed edges: spouse, parent, child, sibling, in-law, partner, guardian, caregiver, ward, nominee, beneficiary.
- **Dependencies.** Financial support direction and intensity.
- **Earning roles.** Who produces income; primary vs secondary earners.
- **Vulnerability flags.** Age-related, health-related, single-earner exposure, caregiver burden, special-needs.
- **Support obligations.** Who supports whom and for how long.
- **Insurance links.** Policies linked to people (insured, owner, nominee).
- **Goals links.** Goals tied to specific members (e.g., a child's education).
- **Liabilities links.** Loans that affect specific members (e.g., education loan for a child).
- **Nominee & beneficiary relationships.** Across assets, policies, accounts.
- **Succession paths.** Planned or intended flows.
- **Caregiving links.** Who provides care; hours/week indicated.
- **Special-needs support requirements.** Presented with care (see sensitivity rules).
- **Cross-border family links.** Members or obligations in other jurisdictions with visible flags.

## 17.2 How it works

### Data model backing
- Nodes: `person` or `entity` from the household.
- Edges: `relationship`, `dependency`, `nominee_link`, `goal_link`, `policy_link`, `liability_link`, `caregiver_link`, `beneficiary_link`, `succession_link`.
- Annotations: vulnerability flags, earnings rank, support amount, duration, and cross-border flags.

### Graph layout
- Force-directed with role-aware clustering (earners clustered near the top; dependents below; extended family grouped to the sides).
- Stable layout — layout positions are remembered per household; manual nudges persist.
- Zoom & pan; keyboard `+` / `-` / arrow keys.

### Filters (chips)
- **Earnings** — show income sources and flow.
- **Obligations** — show financial dependencies.
- **Insurance** — show life & health policies linked to members.
- **Goals** — show goals tagged to members.
- **Nominees** — show nominee coverage and gaps.
- **Beneficiaries** — show insurance beneficiary consistency.
- **Special-needs / eldercare** — isolated view with sensitivity framing.
- **Cross-border** — highlight members/assets/obligations in other jurisdictions.

### Overlays
- **Vulnerability overlay.** Nodes with a discreet indicator (small dot) when flagged.
- **Gap overlay.** Edges with gaps (missing nominee, policy exclusion) shown as dashed with a gentle warning color.
- **Intensity overlay.** Edge thickness ∝ support intensity; line style (solid/dashed) indicates confidence or expected duration.

### Interactions
- Click a node → **Member drawer** with: summary, income, risk, policies, assets, goals, actions.
- Click an edge → **Relationship drawer** with: dependency type, intensity, duration, notes, linked actions.
- Right-click → Quick actions (add nominee, add goal, add note).
- `G M` in keyboard nav opens the map.

---

## 17.3 How it looks (visual direction)

- Canvas: `#F5F7FA` background, members as rounded avatars with name + 2-line chip summary.
- Earners: subtle deep green (`#0F5132`) rim; non-earners: neutral rim.
- Dependents: soft mint (`#D4EDDA`) chip.
- Vulnerability: a small amber dot (never red by default).
- Cross-border: a small globe icon beside the member.
- Edges: thin, quiet lines; labels reveal on hover.
- Typography: premium serif for household name (used sparingly) if brand allows; sans for nodes and labels.
- Motion: cards grow gently on focus (180ms ease-out); no bouncy animations.

The aesthetic target is **calm, like a private banking screen**, not a social-network visualization.

---

## 17.4 Variants by view

- **Individual view.** A small version of the map showing just the person and their immediate connections (spouse, parents, children if any). The full household is available with one tap.
- **Couple view.** Two central nodes (the couple) with shared and separate assets, joint goals, and any parents each supports.
- **Family view.** Full graph; the default for households with dependents or parents.

---

## 17.5 Sensitivity rules

- Health, disability, and special-needs indicators are never displayed without an explicit privacy acknowledgment on first visit.
- The default label is functional and respectful: "Primary caregiver," "Lifelong support required," "Chronic condition (planning context)" — customizable by the household.
- Severity colors muted for sensitive elements; red avoided.
- Advisors can annotate with clinical shorthand only in internal notes, never on client-visible nodes.

---

## 17.6 How it helps advisors discover gaps faster

- **One-glance view of dependency fragility.** Single-earner + multiple dependents + thin cover is a familiar pattern the map makes obvious.
- **Nominee gaps become visible instantly** when the Nominees filter is on — missing or mismatched relationships show as dashed edges.
- **Beneficiary inconsistencies** (e.g., policy beneficiary differs from will beneficiary) surface as a labeled conflict.
- **Cross-border complexity** is surfaced with a simple flag, so the advisor knows to invoke Advanced Mode cross-border modules.
- **Eldercare and special-needs planning** have their own filters, reducing the chance these are overlooked.

---

## 17.7 How it helps clients understand their plan emotionally

- **Faces and names, not rows.** The map makes the plan about people.
- **Flows they recognize.** "My income supports 4 people; one is my mother; two are my kids."
- **A personal narrative surface** for the insight cards: "When we strengthen your term cover, this edge gets stronger."
- **Agency through visibility.** Clients can see where their plan protects whom.

---

## 17.8 How it becomes a differentiator

- **First-class primitive.** Most planning tools bury family as a footnote; Compass treats the household as the unit of planning.
- **Live and filterable.** Insights and actions speak to the map directly; the map is not decorative.
- **Seamless in meetings.** Advisors can screenshare the map in Meeting Mode without exposing internals; the map is the conversation.
- **India-specific support.** Joint family, parents supported, in-laws, cross-border links are treated as standard, not special cases.

---

## 17.9 Interactions with other modules

- **Insurance.** Adding/removing a policy updates the policy edges on the map and recomputes PAS.
- **Goals.** Tagging a goal to a person adds a goal edge; the goal's funding plan shows on the member drawer.
- **Risk & Suitability.** Household risk considerations are visible from the map via member vulnerability and dependency intensity.
- **Tax.** Cross-border flags on members surface observation chips in the tax module.
- **Estate.** Guardianship and nominee data are shown and editable from the map.

---

## 17.10 Example interactions

- **Advisor in a meeting:** toggles Insurance filter; an edge shows a missing nominee on a home loan-linked insurance; the advisor creates a task from the edge drawer ("Correct nominee on policy #X").
- **Client self-serve:** clicks their mother node; sees "Supported: ₹30,000/mo" + "No dedicated healthcare reserve"; taps the insight chip; is offered a 'Build healthcare reserve' action.
- **NRI household:** toggles Cross-border; two members in GCC surface; parents in India surface; advisor opens residency details and adds a cross-border observation.

---

## 17.11 Accessibility

- The map is always paired with a **"list view"** toggle that presents the same data as a structured, accessible list.
- Tooltips include text alternatives.
- Keyboard nav for every node and edge; focus ring clearly visible on non-color dark borders.

---

## 17.12 Export

- A static PDF export of the map is included in the Advanced Plan Report and Annual Review Deck.
- Exports respect privacy scopes (e.g., special-needs indicators excluded unless explicitly included).
