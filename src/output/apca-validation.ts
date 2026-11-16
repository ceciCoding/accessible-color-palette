import type { ApcaLevel, ApcaPaletteResult, ApcaPolarity, ShadeKey } from '../types.js'
import { buildApcaCompatMatrix } from './apca-tokens.js'
import { parseHex } from '../math/color.js'
import { apcaContrastHex, polarityOf } from '../math/apca.js'
import { classifyLc, isTextLevel } from '../algorithm/apca/thresholds.js'

const VALID_SHADE_KEYS = new Set<string>(['100', '300', '600', '700', '800', '900'])

export type ApcaPairingLevel = ApcaLevel | 'invalid'

export interface ApcaPairingResult {
  foreground: string
  background: string
  level: ApcaPairingLevel
  hex?: string
  message: string
}

export interface ApcaValidationReport {
  summary: string
  allPass: boolean
  pairings: ApcaPairingResult[]
}

const LEVEL_TEXT: Record<ApcaLevel, string> = {
  'preferred-text': '✓ preferred body text (Lc ≥ 90) — safe for any size',
  'body-text': '✓ body text (Lc 75–90) — safe for any size',
  'content-text': '◐ content text only (Lc 60–75) — headlines / large text, NOT body copy',
  'large-text': '⚠ large text & icons only (Lc 45–60) — very large or bold text, icons, UI strokes',
  'non-text': '✗ non-text only (Lc 15–45) — borders, dividers, decorative. NEVER text',
  fail: '✗ FAILS APCA (below Lc 15)',
}

export function validateApcaPairings(
  result: ApcaPaletteResult,
  pairings: Array<{ foreground: string; background: string }>
): ApcaValidationReport {
  const matrix = buildApcaCompatMatrix(result)

  const results: ApcaPairingResult[] = pairings.map(({ foreground, background }) => {
    if (!VALID_SHADE_KEYS.has(foreground)) {
      return {
        foreground,
        background,
        level: 'invalid',
        message: `"${foreground}" is not a valid shade key — use 100, 300, 600, 700, 800, or 900`,
      }
    }

    const shade = matrix[foreground as ShadeKey]
    const level = levelFor(shade, background)
    const base = `shade-${foreground} as text on ${background}: ${LEVEL_TEXT[level]}`

    if (isTextLevel(level)) {
      return { foreground, background, level, hex: shade.hex, message: base }
    }

    const allowed = [
      shade.preferredText.length ? `preferred-text on: ${shade.preferredText.join(', ')}` : '',
      shade.bodyText.length ? `body-text on: ${shade.bodyText.join(', ')}` : '',
      shade.contentText.length ? `content-text on: ${shade.contentText.join(', ')}` : '',
      shade.largeText.length ? `large-text on: ${shade.largeText.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join(' | ')

    return {
      foreground,
      background,
      level,
      hex: shade.hex,
      message: `${base}. Allowed as text: ${allowed || 'none'}`,
    }
  })

  const allPass = results.every((r) => r.level !== 'invalid' && isTextLevel(r.level))

  return {
    summary: allPass
      ? '✓ All pairings pass APCA as text'
      : '✗ One or more pairings are not valid as text under APCA — fix before generating CSS',
    allPass,
    pairings: results,
  }
}

function levelFor(
  shade: ReturnType<typeof buildApcaCompatMatrix>[ShadeKey],
  background: string
): ApcaLevel {
  if (shade.preferredText.includes(background)) return 'preferred-text'
  if (shade.bodyText.includes(background)) return 'body-text'
  if (shade.contentText.includes(background)) return 'content-text'
  if (shade.largeText.includes(background)) return 'large-text'
  if (shade.nonText.includes(background)) return 'non-text'
  return 'fail'
}

export interface ApcaContrastCheckResult {
  foreground: string
  background: string
  lc: number
  polarity: ApcaPolarity
  level: ApcaLevel
  message: string
}

// Standalone APCA check between two arbitrary hex colors. Directional: the
// first argument is the TEXT, the second the BACKGROUND.
export function checkApcaContrast(foregroundHex: string, backgroundHex: string): ApcaContrastCheckResult {
  const foreground = parseHex(foregroundHex)
  const background = parseHex(backgroundHex)
  const lc = apcaContrastHex(foreground, background)
  const level = classifyLc(lc)

  return {
    foreground,
    background,
    lc,
    polarity: polarityOf(lc),
    level,
    message: `${foreground} as text on ${background}: Lc ${lc.toFixed(1)} — ${LEVEL_TEXT[level]}`,
  }
}
