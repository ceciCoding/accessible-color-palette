import { hexToRGB } from './color.js'
import type { ApcaPolarity, HexColor, RGB } from '../types.js'

// APCA-W3 0.1.9 (0.0.98G-4g), sRGB. Constants are part of the published
// algorithm (https://github.com/Myndex/apca-w3). Implemented directly — no
// library import, same rule as the WCAG 2 math.
//
// IMPORTANT: this "Y" is NOT the WCAG 2 relative luminance. APCA uses a plain
// 2.4 power curve and slightly different coefficients. Never mix the two.
const MAIN_TRC = 2.4
const S_RCO = 0.2126729
const S_GCO = 0.7151522
const S_BCO = 0.072175

// Exponents for "normal" polarity (dark text on light bg) and "reverse"
// polarity (light text on dark bg). This asymmetry is why Lc(a, b) !== -Lc(b, a).
const NORM_BG = 0.56
const NORM_TXT = 0.57
const REV_TXT = 0.62
const REV_BG = 0.65

// Soft clamp near black: very dark colors are perceived lighter than their
// luminance suggests (flare / ambient light), so Y is lifted below the threshold.
const BLK_THRS = 0.022
const BLK_CLMP = 1.414

const SCALE_BOW = 1.14
const SCALE_WOB = 1.14
const LO_BOW_OFFSET = 0.027
const LO_WOB_OFFSET = 0.027
const LO_CLIP = 0.1
const DELTA_Y_MIN = 0.0005

export function apcaLuminance(rgb: RGB): number {
  return (
    S_RCO * Math.pow(rgb.r, MAIN_TRC) +
    S_GCO * Math.pow(rgb.g, MAIN_TRC) +
    S_BCO * Math.pow(rgb.b, MAIN_TRC)
  )
}

export function softClampBlack(y: number): number {
  return y > BLK_THRS ? y : y + Math.pow(BLK_THRS - y, BLK_CLMP)
}

// Returns the signed Lc value, full float precision (round only for display).
//   positive → dark text on a lighter background
//   negative → light text on a darker background
// |Lc| is the contrast magnitude; the sign is the polarity. The roles matter:
// text and background are not interchangeable (white on black = -107.9,
// black on white = +106.0).
export function apcaContrast(text: RGB, background: RGB): number {
  const yText = softClampBlack(apcaLuminance(text))
  const yBg = softClampBlack(apcaLuminance(background))

  if (Math.abs(yBg - yText) < DELTA_Y_MIN) return 0

  if (yBg > yText) {
    const sapc = (Math.pow(yBg, NORM_BG) - Math.pow(yText, NORM_TXT)) * SCALE_BOW
    return sapc < LO_CLIP ? 0 : (sapc - LO_BOW_OFFSET) * 100
  }

  const sapc = (Math.pow(yBg, REV_BG) - Math.pow(yText, REV_TXT)) * SCALE_WOB
  return sapc > -LO_CLIP ? 0 : (sapc + LO_WOB_OFFSET) * 100
}

export function apcaContrastHex(text: HexColor, background: HexColor): number {
  return apcaContrast(hexToRGB(text), hexToRGB(background))
}

export function polarityOf(lc: number): ApcaPolarity {
  if (lc > 0) return 'dark-on-light'
  if (lc < 0) return 'light-on-dark'
  return 'none'
}
