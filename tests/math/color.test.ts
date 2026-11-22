import { describe, expect, it } from 'vitest'
import { parseHex } from '../../src/input/parse.js'
import { hexToHSL, hexToRGB, hslToHex, rgbToHex } from '../../src/math/color.js'

describe('hexToRGB', () => {
  it('converts white', () => {
    expect(hexToRGB(parseHex('#ffffff'))).toEqual({ r: 1, g: 1, b: 1 })
  })

  it('converts black', () => {
    expect(hexToRGB(parseHex('#000000'))).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('converts #1f7a54 within tolerance', () => {
    const { r, g, b } = hexToRGB(parseHex('#1f7a54'))
    expect(r).toBeCloseTo(0.122, 2)
    expect(g).toBeCloseTo(0.478, 2)
    expect(b).toBeCloseTo(0.329, 2)
  })
})

describe('rgbToHex', () => {
  it('converts white RGB to hex', () => {
    expect(rgbToHex({ r: 1, g: 1, b: 1 })).toBe('#ffffff')
  })

  it('converts black RGB to hex', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000')
  })
})

describe('hslToHex / hexToHSL roundtrip', () => {
  const cases = ['#1f7a54', '#6e58d0', '#c62490', '#007499', '#ffffff', '#000000']

  for (const hex of cases) {
    it(`roundtrips ${hex}`, () => {
      const parsed = parseHex(hex)
      expect(hslToHex(hexToHSL(parsed))).toBe(parsed)
    })
  }
})
