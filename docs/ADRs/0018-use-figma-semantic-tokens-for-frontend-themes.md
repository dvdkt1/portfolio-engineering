# ADR 0018: Use Figma semantic tokens for frontend themes

- Status: accepted
- Date: 2026-10-13
- Audience: [architect-agents, coding-agents, testing-agents, uxd, humans]

## Applicable When

- Adding or changing frontend theme tokens, CSS custom properties, Tailwind theme mappings, or visual styling that consumes the Figma Foundations.
- Adding a theme or changing how an existing theme is selected or represented.
- Not applicable to routing, data, APIs, page layout, or application behavior changes.

## Context

- The Figma exports define five theme modes and shared typography, spacing, radius, and elevation foundations. The reconciled inventory is [design-token-foundations.md](../uxd/research/design-token-foundations.md), with machine-readable values and metadata in [design-tokens.json](../uxd/flows/design-tokens.json).
- The exports specify CSS code-syntax names for some color tokens, but not all tokens. Spacing and radius values are exported as unitless numbers; no CSS unit is specified.
- The frontend currently combines CSS custom properties, `App.css`, Tailwind utilities, and reusable `components/ui` primitives. ADR [0005](0005-adopt-tailwind-css-and-shadcn-ui-for-frontend-ui.md) requires semantic tokens and prohibits a competing styling system.
- The requested theme work is an intentional visual skin swap. It must preserve current page layout and application behavior; it is not authorization to redesign layouts or migrate all CSS to Tailwind.

## Decision Statement

Use the Figma semantic token inventory as the canonical source for frontend visual values, exposed at runtime through CSS custom properties. Tailwind and all frontend styles consume those properties; components do not branch on theme identity. The five runtime identifiers are `light`, `dark-orchid`, `pathfinder`, `warm-orchid`, and `high-contrast`; theme selection and persistence are deferred.

## Decision Drivers

- Fidelity to the supplied Figma exports and exact source token names.
- One runtime token interface usable by both existing CSS and Tailwind.
- A deterministic naming and unit convention for tokens whose exports omit CSS syntax or units.
- No layout redesign, application-logic changes, or second styling architecture.
- Preservation of accessibility notes present in the Figma exports without claiming unsupported conformance.

## Options Considered

1. **CSS custom properties as canonical tokens; Tailwind as a consumer.** Works across `index.css`, `App.css`, and existing utility classes; preserves the current hybrid architecture.
2. **Tailwind configuration as the canonical token store.** Would leave plain CSS without the same source of truth and make theme values configuration-dependent.
3. **A separate TypeScript/CSS-in-JS token system.** Adds another runtime/build representation and duplicates the existing CSS custom-property interface.

## Chosen Approach and Rationale

Choose option 1. It aligns with ADR 0005 and the current frontend, supports runtime theme values without component-level branching, and avoids adding a second token architecture.

### Naming rule

1. If a Figma token has `com.figma.codeSyntax.WEB`, use that CSS custom-property name exactly.
2. Otherwise, preserve the Figma token path and create its CSS name by prefixing `--` and joining path segments with hyphens. Convert `.` and `/` path separators to `-`; preserve existing hyphens within a segment. Examples: `bg.scrim` → `--bg-scrim`, `status.positive-subtle` → `--status-positive-subtle`, `space/4` → `--space-4`, and `radius.sm` → `--radius-sm`.
3. For a typography style path, append the property name to the flattened path: `typography.heading.h1` font size → `--typography-heading-h1-font-size`. Use the exported Figma style name as metadata, not as an alternative variable name.
4. For an elevation path, use the flattened path: `elevation.1-menu` → `--elevation-1-menu`.
5. Keep a mapping from every canonical CSS name to its original Figma path and export metadata in the inventory. Do not create one-off names outside this rule.

### CSS units and no-layout-change boundary

- The token export's numeric spacing and radius values remain the exact numeric magnitudes; when exposed as CSS lengths, append `px` (for example, `space/8` → `--space-8: 8px`, `radius/md` → `--radius-md: 6px`). The Figma export does not encode a unit; `px` is the CSS realization rule, not a claim that a unit was included in the export.
- Typography sizes and letter spacing use the explicit exported `px` units. Preserve exported unitless line-height ratios as unitless CSS values.
- Do not change layout properties or substitute spacing tokens when doing so changes their computed value. A spacing literal may use a Figma spacing variable only when the computed CSS length is identical. Any density or layout adjustment needs separate approval.
- Typography and radii may receive the exported visual values, but must not change grid/flex structure, column widths, breakpoints, component order, or content. Font-metric-driven wrapping is an expected visual consequence to check at the established viewports; clipping, overflow, or material structure changes are not acceptable.

### Theme and migration contract

- Theme values live in the canonical custom properties. Use the five identifiers above on the root element via `data-theme`; absent an explicit theme, Light is the default. Do not follow operating-system theme preference until specified by a later theme-preference decision.
- All five theme modes define the same semantic color-token paths. Shared typography, spacing, radii, and elevation remain shared unless a source export explicitly provides a mode-specific value.
- The supplied elevation styles are shared across themes; do not create theme-specific shadows.
- Existing application variable names may remain temporarily during migration. Alias a legacy name to a canonical Figma variable only when its meaning is an approved match. If no direct equivalent exists, preserve the existing legacy declaration as a documented temporary exception; do not map it to a merely similar Figma token. Remove compatibility declarations after consumers migrate.
- Tailwind configuration maps semantic utility names to these custom properties. It does not define a parallel palette or theme system. Reusable `components/ui` remain in place and consume semantic utilities/tokens.
- UI code must not test theme slugs, branch styles by theme, or use theme-specific component variants. CSS resolves the active values.
- Do not implement a theme picker, persistence, preference API, or pre-paint selection script in this decision's token-foundation phase. A later specification must decide browser versus profile scope and selection UX.

## Consequences and Tradeoffs

- Plain CSS, Tailwind utilities, and reusable primitives can share one runtime interface.
- Some CSS names are application-defined because Figma did not export names for those tokens; the path-flattening rule makes the mapping reproducible and traceable.
- Pixel realization of unitless spacing/radius exports is explicit and simple, but applying tokens is limited by the no-layout-change boundary.
- Temporary legacy declarations may coexist during migration. They are compatibility state, not a second canonical design system, and must be removed as their consumers move.
- IBM Plex should be self-hosted using the weights present in the inventory so local/offline deployments do not depend on a third-party font service.
- The exports specify some contrast/status guidance, but not a complete WCAG conformance level or all interaction accessibility requirements. Validation must distinguish explicit Figma criteria from broader product accessibility checks.

## Audience Guidance

### Architect agents

- Treat the reconciled inventory as the Figma source of truth; preserve Figma paths and exact exported CSS names.
- Keep theme selection and persistence outside the token-layer decision.
- Do not infer unexported theme variants, colors, shadows, or CSS names beyond the deterministic mapping rule.

### Coding agents

- Put runtime token values in CSS custom properties, consumed by Tailwind and plain CSS.
- Preserve existing page structure, spacing geometry, routing, data behavior, and application logic.
- Keep any legacy variables documented and temporary; only alias semantically equivalent tokens.
- Do not add theme-name checks to React components or class composition.

### Testing agents

- Assert token-name parity across all five themes and verify values against the inventory.
- Check explicit Figma contrast requirements: the specified highlight text pairs and subtle status pairs at 5:1, and `accent.strong` at 3:1 against the named backgrounds. Do not infer a global WCAG target from these notes.
- Verify unchanged layout structure and no clipping/overflow at the agreed viewports. Test theme application by setting the root attribute; do not require selection or persistence before its later specification.

### UXD and humans

- Use the source inventory and export metadata to confirm token intent and names.
- Supply an additional accessibility handoff if broader contrast, focus, reduced-motion, or forced-colors requirements are intended.

## Open Questions and Follow-up

- A separate design handoff may define accessibility criteria not present in the supplied exports; confirm its location before the cross-theme accessibility closeout.
- Compare the current decorative gradients with the relevant Figma page designs before deciding whether to retain or remove them. The Foundations exports do not specify gradients.
- Theme picker placement, default/prefers-color-scheme behavior beyond the Light default, and browser/profile persistence require a later specification.
- Continue the implementation in [Plan 0010](../plans/0010-design-token-foundation.md). This ADR records architecture only; it does not authorize runtime code changes outside that plan.
