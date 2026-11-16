import { hexToHSL, hexToRGB, hslToHex } from '../math/color.js'
import { relativeLuminance } from '../math/contrast.js'
import type { Direction, HexColor } from '../types.js'

const DEFAULT_STEP = 0.005
const MAX_STEPS = 1000

// A metric evaluated on each candidate color while walking lightness.
// The walker is metric-agnostic: WCAG 2 ratio and APCA Lc both plug in here.
export type LightnessMeasure = (candidate: HexColor) => number

const clampL = (l: number): number => Math.min(1, Math.max(0, l))

// Walks HSL lightness in `direction` until measure(candidate) >= target.
// Used to INCREASE a contrast metric. Returns the first candidate that reaches it.
export function walkLightness(
  startHex: HexColor,
  direction: Direction,
  measure: LightnessMeasure,
  target: number,
  step: number = DEFAULT_STEP
): HexColor {
  const deltaL = direction === 'lighten' ? step : -step
  let hsl = hexToHSL(startHex)

  for (let i = 0; i < MAX_STEPS; i++) {
    hsl = { ...hsl, l: clampL(hsl.l + deltaL) }
    const current = hslToHex(hsl)

    if (measure(current) >= target) return current
  }

  throw new Error(
    `walkLightness: could not reach target ${target} in direction ${direction} — color may be at lightness boundary`
  )
}

// Walks HSL lightness in `direction` while measure(candidate) stays above target.
// Used to DECREASE a contrast metric. Returns the last candidate whose measure is
// still >= target, so an overshoot below target never leaks out.
export function retreatLightness(
  startHex: HexColor,
  direction: Direction,
  measure: LightnessMeasure,
  target: number,
  step: number = DEFAULT_STEP
): HexColor {
  const deltaL = direction === 'lighten' ? step : -step
  let hsl = hexToHSL(startHex)
  let prev: HexColor = startHex

  for (let i = 0; i < MAX_STEPS; i++) {
    hsl = { ...hsl, l: clampL(hsl.l + deltaL) }
    const current = hslToHex(hsl)
    const value = measure(current)

    if (value <= target) {
      return value < target ? prev : current
    }

    prev = current
  }

  throw new Error(
    `retreatLightness: could not drop to target ${target} in direction ${direction} — color may be at lightness boundary`
  )
}

export function stepTowardRatio(
  startHex: HexColor,
  referenceHex: HexColor,
  targetRatio: number,
  direction: Direction,
  step: number = DEFAULT_STEP
): HexColor {
  // Pre-compute the reference luminance once — it never changes during iteration
  const refLuminance = relativeLuminance(hexToRGB(referenceHex))

  const wcagRatio: LightnessMeasure = (candidate) => {
    const currentLuminance = relativeLuminance(hexToRGB(candidate))
    const l1 = Math.max(currentLuminance, refLuminance)
    const l2 = Math.min(currentLuminance, refLuminance)
    return (l1 + 0.05) / (l2 + 0.05)
  }

  return walkLightness(startHex, direction, wcagRatio, targetRatio, step)
}

export function lightenToRatio(
  anchor: HexColor,
  referenceHex: HexColor,
  targetRatio: number
): HexColor {
  return stepTowardRatio(anchor, referenceHex, targetRatio, 'lighten')
}

export function darkenToRatio(
  anchor: HexColor,
  referenceHex: HexColor,
  targetRatio: number
): HexColor {
  return stepTowardRatio(anchor, referenceHex, targetRatio, 'darken')
}
