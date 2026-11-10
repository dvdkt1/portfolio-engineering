import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import test from 'node:test'

type ExportedColor = string | { hex: string; alpha: number }

interface TokenTheme {
  colors: Record<string, ExportedColor>
}

interface TokenInventory {
  colorTokenMetadata: Record<
    string,
    { cssVariableName: string | null; figmaReference?: string }
  >
  themes: Record<string, TokenTheme>
}

function cssVariableName(path: string, inventory: TokenInventory): string {
  return (
    inventory.colorTokenMetadata[path]?.cssVariableName ??
    `--${path.replace(/[./]/g, '-')}`
  )
}

function exportedColorToCss(
  path: string,
  value: ExportedColor,
  inventory: TokenInventory,
): string {
  if (typeof value === 'string' && value.startsWith('{')) {
    const reference = inventory.colorTokenMetadata[path]?.figmaReference
    if (!reference) {
      throw new Error(`Missing Figma reference metadata for ${path}`)
    }

    const referencePath = reference.slice(1, -1).replaceAll('/', '.')
    return `var(${cssVariableName(referencePath, inventory)})`
  }

  if (typeof value === 'string') {
    return value.toLowerCase()
  }

  const channels = value.hex
    .replace('#', '')
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16))

  if (!channels || channels.length !== 3) {
    throw new Error(`Expected an RGB hex color, received ${value.hex}`)
  }

  return `rgba(${channels.join(', ')}, ${value.alpha})`
}

function resolveHex(value: ExportedColor): string {
  if (typeof value === 'string' && value.startsWith('{')) {
    throw new Error(`Unresolved Figma color reference: ${value}`)
  }

  return typeof value === 'string' ? value : value.hex
}

function relativeLuminance(hex: string): number {
  const channels = hex
    .replace('#', '')
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255)

  if (!channels || channels.length !== 3) {
    throw new Error(`Expected an RGB hex color, received ${hex}`)
  }

  const linearChannels = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  )

  return (
    linearChannels[0] * 0.2126 +
    linearChannels[1] * 0.7152 +
    linearChannels[2] * 0.0722
  )
}

function contrastRatio(first: string, second: string): number {
  const luminances = [relativeLuminance(first), relativeLuminance(second)].sort(
    (left, right) => right - left,
  )

  return (luminances[0] + 0.05) / (luminances[1] + 0.05)
}

async function readComponentSources(
  directory: URL,
  prefix = '',
): Promise<Array<{ path: string; source: string }>> {
  const entries = await readdir(directory, { withFileTypes: true })
  const sources = await Promise.all(entries.map(async (entry) => {
    const path = `${prefix}${entry.name}`
    if (entry.isDirectory()) {
      return readComponentSources(new URL(`${entry.name}/`, directory), `${path}/`)
    }
    if (!entry.name.endsWith('.tsx') || entry.name.endsWith('.test.tsx')) {
      return []
    }
    return [{ path, source: await readFile(new URL(entry.name, directory), 'utf8') }]
  }))
  return sources.flat()
}

test('remaining legacy surface utilities are explicit exceptions and focus uses the ring mapping', async () => {
  const [frontendSources, sharedSources, tailwindSource] = await Promise.all([
    readComponentSources(new URL('../', import.meta.url)),
    readComponentSources(new URL('../../../../packages/ui/src/', import.meta.url), 'packages/ui/'),
    readFile(new URL('../../tailwind.config.ts', import.meta.url), 'utf8'),
  ])
  const expectedExceptions: Record<string, string[]> = {
    'components/ConfigurationErrorPanel.tsx': ['bg-surface-emphasis/50', 'text-text-strong'],
    'components/ProfilePicker.tsx': ['bg-surface-default/80'],
  }
  const actualExceptions: Record<string, string[]> = {}
  for (const { path, source } of [...frontendSources, ...sharedSources]) {
    assert.doesNotMatch(source, /(?:focus-visible|focus):ring-accent-strong\b/, path)
    const matches = source.match(
      /\b(?:[\w-]+:)*(?:bg-surface-(?:default|muted|emphasis)|text-text-strong)(?:\/[\d.]+)?\b/g,
    )
    if (matches) actualExceptions[path] = matches.sort()
  }
  for (const values of Object.values(expectedExceptions)) values.sort()
  assert.deepEqual(actualExceptions, expectedExceptions)
  assert.match(tailwindSource, /ring:\s*'var\(--accent-strong\)'/)
})

test('Button states follow the approved Figma handoff without changing size variants', async () => {
  const [buttonSource, tailwindSource] = await Promise.all([
    readFile(new URL('../components/ui/button.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../tailwind.config.ts', import.meta.url), 'utf8'),
  ])
  const variants = buttonSource.split('variant: {')[1]?.split('size: {')[0]
  assert.ok(variants)
  const classesFor = (variant: string) => {
    const classes = variants.match(new RegExp(`\\b${variant}:\\s*'([^']+)'`))?.[1]
    assert.ok(classes, variant)
    return classes.split(' ')
  }
  assert.deepEqual(classesFor('default'), [
    'bg-inverse', 'text-on-inverse', 'hover:bg-inverse-subtle-light',
    'disabled:bg-disabled', 'disabled:text-text-disabled', 'disabled:opacity-100',
  ])
  assert.deepEqual(classesFor('outline'), [
    'border', 'border-border-muted', 'bg-subtle', 'text-text-primary',
    'hover:bg-selected', 'disabled:bg-disabled', 'disabled:text-text-disabled',
    'disabled:opacity-100',
  ])
  assert.deepEqual(classesFor('secondary'), [
    'bg-subtle', 'text-text-primary', 'shadow-[inset_0_0_0_1px_var(--border-muted)]',
    'hover:bg-selected', 'disabled:bg-disabled', 'disabled:text-text-disabled',
    'disabled:opacity-100',
  ])
  assert.deepEqual(classesFor('ghost'), [
    'bg-transparent', 'text-text-primary', 'hover:bg-selected',
    'disabled:bg-transparent', 'disabled:text-text-disabled', 'disabled:opacity-100',
  ])
  assert.match(buttonSource, /focus-visible:ring-2 focus-visible:ring-ring/)
  assert.match(buttonSource, /default: 'h-10 px-4 py-2'/)
  assert.match(buttonSource, /sm: 'h-9 rounded-md px-3'/)
  assert.match(buttonSource, /lg: 'h-11 rounded-md px-8'/)
  assert.match(buttonSource, /icon: 'h-10 w-10'/)
  assert.match(tailwindSource, /disabled:\s*'var\(--bg-disabled\)'/)
  assert.match(tailwindSource, /'text-disabled':\s*'var\(--text-disabled\)'/)
})

test('shell panels, navigation hover, and headings consume role-specific tokens', async () => {
  const [appCss, indexCss] = await Promise.all([
    readFile(new URL('../App.css', import.meta.url), 'utf8'),
    readFile(new URL('../index.css', import.meta.url), 'utf8'),
  ])
  const declarations = (source: string, selector: string) => {
    const rules = source.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)
    const block = [...rules].find((rule) => rule[1].trim() === selector.trim())?.[2]
    assert.ok(block, `Expected CSS selector ${selector}`)
    return new Map(
      [...block.matchAll(/^\s*([\w-]+)\s*:\s*([^;]+);/gm)].map(
        (match) => [match[1], match[2].trim()],
      ),
    )
  }

  const selectorFixture = `
    .primary-button,
    .secondary-button { color: red; }
    .secondary-button { color: blue; }
  `
  assert.equal(declarations(selectorFixture, '.secondary-button').get('color'), 'blue')
  assert.throws(
    () => declarations('.primary-button, .secondary-button { color: red; }', '.secondary-button'),
    /Expected CSS selector/,
  )

  for (const selector of [
    '.hero-panel,\n.status-panel',
    '.user-details div',
    '.settings-tabs',
    '.settings-section-card',
    '.settings-overview-card',
    '.settings-metrics',
    '.placeholder-grid li',
    '.route-note',
  ]) {
    assert.equal(declarations(appCss, selector).get('background'), 'var(--bg-subtle)', selector)
  }
  assert.equal(declarations(appCss, '.nav-link:hover').get('background'), 'var(--bg-selected)')
  assert.equal(declarations(appCss, '.nav-link.active').get('background'), 'var(--bg-selected)')
  assert.equal(declarations(appCss, '.nav-link.active').get('border-color'), 'var(--accent-strong)')
  assert.equal(declarations(appCss, '.nav-link:focus-visible').get('outline'), '2px solid var(--accent-strong)')
  assert.equal(declarations(appCss, '.nav-link:focus-visible').get('outline-offset'), '2px')
  assert.deepEqual(declarations(appCss, '.secondary-button'), new Map([
    ['background', 'var(--bg-subtle)'],
    ['color', 'var(--text-primary)'],
    ['border-color', 'var(--border-muted)'],
  ]))
  assert.deepEqual(declarations(appCss, '.secondary-button:hover:enabled'), new Map([
    ['background', 'var(--bg-selected)'],
  ]))
  assert.deepEqual(declarations(appCss, '.secondary-button:disabled'), new Map([
    ['background', 'var(--bg-disabled)'],
    ['color', 'var(--text-disabled)'],
    ['border-color', 'var(--border-muted)'],
  ]))
  const legacyButtonFocus = declarations(appCss, '.primary-button:focus-visible,\n.secondary-button:focus-visible')
  assert.equal(legacyButtonFocus.get('outline'), '2px solid var(--accent-strong)')
  assert.equal(legacyButtonFocus.get('outline-offset'), '2px')
  assert.equal(declarations(appCss, '.settings-overview-card').get('border-color'), 'var(--border-subtle)')
  assert.match(declarations(appCss, '.hero-panel').get('background') ?? '', /^linear-gradient\(/)
  for (const selector of [
    '.status-panel h3',
    '.user-details dd',
    '.nav-link.active',
    '.settings-metric-value',
  ]) {
    assert.equal(declarations(appCss, selector).get('color'), 'var(--text-primary)', selector)
  }
  assert.equal(declarations(indexCss, 'h1,\nh2').get('color'), 'var(--text-primary)')
  assert.equal(declarations(indexCss, 'code').get('color'), 'var(--color-text-strong)')
  assert.equal(declarations(indexCss, 'code').get('background'), 'var(--color-surface-code)')
  assert.doesNotMatch(indexCss, /color-scheme\s*:/, 'Native color-scheme must be owned by the theme blocks')
})

test('theme token inventory parity, CSS names, and explicit contrast guidance', async () => {
  const [inventorySource, themesSource] = await Promise.all([
    readFile(new URL('../../../../docs/uxd/flows/design-tokens.json', import.meta.url), 'utf8'),
    readFile(new URL('./themes.css', import.meta.url), 'utf8'),
  ])
  const inventory = JSON.parse(inventorySource) as TokenInventory
  const themeNames = Object.keys(inventory.themes)
  const lightTheme = inventory.themes.Light
  const expectedPaths = Object.keys(lightTheme.colors).sort()

  assert.ok(themeNames.length > 0, 'Expected exported theme modes')

  for (const themeName of themeNames) {
    const actualPaths = Object.keys(inventory.themes[themeName].colors).sort()
    assert.deepEqual(actualPaths, expectedPaths, `${themeName} semantic color token set`)
  }

  const lightBlock = themesSource.match(
    /:root,\s*\[data-theme="light"\]\s*\{([\s\S]*?)\}/,
  )?.[1]
  assert.ok(lightBlock, 'Expected the default Light theme block')
  const lightDeclarations = new Map(
    [...lightBlock.matchAll(/^\s*(--[\w-]+|color-scheme)\s*:\s*([^;]+);/gm)].map(
      (match) => [match[1], match[2].trim().toLowerCase()],
    ),
  )
  assert.equal(lightDeclarations.get('color-scheme'), 'light')
  const declaredVariables = new Set(
    lightDeclarations.keys(),
  )

  for (const path of expectedPaths) {
    const cssName = cssVariableName(path, inventory)
    assert.ok(
      declaredVariables.has(cssName),
      `Light theme is missing ${cssName} for Figma token ${path}`,
    )
    const expectedValue = exportedColorToCss(
      path,
      lightTheme.colors[path],
      inventory,
    )
    assert.equal(
      lightDeclarations.get(cssName),
      expectedValue.toLowerCase(),
      `Light theme value for ${path} must match the Figma export`,
    )
  }

  const approvedAliases = [
    ['--color-text-primary', '--text-primary'],
    ['--color-text-muted', '--text-muted'],
    ['--color-bg-canvas', '--bg-page'],
    ['--color-border-subtle', '--border-subtle'],
  ]
  for (const [legacyName, canonicalName] of approvedAliases) {
    assert.equal(
      lightDeclarations.get(legacyName),
      `var(${canonicalName})`,
      `${legacyName} must alias the approved canonical Figma token`,
    )
  }

  const darkOrchidTheme = inventory.themes['Dark / Orchid']
  assert.ok(darkOrchidTheme, 'Expected the exported Dark / Orchid theme')
  const darkOrchidBlock = themesSource.match(
    /\[data-theme="dark-orchid"\]\s*\{([\s\S]*?)\}/,
  )?.[1]
  assert.ok(darkOrchidBlock, 'Expected the Dark / Orchid runtime theme block')
  const darkOrchidDeclarations = new Map(
    [...darkOrchidBlock.matchAll(/^\s*(--[\w-]+|color-scheme)\s*:\s*([^;]+);/gm)].map(
      (match) => [match[1], match[2].trim().toLowerCase()],
    ),
  )

  assert.equal(
    darkOrchidDeclarations.get('color-scheme'),
    'dark',
    'Dark / Orchid must use the approved dark native control and scrollbar mode',
  )
  assert.deepEqual(
    [...darkOrchidDeclarations.keys()].sort(),
    [
      ...expectedPaths.map((path) => cssVariableName(path, inventory)),
      ...approvedAliases.map(([legacyName]) => legacyName),
      'color-scheme',
    ].sort(),
    'Dark / Orchid runtime block must expose only exported tokens, approved compatibility aliases and native color-scheme',
  )

  for (const [legacyName, canonicalName] of approvedAliases) {
    assert.equal(
      darkOrchidDeclarations.get(legacyName),
      `var(${canonicalName})`,
      `Dark / Orchid ${legacyName} must alias the approved canonical Figma token`,
    )
  }

  for (const path of expectedPaths) {
    const cssName = cssVariableName(path, inventory)
    assert.ok(
      darkOrchidDeclarations.has(cssName),
      `Dark / Orchid theme is missing ${cssName} for Figma token ${path}`,
    )
    const expectedValue = exportedColorToCss(
      path,
      darkOrchidTheme.colors[path],
      inventory,
    )
    assert.equal(
      darkOrchidDeclarations.get(cssName),
      expectedValue.toLowerCase(),
      `Dark / Orchid theme value for ${path} must match the Figma export`,
    )
  }

  for (const [themeName, theme] of Object.entries(inventory.themes)) {
    const color = (path: string) => resolveHex(theme.colors[path])
    const requiredPairs: Array<[string, string, number]> = [
      ['text.primary', 'bg.highlight', 4.5],
      ['text.secondary', 'bg.highlight', 4.5],
      ['status.positive', 'status.positive-subtle', 4.5],
      ['status.negative', 'status.negative-subtle', 4.5],
      ['accent.strong', 'bg.page', 3],
      ['accent.strong', 'bg.subtle', 3],
      ['accent.strong', 'bg.selected', 3],
    ]

    for (const [foreground, background, minimum] of requiredPairs) {
      const ratio = contrastRatio(color(foreground), color(background))
      assert.ok(
        ratio >= minimum,
        `${themeName}: ${foreground} on ${background} is ${ratio.toFixed(2)}:1; expected at least ${minimum}:1`,
      )
    }
  }
})
