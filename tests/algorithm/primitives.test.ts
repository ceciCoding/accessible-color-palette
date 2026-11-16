import { describe, expect, it } from 'vitest'
import {
  darkenToRatio,
  lightenToRatio,
  retreatLightness,
  walkLightness,
} from '../../src/algorithm/primitives.js'
import { contrastRatioHex } from '../../src/math/contrast.js'
import { hexToHSL, parseHex } from '../../src/math/color.js'

const anchor = parseHex('#1f7a54')
const white = parseHex('#ffffff')

describe('lightenToRatio', () => {
  it('result has contrast >= 4.5 against the anchor', () => {
    const result = lightenToRatio(anchor, anchor, 4.5)
    const ratio = contrastRatioHex(result, anchor)
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })

  it('result has contrast <= 5.1 against the anchor (did not overshoot far)', () => {
    const result = lightenToRatio(anchor, anchor, 4.5)
    const ratio = contrastRatioHex(result, anchor)
    expect(ratio).toBeLessThanOrEqual(5.1)
  })

  it('throws when target ratio is unreachable', () => {
    expect(() =>
      lightenToRatio(parseHex('#ffffff'), parseHex('#ffffff'), 21)
    ).toThrow('could not reach target')
  })
})

describe('darkenToRatio', () => {
  it('result has contrast >= 3.0 against the anchor', () => {
    const result = darkenToRatio(anchor, anchor, 3.0)
    const ratio = contrastRatioHex(result, anchor)
    expect(ratio).toBeGreaterThanOrEqual(3.0)
  })

  it('result has contrast <= 4.0 against the anchor (did not overshoot far)', () => {
    const result = darkenToRatio(anchor, anchor, 3.0)
    const ratio = contrastRatioHex(result, anchor)
    expect(ratio).toBeLessThanOrEqual(4.0)
  })
})

describe('walkLightness', () => {
  it('stops at the first candidate whose measure reaches the target', () => {
    const measure = (hex: typeof anchor) => contrastRatioHex(hex, white)
    const result = walkLightness(anchor, 'darken', measure, 10)
    expect(measure(result)).toBeGreaterThanOrEqual(10)
    expect(hexToHSL(result).l).toBeLessThan(hexToHSL(anchor).l)
  })

  it('honours a custom step', () => {
    const measure = (hex: typeof anchor) => contrastRatioHex(hex, white)
    const coarse = walkLightness(anchor, 'darken', measure, 10, 0.05)
    expect(measure(coarse)).toBeGreaterThanOrEqual(10)
  })

  it('throws when the measure never reaches the target', () => {
    expect(() => walkLightness(anchor, 'lighten', () => 0, 1)).toThrow('walkLightness')
  })
})

describe('retreatLightness', () => {
  const measure = (hex: typeof anchor) => contrastRatioHex(hex, white)

  it('returns the last candidate still >= target when walking toward the reference', () => {
    const result = retreatLightness(anchor, 'lighten', measure, 4.5)
    expect(measure(result)).toBeGreaterThanOrEqual(4.5)
    // one more step would drop below the target
    const oneMore = walkLightness(result, 'lighten', () => Infinity, 0)
    expect(measure(oneMore)).toBeLessThan(4.5)
  })

  it('returns the start value unchanged when the very first step already drops below target', () => {
    const start = retreatLightness(anchor, 'lighten', measure, 4.5)
    expect(retreatLightness(start, 'lighten', measure, 4.5)).toBe(start)
  })

  it('returns the candidate itself when its measure equals the target exactly', () => {
    const result = retreatLightness(anchor, 'lighten', () => 4.5, 4.5)
    expect(hexToHSL(result).l).toBeGreaterThan(hexToHSL(anchor).l)
  })

  it('throws when the measure never drops to the target', () => {
    expect(() => retreatLightness(anchor, 'lighten', () => 100, 1)).toThrow('retreatLightness')
  })
})
