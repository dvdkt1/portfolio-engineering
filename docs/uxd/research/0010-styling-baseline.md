# Plan 0010: Frontend styling baseline and audit

**Status:** blocked — static review started; required browser screenshots and exhaustive source scan remain outstanding  
**Plan task:** [T-01.3](../../plans/0010-design-token-foundation.md)  
**Architecture:** [ADR 0018](../../ADRs/0018-use-figma-semantic-tokens-for-frontend-themes.md)  
**Date reviewed:** 2026-10-14  
**Application source:** [`apps/frontend/src`](../../../apps/frontend/src)

## Capture status

The plan requires browser screenshots at 375px and 1280px, including each routed page, an open Dialog, and HelpTooltip. No screenshot was captured for this handoff: browser/runtime controls are not available in this task environment. The routes are session-gated; captures should use a stable authenticated local session and representative seeded content, and should record the app mode and data state. Do not treat the route matrix below as a visual baseline or infer geometry from source.

`Not captured` means there is no screenshot artifact or reference yet.

| Page / route or state | 375px | 1280px |
| --- | --- | --- |
| Workspace shell + Dashboard `/workspace/dashboard` | Not captured | Not captured |
| Portfolio `/workspace/portfolio` | Not captured | Not captured |
| Positions `/workspace/positions` | Not captured | Not captured |
| Orders `/workspace/orders` | Not captured | Not captured |
| Risk & Margin `/workspace/risk-margin` | Not captured | Not captured |
| Taxes `/workspace/taxes` | Not captured | Not captured |
| Training Hub `/workspace/training` | Not captured | Not captured |
| Glossary `/workspace/glossary` | Not captured | Not captured |
| Journal day, week, month, and all-entry views `/workspace/journal` (URL query variants) | Not captured | Not captured |
| Journal review table (week, month, and all-entry scopes) | Not captured | Not captured |
| Automation `/workspace/automation` | Not captured | Not captured |
| Experiments `/workspace/experiments` | Not captured | Not captured |
| Help landing `/help` | Not captured | Not captured |
| Help topic `/help/:helpKey` | Not captured | Not captured |
| Settings — Your AI overview, connections, providers, and connection workflow `/workspace/settings/your-ai/*` | Not captured | Not captured |
| Settings — Investor Profile `/workspace/settings/profile` | Not captured | Not captured |
| Settings — Preferences / Help refresh `/workspace/settings/preferences` | Not captured | Not captured |
| Settings — Account `/workspace/settings/account` | Not captured | Not captured |
| Security Master list, detail, create, and edit `/workspace/security-master/*` | Not captured | Not captured |
| NotFound (unmatched route) | Not captured | Not captured |
| Representative open Dialog (profile switcher or delete-profile confirmation) | Not captured | Not captured |
| HelpTooltip open, on a route that renders a tooltip | Not captured | Not captured |

Route inventory was checked against [`scaffoldRoutes.ts`](../../../apps/frontend/src/scaffoldRoutes.ts), [`App.tsx`](../../../apps/frontend/src/App.tsx), and [`SettingsShell.tsx`](../../../apps/frontend/src/SettingsShell.tsx). The actual Journal page takes precedence over the scaffold placeholder at the same path. The Settings root redirects to Your AI; include its tab routes and subroutes rather than capturing the redirect as a separate page.

## Static styling audit

This is a source review, not computed-style or rendered-page verification. It directly covers the global stylesheets, Tailwind configuration, the reusable frontend UI primitives, shared package placeholder, and representative routed/shared components listed below. An exhaustive scan of every frontend TSX file and generated Tailwind selector was not possible without source-search tooling; remaining class-level findings must be checked before treating this audit as complete.

| Source / selector or class | Existing styling | Migration target / disposition |
| --- | --- | --- |
| [`index.css`](../../../apps/frontend/src/index.css) `:root` color variables | Legacy palette: slate text (`#334155`, `#0f172a`, `#475569`), canvas/border/surface values (`#f8fafc`, `#dbe4f0`, `#fff`, `#eef2ff`, `#e2e8f0`), indigo action (`#4f46e5`), green/amber/red states, and an rgba action tint. A second group of short names aliases these variables. | Use the old-to-Figma crosswalk in [`design-tokens.json`](../flows/design-tokens.json). `text.primary`, `text.muted`, `bg.page`, and `border.subtle` have direct semantic candidates. Several surface/action roles are unresolved; retain documented aliases/exceptions until a semantic match is approved. Do not map by visual similarity alone. |
| `index.css` root font declaration and code style | Root is `16px/1.5` system UI; `code` uses a platform monospace stack. `h1`/`h2` use clamped sizes. | Replace font families and text styles only under E-03 using IBM Plex inventory values. Check wrapping at both baselines; preserve page structure and spacing. |
| `index.css` `body` background | Radial indigo gradient with a hard-coded rgba color over the canvas. | No semantic gradient token is exported. Capture current appearance; compare against Figma page designs under R-14/T-04.1 before deciding whether to retain it. |
| [`App.css`](../../../apps/frontend/src/App.css) panels and cards | Most colors and the shared soft shadow use legacy variables. Border radii and padding are literal values (`1rem`, `0.9rem`, `0.75rem`, etc.). Hero and settings overview cards use a two-stop gradient. | Migrate mapped colors to semantic CSS variables. Radii may use the ADR 0018 `px` realization only when visual scope allows. Spacing values must preserve computed geometry. Gradient decision remains for T-04.1. |
| `App.css` status and action styling | Success, warning, and error borders use legacy state variables; primary button text is literal `#ffffff`. | Positive/negative Figma status tokens are candidates for success/error, but there is no Figma warning token. Do not silently substitute. Primary button foreground should be reviewed against `text.on-inverse`; no mapping is assumed by this audit. |
| [`tailwind.config.ts`](../../../apps/frontend/tailwind.config.ts) | Tailwind 3.4 is actively used. Palette and shadow utilities point at legacy custom properties; font stacks are system UI/monospace. Spacing and radius scales are hard-coded. `darkMode: ['class']` is configured. | Preserve Tailwind as a consumer; point semantic utilities at canonical Figma properties under E-02. Remove competing hard-coded semantic scales only where replacement preserves computed CSS. Avoid a second theme/palette system. |
| [`components/ui/button.tsx`](../../../apps/frontend/src/components/ui/button.tsx) | Semantic action/error/surface classes coexist with `text-white`, alpha hover modifiers, and focus classes `ring-ring` / `ring-offset-background`. | Replace fixed white with an approved semantic foreground; verify alpha utilities compile against CSS-variable colors. Confirm whether `ring-ring` and `ring-offset-background` resolve in generated CSS; use exported `accent.strong` for focus indication only as directed by ADR 0018. |
| [`components/ui/input.tsx`](../../../apps/frontend/src/components/ui/input.tsx), `select.tsx`, `textarea.tsx` | Mostly semantic palette classes; focus-visible rings use the action token. Dimensions and padding are Tailwind utility values. | Keep primitive components. Check semantic ring color and offset mappings; do not alter dimensions/padding as part of the skin swap. |
| [`components/ui/card.tsx`](../../../apps/frontend/src/components/ui/card.tsx) | Semantic border, surface, text, and shadow utilities; fixed rounded/padding classes in child primitives. | Preserve reusable UI layer; route shadow/radius through shared tokens without changing spacing geometry. |
| [`components/ui/alert.tsx`](../../../apps/frontend/src/components/ui/alert.tsx) | Success/warning/destructive use legacy state classes; destructive/success/warning variants also contain `dark:` branches. | Figma exports have positive/negative but no warning token. Inspect these existing class-based dark variants during E-02; themes must resolve through shared semantic CSS values, not a theme-specific component branch. Keep non-color status cues/accessibility intact. |
| [`components/ui/dialog.tsx`](../../../apps/frontend/src/components/ui/dialog.tsx) | Overlay uses `bg-black/50`; content uses `shadow-lg` and rounded/border/surface classes. Animation utility classes are present. | `bg.scrim` is the exported semantic candidate for the overlay. Use the shared dialog elevation for content. Animation is outside the visual-token scope; the existing animate utilities have a separate plan risk (R-8). |
| [`components/HelpTooltip.tsx`](../../../apps/frontend/src/components/HelpTooltip.tsx) | Tokenized border/surface/text, but `shadow-lg`, fixed width/offset, and focus ring `ring-ring`. | Use the appropriate shared popover/menu elevation after review. Preserve position and width; verify focus indicator resolves. |
| [`components/MarkdownViewer.tsx`](../../../apps/frontend/src/components/MarkdownViewer.tsx) | `prose prose-slate` adds a fixed slate typography/color palette on Markdown content. | Remove palette coupling in favor of semantic prose styling while preserving Markdown structure; verify links, headings, tables, code, and contrast in every theme. |
| [`packages/ui/src/NotYetImplemented.tsx`](../../../packages/ui/src/NotYetImplemented.tsx) | Shared placeholder hard-codes amber background/border and gray text utilities. | Migrate to a semantic informational treatment; no exact warning/info Figma token set exists. Do not invent a warning token; keep its shared component API and layout. |
| [`components/EmptyProfileAlert.tsx`](../../../apps/frontend/src/components/EmptyProfileAlert.tsx) | Hard-coded amber palette classes and emoji cue, with shadow utility. | No direct Figma warning token. Determine a non-color-only semantic presentation without changing behavior or content; this needs product/UX direction before a warning color is selected. |
| [`components/JournalReviewTable.tsx`](../../../apps/frontend/src/components/JournalReviewTable.tsx) | Most table colors are semantic; checkbox focus uses the action token. Includes fixed dimensions, truncation, and spacing utilities. | Preserve all layout/overflow behavior. Check status/selection token meanings and ensure focus remains visible. |
| [`ConfigurationErrorPanel.tsx`](../../../apps/frontend/src/components/ConfigurationErrorPanel.tsx) | Semantic utilities mixed with opacity modifiers (`/30`, `/10`, `/50`), `shadow-lg`, and fixed typography sizes. | Confirm alpha utilities work with CSS variable colors; map severity and elevation only to approved tokens; preserve size/spacing. |
| [`InvestorProfilePage.tsx`](../../../apps/frontend/src/InvestorProfilePage.tsx) and account/security/AI workflows | Representative pages use utility styles; Investor Profile includes literal `text-red-500` and `text-green-600` feedback colors. | These should be inventoried across all routed components and moved to semantic status tokens (positive/negative only where meanings match). Warning and neutral states need explicit treatment; no broad refactor of layout classes. |

### Existing visual values without an established Figma mapping

These are explicit non-mappings in the inventory and must not be guessed during E-02:

- `--color-surface-emphasis`, `--color-surface-muted`, and `--color-surface-code`.
- `--color-action-primary-soft`.
- `--color-state-warning`.
- `--shadow-elevation-soft` as a single generic shadow. Figma supplies separate menu, popover, and dialog elevations.
- Existing indigo radial/card gradients; no gradient foundation token is present.
- Tailwind `slate`, `gray`, `amber`, `red`, `green`, `white`, and `black` palette classes outside the token map.

The exact legacy-variable mapping and candidate status are recorded in `existingTokenMapping` in [`design-tokens.json`](../flows/design-tokens.json); this audit does not promote candidates to approved equivalences.

## E-02-relevant follow-up

1. Capture the route/state matrix in a browser at exactly 375px and 1280px. Store the images in the session workspace or attach them to the PR and link each capture here.
2. Complete the source-wide literal/class audit, including all `apps/frontend/src` route components and the shared `packages/ui` package. Record each target by file and selector/class, then add source line references before closing T-01.3.
3. Resolve only mappings required to establish the token layer. Unmatched legacy roles may remain documented compatibility declarations under ADR 0018; do not assign approximate Figma tokens merely to make the crosswalk look complete.
4. Keep gradient fidelity (R-14/T-04.1), alert/warning semantics, and full accessibility criteria scoped to their later decisions. They do not require beginning E-02, but E-02 must not introduce invented values or break current behavior.

## Verification and task disposition

- [x] Reviewed `index.css`, `App.css`, Tailwind configuration, representative `components/ui` primitives, the shared placeholder package, route declarations, and selected routed/common components.
- [ ] Screenshot reference for every listed route/state at 375px.
- [ ] Screenshot reference for every listed route/state at 1280px.
- [ ] Exhaustive source-wide hard-coded visual-value and unresolved utility audit with file/line mappings.
- [x] No-application-code-change condition — satisfied; only planning/research documentation was added.

T-01.3 is **blocked**, not done: the required screenshots and complete file/line audit have not been produced. Consequently E-01's exit gate is **not satisfied**, and E-02 must not start.
