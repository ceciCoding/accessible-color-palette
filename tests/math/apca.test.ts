import { describe, expect, it } from 'vitest'
import { apcaContrast, apcaContrastHex, apcaLuminance, polarityOf, softClampBlack } from '../../src/math/apca.js'
import { hexToRGB, parseHex } from '../../src/math/color.js'

// Official test values published with apca-w3 0.1.9 (0.0.98G-4g). Format: text on background.
const officialCases: Array<[string, string, number]> = [
  ['#888888', '#ffffff', 63.056469930209424],
  ['#ffffff', '#888888', -68.54146436644962],
  ['#000000', '#aaaaaa', 58.146262578561334],
  ['#aaaaaa', '#000000', -56.24113336839742],
  ['#112233', '#ddeeff', 91.66830811481631],
  ['#ddeeff', '#112233', -93.06770049484275],
  ['#112233', '#444444', 8.32326136957393],
  ['#444444', '#112233', -7.526878460278154],
]

describe('apcaContrastHex — official apca-w3 test values', () => {
  for (const [text, bg, expected] of officialCases) {
    it(`${text} on ${bg} = ${expected.toFixed(4)}`, () => {
      const lc = apcaContrastHex(parseHex(text), parseHex(bg))
      expect(Math.abs(lc - expected)).toBeLessThan(1e-9)
    })
  }
})

describe('apcaContrast — polarity and asymmetry', () => {
  const white = hexToRGB(parseHex('#ffffff'))
  const black = hexToRGB(parseHex('#000000'))

  it('black on white is positive (~106)', () => {
    const lc = apcaContrast(black, white)
    expect(lc).toBeGreaterThan(105)
    expect(lc).toBeLessThan(107)
  })

  it('white on black is negative (~-108)', () => {
    const lc = apcaContrast(white, black)
    expect(lc).toBeLessThan(-107)
    expect(lc).toBeGreaterThan(-109)
  })

  it('is not symmetric: |Lc(a,b)| !== |Lc(b,a)|', () => {
    const a = hexToRGB(parseHex('#888888'))
    expect(Math.abs(apcaContrast(a, white))).not.toBeCloseTo(Math.abs(apcaContrast(white, a)), 1)
  })

  it('identical colors return 0', () => {
    expect(apcaContrast(white, white)).toBe(0)
  })

  it('very close dark colors clip to 0 (below loClip)', () => {
    const a = hexToRGB(parseHex('#101010'))
    const b = hexToRGB(parseHex('#141414'))
    expect(apcaContrast(a, b)).toBe(0)
    expect(apcaContrast(b, a)).toBe(0)
  })
})

describe('apcaLuminance / softClampBlack', () => {
  it('white has Y = 1', () => {
    expect(apcaLuminance(hexToRGB(parseHex('#ffffff')))).toBeCloseTo(1, 6)
  })

  it('black has Y = 0 before clamping', () => {
    expect(apcaLuminance(hexToRGB(parseHex('#000000')))).toBe(0)
  })

  it('softClampBlack lifts values below the threshold and leaves others untouched', () => {
    expect(softClampBlack(0)).toBeGreaterThan(0)
    expect(softClampBlack(0.5)).toBe(0.5)
  })
})

describe('polarityOf', () => {
  it('classifies sign', () => {
    expect(polarityOf(75)).toBe('dark-on-light')
    expect(polarityOf(-75)).toBe('light-on-dark')
    expect(polarityOf(0)).toBe('none')
  })
})
