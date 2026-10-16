# Plan 0010: Frontend styling baseline and audit

**Status:** pre-styling baseline, source audit, and E-02 comparison complete  
**Plan task:** [T-01.3](../../plans/0010-design-token-foundation.md)  
**Architecture:** [ADR 0018](../../ADRs/0018-use-figma-semantic-tokens-for-frontend-themes.md)  
**Date reviewed:** 2026-10-15  
**Application source:** [`apps/frontend/src`](../../../apps/frontend/src)

## Reproducible pre-styling baseline

**Baseline commit:** `dad2b60716fdadf9df342405c9f7d404a0daf44a`

This is the committed pre-styling revision to compare against during the skin swap. At the time it was recorded, the application source had no worktree changes; only untracked token-inventory research files were present. The revision is reproducible through Git history or a detached worktree. Screenshots are optional review evidence, not a completion gate, unless a reviewer requests them.

### Manual representative-route comparison

The representative routes/states below were manually reviewed against baseline commit `dad2b60716fdadf9df342405c9f7d404a0daf44a` at 375px and 1280px on 2026-10-14 before styling and again after E-02 on 2026-10-15. The reviewer reported no notable existing layout issues and no notable unintended changes to layout structure, breakpoints, widths, spacing geometry, navigation, control dimensions, focus behavior, or overflow. Dialog behavior and keyboard focus were verified where specified. Future styling phases should check the same route/state at both widths, using the same app mode, representative data, and interaction state, and compare against the committed baseline. Focus on unintended changes to layout, wrapping, overflow, component order, responsive behavior, and interaction states; do not mistake intended color/type/radius/elevation changes for layout regressions.

| Representative route / state | Route-specific checks | 375px baseline | 1280px baseline | 375px after styling | 1280px after styling |
| --- | --- | --- | --- | --- | --- |
| Authenticated workspace shell + Dashboard `/workspace/dashboard` | Logo, welcome text, profile switcher, primary navigation, and placeholder panel remain in order; mobile does not clip header controls; desktop navigation/content columns remain unchanged. | Verified; no notable issue observed | Verified; no notable issue observed | Verified; no notable unintended change | Verified; no notable unintended change |
| Journal populated day editor `/workspace/journal?mode=day&date=<date-with-entry>` and review table `/workspace/journal?mode=month&month=<month-with-entries>` | Scope/mode controls, date input, editor, preview, save/actions retain dimensions and order; editor remains resizable; month table keeps its existing horizontal-scroll behavior and row actions stay reachable. | Verified; no notable issue observed | Verified; no notable issue observed | Verified; no notable unintended change | Verified; no notable unintended change |
| Help landing `/help` and a real Help topic `/help/<active-help-key>` | Group cards preserve order and breakpoint behavior; topic title, status message, Markdown headings/links/tables/code, and return link remain readable and do not overflow. | Verified; no notable issue observed | Verified; no notable issue observed | Verified; no notable unintended change | Verified; no notable unintended change |
| Settings Investor Profile form `/workspace/settings/profile` | Summary/edit form, labels, radio/checkbox groups, textareas, preview controls, feedback, and save/cancel actions preserve structure; keyboard focus stays visible and fields remain usable at narrow width. | Verified; no notable issue observed | Verified; no notable issue observed | Verified; no notable unintended change | Verified; no notable unintended change |
| Security Master populated list `/workspace/security-master?status=active` | Filters keep existing responsive arrangement; results retain horizontal scrolling rather than compressing/overlapping columns; links and status remain visible. | Verified; no notable issue observed | Verified; no notable issue observed | Verified; no notable unintended change | Verified; no notable unintended change |
| Open Security Master delete Dialog from a populated detail `/workspace/security-master/<existing-id>` | Dialog overlay and content remain on-screen; title/actions readable; focus is contained and visible, Escape dismisses, and the destructive action remains distinguishable. | Verified; dialog behavior and keyboard focus checked; no notable issue observed | Verified; dialog behavior and keyboard focus checked; no notable issue observed | Verified; dialog and keyboard focus behavior; no notable unintended change | Verified; dialog and keyboard focus behavior; no notable unintended change |
| Placeholder `/workspace/portfolio` and NotFound (use an unmatched path such as `/not-a-route`) | Status/placeholder content and action remain in order; no text, links, or buttons are clipped or obscured. | Verified; no notable issue observed | Verified; no notable issue observed | Verified; no notable unintended change | Verified; no notable unintended change |
At both widths and on the same routes after styling, verify: no change to page or component order, grid/flex structure, breakpoints, column widths, margins/padding/gaps, or control dimensions; no unexpected wrapping that clips content, horizontal overflow, or inaccessible controls; route navigation and focus order remain intact; visible keyboard focus; dialogs retain overlay, focus containment, Escape dismissal, and usable actions. Intended colors, typefaces, radii, and shadows may differ. Record the result per row and note any natural font-metric text reflow without treating it as layout approval. `HelpTooltip` is included in the source audit, but no mounted route usage was identified in the reviewed route/component tree; do not fabricate a route state for it.

The E-02 comparison against the pre-styling commit is complete for the representative routes/states at both viewport widths, including dialog and keyboard-focus behavior. No notable unintended layout or interaction changes were observed.

### T-03.2 Light-color comparison

T-03.2 applies the Figma Light colors through four direct legacy-variable mappings in the Light theme block: primary text `#334155` → `#121212`, muted text `#475569` → `#6B6B6B`, page background `#f8fafc` → `#FFFFFF`, and subtle border `#dbe4f0` → `#D9D9D9`. Candidate and unmapped legacy roles remain unchanged.

### T-03.3 typography application

The global typography application uses the existing Figma-derived CSS variables in `index.css` for the root body text, `h1`, `h2`, and `code`, and in `App.css` for `.eyebrow`, `.user-details dt`, `.nav-group h3`, `.nav-link.active`, `.settings-metric-value`, and `.settings-metric-label`. The active navigation link retains its existing weight through the Body/Strong weight token. IBM Plex Sans is selected through the existing variables for body, headings, and labels; IBM Plex Mono is selected for code and data values. Both retain the configured fallback stacks. The only intended visual differences are approved typeface, weight, size, line-height, and letter-spacing changes; natural wrapping/reflow is expected where font metrics differ. No layout or spacing adjustments were made.

**Verification status:** Complete based on the user's report: `git diff --check` passed; frontend tests passed (40/40); typecheck passed; lint passed with 6 warnings and 0 errors; production build passed; representative-route comparison passed at 375px and 1280px; dialog and keyboard-focus behavior passed. No unintended layout, overflow, navigation, control-size, or interaction regressions were observed. The user did not report specific natural text reflow; no problematic wrapping or clipping was reported. These results apply to T-03.3 and are distinct from the earlier E-02 and T-03.2 comparisons.

### T-03.4 radius and elevation application

App.css uses the existing shared radius properties by documented role: cards use `--radius-lg` (10px), hero/status/settings panels use `--radius-xl` (12px), and navigation links/buttons use `--radius-md` (6px). The established Dialog primitive uses `--radius-xl` and `shadow-elevation-dialog`, which resolves to the shared `--elevation-3-dialog` value. No menu or popover primitive/role was identified for applying the other elevation tokens. The existing `--shadow-elevation-soft` remains on static hero, status, and settings section cards because those roles do not match an exported floating-surface elevation; no legacy shadow was guessed or removed. Compatibility aliases remain in place.

The intended visible differences are updated corner curvature on the mapped App.css surfaces and the Figma dialog shadow/radius. No spacing, dimensions, layout structure, routing, content, or behavior were changed.

**Verification status:** Complete based on the user's report: `git diff --check` passed; frontend tests passed (40/40); typecheck passed; lint passed with 6 warnings and 0 errors; production build passed; representative-route comparison passed at 375px and 1280px; dialog behavior and keyboard focus passed. Approved radius changes and dialog elevation render as expected. No unintended layout, spacing, overflow, navigation, control-size, or interaction regressions were observed. Static cards retain `--shadow-elevation-soft` because no approved Figma elevation role exists.

### T-03.5 spacing-token publication

The shared spacing tokens were already present in `tokens.css` at the exported values: `--space-2`, `--space-4`, `--space-8`, `--space-12`, `--space-16`, `--space-20`, `--space-24`, `--space-32`, `--space-40`, `--space-48`, and `--space-64`. Tailwind now exposes matching named spacing keys (`space-2` through `space-64`) mapped to those properties. Existing legacy Tailwind spacing keys remain unchanged.

App.css was audited against the root's 14px font size. None of its distinct rem spacing values (`0.25`, `0.35`, `0.4`, `0.45`, `0.5`, `0.6`, `0.65`, `0.75`, `0.8`, `0.9`, `1`, `1.1`, `1.25`, `1.5`, `2`, `3`, and `4rem`) computes to an exported spacing-token value. No App.css spacing declarations were replaced, and no visual change is expected from this task.

**Verification status:** Complete based on the user's report: `git diff --check` passed; frontend tests passed (40/40); typecheck passed; lint passed with 6 warnings and 0 errors; production build passed; representative bounding-box/geometry spot-checks passed at 375px and 1280px. No unintended changes to widths, spacing geometry, wrapping, clipping, overflow, or component dimensions were observed. The exported Figma spacing values are available through the deterministic Tailwind named keys. App.css spacing remains unchanged because its audited literals do not exactly match exported token lengths at the current 14px root size.

The user reports that the representative route comparison against baseline commit `dad2b60716fdadf9df342405c9f7d404a0daf44a` passed at 375px and 1280px, including dialog and keyboard-focus behavior. Expected changes were limited to the four Light color roles; no unintended layout, overflow, navigation, control-size, or interaction regressions were observed.

The user also reports these T-03.2 checks passed: `git diff --check`; frontend tests (40/40); typecheck; lint (6 warnings, 0 errors); and production build.

### E-02 verification results

The user reports the following E-02 checks passed:

- Frontend tests.
- Frontend typecheck.
- Frontend lint (6 warnings, 0 errors).
- Frontend production build.
- `git diff --check`.
- Browser review: application renders as expected with no obvious unintended visual changes.

The user also completed a repository-wide CSS custom-property reference search. It confirmed that legacy compatibility properties are still consumed, including legacy `--color-*`, spacing/radius, and `--shadow-elevation-soft` properties in `tailwind.config.ts`, `index.css`, and `App.css`. Therefore, the zero-reference condition for alias removal is not satisfied; retain the compatibility declarations and do not remove them.

Route inventory was checked against [`scaffoldRoutes.ts`](../../../apps/frontend/src/scaffoldRoutes.ts), [`App.tsx`](../../../apps/frontend/src/App.tsx), and [`SettingsShell.tsx`](../../../apps/frontend/src/SettingsShell.tsx). The actual Journal page takes precedence over the scaffold placeholder at the same path. The Settings root redirects to Your AI; include its tab routes and subroutes rather than capturing the redirect as a separate page.

## Static styling audit

This is a source-wide static styling review of `apps/frontend/src` and the shared `packages/ui` package, including global styles, Tailwind configuration, route/page components, feature components, and reusable UI primitives. Findings below give source file and line references and identify either a Figma-token candidate or a non-mapping. This static audit is distinct from the completed pre-styling browser checks recorded above.

| Source / line(s) | Existing styling | Migration target / disposition |
| --- | --- | --- |
| [`index.css`](../../../apps/frontend/src/index.css) 7–34 | Legacy color palette (`#334155`, `#0f172a`, `#475569`, `#f8fafc`, `#dbe4f0`, `#fff`, `#eef2ff`, `#e2e8f0`, indigo, green, amber, red, rgba action tint) plus legacy aliases `--text`, `--bg`, `--accent`, etc. | Use the crosswalk in [`design-tokens.json`](../flows/design-tokens.json). Direct candidates include `text.primary`, `text.muted`, `bg.page`, `border.subtle`; several surface/action/state roles remain unmatched or candidates only. Preserve unmatched declarations as documented migration exceptions under ADR 0018. |
| `index.css` 34–42, 83–90 | `16px/1.5` system-ui root typography; code uses platform monospace; `h1`/`h2` use `clamp()` sizes; code padding/radius/colors are literals or legacy vars. | E-03 type tokens/IBM Plex. Preserve dimensions and compare wrapping; use mono family token for code. |
| `index.css` 49–55 | Body radial indigo gradient with literal rgba color. | No Foundations gradient token; compare Figma page designs in R-14/T-04.1 before retaining/removing. |
| [`App.css`](../../../apps/frontend/src/App.css) 1–303 | Shell, panels, navigation, settings, cards, and button rules use legacy color/shadow vars; numerous literal radius/spacing/font values. Hero and overview cards have gradients (about 19–26 and 195–202); button text includes literal white (about 290). | Migrate only mapped color roles; retain exceptions where no exact token exists. Radius/type may use exported values in their planned phases; spacing may change only if computed geometry remains identical. Gradients remain T-04.1 decision. |
| [`tailwind.config.ts`](../../../apps/frontend/tailwind.config.ts) 1–42 | Tailwind 3.4 active. Color/shadow map to legacy vars; font stacks are system/mono; named spacing and radii are hard-coded; `darkMode: ['class']`. | Tailwind consumes canonical CSS vars (ADR 0018); avoid competing palette/scales. `darkMode` is not the theme mechanism and class-based dark branches should be removed only within authorized visual migration, not replaced with theme-slug branches. |
| [`App.tsx`](../../../apps/frontend/src/App.tsx) ~437–550 | Workspace shell combines `App.css` classes with layout utilities (`flex`, `gap-5`, `min-w-0`, `flex-shrink-0`, `ml-4`, `flex-1`). Session states use status panel classes. | Color styling resides in `App.css`; preserve every layout utility and component order. Shell is covered in manual baseline checks. |
| [`components/ui/button.tsx`](../../../apps/frontend/src/components/ui/button.tsx) 7–25 | Semantic color classes plus `text-white`, `bg-action-primary/90`, `bg-state-error/90`; focus uses `ring-ring` and `ring-offset-background`. | `text.on-inverse` is a candidate for foreground; `/90` hover value has no export match except narrowly applicable `bg.inverse-subtle-light`. `ring-ring` and `ring-offset-background` are unresolved Tailwind color utilities (no corresponding config keys); map focus to `accent.strong` and an approved offset surface. |
| [`components/ui/input.tsx`](../../../apps/frontend/src/components/ui/input.tsx) 11–20; [`select.tsx`](../../../apps/frontend/src/components/ui/select.tsx) 9–19; [`textarea.tsx`](../../../apps/frontend/src/components/ui/textarea.tsx) 9–18 | Semantic border/surface/text classes, fixed Tailwind size/padding, focus rings keyed to `action-primary`, `ring-offset-background`. | Keep primitives and dimensions. Review focus color against `accent.strong`; `ring-offset-background` is undefined. Do not migrate sizing/spacing absent geometry equivalence. |
| [`components/ui/card.tsx`](../../../apps/frontend/src/components/ui/card.tsx) 8–66 | Semantic border/surface/text and `shadow-elevation`; radii, spacing, typography are Tailwind defaults/literals (`rounded-lg`, `p-6`, `space-y-*`, `text-sm`). | Retain reusable UI API. Migrate shadow/radius and type only under relevant plan tasks; preserve spacing geometry. |
| [`components/ui/alert.tsx`](../../../apps/frontend/src/components/ui/alert.tsx) 6–30 | Default uses semantic vars; destructive/success/warning use state colors and alpha border; each has a `dark:` class branch. | Figma has positive/negative status, no warning token. Do not invent warning mapping. Component must remain theme-agnostic; preserve explicit non-color status communication. |
| [`components/ui/dialog.tsx`](../../../apps/frontend/src/components/ui/dialog.tsx) 13–48 | Overlay `bg-black/50`; content `shadow-lg`, fixed radius; `animate-in`/`animate-out` family. | Overlay candidate `bg.scrim`, content elevation `elevation.3-dialog`; animation utilities are unrelated existing no-ops per R-8. Preserve geometry and Radix behavior. |
| [`components/ui/copy-button.tsx`](../../../apps/frontend/src/components/ui/copy-button.tsx) 1–93 | No direct color values; delegates visual variant/focus to Button; live status uses `sr-only`. | Covered by Button token migration; preserve status announcement and focus behavior. |
| [`components/HelpTooltip.tsx`](../../../apps/frontend/src/components/HelpTooltip.tsx) 38–58 | Semantic colors, `shadow-lg`, fixed `w-64` and offsets; focus `ring-ring`. | Elevation candidate `elevation.1-menu` or `.2-popover` based on Figma use; preserve width/position. Unresolved focus class needs token mapping. |
| [`components/HelpTopicLink.tsx`](../../../apps/frontend/src/components/HelpTopicLink.tsx) 9–20 | Semantic colors, fixed rounded/padding/type; focus `ring-ring`; hover uses `action-primary`. | Canonical semantic colors/radius/type; resolve focus color. Preserve link hit-area size and layout. |
| [`components/MarkdownViewer.tsx`](../../../apps/frontend/src/components/MarkdownViewer.tsx) 18–42 | Empty and filled states use semantic surface/text, but filled content adds `prose prose-slate` (hard-coded palette/type); `min-h-48`, break/overflow/padding classes. | Replace prose palette with token-driven typography/color under T-04.3; keep Markdown structure, overflow, min-height, and padding unchanged. |
| [`components/HelpGroup.tsx`](../../../apps/frontend/src/components/HelpGroup.tsx) 9–20; [`HelpContentStatus.tsx`](../../../apps/frontend/src/components/HelpContentStatus.tsx) 18–20 | Semantic border/surface/text; hard-coded Tailwind radius/spacing/type scale. | No literal color mapping issue. Retain layout; typography/radius use tokens in planned migrations. |
| [`components/ConfigurationErrorPanel.tsx`](../../../apps/frontend/src/components/ConfigurationErrorPanel.tsx) 19–67 | Semantic colors mixed with alpha modifiers (`border-state-error/30`, `bg-state-error/10`, `bg-surface-emphasis/50`), `shadow-lg`, fixed text sizes. | Verify alpha utilities against variable colors; surface-emphasis remains unmapped; select only approved error/status and dialog/card elevation. Preserve spacing. |
| [`components/EmptyProfileAlert.tsx`](../../../apps/frontend/src/components/EmptyProfileAlert.tsx) 50–72 | Hard-coded amber palette, icon emoji, `shadow-sm`; close action has no explicit focus-visible ring. | No Figma warning token. Requires semantic warning treatment without color-only meaning; verify keyboard focus visibility. Do not invent palette values. |
| [`components/ProfilePicker.tsx`](../../../apps/frontend/src/components/ProfilePicker.tsx) 143–225 | `shadow-lg`, alpha action classes (`bg-action-primary/10`, `bg-state-error/10`, `bg-surface-default/80`), `text-white`; selection button uses `focus:outline-none` without explicit focus-visible ring; hover `shadow-md`. | Map colors only when semantically matched; alpha/highlight shades lack general export equivalents. Restore a visible focus treatment using `accent.strong`; choose shared elevation by use. Preserve grid/sizing. |
| [`components/ProfileSwitcher.tsx`](../../../apps/frontend/src/components/ProfileSwitcher.tsx) 61–111 | `text-white`, `bg-action-primary/10`, `shadow-xs`, plus semantic classes. `shadow-xs` is not in Tailwind 3.4's default shadow scale and no custom `xs` entry exists. | Use `text.on-inverse` if verified; alpha remains unresolved unless exact exported role matches. Replace `shadow-xs` only with a mapped elevation or retain as an explicit exception; preserve profile dialog geometry. |
| [`components/DeleteProfileDialog.tsx`](../../../apps/frontend/src/components/DeleteProfileDialog.tsx) 93–172 | Uses shared Dialog, Alert, Input, Button; local card borders/surface/text use semantic utilities and fixed spacing. | Inherits Dialog/Alert/primitive findings; no additional literal palette. Retain confirmation/error hierarchy and focus behavior. |
| [`components/AiConnectionForm.tsx`](../../../apps/frontend/src/components/AiConnectionForm.tsx) 126–185 | Uses shared Input/Select/Button; errors `text-state-error`, help text `text-text-muted`; layout uses grid/flex gap utilities. | Reuse semantic status aliases only where mapping approved; preserve form structure and gaps. |
| [`components/AiConnectionList.tsx`](../../../apps/frontend/src/components/AiConnectionList.tsx) 43–79, 144–236 | Semantic surface/border/text; success/error statuses use legacy state utilities; shared Dialog/Button used for destructive action. | Success/error are candidate matches to Figma positive/negative; verify meanings before aliasing. Preserve text status cues and state labels. |
| [`components/AiProviderCatalog.tsx`](../../../apps/frontend/src/components/AiProviderCatalog.tsx) 22–72 | Semantic muted text and shared Card/Button; planned cards use `opacity-70`. | No direct palette literal. Preserve disabled/planned text as well as opacity so state is not conveyed by opacity alone. |
| [`components/JournalReviewTable.tsx`](../../../apps/frontend/src/components/JournalReviewTable.tsx) 62–139 | Semantic table colors; hover `surface-emphasis` (legacy/unmapped role); checkbox uses `accent-action-primary` and focus `ring-offset-background`. Width/truncation/overflow utilities are layout behavior. | Preserve table dimensions and horizontal scrolling. Resolve surface-emphasis separately; make checkbox focus use approved accent and offset tokens. |
| [`components/JournalAnalysisPanel.tsx`](../../../apps/frontend/src/components/JournalAnalysisPanel.tsx) 275–500 | Semantic color classes; warning border uses `state-warning/50`, statuses use success/error vars; shared Markdown viewer and primitives. | No Figma warning mapping; success/error candidate mappings only. Keep warning meaning non-color-only and Markdown token migration consistent. |
| [`JournalPage.tsx`](../../../apps/frontend/src/JournalPage.tsx) 770–890, 1010–1145, 1285–1408 | Repeated `text-white` on primary/selected controls; action/surface alpha or opacity states (`hover:opacity-90`, `bg-opacity-10`); literal Tailwind type/radius; editor uses hard-coded focus action ring and inline user-adjustable `height`. | Replace fixed white and opacity colors only with semantically approved tokens; error/success feedback can map to negative/positive after checking Figma intent. Preserve editor resize/storage behavior, all sizing, responsive preview grid, and state cues. |
| [`InvestorProfilePage.tsx`](../../../apps/frontend/src/InvestorProfilePage.tsx) 151–230, 260–452 | Literal palette classes `text-red-500`, `text-green-600`, `text-gray-700/600/500`, `bg-gray-50`, `text-blue-600`; old `btn`, `input`, `text-input`, `select-input`, `textarea-input` classes; native controls have no explicit visible focus classes here. | Replace literal palette with semantic tokens only after meaning-mapping; positive/negative are candidates, neutral fields map by Figma text/surface roles; no Figma info/warning token. Check legacy class definitions (not present in the reviewed global/Tailwind setup) and keyboard focus. Preserve form controls and spacing. |
| [`AccountSettingsPage.tsx`](../../../apps/frontend/src/AccountSettingsPage.tsx) 133–199; [`SettingsShell.tsx`](../../../apps/frontend/src/SettingsShell.tsx) 1–48 | Shared primitives and `.status-panel`/`.actions-row` shell; mostly semantic colors plus Tailwind spacing/type. | No separate raw palette finding; inherits card/alert/button migration. Preserve tab route order and layout. |
| [`YourAiPage.tsx`](../../../apps/frontend/src/YourAiPage.tsx) 38–106, 160–402; [`components/HelpRefreshControl.tsx`](../../../apps/frontend/src/HelpRefreshControl.tsx) 47–86 | Semantic text/status utilities, shared primitives, `settings-*` rules in App.css; refresh failure uses warning Alert. | Map state colors only to approved semantics; warning remains unresolved. Keep status announcements and component behavior. |
| [`SecurityMasterPage.tsx`](../../../apps/frontend/src/SecurityMasterPage.tsx) 40–60, 200–367 | Mostly semantic classes; `text-text-danger` is not defined in Tailwind's configured color keys (there is `state-error`, not `text-danger`); status/error styling uses `.error-panel`; fixed table min-width and horizontal scrolling. | Replace undefined utility with an approved semantic negative token. Preserve responsive overflow and form geometry. Shared Dialog/inputs carry their own findings. |
| [`PlaceholderPage.tsx`](../../../apps/frontend/src/PlaceholderPage.tsx) 1–130; [`NotFoundPage.tsx`](../../../apps/frontend/src/NotFoundPage.tsx) 1–28; [`SettingsPage.tsx`](../../../apps/frontend/src/SettingsPage.tsx) 1–10 | Use App.css status/placeholder/action classes, no additional literal palette. | Covered by `App.css` mappings; keep placeholder content and layout unchanged. |
| [`packages/ui/src/NotYetImplemented.tsx`](../../../packages/ui/src/NotYetImplemented.tsx) 27–55 | Shared package hard-codes amber backgrounds/borders and gray text; `focus:ring-action-primary` uses a configured color, but it has no `focus-visible` gate. | No exact warning/info token; define disposition without inventing a theme value. Preserve visible focus (consider keyboard-visible focus state) and shared API/layout. |

### Existing semantic CSS variable inventory

The legacy variables are defined in [`index.css`](../../../apps/frontend/src/index.css) 7–33 and cross-referenced in `existingTokenMapping` in [`design-tokens.json`](../flows/design-tokens.json):

| Existing variable(s) | Audit disposition |
| --- | --- |
| `--color-text-primary`, `--color-text-strong`, `--color-text-muted` | `--color-text-primary` and `--color-text-muted` have direct Figma candidates `--text-primary` and `--text-muted`. `--color-text-strong` maps only as a candidate to `text.primary`; validate use in hierarchy before aliasing. |
| `--color-bg-canvas`, `--color-border-subtle` | Direct candidates for `bg.page` and `border.subtle`. |
| `--color-surface-default` | Candidate for `bg.subtle`; validate semantic use across cards, inputs, and panels before aliasing. |
| `--color-surface-emphasis`, `--color-surface-muted`, `--color-surface-code` | No direct equivalent established in the exports. Retain as documented temporary exceptions until a design decision exists. |
| `--color-action-primary` | Candidate for `bg.inverse` (Figma describes primary buttons); validate all link/focus/action usages before aliasing. |
| `--color-action-primary-soft` | No direct equivalent established. |
| `--color-state-success`, `--color-state-error` | Semantic candidates for `status.positive` and `status.negative`; deterministic CSS names per ADR 0018, because Figma did not supply CSS syntax names. Confirm meaning/context before migration. |
| `--color-state-warning` | No warning token in Figma Foundations; do not alias to positive or negative. |
| `--shadow-elevation-soft` | No equivalent single generic shadow. Figma supplies menu, popover, and dialog levels separately; migrate by component role only. |
| `--text`, `--text-h`, `--text-muted`, `--bg`, `--border`, `--panel-bg`, `--hero-bg`, `--detail-bg`, `--code-bg`, `--accent`, `--success-border`, `--warning-border`, `--error-border`, `--shadow` | Compatibility aliases currently refer to the preceding legacy variables. Keep only while consumers remain; remove after a zero-reference check. Their presence is not a separate semantic token system. |

The audit also reviewed all visual-bearing source under `apps/frontend/src` and `packages/ui/src`. Remaining route/component styling not called out as a separate palette finding uses the existing semantic Tailwind keys and/or the `App.css` shell classes; its Tailwind size, spacing, radius, typography, and overflow utilities are still migration-sensitive. Preserve their computed geometry under the no-layout-change rule. UI source files reviewed include `AccountSettingsPage.tsx`, `App.tsx`, `HelpLandingPage.tsx`, `HelpRefreshControl.tsx`, `HelpTopicPage.tsx`, `InvestorProfilePage.tsx`, `JournalPage.tsx`, `NotFoundPage.tsx`, `PlaceholderPage.tsx`, `SecurityMasterPage.tsx`, `SettingsPage.tsx`, `SettingsShell.tsx`, `YourAiPage.tsx`, and all `.tsx` files under `components/` and `packages/ui/src/`.

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

1. The representative-route comparison against the committed baseline at 375px and 1280px is complete for E-02. Repeat the comparison after later visual phases; screenshots remain optional unless requested by a reviewer.
2. Resolve only mappings required for each later phase. Unmatched legacy roles may remain documented compatibility declarations under ADR 0018; do not assign approximate Figma tokens merely to make the crosswalk look complete.
3. Keep gradient fidelity (R-14/T-04.1), alert/warning semantics, and full accessibility criteria scoped to their later decisions.

## Verification and task disposition

- [x] Recorded committed pre-styling source revision `dad2b60716fdadf9df342405c9f7d404a0daf44a`.
- [x] Completed source-wide static styling audit across `apps/frontend/src` and `packages/ui`; findings include file/line locations and semantic migration dispositions.
- [x] Manual pre-styling verification of representative route/state matrix at 375px and 1280px, including specified dialog behavior and keyboard focus.
- [x] E-02 frontend tests, typecheck, lint, production build, and `git diff --check` reported passing by the user; lint reports 6 warnings and 0 errors.
- [x] Repository-wide CSS custom-property search completed; compatibility properties remain referenced and were retained.
- [x] Record E-02 post-change comparison of the representative route/state matrix against the baseline commit at both 375px and 1280px.
- [x] No-application-code-change condition for T-01.3/E-01 — satisfied; E-02 token infrastructure changes are limited to the planned CSS/Tailwind foundation.

The source-wide styling audit, pre-styling baseline checks, E-02 comparison, and T-03.2 Light-color comparison are **complete**. T-01.3, E-01, and E-02 are complete. T-03.2's automated checks and representative-route comparison at 375px and 1280px are complete; no notable unintended changes were observed. T-03.3 and later E-03 tasks have not started.
