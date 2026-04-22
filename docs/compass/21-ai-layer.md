# 21. AI Layer

Compass uses AI as an **assistive, citation-bound, scope-limited capability**, not as an autonomous advisor. The AI layer accelerates work; it does not replace advisor judgment, override compliance rules, or invent facts. This section specifies where AI is allowed, where it's forbidden, how hallucinations are mitigated, and how compliance is preserved.

---

## 21.1 AI roles

AI in Compass performs only these roles:

1. **Summarization.** Translate household data into plain-English summaries.
2. **Translation & simplification.** Turn technical content into client-friendly language.
3. **Insight explanation drafting.** Draft the narrative of an engine-generated insight (the engine makes the judgment; AI words it).
4. **Recommendation summary drafting.** Draft the narrative of an advisor-proposed recommendation (the advisor chooses; AI words it).
5. **Missing data identification.** Detect and list data gaps and likely-useful next data points.
6. **Scenario narrative comparison.** Produce plain-English comparisons between baseline and named scenarios.
7. **Meeting notes drafting.** From timestamps + captured notes, produce a structured meeting summary.
8. **Annual review drafting.** Produce the "what changed" and "what's next" narrative from score/data deltas.
9. **Next-step task list generation.** Turn insights and meeting outcomes into concrete, owned tasks.
10. **Score-change explanations.** Explain why a score moved.
11. **Conflict and blind-spot surfacing.** Draft notes about contradictions the engine has detected (not invented).

**Non-roles (explicit):**
- Never generates a plan without underlying engine data.
- Never produces product recommendations.
- Never infers a legal/tax/medical conclusion.
- Never creates synthetic numbers.

---

## 21.2 Allowed vs approval-required vs forbidden

### Allowed without extra approval
- Drafting plain-English copy from engine output (the facts/numbers come from the engine).
- Suggesting tasks from an insight.
- Drafting a summary of a meeting the advisor conducted.
- Suggesting a glossary definition.

### Approval required (advisor review before client-visible)
- Any client-facing narrative involving sensitive topics (eldercare, special-needs, mortality).
- Any tax observation narrative.
- Any suitability-related narrative.
- Any advisor-tone draft that will be sent to a client.
- Any scenario narrative that will be exported.

### Forbidden
- Picking specific products / tickers / funds / policies.
- Issuing buy/sell/subscribe/surrender directives.
- Generating content when source data is missing ("creative" finance writing).
- Adding numbers not in engine output.
- Modifying scores.
- Taking actions in external systems.
- Operating without citations on its outputs.

---

## 21.3 Hallucination controls

- **Source-binding.** Every AI output carries a **citation set**: the exact `field_id`s, `score_id`s, `scenario_id`s, or `document_id`s used. If AI cannot cite, it cannot output.
- **Data-conditioned generation.** AI prompts are structured so the model is given (a) relevant engine output and (b) constrained copy templates. Free-form generation is disallowed for anything that contains numbers.
- **No math from the model.** All numbers displayed in AI-generated copy are **pulled verbatim** from the engine. The model's job is language, not arithmetic.
- **Fact-check pass.** A lightweight rule-based post-check verifies that numbers in AI output match engine numbers. A mismatch blocks publication.
- **Template library.** Insight and recommendation templates constrain voice, structure, and omissions.
- **Model contract.** The model receives a system prompt that enumerates these constraints and refusal behaviors.
- **Refusal UX.** When AI cannot complete a request safely, it returns a clear refusal with "reason" and a path forward (e.g., "I need the latest expense numbers to summarize this section").

---

## 21.4 Citation display

Every AI-generated surface includes a "Sources" disclosure (chip or drawer) listing:

- Engine outputs used.
- Specific fields used.
- Documents used.
- Assumption set version.

Clicking a source opens the underlying item.

---

## 21.5 Advisor review workflow

- AI-generated content destined for client view appears in a **staging area**:
  - Advisor sees the generated copy with citations.
  - Advisor can accept, edit, or regenerate.
  - Edited copy is stored with "edited from AI draft" tag.
- Published copy records:
  - Original AI draft.
  - Any advisor edits.
  - Actor and timestamp.
- Approval required toggles can be set at firm level.

---

## 21.6 Client-facing language constraints

- Reading level ≤ 8th grade for insight summaries.
- No superlatives, no alarmism, no jargon without glossary.
- No cultural / political / religious references.
- Respectful framing for sensitive subjects (illness, disability, mortality, divorce).
- No promises about returns, outcomes, or market direction.
- No implied regulatory claims.

A **copy guard** rule set blocks outputs that violate these constraints; violations are routed back to the model with a reshape instruction.

---

## 21.7 Compliance review support

- AI-generated content included in any compliance artifact (e.g., suitability summary) is flagged as AI-assisted.
- The audit trail captures:
  - Prompt template id and version.
  - Model name and version.
  - Input context (engine outputs + document ids).
  - Output text.
  - Citations.
  - Approvals (who approved, when).
- Compliance can filter the audit log by "AI-assisted" and export.

---

## 21.8 Sensitive data handling

- Data sent to model is **minimized**: only the specific fields necessary for the task; no bulk household dumps.
- Highly sensitive fields (health, disability, special-needs) require an explicit feature flag per household to be included in prompts.
- Models are configured with:
  - No training on customer data.
  - No retention on the provider side beyond processing.
  - Region-appropriate data residency (configurable).
- Tokens and requests are logged (metadata only); prompt/response content encrypted at rest.
- Self-serve users are informed transparently when AI drafted a surface they see.

---

## 21.9 User-visible AI affordances

- **"Drafted by AI (advisor reviewed)"** chip on sections where applicable.
- **"Sources"** button to reveal citations.
- **"Regenerate"** and **"Edit"** on advisor-only surfaces.
- **Never show** AI chat as the primary interaction; AI is assistive within forms, insights, reports, and meetings — not a chatbot replacing the product UX.

---

## 21.10 AI for advisors (in-product)

- **Draft meeting prep.** Given household state + upcoming meeting, produce a meeting-prep card (top insights, tasks, questions).
- **Draft meeting summary.** After a meeting, produce a summary from notes + tasks created.
- **Draft annual review deck copy.** From year-over-year deltas.
- **Draft recommendation rationale.** Given advisor's chosen category and household context, draft the rationale for the compliance record; advisor edits and signs.
- **Data-gap assistant.** "What should we ask the client next to unlock the best insights?" returns a ranked list of missing fields tied to expected insight uplift.
- **Contradiction narrator.** Produces plain-English narration of engine-detected contradictions (it does not detect them itself).

---

## 21.11 AI for self-serve clients

- **Section summaries.** After Basic Mode or Advanced Mode completion, a plain-English paragraph per section.
- **Insight narratives.** Plain-English wording of engine-produced insights.
- **Glossary on demand.** "Explain this term" inline.
- **Help with next step.** "Help me understand what to do next" explains the top task contextually.

AI is not a planner for the self-serve user; the engine is. AI just narrates.

---

## 21.12 Prompt and template governance

- All prompts stored as versioned templates in `ai_prompts/`.
- Each template has:
  - `id`, `version`,
  - `purpose`,
  - `inputs_schema`,
  - `outputs_schema`,
  - `constraints` (from Section 21.6),
  - `post_checks` (hallucination/fact-check rules),
  - `approvals_required` flag.
- Templates are reviewed and approved by product + compliance before rollout.
- Changes to a template generate a new version; audit records which version produced each output.

---

## 21.13 Safeguards against drift

- Regular eval suite with golden cases: for each prompt template, a set of inputs and expected-property outputs (e.g., "does not mention tickers," "numbers match," "reading level ≤ 8").
- Automated comparison on each model or template change.
- Human spot-check sampling on production outputs (with privacy redaction) for quality.
- Red-team scenarios: adversarial inputs that attempt to get AI to produce advice beyond scope; verified refusals.

---

## 21.14 Failure modes and fallbacks

- Model unavailable → show engine output without narrative; UI still fully functional.
- Model returns disallowed content → rule-based sanitizer strips and re-requests; if persistent, fall back to template-only output.
- Latency budget exceeded → show skeletons, complete when available; never block a dashboard on AI.

---

## 21.15 AI boundaries summary (for stakeholders)

> Compass AI *writes clearly about* the plan. It does not *make* the plan. The engine makes the plan. The advisor decides. AI is the translator.
