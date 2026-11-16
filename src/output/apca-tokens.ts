import type { ApcaPair, ApcaPaletteResult, CSSTokens, ShadeKey, Theme } from '../types.js'

const SHADE_KEYS: ShadeKey[] = ['100', '300', '600', '700', '800', '900']

function bgLabel(key: string, theme: Theme): string {
  return key === 'theme' ? theme : key
}

const byMagnitudeDesc = (a: ApcaPair, b: ApcaPair): number => Math.abs(b.lc) - Math.abs(a.lc)

const labels = (pairs: ApcaPair[], theme: Theme): string[] =>
  [...pairs].sort(byMagnitudeDesc).map((p) => bgLabel(p.key, theme))

// ─── Compatibility JSON ───────────────────────────────────────────────────────

export type ApcaShadeCompat = {
  hex: string
  preferredText: string[]
  bodyText: string[]
  contentText: string[]
  largeText: string[]
  nonText: string[]
  textSafe: boolean
}

// Each shade AS TEXT → background labels, grouped by the highest role the pair
// qualifies for. Directional: do not read it with the roles swapped.
export function buildApcaCompatMatrix(result: ApcaPaletteResult): Record<ShadeKey, ApcaShadeCompat> {
  const { palette, usage, theme } = result
  const matrix = {} as Record<ShadeKey, ApcaShadeCompat>

  for (const shade of SHADE_KEYS) {
    const { preferredText, bodyText, contentText, largeText, nonText } = usage[shade]
    const textSafe =
      preferredText.length + bodyText.length + contentText.length + largeText.length > 0

    matrix[shade] = {
      hex: palette[shade].hex.toLowerCase(),
      preferredText: labels(preferredText, theme),
      bodyText: labels(bodyText, theme),
      contentText: labels(contentText, theme),
      largeText: labels(largeText, theme),
      nonText: labels(nonText, theme),
      textSafe,
    }
  }

  return matrix
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function toApcaCSSTokens(result: ApcaPaletteResult, prefix: string = 'color'): CSSTokens {
  const { sourceColor, theme } = result
  const matrix = buildApcaCompatMatrix(result)

  const section = (
    title: string,
    pick: (c: ApcaShadeCompat) => string[]
  ): string[] => {
    const lines = SHADE_KEYS.flatMap((shade) => {
      const compat = matrix[shade]
      const targets = pick(compat)
      return targets.length ? [` *   shade-${shade} (${compat.hex}) → ${targets.join(', ')}`] : []
    })
    return lines.length ? [` * ${title}`, ...lines, ` *`] : []
  }

  const noTextUse = SHADE_KEYS.filter((s) => !matrix[s].textSafe).map(
    (s) => `shade-${s} (${matrix[s].hex})`
  )

  const manifest: string[] = [
    `/*`,
    ` * APCA PAIRING MANIFEST — source: ${sourceColor} · theme: ${theme} · model: APCA-W3 0.1.9 (WCAG 3 draft)`,
    ` *`,
    ` * Every line reads "shade-X AS TEXT → backgrounds". APCA is DIRECTIONAL:`,
    ` * swapping text and background changes the Lc value. A pairing listed here`,
    ` * is NOT automatically valid with the roles reversed.`,
    ` *`,
    ...section('PREFERRED BODY TEXT (Lc ≥ 90):', (c) => c.preferredText),
    ...section('BODY TEXT (Lc 75–90 — any size):', (c) => c.bodyText),
    ...section(
      'CONTENT TEXT ONLY (Lc 60–75 — headlines and large text, NOT body copy):',
      (c) => c.contentText
    ),
    ...section(
      'LARGE TEXT & ICONS ONLY (Lc 45–60 — very large or bold text, icons, UI strokes):',
      (c) => c.largeText
    ),
    ...section('NON-TEXT ONLY (Lc 15–45 — borders, dividers, decorative; NEVER text):', (c) => c.nonText),
    ...(noTextUse.length ? [` * NO SAFE TEXT USE (background / non-text only):`, ` *   ${noTextUse.join(', ')}`, ` *`] : []),
    ` */`,
  ]

  const cssVars = SHADE_KEYS.map((key) => {
    const { hex, preferredText, bodyText, contentText, largeText, nonText, textSafe } = matrix[key]
    const parts: string[] = []
    if (!textSafe) parts.push('no-text-use')
    if (preferredText.length) parts.push(`★ preferred→${preferredText.join('·')}`)
    if (bodyText.length) parts.push(`✅ body→${bodyText.join('·')}`)
    if (contentText.length) parts.push(`◐ content→${contentText.join('·')}`)
    if (largeText.length) parts.push(`⚠️ lg→${largeText.join('·')}`)
    if (nonText.length) parts.push(`▫ non-text→${nonText.join('·')}`)
    return `--${prefix}-${key}: ${hex}; /* ${parts.join('  ')} */`
  })

  return [...manifest, `:root {`, ...cssVars, `}`].join('\n')
}
