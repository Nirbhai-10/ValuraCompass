# 23. Design System and Brand Incorporation

Compass looks like it belongs in a **private banking conversation**, not a retail app. Premium, minimal, analytical, calm. This section specifies the design system and how Valura.ai's brand assets are used without making the product loud.

Brand palette (provided): `#4CAF50` (primary) · `#0F5132` (deep) · `#D4EDDA` (tint) · `#F5F7FA` (canvas) · `#FFFFFF` (surface).

---

## 23.1 Design principles

1. **Calm over loud.** Negative space is the primary design tool.
2. **Clarity over cleverness.** Every page answers "what do I need to do with this?" in ≤ 3 seconds.
3. **Hierarchy over density.** Information density is achieved through typography hierarchy and progressive disclosure, not by cramming.
4. **Signal over decoration.** Colors, motion, and icons are signals.
5. **Trust via restraint.** Gradients, drop-shadows, and motion are applied sparingly.
6. **Accessibility from day one.** Contrast and keyboard navigation are never afterthoughts.
7. **Consistency across modules.** The shell is the product identity; modules inherit it.

---

## 23.2 Color system

### Brand palette
- **Brand Green** `#4CAF50` — primary accent; used for positive chips, success states, small highlights.
- **Deep Green** `#0F5132` — structural primary; headings, primary CTAs, navigation active state.
- **Mint Tint** `#D4EDDA` — subtle highlight, positive pill background; never for body text backgrounds over dense content.
- **Canvas** `#F5F7FA` — app background behind cards.
- **Surface** `#FFFFFF` — card / surface background.

### Neutral scale
- `Ink 900` `#0F172A` — primary text.
- `Ink 700` `#334155` — secondary text.
- `Ink 500` `#64748B` — tertiary text.
- `Line 200` `#E2E8F0` — default border / divider.
- `Line 100` `#F1F5F9` — subtle divider.

### Severity palette (distinct from brand)
- **Critical** `#B91C1C` — red, reserved for critical severity; never as a background.
- **High** `#C2410C` — deep orange.
- **Medium** `#A16207` — amber.
- **Low** `#0E7490` — teal (distinct from brand green).
- **Informational** `#334155` — neutral.

### Semantic palette
- **Positive** `#4CAF50` (brand green) — used only for clear positive outcomes.
- **Warning** `#C2410C`.
- **Negative** `#B91C1C`.
- **Neutral** `#334155`.

### Rules
- Brand green is **never used for severity** (avoids confusion).
- Deep green is the structural anchor.
- Severity reds are not used for primary navigation or structural elements.
- Backgrounds: 85% of surface area is white/canvas. Brand tints never dominate a page.

---

## 23.3 Typography

### Family
- **Primary UI.** A humanist sans (e.g., Inter, or a licensed equivalent if brand requires) with a wide weight range.
- **Display / Accent.** Optional premium serif (e.g., Source Serif, or a brand-approved face) used sparingly on report covers and executive summaries.
- **Numbers.** Tabular figures enabled for financial data (cards, tables, charts).

### Scale (web)
- `display-2xl` 40/48 — report covers only.
- `display-xl` 32/40 — page titles on reports.
- `h1` 28/36 — section titles in reports.
- `h2` 22/30 — workspace section titles.
- `h3` 18/26 — card titles.
- `body-lg` 16/26 — primary body (Meeting Mode default).
- `body` 14/22 — default body.
- `caption` 12/18 — metadata, footnotes.
- `overline` 11/16 (tracking 1.5) — chip and label.

### Weights
- Display: 500.
- Headings: 600.
- Body: 400.
- Emphasis: 500.
- Avoid 300 or <400 for body in client-facing surfaces.

### Rules
- **One visual weight per hierarchy level.**
- **Sentence case** for titles.
- **No ALL CAPS** except in small overlines or legal footers.
- **Line length** capped at 72 characters for body copy.

---

## 23.4 Spacing system

- Base unit: 4px.
- Scale: 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96.
- Components use multiples of 4 for padding/margin.
- Section spacing in dashboards: 32–48.
- Card inner padding: 20 or 24.

---

## 23.5 Layout

- 12-column grid; gutter 24; max content width 1200 (desktop), 1440 for Advanced workspace.
- Left rail 232 expanded, 64 collapsed.
- Right rails 320.
- Workspace modules fill the inner canvas.
- Dashboards use card grid (3–4 columns above the fold).

---

## 23.6 Cards

- Background: `#FFFFFF`.
- Border: 1px `Line 200`.
- Radius: 12 (default); 16 for hero cards.
- Shadow: none by default; on hover, a subtle shadow (0 2 8 rgba(0,0,0,0.04)).
- Inner padding: 20 / 24.
- Header: 14/22 semibold ink-900 with optional chip.
- Footer: 12/18 caption with secondary actions aligned right.

---

## 23.7 Buttons

- **Primary.** Background `#0F5132`, text white. Height 40 (default), 48 (meeting mode). Hover darkens 6%.
- **Secondary.** Border 1px `#0F5132`, text `#0F5132`, background white.
- **Tertiary / text.** `#0F5132` text only, underline on hover.
- **Destructive.** Border red; red text; reserved for irreversible actions.
- **Disabled.** 40% opacity; text and border desaturate.
- Icons inside buttons: 16px; text gap 8.

---

## 23.8 Form controls

- Inputs: 40 tall; radius 8; border `Line 200`; focus ring 2px deep green with 2px offset.
- Labels: 12 overline above input, 8 below for helper text.
- Error: inline 12 caption with red dot, never red background fill.
- Success (rare): inline 12 caption with subtle green dot.
- Chips: 28 tall; radius 999; 12 caption; color-coded by semantic meaning.
- Selects: same as inputs; dropdown panel with 12 radius, 16 padding.
- Sliders: track `Line 200`, thumb deep green.

### Form rules
- One clear question per screen in Basic Mode; 4–8 fields max per step.
- Helper text appears under inputs, not in tooltips, for critical fields.
- Never use placeholder text as the only label.

---

## 23.9 Charts

- Chart library: D3 or comparable; custom theme.
- Palette:
  - Primary series: `#0F5132`.
  - Secondary series: `#334155`.
  - Tertiary: `#64748B`.
  - Positive markers: `#4CAF50`.
  - Severity accents drawn from severity palette.
- Axes: thin lines `Line 200`; labels in `caption`.
- Grid: minimal; horizontal only in most cases.
- Tooltips: white card, radius 8, 1px border, caption type, tabular nums for values.
- Motion: subtle 180ms ease-out for initial draw; no bouncing.
- Accessibility: every chart has a data-table alternative + alt text.
- Chart types:
  - Score ring (radial progress).
  - Sparkline for trend.
  - Fan chart for probabilistic paths.
  - Tornado chart for sensitivities.
  - Allocation donut.
  - Timeline for goals.
  - Dependency graph for Household Map (Section 17).

---

## 23.10 Iconography

- Monoline icons, 1.5 stroke weight, 20x20 default.
- Library: a custom or open set (Lucide or similar), theme-tinted `Ink 700` by default.
- Domain icons (household member, goal, asset class) are subtle symbolic; no illustrations in icon slots.

---

## 23.11 Severity color logic

- **Critical.** Red chip or small dot; never red banner.
- **High.** Orange chip.
- **Medium.** Amber chip.
- **Low.** Teal chip.
- **Informational.** Neutral chip.
- **Resolved.** Mint tint chip with green dot.
- Severity colors always paired with an icon or text label (no color-alone encoding).

---

## 23.12 Alert behavior

- Alerts appear as **chips or cards**; never full-width red banners.
- Critical alerts add a small red dot and bold title.
- Dismissible alerts are rare; most are resolved by the user taking the action.
- Toasts used sparingly; limited to 2–3s.
- System banners used only for global disruption (maintenance).

---

## 23.13 Progressive disclosure rules

- **Short first, long on request.** Cards show 1–2 key stats; "See details" opens a drawer.
- **Advanced depth hidden in Basic Mode** (Section 4).
- **Drawers over modals** when content is exploratory.
- **Modals reserved** for decisive actions (confirm, create, approve).

---

## 23.14 Motion

- Standard durations: 120ms (micro), 180–240ms (component), 320ms (panel slides).
- Easings: ease-out on reveal; ease-in on dismiss.
- No bouncing, no elastic, no 3D tilt.
- Loading: skeletons; rotating icon only if > 1.2s.
- Score changes animate 400ms with a tiny chip showing delta.

---

## 23.15 Differences between Basic and Advanced

- Basic: larger type, more white space, fewer cards per screen, softer iconography usage.
- Advanced: denser information, more charts, more tabs, smaller caption usage. Meeting Mode enlarges type by 2 steps and simplifies tabs.
- Color palette is the same; spacing and density change.
- Both modes share the exact component library to ensure consistency.

---

## 23.16 Brand color usage guidance

- **Do.** Use deep green for structure and primary CTAs; brand green for positive chips; mint tint for subtle positive highlights or section bands.
- **Don't.** Use brand green everywhere (fatigue); use mint as a dense background; use bright green on severity; combine brand greens with strong ambers in close adjacency.
- **Large surfaces.** Always white or canvas.

---

## 23.17 Logo usage

- **Primary logo.** Valura.ai full wordmark on light backgrounds.
- **Icon mark.** Standalone "V" mark on compact spaces (top rail, favicon, small chips).
- **Minimum size.** Full wordmark 24px tall; icon mark 16px.
- **Clear space.** Half the cap-height of the mark around all sides.
- **Placement.** Top-left of the shell on web; top-left of PDFs.
- **Never.** Stretch, recolor, outline, add effects, place on photography, or on busy gradients.
- **Co-brand.** Firm logo optional top-right; equal gravity rule.

---

## 23.18 Report visual treatment

- **Cover.** Optional serif display for report title; Valura mark top-left; generated date and version id bottom-right.
- **Internal pages.** Clean hierarchy; ample margins; numbered pages.
- **Sections.** Section dividers use deep green rule 1px and an uppercase overline.
- **Charts.** Same palette as web; slightly increased stroke for print clarity.
- **Appendix.** Smaller body, same hierarchy.

---

## 23.19 Dark mode (later consideration)

- V1 ships light mode only.
- Architecture supports theming (CSS variables / design tokens).
- Dark mode explored in Phase 2 with calibrated severity colors.

---

## 23.20 Accessibility

- WCAG 2.1 AA baseline; AAA on primary content.
- Minimum contrast 4.5:1 for body; 3:1 for large text.
- Keyboard navigation all primary flows.
- Focus rings always visible (deep green, 2px).
- Motion respects `prefers-reduced-motion`.
- Color not the only signal on severity.

---

## 23.21 Design tokens (example shape)

```
--color-brand-green: #4CAF50;
--color-deep-green: #0F5132;
--color-mint: #D4EDDA;
--color-canvas: #F5F7FA;
--color-surface: #FFFFFF;
--color-ink-900: #0F172A;
--color-ink-700: #334155;
--color-ink-500: #64748B;
--color-line-200: #E2E8F0;
--color-severity-critical: #B91C1C;
--color-severity-high: #C2410C;
--color-severity-medium: #A16207;
--color-severity-low: #0E7490;
--radius-card: 12px;
--radius-button: 8px;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 32px;
--space-8: 40px;
--shadow-card: 0 2px 8px rgba(0,0,0,0.04);
--font-body: "Inter", system-ui, sans-serif;
--font-display: "Source Serif", Georgia, serif;
```

---

## 23.22 Component library checklist (V1)

- Buttons (primary, secondary, tertiary, destructive, loading).
- Chips (severity, filter, status).
- Inputs (text, number, currency, date, select, multi-select, slider, toggle).
- Cards (basic, KPI, insight, action, person, goal).
- Tables (sortable, filterable, resizable).
- Tabs.
- Drawers (right/left/bottom).
- Modals.
- Toasts.
- Banners (use sparingly).
- Empty / loading / error states.
- Progress bars and rings.
- Stepper for Basic Mode.
- Household Map node and edge variants.
- PDF report layouts (cover, section, appendix).
- Deck slide templates (Annual Review).
