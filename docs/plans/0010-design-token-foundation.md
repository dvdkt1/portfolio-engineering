# Plan 0010: Design-token foundation for the Portfolio OS visual theme

- Status: `draft`
- Date: 2026-10-12
- Spec: none — see [Inputs](#inputs) for the recorded override
- Audience: [coding-agents, uxd, governance-agents, adr-architect, humans]

## Progress

Executing agents keep this block current. It is the entry point for any agent resuming this plan.

- Current effort: E-03
- Completed efforts: E-01, E-02
- Blocked tasks: T-07.3, T-07.4 (deferred until a theme-preference spec exists; see R-2)
- Next recommended task: T-03.2 (apply Figma Light color values)
- Last updated: 2026-10-15

| Effort | Title | Tasks | Done | Status |
| --- | --- | --- | --- | --- |
| E-01 | Design inputs, decisions, and baseline | 4 | 4 | done |
| E-02 | Token layer structure (no visual change) | 4 | 4 | done |
| E-03 | Light theme, typography, radius, elevation values | 5 | 1 | in-progress |
| E-04 | Remove hard-coded visual values from shared layers | 4 | 0 | pending |
| E-05 | Remaining four themes | 4 | 0 | pending |
| E-06 | Accessibility verification and drift review | 2 | 0 | pending |
| E-07 | Theme selection and persistence (deferred) | 4 | 0 | blocked |

## Summary

Introduce a single semantic CSS-custom-property token layer, driven by the Figma Foundations (color, font families, type, spacing/radius, elevation), that every existing stylesheet and Tailwind utility consumes. The five Figma themes become `[data-theme]` blocks that redefine the same semantic tokens; Tailwind remains a consumer of those variables rather than a second source of truth. This is a visual skin swap: no layout, routing, data, or behavior changes. Theme selection UI and persistence are described but deferred.

## Inputs

- **Spec readiness at planning time:** No spec exists. **User override recorded 2026-10-12:** the user explicitly requested this plan from a direct brief (Vy Hoang's Figma design system and styling plan). This plan uses number 0010 because 0009 is reserved for another feature. If `business-requirements` later writes a spec for this work, it should take number 0010 so the pairing holds (see R-2).
- **Figma (source of truth):** file `4ffzXpXtH6B9JEAzZtSzmW` ("Portfolio-operating-system-Wireframes"); Foundations nodes Color `613:8`, Font families `637:2`, Type `614:4528`, Spacing and radius `614:4599`, Elevation `614:4675`. Supplied exports were inventoried in [design-token-foundations.md](../uxd/research/design-token-foundations.md) and [design-tokens.json](../uxd/flows/design-tokens.json).
- **ADRs reviewed:** 0001–0018. Applicable: [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md), [0018](../ADRs/0018-use-figma-semantic-tokens-for-frontend-themes.md). Context only: [0013](../ADRs/0013-deployment-modes-and-passwordless-local-profiles.md) (local mode informs font hosting), [0007](../ADRs/0007-use-cwl-editor-behind-an-owned-markdown-editor.md)/[0012](../ADRs/0012-defer-wysiwyg-engine-selection-behind-an-owned-markdown-editor.md) (editor styling, conditional in T-04.4), [0017](../ADRs/0017-standardize-data-grid-list-behaviors.md) (grid behaviors must not change). Not applicable: 0001–0004, 0006, 0008–0011, 0014–0016 (no data, routing, auth, or content work).
- **UX artifacts used:** [ui-scaffold-contract.json](../uxd/flows/ui-scaffold-contract.json) — `constraints.theming.currentState = "single-light-theme"`, `themeSwitcher = "planned-preferences-surface-only"`, `implementationRule = "use-semantic-design-tokens"`. No design-handoff accessibility document was found in the repo (R-10).
- **Schema reference:** not applicable until E-07 (per-profile persistence, if chosen).
- **Intersecting tech debt:** [checklist.md](../tech-debt/checklist.md) TD-016 (source-regex UI tests break on class-name refactors — E-04 class changes may trip these tests in `SecurityMasterPage.test.tsx`). No styling-specific debt items exist.

### Codebase facts this plan relies on (verified 2026-10-12)

| Fact | Evidence |
| --- | --- |
| Tailwind **v3.4** is an active, load-bearing part of styling. `@tailwind base/components/utilities` are at the top of `index.css`; PostCSS runs `tailwindcss` + `autoprefixer`. | [index.css](../../apps/frontend/src/index.css), [postcss.config.js](../../apps/frontend/postcss.config.js), [package.json](../../apps/frontend/package.json) |
| Styling is hybrid: `App.css` (~250 lines) owns shell/workspace/settings classes; `components/ui/*` and feature components (e.g. `HelpTooltip`, `JournalReviewTable`, `MarkdownViewer`, `SecurityMasterPage`) use Tailwind utilities. | [App.css](../../apps/frontend/src/App.css), [components/](../../apps/frontend/src/components) |
| A semantic token vocabulary already exists in `:root` (`--color-text-*`, `--color-bg-canvas`, `--color-surface-*`, `--color-border-subtle`, `--color-action-primary[-soft]`, `--color-state-*`, `--shadow-elevation-soft`) plus legacy short aliases (`--text`, `--bg`, `--accent`, `--panel-bg`, …). | [index.css](../../apps/frontend/src/index.css) |
| `tailwind.config.ts` maps those variables into `theme.extend.colors`/`boxShadow`, and hard-codes `fontFamily`, `borderRadius` (sm/md/lg), and `spacing` (xs–xl) literals. `darkMode: ['class']` is set but unused. `@tailwindcss/typography` is enabled. | [tailwind.config.ts](../../apps/frontend/tailwind.config.ts) |
| `App.css` colors are almost fully tokenized (one `#ffffff`), but radii and spacing are literals. Only breakpoint: `@media (min-width: 768px)`. | [App.css](../../apps/frontend/src/App.css) |
| UI primitives reference **undefined** Tailwind tokens: `ring-ring`, `ring-offset-background` (focus rings currently render without the intended color), and `tailwindcss-animate` classes (`animate-in`, `fade-in-0`, `zoom-in-95`, …) with the plugin not installed. Also literals: `text-white`, `bg-black/50`, `shadow-lg`, alpha modifiers on var colors (`bg-action-primary/90`). | [button.tsx](../../apps/frontend/src/components/ui/button.tsx), [input.tsx](../../apps/frontend/src/components/ui/input.tsx), [dialog.tsx](../../apps/frontend/src/components/ui/dialog.tsx), [HelpTooltip.tsx](../../apps/frontend/src/components/HelpTooltip.tsx) |
| `MarkdownViewer` uses `prose prose-slate` (hard-coded slate palette). | [MarkdownViewer.tsx](../../apps/frontend/src/components/MarkdownViewer.tsx) |
| `body` has a hard-coded `rgba(79, 70, 229, 0.09)` radial gradient; `color-scheme: light` is fixed on `:root`. | [index.css](../../apps/frontend/src/index.css) |
| No fonts are loaded (`index.html` has no font links; `public/` has no font files). No theme switching, `data-theme`, or `prefers-color-scheme` handling exists. | [index.html](../../apps/frontend/index.html) |
| No visual-regression or a11y tooling; frontend tests run via `tsx --test` with an explicit file list in the `test` script. | [package.json](../../apps/frontend/package.json) |
| `packages/ui` exports `NotYetImplemented`, consumed by `JournalPage.tsx`. | [packages/ui/src](../../packages/ui/src) |

## Applicable ADRs

| ADR | Applies because | Binds efforts |
| --- | --- | --- |
| [0005 Tailwind CSS + shadcn/ui](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) | All work changes frontend styling, tokens, Tailwind config, and `components/ui` primitives. | E-02, E-03, E-04, E-05, E-06, E-07 |
| [0018 Figma semantic tokens](../ADRs/0018-use-figma-semantic-tokens-for-frontend-themes.md) | Multi-theme token architecture, deterministic CSS names/units, `data-theme` contract, font hosting, and authorization for the deliberate style-only pass. | E-02 onward |

Key ADR 0005 bindings used throughout:
- **Do:** "Map semantic application design tokens to Tailwind theme tokens and use semantic token names in components."
- **Do:** "Preserve or improve keyboard interaction, visible focus, … contrast, and responsive behavior."
- **Do:** "Run the frontend's existing typecheck, lint, and build commands after changing the UI foundation."
- **Do Not:** "add a second utility CSS framework, component library, or conflicting token system without a new ADR."
- **Do Not:** "introduce new component-specific CSS files or expand App.css for ordinary component styling." (Token files are global base styles, which the ADR's applicability carve-out permits.)
- **Do Not:** "replace existing semantic tokens with arbitrary literal colors, spacing, or typography values."
- **Do Not:** "perform a broad style-only rewrite of working frontend pages merely to migrate to Tailwind CSS." — This plan is a deliberate restyle, not a Tailwind migration; it must **not** convert `App.css` classes into Tailwind utilities. ADR 0018 records the authorization (R-7).

## Approach

### 1. Token layer location and structure

New directory `apps/frontend/src/styles/` holding global base styles only:

| File | Contents |
| --- | --- |
| `styles/tokens.css` | Theme-invariant tokens on `:root`: font families, type scale (size/line-height/weight/letter-spacing), spacing, radii, and shared elevation. No primitive palette layer is present in the supplied exports. |
| `styles/themes.css` | One block per theme redefining the **same** semantic color-token set. Light is also the `:root` default; the exported elevations remain shared. |
| `index.css` (modified) | Becomes the single CSS entry point: `@import` of the two token files, then `@tailwind` directives, then global element base styles (`body`, `h1`, `h2`, `code`, …) rewritten to consume tokens. |

Rejected alternatives: tokens in `tailwind.config.ts` (would make Tailwind the source of truth and leave `App.css` unable to consume them); a TS/JS token object or CSS-in-JS (a second competing architecture); `packages/ui` (only one consumer app; revisit if a second app appears).

### 2. Theme → semantic custom-property mapping

- Theme attribute on `<html>` uses `light`, `dark-orchid`, `pathfinder`, `warm-orchid`, and `high-contrast`, mapped respectively to Figma modes `Light`, `Dark / Orchid`, `Pathfinder`, `Warm / Orchid`, and `High contrast`. The attribute is absent until E-07, so `:root` (Light) applies by default.
- Selectors: `:root, [data-theme="light"] { … }` and `[data-theme="<other-slug>"] { … }`. Every theme block must define exactly the same Figma semantic color-token paths (enforced by the T-02.3 contract test).
- Preserve exact Figma `com.figma.codeSyntax.WEB` names where present (for example `--bg-page`, `--text-primary`, `--border-subtle`). For tokens without exported CSS names, use ADR 0018's deterministic rule: prefix `--` and flatten `.` or `/` path separators to `-`, preserving hyphens within path segments. Examples: `bg.scrim` → `--bg-scrim`, `status.positive-subtle` → `--status-positive-subtle`. Typography variables append their property name to the flattened style path; elevation uses its flattened token path. No ad hoc names or unexported semantic tokens.
- Elevation is the three shared styles in `styles.tokens.json`; the supplied export has no theme-specific shadows. Do not vary shadows per theme unless an approved design source later requires it.
- Existing `--color-*` names may be temporary compatibility aliases only when their mapping is reviewed; aliases must not imply false equivalence. The detailed direct/candidate/unresolved mapping is recorded in `design-tokens.json`. Legacy short aliases (`--text`, `--bg`, …) are removed only after a zero-reference check.
- Prefer exported state tokens over Tailwind alpha modifiers. `bg.inverse-subtle-light` is described as the hover shade for primary buttons and selected chips; use it only for matching states after assigning its CSS name. Do not invent hover/pressed variants for which the exports provide no token (R-9).
- Components never branch on theme. No Tailwind `dark:` variants; `darkMode` config is left as-is (unused).

### 3. Typography, spacing, radii, elevation

| Category | CSS representation | Tailwind exposure |
| --- | --- | --- |
| Font families | Exported families/fallbacks: IBM Plex Sans + `system-ui, sans-serif`; IBM Plex Mono + `ui-monospace, monospace`. CSS names follow ADR 0018's path/property rule. | `fontFamily.sans/mono` → CSS variables |
| Type scale | 15 named styles are inventoried with exported family, weight, size, line-height, and letter spacing. CSS names follow the flattened style path plus property (e.g. `--typography-heading-h1-font-size`). | Map styles to Tailwind; preserve existing layout utilities. |
| Spacing | Exported names `space/2`…`space/64`, numeric values, no unit or CSS syntax in export. CSS realization appends `px`, e.g. `space/8` → `--space-8: 8px`. | Map to semantic variables; do not change computed layout spacing. |
| Radii | Exported names `radius/sm`, `md`, `lg`, `xl`, `full`; numeric values, no unit or CSS syntax in export. CSS realization appends `px`, e.g. `radius/md` → `--radius-md: 6px`. | Map to semantic variables. |
| Elevation | Three shared shadows: menu, popover, dialog, defined in `styles.tokens.json`; no theme variants. | Map to `--elevation-1-menu`, `--elevation-2-popover`, `--elevation-3-dialog`; do not derive theme-specific variants. |
| Fonts loading | Self-host IBM Plex via `@fontsource/ibm-plex-sans` and `@fontsource/ibm-plex-mono` (only weights Figma uses), imported once in `main.tsx`, `font-display: swap`. Self-hosting works in local/offline mode ([ADR 0013](../ADRs/0013-deployment-modes-and-passwordless-local-profiles.md)) and avoids third-party requests. |

### 4. Cascade entry

`main.tsx` → `index.css` → `@import './styles/tokens.css'; @import './styles/themes.css';` (Vite inlines `@import` before PostCSS/Tailwind run) → `@tailwind base` (preflight) → `@tailwind components` → `@tailwind utilities` → global element styles. `App.css` (imported by `App.tsx`, later in the cascade) consumes the variables unchanged in structure. Token declarations are plain custom properties on `:root`/`[data-theme]`, so preflight and utilities cannot override them; the theme attribute selector has higher specificity than `:root` alone and is declared later.

### 5. Tailwind decision

Tailwind **is** part of the current architecture (v3.4, actively used by `components/ui` and feature components). Required integration is limited to `tailwind.config.ts`:
- point `colors`, `fontFamily`, `fontSize`, `borderRadius`, `boxShadow`, and named `spacing` at approved CSS variables;
- define the currently-undefined `ring` and `background` color keys after they are mapped to an exported token; do not assume Figma supplied `on-accent` or `overlay` tokens (the existing scrim is a background token);
- add a token-driven typography (prose) theme so `MarkdownViewer` stops using `prose-slate`.

Out of scope: upgrading to Tailwind v4, adding `tailwindcss-animate`, converting `App.css` to utilities, or using `dark:` variants.

### 6. Later theme selection/persistence (E-07, deferred)

Described only. A future spec decides scope (per browser vs per profile), default (Light vs `prefers-color-scheme`), and placement (Settings preferences surface per the scaffold contract). Expected mechanics: a small `applyTheme(slug)` utility that sets `document.documentElement.dataset.theme`; an inline pre-paint script in `index.html` that reads the stored choice to avoid a flash of the wrong theme; `localStorage` for pre-auth/per-browser; per-profile persistence would require `database-design` and a backend preference endpoint. Nothing in E-01–E-06 depends on E-07; themes are exercised by setting `data-theme` manually in devtools.

### Layout-preservation rule (applies to every task)

Diffs to `.css` files and `className` strings may change only: color, background(-color/-image), border-color, border-radius, box-shadow, outline/ring, font-family, font-size, font-weight, line-height, letter-spacing, text-decoration, opacity, and `color-scheme`. They must not change `display`, grid/flex properties, `gap`, widths/heights, `margin`/`padding` values, positioning, media queries, or element order — unless R-5 is resolved otherwise. Before and after implementation, manually verify representative routes at 375px and 1280px against the committed pre-styling baseline revision recorded in [the T-01.3 audit](../uxd/research/0010-styling-baseline.md). Git history/worktrees may provide the direct comparison; screenshots are optional review evidence unless a reviewer requests them.

### Standard frontend checks (referred to as "standard checks")

`corepack pnpm --filter @portfolio-engineering/frontend typecheck`, `… lint`, `… build`, `… test`.

## Non-goals

- Page layout, grid/flex structure, breakpoints, column widths, component order, content, routing, APIs, data, or application logic.
- Converting `App.css` to Tailwind utilities; Tailwind v4 upgrade; adding animation plugins or motion changes.
- Building the theme switcher or persisting theme choice (E-07 is deferred).
- Page-by-page visual redesign beyond token adoption.
- New visual-regression tooling (R-11).

---

## E-01: Design inputs, decisions, and baseline

**Goal:** Turn the Figma Foundations into a reviewable in-repo token inventory, record the architecture decision, identify the committed pre-styling source baseline, and complete the styling audit before anything changes.

**Exit gate:** T-01.1 inventory merged with values for all five themes; ADR 0018 accepted; the pre-styling commit SHA recorded and confirmed; the source-wide styling audit in T-01.3 complete with file/line findings; representative routes manually checked at 375px and 1280px before styling; the decisions in T-01.4 recorded. Screenshots are optional review evidence unless requested. Open items explicitly scoped to later tasks do not block E-02.

**Depends on:** none

### T-01.1: Extract Figma Foundations into a token inventory

- **Status:** done
- **Owner:** uxd
- **Depends on:** none
- **Files:**
  - `docs/uxd/research/design-token-foundations.md` (new) — human-readable inventory and rationale
  - `docs/uxd/flows/design-tokens.json` (new) — machine-readable token set consumed by E-02/E-03/E-05 and the T-02.3 test
- **Intent:** From the supplied Figma token exports `Light.tokens.json`, `Dark _ Orchid.tokens.json`, `Pathfinder.tokens.json`, `Warm _ Orchid.tokens.json`, `High contrast.tokens.json`, `Default.tokens.json`, and `styles.tokens.json`, record every semantic token with its value per theme, type styles, shared spacing/radius steps, elevation, font families/weights, export token names, intended CSS variable names, and accessibility requirements explicitly present in the exports. Include a mapping table from every existing `--color-*`/`--shadow-*` token in `index.css` to its Figma semantic equivalent (or "retire"). Do not infer missing values or claim requirements not present in exports.
- **ADRs:** [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) — Do: "Map semantic application design tokens to Tailwind theme tokens"; Do Not: "conflicting token system".
- **Verify:** JSON lists the same semantic color-token keys for all five themes with no empty values; shared spacing, radius, typography, and elevation data are captured; Figma token names and intended CSS variable names are preserved; every existing `--color-*` and `--shadow-elevation-soft` token appears in the mapping table; values are sourced verbatim (no invented/inferred values); node IDs are cited per section. If exports omit accessibility requirements, record that absence and leave contrast/a11y values unasserted pending confirmation.
- **Notes:** Verified all five theme maps have the same 29 non-empty semantic color paths. Inventoried shared spacing/radii, 15 typography styles, two font stacks, and three shared elevation styles. Exact Figma code-syntax names and token references are preserved; tokens without code syntax remain marked as not supplied by Figma, with deterministic application naming defined in ADR 0018. Exports do not contain a complete contrast matrix or theme-specific elevation. Updated later-task assumptions and open items below; application code unchanged.

### T-01.2: Record the multi-theme token architecture ADR

- **Status:** done
- **Owner:** adr-architect
- **Depends on:** T-01.1
- **Files:**
  - `docs/ADRs/0018-use-figma-semantic-tokens-for-frontend-themes.md` (new)
- **Intent:** Decide and record: CSS custom properties as the single runtime token interface; exact Figma CSS names plus deterministic fallback naming; `px` realization for spacing/radii while preserving layout; `data-theme` on `<html>` with the five identifiers; Tailwind as consumer only; no theme-name branches; shared elevation; temporary migration aliases; self-hosted IBM Plex; theme switching deferred; authorization of this deliberate style-only pass relative to ADR 0005.
- **ADRs:** [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) — Do Not: "conflicting token system without a new ADR".
- **Verify:** ADR exists with template sections `Applicable When`, `Context`, `Decision Statement`, `Do`, and `Do Not`, plus rationale, consequences, audience guidance, and follow-up; status accepted; references ADR 0005 without contradiction.
- **Notes:** Accepted on 2026-10-13 under the user's explicit direction to execute T-01.2 and determine these conventions. No runtime code changed.

### T-01.3: Record source baseline and complete hard-coded-value audit

- **Status:** done
- **Owner:** frontend coding
- **Depends on:** none
- **Files:**
  - `docs/uxd/research/0010-styling-baseline.md` (modified) — baseline commit SHA, representative route checks, and source audit
- **Intent:** Record the committed pre-styling Git revision as the reproducible source baseline. Manually check representative routes before implementation at 375px and 1280px; after styling, compare the same routes against this revision, using Git history/worktrees as needed. Screenshots are optional review evidence unless specifically requested. Complete a source-wide audit of hard-coded visual values outside token files, including Tailwind palette classes (`text-white`, `bg-black/*`, `*-slate-*`, `*-red-*`, …), `shadow-lg`, `prose-slate`, alpha modifiers on token colors, undefined token classes, literals in `App.css`/`index.css`, focus rings, typography, gradients, shadows/elevation, and `packages/ui`.
- **ADRs:** [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) — Do: "Preserve or improve … responsive behavior when migrating UI."
- **Verify:** The document records the full pre-styling commit SHA and manual pre-styling checks for representative routes at both widths; the source-wide audit covers all in-scope frontend styling and records file:line → literal/class → proposed semantic token or documented non-mapping; no application code changed. Post-styling manual comparison at those widths is required by styling-task exit gates. No screenshot is required unless requested by a reviewer.
- **Notes:** Recorded pre-styling HEAD `dad2b60716fdadf9df342405c9f7d404a0daf44a`; application source had no worktree changes at capture time. Completed the source-wide static audit of `apps/frontend/src` and `packages/ui`, with file/line findings and token/non-mapping dispositions in [the baseline audit](../uxd/research/0010-styling-baseline.md). The user reported manually reviewing every listed representative route/state at 375px and 1280px against the baseline on 2026-10-14, including the specified dialog behavior and keyboard focus, with no notable existing layout issues. Screenshots are optional and do not block completion. No application code changed.

### T-01.4: Confirm open decisions with the user

- **Status:** done
- **Owner:** uxd
- **Depends on:** T-01.1
- **Files:**
  - `docs/plans/0010-design-token-foundation.md` (modified — Risks table and Revisions)
- **Intent:** Record resolutions and dispositions for R-3, R-4, R-5, R-6, R-10, R-11, R-14, R-15, and R-16. Record open items as scoped to their later task where they do not block E-02.
- **ADRs:** none
- **Verify:** Each listed risk row has a recorded decision and date.
- **Notes:** Decisions and scoped follow-ups recorded 2026-10-13. No additional architectural decision blocks E-02; T-01.3 baseline remains an E-01 exit gate.

---

## E-02: Token layer structure (no visual change)

**Goal:** Move the token layer into its permanent location and wire Tailwind to it while the Light theme still holds today's values, so the structural change is reviewable separately from the visual change.

**Exit gate:** `index.css` imports `styles/tokens.css` and `styles/themes.css`; Tailwind theme values are all `var(...)`; the token contract test runs in `pnpm test`; manually compare representative routes against pre-styling commit `dad2b60716fdadf9df342405c9f7d404a0daf44a` at 375px and 1280px and confirm no unintended layout regressions (focus rings may become visible). Screenshots are optional unless requested by a reviewer.

**Depends on:** E-01

### T-02.1: Create the token files and wire them into the cascade

- **Status:** done
- **Owner:** frontend coding
- **Depends on:** T-01.2, T-01.4
- **Files:**
  - `apps/frontend/src/styles/tokens.css` (new)
  - `apps/frontend/src/styles/themes.css` (new)
  - `apps/frontend/src/index.css` (modified)
- **Intent:** Move the `:root` token block out of `index.css`; introduce the exact Figma code-syntax names where provided and use ADR 0018's deterministic path rule for all remaining names. Keep E-02 visually neutral: legacy component-facing variables may temporarily retain current values until consumers migrate; alias only semantically matched values and keep unmatched legacy roles explicit and temporary. Represent spacing/radius numeric values as CSS px without substituting values that alter computed layout. Add `@import`s above `@tailwind base`; tokenise the body gradient and `code` styles without changing their appearance.
- **ADRs:** [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) — Do Not: "replace existing semantic tokens with arbitrary literal … values"; Do Not: "introduce new component-specific CSS files" (these are global base files). ADR 0018.
- **Verify:** Standard checks pass; built CSS contains token declarations before preflight; `getComputedStyle(document.body)` colors/fonts equal the pre-styling baseline where expected; manually compare representative routes at 375px and 1280px against commit `dad2b60716fdadf9df342405c9f7d404a0daf44a` and confirm no unintended layout change. Screenshots optional unless requested.
- **Notes:** Added `styles/tokens.css` and `styles/themes.css`, moved the existing legacy token declarations out of `index.css`, and imported both before Tailwind directives. Added exported semantic Light colors, shared spacing/radius/elevation, typography variables, and compatibility values; gradient/code declarations now reference values that preserve the prior CSS literals. The user reports the frontend tests, typecheck, lint, production build, and `git diff --check` pass. The user also completed the representative-route comparison against baseline commit `dad2b60716fdadf9df342405c9f7d404a0daf44a` at 375px and 1280px, including navigation, dialog, focus, and overflow checks, with no notable unintended layout changes. No application logic/layout changed.

### T-02.2: Point Tailwind theme values at CSS variables

- **Status:** done
- **Owner:** frontend coding
- **Depends on:** T-02.1
- **Files:**
  - `apps/frontend/tailwind.config.ts` (modified)
- **Intent:** Replace literal `fontFamily`, `borderRadius`, named `spacing` with approved `var(...)` references; add font-size keys per Figma styles; map `ring`/`background` to existing exported semantic tokens where applicable; add box-shadow entries for the three shared elevation styles; keep existing keys only as compatibility aliases where mapped. Retain legacy spacing and radius magnitudes via compatibility variables until E-03 so E-02 does not change computed layout geometry.
- **ADRs:** [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) — Do: "Map semantic application design tokens to Tailwind theme tokens and use semantic token names in components."
- **Verify:** Standard checks pass; built CSS contains rules for `.ring-ring` and `.ring-offset-background` resolving to token vars; no literal hex/rem values remain in `tailwind.config.ts` except Tailwind defaults left intentionally; manually compare representative routes at 375px and 1280px against the recorded pre-styling commit, allowing intended focus-ring visibility but no unintended layout regressions.
- **Notes:** Updated Tailwind font-family, color, shadow, font-size, radius, and named-spacing mappings to CSS variables; added `ring` and `background` mappings. Legacy Tailwind color keys remain backed by their existing variables, and current spacing/radius values remain the values consumed by existing utility keys. The user reports frontend tests, typecheck, lint, production build, and `git diff --check` pass, and completed the representative-route comparison against baseline at 375px and 1280px with no notable unintended visual or layout changes.

### T-02.3: Add a token contract test

- **Status:** done
- **Owner:** frontend coding
- **Depends on:** T-02.1
- **Files:**
  - `apps/frontend/src/styles/tokens.test.ts` (new)
  - `apps/frontend/package.json` (modified — append the file to the `test` script)
- **Intent:** Without new dependencies, assert (a) all five exported theme inventories define the same semantic token set, (b) the runtime Light block defines every canonical CSS name, using the ADR 0018 naming rule where Figma supplied no code name, and (c) documented text contrast requirements meet 4.5:1 and documented non-text contrast requirements meet 3:1 per exported theme. E-02 creates only the Light runtime block; E-05 adds the remaining runtime theme blocks. Do not claim a general WCAG conformance level or test unprovided pairings as design requirements.
- **ADRs:** [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) — Do: "Preserve or improve … contrast".
- **Verify:** `pnpm --filter @portfolio-engineering/frontend test` runs the new test and passes; deliberately deleting one Light CSS token or changing one exported theme token set makes it fail.
- **Notes:** The user reported an initial 39/40 test result with only Warm / Orchid `status.negative` on `status.negative-subtle` failing at 4.75:1 against an unsupported 5:1 assertion. The test was corrected to the user-confirmed UXD text contrast threshold of 4.5:1 while retaining 3:1 for non-text accent pairs; exported token values were not changed. The user now reports the frontend test suite passes.

### T-02.4: Remove unused legacy short aliases

- **Status:** done
- **Owner:** frontend coding
- **Depends on:** T-02.1
- **Files:**
  - `apps/frontend/src/styles/tokens.css` (modified)
- **Intent:** Use a repository-wide CSS custom-property reference search to determine whether compatibility aliases are safe to remove. Remove only aliases with no consumers; retain every alias/property that remains referenced.
- **ADRs:** none
- **Verify:** Repository-wide search results are recorded; no referenced property is removed; frontend checks pass.
- **Notes:** The user reports the repository-wide custom-property reference search is complete and confirms compatibility properties remain consumed, including legacy `--color-*`, spacing/radius, and `--shadow-elevation-soft` references in `tailwind.config.ts`, `index.css`, and `App.css`. The zero-reference removal condition is not met. All compatibility declarations are retained; no alias/property was removed. The user reports frontend tests, typecheck, lint, and production build pass.

---

## E-03: Light theme, typography, radius, and elevation values

**Goal:** Apply Figma Light-theme values, IBM Plex typography, shared spacing/radii, and shared elevations through the token layer only.

**Exit gate:** Light theme matches the supplied foundations; the explicitly specified contrast assertions pass; manual representative-route comparisons at 375px and 1280px against the recorded pre-styling Git revision show only intended visual skin changes and no unintended layout regressions within R-5 tolerance. Screenshots are optional unless requested by a reviewer.

**Depends on:** E-02

### T-03.1: Self-host IBM Plex Sans and IBM Plex Mono

- **Status:** done
- **Owner:** frontend coding
- **Depends on:** T-02.1
- **Files:**
  - `apps/frontend/package.json` (modified — `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono`)
  - `pnpm-lock.yaml` (modified)
  - `apps/frontend/src/main.tsx` (modified — font CSS imports only)
  - `apps/frontend/src/styles/tokens.css` (existing family stacks reused; no change required)
- **Intent:** Load only the weights/styles Figma uses and point `--font-family-sans/-mono` at them.
- **ADRs:** [0018](../ADRs/0018-use-figma-semantic-tokens-for-frontend-themes.md) (font hosting). [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) — Do Not: "add a second … component library" (fonts packages are not one).
- **Verify:** Standard checks pass; the production build bundles the font files from the app's installed packages; browser network confirms fonts are served from the app origin with no third-party font requests; approved weights and existing family variables/fallbacks are confirmed. Applying those families to `body`/`code` remains part of T-03.3 and is intentionally not done in T-03.1.
- **Notes:** Added frontend dependencies for `@fontsource/ibm-plex-sans` and `@fontsource/ibm-plex-mono`, and imported only weights 400/500/600 for Sans and 400/500 for Mono in `main.tsx`. The lockfile resolves both packages to 5.3.0. Existing `--font-family-sans` and `--font-family-mono` variables already name IBM Plex with system fallbacks and were left unchanged. The user reports frontend tests pass (40/40), typecheck passes, lint passes (6 warnings, 0 errors), production build passes, `git diff --check` passes, and browser/network inspection confirms locally served font assets with no CDN. No global typography or layout styles changed; actual font application remains in T-03.3.

### T-03.2: Apply Figma Light color values

- **Status:** pending
- **Owner:** frontend coding
- **Depends on:** T-02.3, T-03.1
- **Files:**
  - `apps/frontend/src/styles/themes.css` (modified — Light block only)
- **Intent:** Replace Light semantic color values with the T-01.1 values; set `color-scheme: light`.
- **ADRs:** [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) — Do: "Preserve or improve … contrast".
- **Verify:** Contrast test passes; values equal `design-tokens.json`; manual representative-route comparison against the baseline at 375px and 1280px shows no unintended layout regression. Screenshots optional unless requested.
- **Notes:**

### T-03.3: Apply the type scale to global element styles

- **Status:** pending
- **Owner:** frontend coding
- **Depends on:** T-03.1
- **Files:**
  - `apps/frontend/src/styles/tokens.css` (modified)
  - `apps/frontend/src/index.css` (modified — `:root` font shorthand, `h1`, `h2`, `code`)
  - `apps/frontend/src/App.css` (modified — typographic properties only, e.g. `.eyebrow`, `.settings-metric-value`, `.settings-metric-label`, `.nav-group h3`)
- **Intent:** Replace literal font sizes/weights/line-heights/letter-spacing with type tokens matching the closest Figma style.
- **ADRs:** [0018](../ADRs/0018-use-figma-semantic-tokens-for-frontend-themes.md); [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) — Do Not: "replace existing semantic tokens with arbitrary literal … typography values".
- **Verify:** No literal `font-size`/`font-weight`/`line-height`/`letter-spacing` remains in `index.css`/`App.css`; manually inspect representative routes at 375px and 1280px against the baseline for clipping, overflow, or structural layout changes. Record natural text reflow caused by the Figma font metrics (R-5); screenshots optional unless requested.
- **Notes:**

### T-03.4: Apply radius and elevation values

- **Status:** pending
- **Owner:** frontend coding
- **Depends on:** T-02.2
- **Files:**
  - `apps/frontend/src/styles/tokens.css` (modified — radii)
  - `apps/frontend/src/styles/themes.css` (modified — shared elevation tokens)
  - `apps/frontend/src/App.css` (modified — `border-radius` and `box-shadow` only)
- **Intent:** Map radius literals to the approved CSS names/units for Figma's shared radius values; map surfaces to the three shared elevation levels where their intended usage matches. Do not create theme-specific elevation values.
- **ADRs:** [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) — Do Not: arbitrary literal values.
- **Verify:** No literal `border-radius`/`box-shadow` in `App.css`; manual representative-route comparison at 375px and 1280px shows only intended radius/shadow changes and no unintended layout regressions.
- **Notes:**

### T-03.5: Define spacing tokens without changing layout

- **Status:** pending
- **Owner:** frontend coding
- **Depends on:** T-02.2
- **Files:**
  - `apps/frontend/src/styles/tokens.css` (modified)
  - `apps/frontend/tailwind.config.ts` (modified — named spacing keys only)
- **Intent:** Publish Figma spacing values using ADR 0018's path naming and px realization. Replace `App.css` spacing literals with tokens **only where the computed value is identical**; leave others as-is and list them in Notes for a later, explicitly approved density pass.
- **ADRs:** [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) — Do: "Preserve … responsive behavior".
- **Verify:** Element bounding boxes on representative baseline routes are unchanged (spot-check via devtools/Playwright at 375px and 1280px); standard checks pass.
- **Notes:**

---

## E-04: Remove hard-coded visual values from shared layers

**Goal:** Ensure every color/shadow in the app flows from tokens, so the other four themes work without per-component changes.

**Exit gate:** Re-run of the T-01.3 audit shows zero hard-coded visual values outside `styles/`, except documented exceptions.

**Depends on:** E-03

### T-04.1: Tokenise remaining App.css and index.css literals

- **Status:** pending
- **Owner:** frontend coding
- **Depends on:** T-03.4
- **Files:**
  - `apps/frontend/src/App.css` (modified — `#ffffff` in `.primary-button` → approved mapping for `text.on-inverse`; gradients via tokens)
  - `apps/frontend/src/index.css` (modified — body radial gradient via token)
- **Intent:** Remove the last literal colors so all themes apply. Visual properties only.
- **ADRs:** [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) — Do Not: "expand App.css for ordinary component styling" (edits only, no new rules).
- **Verify:** No hex/rgb/hsl literals in `App.css`/`index.css`; diff touches no layout properties.
- **Notes:**

### T-04.2: Tokenise components/ui primitives

- **Status:** pending
- **Owner:** frontend coding
- **Depends on:** T-02.2
- **Files:**
  - `apps/frontend/src/components/ui/button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `select.tsx`, `textarea.tsx`, `alert.tsx`, `copy-button.tsx` (modified as needed)
- **Intent:** Replace `text-white`, `bg-black/50`, `shadow-lg`, and alpha-modifier hovers with the matching exported tokens (`text.on-inverse`, `bg.scrim`, the appropriate shared elevation level, and `bg.inverse-subtle-light` where its described hover role matches). Use ADR 0018's deterministic CSS names for tokens without exported code syntax and map focus rings to `accent.strong`. Do not invent `on-accent`, `overlay`, or hover tokens absent from the export; do not change variants, sizes, props, Radix usage, or layout classes.
- **ADRs:** [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) — Do Not: "assume a shadcn/ui component is accessible after customization; retain and verify its accessible behavior."
- **Verify:** Standard checks pass; keyboard focus visible on Button/Input/Select/Textarea/Dialog close; Dialog still traps focus and closes on Escape.
- **Notes:**

### T-04.3: Tokenise feature components and Markdown prose

- **Status:** pending
- **Owner:** frontend coding
- **Depends on:** T-01.3, T-02.2
- **Files:**
  - `apps/frontend/tailwind.config.ts` (modified — token-driven typography theme)
  - `apps/frontend/src/components/MarkdownViewer.tsx` (modified — `prose-slate` → token prose)
  - Feature files listed in the T-01.3 audit (e.g. `HelpTooltip.tsx`, `SecurityMasterPage.tsx`, Journal components) (modified)
  - `packages/ui/src/NotYetImplemented.tsx` (modified only if the audit finds literals)
- **Intent:** Replace audited literal color/shadow classes with semantic token classes. Split into additional tasks (T-04.5+) if the audit lists more than ~10 files.
- **ADRs:** [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) — Do: "use semantic token names in components". [0017](../ADRs/0017-standardize-data-grid-list-behaviors.md) — grid behaviors must not change.
- **Verify:** Audit re-run clean for touched files; standard checks pass (watch TD-016 source-regex tests in `SecurityMasterPage.test.tsx`; update only if a class-name assertion breaks, not behavior assertions).
- **Notes:**

### T-04.4: Theme the Markdown editor surface (conditional)

- **Status:** pending
- **Owner:** frontend coding
- **Depends on:** T-01.3
- **Files:**
  - Owned Markdown editor wrapper identified by the T-01.3 audit (modified, if any)
- **Intent:** If the editor engine injects hard-coded colors, map its theme hooks to tokens inside the owned wrapper. Cancel this task with a reason if the audit finds none.
- **ADRs:** [0007](../ADRs/0007-use-cwl-editor-behind-an-owned-markdown-editor.md), [0012](../ADRs/0012-defer-wysiwyg-engine-selection-behind-an-owned-markdown-editor.md) — keep engine specifics behind the owned editor.
- **Verify:** Editor text, caret, selection, and gutter read correctly in Light and (after E-05) every theme.
- **Notes:**

---

## E-05: Remaining four themes

**Goal:** Add the four non-default theme blocks.

**Exit gate:** All five blocks pass the parity and contrast test; every baseline route renders correctly with each `data-theme` set manually.

**Depends on:** E-04

### T-05.1: Dark / Orchid theme

- **Status:** pending
- **Owner:** frontend coding
- **Depends on:** T-04.1, T-04.2, T-04.3
- **Files:**
  - `apps/frontend/src/styles/themes.css` (modified)
- **Intent:** Add the theme's exported color values under the approved runtime slug. Continue using the shared elevation tokens from `styles.tokens.json`; set `color-scheme` only after mode behavior is confirmed.
- **ADRs:** [0018](../ADRs/0018-use-figma-semantic-tokens-for-frontend-themes.md); [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) — Do: "Preserve or improve … contrast".
- **Verify:** Contract test passes; all baseline routes, Dialog, and HelpTooltip legible with attribute set in devtools; native controls/scrollbars render dark.
- **Notes:**

### T-05.2: Pathfinder theme

- **Status:** pending
- **Owner:** frontend coding
- **Depends on:** T-05.1
- **Files:**
  - `apps/frontend/src/styles/themes.css` (modified)
- **Intent:** Add `[data-theme="pathfinder"]`.
- **ADRs:** as T-05.1
- **Verify:** as T-05.1
- **Notes:**

### T-05.3: Warm / Orchid theme

- **Status:** pending
- **Owner:** frontend coding
- **Depends on:** T-05.1
- **Files:**
  - `apps/frontend/src/styles/themes.css` (modified)
- **Intent:** Add `[data-theme="warm-orchid"]`.
- **ADRs:** as T-05.1
- **Verify:** as T-05.1
- **Notes:**

### T-05.4: High Contrast theme and forced-colors support

- **Status:** pending
- **Owner:** frontend coding
- **Depends on:** T-05.1
- **Files:**
  - `apps/frontend/src/styles/themes.css` (modified)
- **Intent:** Add the exported High contrast color values under the approved runtime slug. The export does not specify different shadows or forced-colors behavior; retain shared elevation and assess forced-colors support as a separate accessibility implementation requirement rather than attributing it to Figma.
- **ADRs:** as T-05.1
- **Verify:** Contract test passes for only the explicit ratios recorded in T-01.1; focus remains visible using the exported accent guidance; any forced-colors behavior is reviewed separately and not represented as an exported requirement.
- **Notes:**

---

## E-06: Accessibility verification and drift review

**Goal:** Prove the handoff accessibility requirements hold in every theme and that no layout or behavior drifted.

**Exit gate:** a11y checklist passes for all five themes; governance reports no drift.

**Depends on:** E-05

### T-06.1: Cross-theme accessibility pass

- **Status:** pending
- **Owner:** uxd
- **Depends on:** T-05.2, T-05.3, T-05.4
- **Files:**
  - `docs/uxd/research/0010-styling-baseline.md` (modified — a11y results per theme)
- **Intent:** For each theme: verify the explicit color-ratio guidance in the export (highlight text 5:1, subtle status text 5:1, accent non-text 3:1), visible focus, keyboard path through nav, Settings tabs, and Dialog, and non-color status cues. Evaluate broader accessibility standards separately; the exports do not specify overall WCAG level, focus dimensions, or reduced-motion behavior.
- **ADRs:** [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) — Do: "Preserve or improve keyboard interaction, visible focus, semantic HTML, labels, status messaging, contrast".
- **Verify:** Results table complete for 5 themes × checklist; failures filed as new tasks in this plan.
- **Notes:**

### T-06.2: Governance drift review

- **Status:** pending
- **Owner:** governance
- **Depends on:** T-06.1
- **Files:** none (read-only)
- **Intent:** Confirm the diff respects the layout-preservation rule, touches no routing/data/API logic, adds no competing token system, and matches ADR [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) and [0018](../ADRs/0018-use-figma-semantic-tokens-for-frontend-themes.md).
- **ADRs:** [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md), [0018](../ADRs/0018-use-figma-semantic-tokens-for-frontend-themes.md)
- **Verify:** Governance report with no unresolved findings; manually compare the representative routes at 375px and 1280px against the recorded pre-styling baseline for structural/layout drift. Screenshots are optional review evidence unless requested.
- **Notes:**

---

## E-07: Theme selection and persistence (deferred)

**Goal:** Let users choose among the five themes and persist the choice. Planned only; do not start until a spec is `Ready for planning`.

**Exit gate:** Not applicable until replanned.

**Depends on:** E-05

### T-07.1: Write the theme-preference spec

- **Status:** pending
- **Owner:** business-requirements
- **Depends on:** none
- **Files:**
  - `docs/specs/0010-<slug>.md` or next free number (new)
- **Intent:** Decide scope (per browser vs per profile vs both), default theme and `prefers-color-scheme`/`prefers-contrast` behavior, pre-auth behavior, and placement in Settings preferences.
- **ADRs:** ADR 0018; [0013](../ADRs/0013-deployment-modes-and-passwordless-local-profiles.md) if per-profile.
- **Verify:** Spec status `Ready for UXD` or `Ready for planning`.
- **Notes:**

### T-07.2: Design the theme preference surface

- **Status:** pending
- **Owner:** uxd
- **Depends on:** T-07.1
- **Files:**
  - `docs/uxd/flows/` (new flow doc), `docs/uxd/flows/ui-scaffold-contract.json` (modified — `constraints.theming.currentState`)
- **Intent:** Theme picker UX with accessible names and previews.
- **ADRs:** ADR 0018
- **Verify:** Flow approved; scaffold contract updated.
- **Notes:**

### T-07.3: Implement theme application and selection

- **Status:** blocked
- **Owner:** frontend coding
- **Depends on:** T-07.2
- **Files:**
  - `apps/frontend/index.html` (modified — pre-paint inline script), `apps/frontend/src/theme.ts` (new), Settings preference component (new/modified)
- **Intent:** `applyTheme(slug)` setting `document.documentElement.dataset.theme`; stored choice read before first paint; picker wired in Settings.
- **ADRs:** ADR 0018; [0005](../ADRs/0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md)
- **Verify:** Defined by the spec; at minimum no flash of the wrong theme on reload.
- **Notes:** Blocked: awaiting T-07.1 spec (R-2).

### T-07.4: Persist theme per profile (conditional)

- **Status:** blocked
- **Owner:** database-design
- **Depends on:** T-07.1
- **Files:**
  - `packages/database/prisma/schema.prisma` (modified, if required), migration (new), `docs/schema/current.md` (modified)
- **Intent:** Only if the spec requires server-side persistence; would be followed by backend-coding endpoint work added on replan.
- **ADRs:** [0001](../ADRs/0001-organization-aware-data-access.md), [0013](../ADRs/0013-deployment-modes-and-passwordless-local-profiles.md)
- **Verify:** Defined on replan.
- **Notes:** Blocked: awaiting T-07.1 spec; cancel if persistence is browser-only.

---

## Risks and open items

| ID | Item | Impact | Owning agent | Blocks |
| --- | --- | --- | --- | --- |
| R-1 | Figma MCP was unavailable, but the user supplied direct exports and T-01.1 is complete. | No longer blocks inventory. Export limitations are captured separately in R-10. | uxd | resolved 2026-10-13 |
| R-2 | No spec exists; plan created under user override. Theme selection/persistence needs a spec. | E-07 cannot be planned concretely; plan/spec number pairing. | business-requirements | T-07.1–T-07.4 |
| R-3 | Some Figma tokens have exact CSS syntax names; the rest use ADR 0018's deterministic flattened-path rule. | Canonical names now fixed; only exact code-syntax names may be called Figma-specified. | user / adr-architect | resolved by ADR 0018 (2026-10-13) |
| R-4 | IBM Plex hosting choice. | Self-host using `@fontsource/ibm-plex-sans` and `@fontsource/ibm-plex-mono`, loading only exported weights; avoids third-party requests and works offline, at the cost of two dependencies. | adr-architect | resolved by ADR 0018 (2026-10-13); implement in T-03.1 |
| R-5 | Font metrics can change text wrapping; spacing changes could alter layout. | Permit natural text reflow from the Figma type styles while preserving structural layout and preventing clipping/overflow; do not change computed spacing or grid/flex structure. Verify at 375px and 1280px. | user / frontend coding | resolved by ADR 0018 (2026-10-13); verify T-03.3/T-06.2 |
| R-6 | Default theme before selector ships. | Use Light regardless of `prefers-color-scheme`; theme selection is deferred. | user | resolved by ADR 0018 (2026-10-13) |
| R-7 | ADR 0005 forbids a broad style-only rewrite merely to migrate to Tailwind; this work is an explicitly requested Figma skin swap, not a Tailwind migration. | Keep `App.css`, preserve behavior/layout, and follow the bounded visual-only scope. | user / adr-architect | resolved by user direction and ADR 0018 (2026-10-13) |
| R-8 | `tailwindcss-animate` classes in `dialog.tsx` are no-ops (plugin missing). Out of scope (motion change). | None now; recommend tech-debt entry at closeout. | closeout | none |
| R-9 | Tailwind v3 alpha modifiers (`/90`) on `var()` colors may not generate; hover states may silently not render. `bg.inverse-subtle-light` is the only exported hover-shade token, described for primary buttons and selected chips. | Prefer that exported token only for matching hover roles; do not invent other interaction-state values. | frontend coding | T-04.2 |
| R-10 | Supplied exports contain specific contrast/status/caption notes, but no complete accessibility handoff (global WCAG level, full text/background matrix, focus dimensions, keyboard, forced-colors, reduced-motion). No additional handoff was supplied with T-01.2. | Use exported criteria plus ADR 0005's general accessibility obligations; do not claim missing Figma criteria. Cross-theme audit can record this limitation. | user / uxd | T-06.1 (does not block E-02) |
| R-11 | No visual-regression tooling exists. | Use the committed pre-styling revision recorded in the baseline document and manual representative-route comparisons at 375px and 1280px; screenshots are optional review evidence unless requested. Do not add tooling for this plan. | adr-architect / user | resolved by user direction; baseline commit recorded 2026-10-14 |
| R-12 | TD-016 source-regex tests may fail on className edits in `SecurityMasterPage`. | Test churn in T-04.3. | frontend coding | none |
| R-13 | The exports contain a semantic `accent.strong` in each theme but no separate primitive palette. Its values differ between Dark / Orchid (`#C98AA8`) and Warm / Orchid (`#8F4A6C`); no shared Orchid ramp is supplied. | Do not merge theme-specific values or invent a primitive layer. | uxd | resolved by T-01.1 |
| R-14 | Foundations exports do not specify the current decorative gradients; compare against relevant page designs before deciding whether to retain or remove them. | Visual fidelity for T-04.1; does not affect token architecture or E-02. | uxd | T-04.1 |
| R-15 | Runtime identifiers were not in the Figma exports; user specified `light`, `dark-orchid`, `pathfinder`, `warm-orchid`, and `high-contrast`. | Identifier contract fixed for later selection work. | user | resolved by user direction and ADR 0018 (2026-10-13) |
| R-16 | Numeric spacing/radius values have no exported units; CSS realization and names were needed. | Use flattened token paths and append `px` to exported numeric magnitudes; preserve computed layout spacing. | adr-architect | resolved by ADR 0018 (2026-10-13) |
| R-17 | The initial T-01.3 interpretation required screenshots of every route; the user replaced this with a committed pre-styling Git baseline. | Baseline commit `dad2b60716fdadf9df342405c9f7d404a0daf44a`, source-wide audit, and user-reported manual checks of the listed routes at 375px and 1280px are recorded in `docs/uxd/research/0010-styling-baseline.md`. Screenshots are optional unless requested. | frontend coding | resolved 2026-10-14 |
| R-18 | Initial execution lacked command/browser access; the user subsequently supplied passing command results and completed the repository-wide custom-property reference search and post-E-02 representative route comparison at 375px/1280px. The UXD handoff clarification uses 4.5:1 text and 3:1 non-text thresholds while some inventory prose/metadata retains 5:1 Figma descriptions. | Contract test uses the clarified UXD acceptance thresholds without altering exported values. Preserve referenced compatibility declarations. No E-02 verification remains outstanding. | frontend coding | resolved 2026-10-15 |
| R-19 | This execution environment initially lacked package-manager, command, and browser tools; the user subsequently supplied completion evidence for dependency installation, lockfile generation, checks, build output, and local runtime font delivery. The computed-font check on body/code remains deferred to T-03.3 to avoid applying the typography early. | User-reported verification confirms package resolution, tests/typecheck/lint/build, and local self-hosting. Keep global typography application scoped to T-03.3. | frontend coding | resolved 2026-10-15 |

## Revisions

| Date | Trigger | Change |
| --- | --- | --- |
| 2026-10-12 | Initial plan | Created from user brief (no spec; override recorded). Figma not inspected — R-1. |
| 2026-10-13 | Renumbered | Moved to plan 0010 because 0009 is reserved for another feature. |
| 2026-10-13 | T-01.1 inventory | Added exported token inventory, completed T-01.1, and reconciled naming, elevation, and accessibility assumptions with the supplied files. |
| 2026-10-13 | T-01.2 architecture | Added accepted ADR 0018 and resolved token naming/units, font hosting, identifiers/default, theme boundary, and migration-alias policy. T-01.4 decisions recorded; T-01.3 baseline remains the E-01/E-02 gate. |
| 2026-10-14 | T-01.3 baseline revision | Replaced per-route screenshots as a gate with committed pre-styling revision `dad2b60716fdadf9df342405c9f7d404a0daf44a` and manual representative-route checks at 375px/1280px before and after styling. Screenshots are optional unless requested. |
| 2026-10-14 | T-01.3 source audit | Completed the source-wide static audit across `apps/frontend/src` and `packages/ui`, recording file/line findings. T-01.3/E-01 remain blocked only on manual pre-styling route verification requiring a running browser; E-02 remains pending. |
| 2026-10-14 | T-01.3 manual baseline verification | Recorded user-reported checks of the representative routes/states at 375px and 1280px against the baseline commit, including dialog behavior and keyboard focus; no notable existing layout issues were reported. Marked T-01.3 and E-01 done; E-02 remains pending and has not started. |
| 2026-10-14 | E-02 token infrastructure | Added the token/theme CSS entry files, preserved legacy visual values and aliases, mapped Tailwind theme values to CSS variables, and added the token contract test. Adjusted T-02.3 to test all exported theme inventories and the Light runtime block because adding other runtime theme blocks belongs to E-05. E-02 remains blocked pending commands, alias search, and browser verification unavailable in this environment; E-03 was not started. |
| 2026-10-14 | E-02 contrast and alias verification follow-up | Adjusted contract-test text contrast thresholds to the clarified UXD requirement of 4.5:1; kept 3:1 for documented non-text accent pairs and made no token-value changes. Inspected `App.css` but could not run the required repository-wide alias search or rerun frontend tests in this environment. Compatibility aliases remain. |
| 2026-10-15 | E-02 verification results | Recorded user-reported passing tests, typecheck, lint (6 warnings, 0 errors), production build, `git diff --check`, and browser review. Recorded completed repository-wide property-reference search; consumers remain, so compatibility declarations are retained and no aliases removed. T-02.3 and T-02.4 are done. T-02.1/T-02.2 and E-02 remain blocked only because the user's browser-review report did not explicitly confirm representative-route comparison against baseline at both 375px and 1280px. E-03 has not started. |
| 2026-10-15 | E-02 baseline comparison | Recorded user-completed representative route/state comparison against baseline commit `dad2b60716fdadf9df342405c9f7d404a0daf44a` at 375px and 1280px, including dialog and keyboard focus; no notable unintended layout changes observed. Marked T-02.1, T-02.2, and E-02 done; E-03 remains pending. |
| 2026-10-15 | T-03.1 font loading | Added Fontsource package declarations and CSS imports for the approved Sans 400/500/600 and Mono 400/500 weights, reusing existing family variables/fallbacks. T-03.1 remains blocked pending lockfile generation and required build/runtime verification, unavailable in this environment. No typography application or T-03.2 work started. |
| 2026-10-15 | T-03.1 verification | Recorded user-reported passing dependency installation, lockfile update, tests (40/40), typecheck, lint (6 warnings, 0 errors), production build, `git diff --check`, and browser/network confirmation that all approved IBM Plex weights are locally served with no CDN. Marked T-03.1 done; T-03.2 is next. |
