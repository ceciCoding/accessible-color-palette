import { parseHex } from '../../math/color.js'
import { apcaContrastHex } from '../../math/apca.js'
import { retreatLightness } from '../primitives.js'
import { toShadeEntry } from '../shade-entry.js'
import { moveBackgroundToLc, moveTextToLc } from './primitives.js'
import {
  LC_ANCHOR_700,
  LC_TARGET_100,
  LC_TARGET_300,
  LC_TARGET_600,
  LC_TARGET_800,
  LC_TARGET_900,
} from './thresholds.js'
import type { Direction, HexColor, Palette, Theme } from '../../types.js'

const WHITE = parseHex('#ffffff')
const BLACK = parseHex('#000000')

const themeBackground = (theme: Theme): HexColor => (theme === 'white' ? WHITE : BLACK)
const awayFromBackground = (theme: Theme): Direction => (theme === 'white' ? 'darken' : 'lighten')
const towardBackground = (theme: Theme): Direction => (theme === 'white' ? 'lighten' : 'darken')

// 700 — anchor: |Lc(700 on theme bg)| → 75 (minimum body text).
export function find700(inputHex: HexColor, theme: Theme): HexColor {
  const bg = themeBackground(theme)
  const measure = (candidate: HexColor): number => Math.abs(apcaContrastHex(candidate, bg))

  if (measure(inputHex) < LC_ANCHOR_700) {
    return moveTextToLc(inputHex, bg, LC_ANCHOR_700, awayFromBackground(theme))
  }

  // Too much contrast: walk toward the background, keep the last value still >= 75.
  return retreatLightness(inputHex, towardBackground(theme), measure, LC_ANCHOR_700)
}

// 100 — the light tint: 700 AS TEXT on 100 reaches Lc 60. Here 100 is the
// background being moved, so the roles are inverted relative to every other shade.
export function find100(shade700: HexColor, theme: Theme): HexColor {
  return moveBackgroundToLc(shade700, shade700, LC_TARGET_100, towardBackground(theme))
}

// 300 — non-text (Lc 15) on 100.
export function find300(shade100: HexColor, theme: Theme): HexColor {
  return moveTextToLc(shade100, shade100, LC_TARGET_300, awayFromBackground(theme))
}

// 600 — large text / icons (Lc 45) on 100.
export function find600(shade100: HexColor, theme: Theme): HexColor {
  return moveTextToLc(shade100, shade100, LC_TARGET_600, awayFromBackground(theme))
}

// 800 — body text (Lc 75) on 100.
export function find800(shade100: HexColor, theme: Theme): HexColor {
  return moveTextToLc(shade100, shade100, LC_TARGET_800, awayFromBackground(theme))
}

// 900 — deepest shade: Lc 100 on the THEME background, starting from 800 so it is
// always strictly beyond 800. See LC_TARGET_900 for why it is not measured on 100.
export function find900(shade800: HexColor, theme: Theme): HexColor {
  return moveTextToLc(shade800, themeBackground(theme), LC_TARGET_900, awayFromBackground(theme))
}

export function buildApcaPalette(inputHex: HexColor, theme: Theme): Palette {
  const shade700hex = find700(inputHex, theme)
  const shade100hex = find100(shade700hex, theme)
  const shade300hex = find300(shade100hex, theme)
  const shade600hex = find600(shade100hex, theme)
  const shade800hex = find800(shade100hex, theme)
  const shade900hex = find900(shade800hex, theme)

  return {
    '100': toShadeEntry(shade100hex),
    '300': toShadeEntry(shade300hex),
    '600': toShadeEntry(shade600hex),
    '700': toShadeEntry(shade700hex),
    '800': toShadeEntry(shade800hex),
    '900': toShadeEntry(shade900hex),
  }
}
