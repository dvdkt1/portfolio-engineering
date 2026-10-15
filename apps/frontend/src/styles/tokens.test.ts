import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
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

  for (const [legacyName, canonicalName] of [
    ['--color-text-primary', '--text-primary'],
    ['--color-text-muted', '--text-muted'],
    ['--color-bg-canvas', '--bg-page'],
    ['--color-border-subtle', '--border-subtle'],
  ]) {
    assert.equal(
      lightDeclarations.get(legacyName),
      `var(${canonicalName})`,
      `${legacyName} must alias the approved canonical Figma token`,
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
