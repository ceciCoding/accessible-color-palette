import { parseHex } from '../math/color.js'
import { contrastRatioHex } from '../math/contrast.js'
import { darkenToRatio, lightenToRatio, retreatLightness } from './primitives.js'
import { toShadeEntry } from './shade-entry.js'
import { AA_LARGE, AA_NORMAL } from './thresholds.js'
import type { HexColor, Palette, Theme } from '../types.js'

const WHITE = parseHex('#ffffff')
const BLACK = parseHex('#000000')

const ANCHOR_TARGET = 5.1

export function find700(inputHex: HexColor, theme: Theme): HexColor {
  const bg = theme === 'white' ? WHITE : BLACK
  const currentRatio = contrastRatioHex(inputHex, bg)

  if (currentRatio === ANCHOR_TARGET) return inputHex

  if (currentRatio < ANCHOR_TARGET) {
    return theme === 'white'
      ? darkenToRatio(inputHex, bg, ANCHOR_TARGET)
      : lightenToRatio(inputHex, bg, ANCHOR_TARGET)
  }

  // currentRatio > ANCHOR_TARGET: reduce contrast by walking toward the background.
  // retreatLightness returns the last value that was still >= ANCHOR_TARGET, so
  // overshooting below the anchor never leaks out.
  return retreatLightness(
    inputHex,
    theme === 'white' ? 'lighten' : 'darken',
    (candidate) => contrastRatioHex(candidate, bg),
    ANCHOR_TARGET
  )
}

export function find100(shade700: HexColor, theme: Theme): HexColor {
  return theme === 'white'
    ? lightenToRatio(shade700, shade700, AA_NORMAL)
    : darkenToRatio(shade700, shade700, AA_NORMAL)
}

export function find300(shade700: HexColor, theme: Theme): HexColor {
  return theme === 'white'
    ? lightenToRatio(shade700, shade700, AA_LARGE)
    : darkenToRatio(shade700, shade700, AA_LARGE)
}

export function find600(shade100: HexColor, theme: Theme): HexColor {
  return theme === 'white'
    ? darkenToRatio(shade100, shade100, AA_LARGE)
    : lightenToRatio(shade100, shade100, AA_LARGE)
}

export function find800(shade600: HexColor, theme: Theme): HexColor {
  return theme === 'white'
    ? darkenToRatio(shade600, shade600, AA_LARGE)
    : lightenToRatio(shade600, shade600, AA_LARGE)
}

export function find900(shade700: HexColor, shade600: HexColor, theme: Theme): HexColor {
  const candidate = theme === 'white'
    ? darkenToRatio(shade700, shade700, AA_LARGE)
    : lightenToRatio(shade700, shade700, AA_LARGE)

  if (contrastRatioHex(candidate, shade600) >= AA_NORMAL) return candidate

  return theme === 'white'
    ? darkenToRatio(candidate, shade600, AA_NORMAL)
    : lightenToRatio(candidate, shade600, AA_NORMAL)
}

export function buildPalette(inputHex: HexColor, theme: Theme): Palette {
  const shade700hex = find700(inputHex, theme)
  const shade100hex = find100(shade700hex, theme)
  const shade300hex = find300(shade700hex, theme)
  const shade600hex = find600(shade100hex, theme)
  const shade800hex = find800(shade600hex, theme)
  const shade900hex = find900(shade700hex, shade600hex, theme)

  return {
    '100': toShadeEntry(shade100hex),
    '300': toShadeEntry(shade300hex),
    '600': toShadeEntry(shade600hex),
    '700': toShadeEntry(shade700hex),
    '800': toShadeEntry(shade800hex),
    '900': toShadeEntry(shade900hex),
  }
}
