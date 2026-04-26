# Financial Planning Compass — Product Blueprint

**Company:** Valura.ai
**Product:** Compass (Financial Planning Compass)
**Primary market:** India · **Secondary:** GCC, Global
**Users:** RIAs, wealth managers, MFDs, insurance advisors, CA offices, research advisors, financial planners, self-serve retail clients, couples, families, young professionals, mass affluent, HNI/UHNI, NRI/cross-border households, families with elderly parents or special-needs dependents.
**Brand palette:** `#4CAF50` primary · `#0F5132` deep · `#D4EDDA` tint · `#F5F7FA` canvas · `#FFFFFF` surface.

This directory is the operational product blueprint for Compass. It is written to be handed to a serious design/build agent and is structured as 27 sections.

## Index

| # | Section | File |
|---|---|---|
| 1 | Executive Product Vision | [`01-executive-vision.md`](01-executive-vision.md) |
| 2 | Target User Types and Personas | [`02-personas.md`](02-personas.md) |
| 3 | Core Product Principles | [`03-principles.md`](03-principles.md) |
| 4 | Product Modes (Basic / Advanced) | [`04-product-modes.md`](04-product-modes.md) |
| 5 | Region Framework | [`05-region-framework.md`](05-region-framework.md) |
| 6 | Information Architecture | [`06-information-architecture.md`](06-information-architecture.md) |
| 7 | Deep Data Model | [`07-data-model.md`](07-data-model.md) |
| 8 | Onboarding Flows | [`08-onboarding-flows.md`](08-onboarding-flows.md) |
| 9 | Basic Mode Question Framework | [`09-basic-mode.md`](09-basic-mode.md) |
| 10 | Advanced Mode Discovery Framework | [`10-advanced-mode.md`](10-advanced-mode.md) |
| 11 | Analytics Engine | [`11-analytics-engine.md`](11-analytics-engine.md) |
| 12 | Risk Profiling & Suitability | [`12-risk-suitability.md`](12-risk-suitability.md) |
| 13 | Tax-Aware Planning Engine | [`13-tax-aware-planning.md`](13-tax-aware-planning.md) |
| 14 | Insight Engine | [`14-insight-engine.md`](14-insight-engine.md) |
| 15 | Dashboards | [`15-dashboards.md`](15-dashboards.md) |
| 16 | Screen-by-Screen UX | [`16-screens-ux.md`](16-screens-ux.md) |
| 17 | Family / Household Intelligence Map | [`17-family-map.md`](17-family-map.md) |
| 18 | Action Center | [`18-action-center.md`](18-action-center.md) |
| 19 | Documents & OCR Ingestion | [`19-documents-ocr.md`](19-documents-ocr.md) |
| 20 | Reports & Outputs | [`20-reports-outputs.md`](20-reports-outputs.md) |
| 21 | AI Layer | [`21-ai-layer.md`](21-ai-layer.md) |
| 22 | Compliance, Auditability, Governance | [`22-compliance-audit.md`](22-compliance-audit.md) |
| 23 | Design System & Brand Incorporation | [`23-design-system.md`](23-design-system.md) |
| 24 | Differentiation vs Category | [`24-differentiation.md`](24-differentiation.md) |
| 25 | MVP, Roadmap, Tech Direction | [`25-roadmap-tech.md`](25-roadmap-tech.md) |
| 26 | Edge Cases & Special Scenarios | [`26-edge-cases.md`](26-edge-cases.md) |
| 27 | Final Deliverables | [`27-final-deliverables.md`](27-final-deliverables.md) |

## Reading order

- **Strategy / stakeholders:** 1 → 2 → 3 → 24 → 27
- **Product managers:** 4 → 6 → 8 → 9 → 10 → 14 → 18 → 20 → 25
- **Designers:** 15 → 16 → 17 → 23 → 9 → 10
- **Engineers / architects:** 5 → 7 → 11 → 12 → 13 → 19 → 21 → 22 → 25
- **Compliance / risk:** 12 → 13 → 21 → 22 → 26

## Conventions used throughout

- **Basic** = under-10-minute planning snapshot. **Advanced** = live interview / deep planning workspace.
- **Region** keys: `IN` (India, default), `GCC` (UAE/KSA/Qatar/Oman/Bahrain/Kuwait cluster), `GLOBAL` (generic fallback).
- **Facts vs assumptions:** every stored datum carries `source` (`user_entered | ocr | imported | derived | assumed_default`) and `confidence` (`0–1`).
- **Owner tags** on tasks and insights: `advisor | client | spouse | compliance | specialist`.
- **Severity tokens:** `critical | high | medium | low | informational`.
- **Mode tokens per field/module:** `basic | advanced | both`.
- **Visibility tokens:** `client | advisor | internal | shared`.
