# Portfolio OS design-token foundations inventory

**Status:** source inventory for plan [0010](../../plans/0010-design-token-foundation.md), task T-01.1  
**Figma file:** [Portfolio operating system Wireframes](https://www.figma.com/design/4ffzXpXtH6B9JEAzZtSzmW/Portfolio-operating-system-Wireframes)  
**Inventory data:** [design-tokens.json](../flows/design-tokens.json)

## Sources and fidelity

This inventory was transcribed from the supplied Figma exports: `Light.tokens.json`, `Dark _ Orchid.tokens.json`, `Pathfinder.tokens.json`, `Warm _ Orchid.tokens.json`, `High contrast.tokens.json`, `Default.tokens.json`, and `styles.tokens.json`. The export mode names are retained as written. Figma node IDs are recorded in the JSON under `source.nodes`.

Color values are retained as exported hexadecimal colors and alpha values; icon tokens retain their Figma alias references. Figma `com.figma.codeSyntax.WEB` variable names are retained exactly. Where an export has no CSS code syntax, the inventory records `cssVariableName: null`; it does not manufacture a Figma-defined CSS name. Spacing/radius export values are numbers without units and likewise have no exported CSS variable names. These are documented as open application-mapping decisions, not silently converted to CSS lengths.

## Theme color inventory

All five mode exports expose the same **29 semantic color-token paths**. `design-tokens.json` carries the full per-theme values and metadata, including Figma variable IDs, descriptions, exact code-syntax names, and icon alias references.

| Group | Figma token paths |
| --- | --- |
| Background | `bg.page`, `bg.subtle`, `bg.placeholder`, `bg.inverse`, `bg.selected`, `bg.disabled`, `bg.inverse-light`, `bg.inverse-subtle-light`, `bg.scrim`, `bg.highlight` |
| Text | `text.primary`, `text.on-inverse`, `text.secondary`, `text.muted`, `text.faint`, `text.disabled`, `text.link` |
| Border | `border.default`, `border.subtle`, `border.muted` |
| Icon | `icon.default`, `icon.on-inverse`, `icon.muted`, `icon.disabled` |
| Status | `status.positive`, `status.negative`, `status.positive-subtle`, `status.negative-subtle` |
| Accent | `accent.strong` |

The theme values in the JSON use the export mode names `Light`, `Dark / Orchid`, `Pathfinder`, `Warm / Orchid`, and `High contrast`. Exact runtime `data-theme` slugs are not part of these exports and remain undecided.

### CSS names supplied by Figma

Figma supplies these code-syntax names (no `color-` prefix):

- Background: `--bg-page`, `--bg-subtle`, `--bg-placeholder`, `--bg-inverse`, `--bg-selected`, `--bg-disabled`
- Text: `--text-primary`, `--text-on-inverse`, `--text-secondary`, `--text-muted`, `--text-faint`, `--text-disabled`, `--text-link`
- Border: `--border-default`, `--border-subtle`, `--border-muted`

Figma does **not** supply CSS names for `bg.inverse-light`, `bg.inverse-subtle-light`, `bg.scrim`, `bg.highlight`, the icon aliases, status colors, or `accent.strong`. Those tokens keep their Figma paths in the inventory until an implementation naming convention is confirmed.

## Shared foundations

### Spacing and radius

`Default.tokens.json` has mode `Default`. It provides spacing token names `space/2`, `/4`, `/8`, `/12`, `/16`, `/20`, `/24`, `/32`, `/40`, `/48`, `/64`, with numeric values matching the suffix and the description “Padding and gaps on the 4px grid.” It also provides `radius/sm` 4, `md` 6, `lg` 10, `xl` 12, and `full` 999, with token usage descriptions captured in the JSON. Neither group has CSS code-syntax names or units in the export.

### Typography and font families

`styles.tokens.json` supplies 15 named styles:

| Figma style | Family | Weight | Size | Line height | Letter spacing |
| --- | --- | ---: | ---: | ---: | ---: |
| Heading/H1 | IBM Plex Sans | 600 | 28px | 36px (1.2857) | 0px |
| Heading/H2 | IBM Plex Sans | 600 | 20px | 28px (1.4) | 0px |
| Heading/H3 | IBM Plex Sans | 500 | 16px | 24px (1.5) | 0px |
| Body/Default | IBM Plex Sans | 400 | 14px | 20px (1.4286) | 0px |
| Body/Small | IBM Plex Sans | 400 | 13px | 18px (1.3846) | 0px |
| Body/Strong | IBM Plex Sans | 600 | 14px | 20px (1.4286) | 0px |
| Label/Default | IBM Plex Sans | 500 | 13px | 16px (1.2308) | 0px |
| Label/Small | IBM Plex Sans | 500 | 12px | 16px (1.3333) | 0px |
| Label/Small Strong | IBM Plex Sans | 600 | 12px | 16px (1.3333) | 0px |
| Caption/Uppercase | IBM Plex Sans | 500 | 12px | 16px (1.3333) | 0.48px |
| Data/Large | IBM Plex Mono | 500 | 24px | 32px (1.3333) | 0px |
| Data/Default | IBM Plex Mono | 400 | 14px | 20px (1.4286) | 0px |
| Data/Small | IBM Plex Mono | 400 | 12px | 16px (1.3333) | 0px |
| Editor/Default | IBM Plex Sans | 400 | 15px | 24px (1.6) | 0px |
| Editor/Mono | IBM Plex Mono | 400 | 14px | 22.4px (1.6) | 0px |

Font stacks in the export include `system-ui, sans-serif` for IBM Plex Sans and `ui-monospace, monospace` for IBM Plex Mono. Export descriptions and style metadata, including editor uses, are retained in the JSON.

### Elevation

`styles.tokens.json` supplies three shared (not theme-specific) shadows:

| Figma style | CSS value from export | Intended use |
| --- | --- | --- |
| Elevation/1 Menu | `0 8px 24px 0 rgba(0, 0, 0, 0.35)` | Toasts, context menus, filter panel |
| Elevation/2 Popover | `0 10px 28px 0 rgba(0, 0, 0, 0.35)` | Date-range picker and anchored popovers |
| Elevation/3 Dialog | `0 16px 40px 0 rgba(0, 0, 0, 0.45)` | Modal dialogs; pair with scrim |

There are no theme-specific elevation values in the supplied exports. Do not derive per-theme shadows from the theme names.

## Accessibility details present in source

The inventory records only explicit export guidance:

- `bg.highlight`: `text.primary` and `text.secondary` are described as at least 5:1 on this background in every theme; do not place `text.muted` on it.
- `status.positive`/`status.negative`: pair with ▲ or `+`, and ▼ or `−`, respectively; do not communicate the result by color alone.
- `status.positive-subtle`/`status.negative-subtle`: corresponding status text is described as at least 5:1 on the subtle background.
- `accent.strong`: described as at least 3:1 against `bg.page`, `bg.subtle`, and `bg.selected` in every theme; focus rings are one named use.
- `Caption/Uppercase`: minimum 12px; keep all-caps labels short because they are slower to read.

The exports do not state a global WCAG conformance level, full text/background pairing matrix, focus-ring dimensions, keyboard interaction requirements, forced-colors behavior, or reduced-motion guidance. No such values are inferred here.

## Reconciliation with the existing plan

The exports confirm five equal color-token sets, but they change several plan assumptions:

1. **Use exact Figma code-syntax names where provided.** Earlier plan text proposed a blanket `--color-*` namespace. The exports specify names such as `--bg-page`, `--text-primary`, and `--border-subtle` instead. Tokens without code syntax stay unnamed pending an architecture decision.
2. **Elevation is shared.** The plan proposed per-theme elevation; the only supplied elevation styles are in `styles.tokens.json` and have no theme modes.
3. **Spacing/radius are numbers without units or CSS names.** Existing plan examples `--space-*` and `--radius-*` are implementation proposals, not names defined by Figma. Confirm the conversion convention before using them in CSS.
4. **Accessibility targets are descriptive and token-specific.** They do not provide the full contrast-pair matrix or all handoff requirements assumed by the earlier plan. Only the explicit pairings above can be asserted from these files.
5. **Theme names/slugs differ in scope.** The exports specify mode names, not URL/DOM slugs; do not treat generated slugs as Figma source data.
6. **Existing-token mapping is only partly direct.** `existingTokenMapping` in the JSON covers every color and shadow variable in the current `index.css`. Several current surface/action/error roles have no exact export equivalent; candidates are marked for review, and unresolved mappings are explicitly left null rather than equated by guesswork.

These discrepancies require revising E-02/E-03/E-05 token naming, elevation, and contrast verification assumptions before those implementation efforts begin. This handoff does not change application code.
