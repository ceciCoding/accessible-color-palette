import { describe, expect, it } from 'vitest'
import { generateApcaPalette, toApcaCSSTokens } from '../src/index.js'
import { apcaContrastHex } from '../src/math/apca.js'
import { parseHex } from '../src/math/color.js'

const SHADES = ['100', '300', '600', '700', '800', '900'] as const

describe('generateApcaPalette — #3b82f6 white', () => {
  const result = generateApcaPalette('#3b82f6', 'white')

  it('carries the model tag and parsed source', () => {
    expect(result.model).toBe('apca')
    expect(result.sourceColor).toBe('#3b82f6')
    expect(result.theme).toBe('white')
  })

  it('exposes no contrast values on palette entries', () => {
    for (const s of SHADES) expect(Object.keys(result.palette[s]).sort()).toEqual(['hex', 'hsl', 'rgb'])
  })

  it('900 keeps hue instead of collapsing to black (lightness well above 0)', () => {
    expect(result.palette['900'].hsl.l).toBeGreaterThanOrEqual(8)
    expect(result.palette['900'].hsl.s).toBeGreaterThan(0)
  })

  it('every shade as text on the theme background has positive Lc', () => {
    for (const s of SHADES) expect(apcaContrastHex(result.palette[s].hex, parseHex('#ffffff'))).toBeGreaterThanOrEqual(0)
  })
})

describe('generateApcaPalette — #3b82f6 black', () => {
  const result = generateApcaPalette('#3b82f6', 'black')

  it('900 keeps hue instead of collapsing to white', () => {
    expect(result.palette['900'].hsl.l).toBeLessThanOrEqual(98)
    expect(result.palette['900'].hex).not.toBe('#ffffff')
  })

  it('every shade as text on black has negative Lc', () => {
    for (const s of SHADES) expect(apcaContrastHex(result.palette[s].hex, parseHex('#000000'))).toBeLessThanOrEqual(0)
  })
})

describe('generateApcaPalette — input validation', () => {
  it('throws for invalid hex with the input in the message', () => {
    expect(() => generateApcaPalette('notacolor', 'white')).toThrow('notacolor')
  })

  it('accepts 3-char hex without #', () => {
    expect(generateApcaPalette('38f', 'white').sourceColor).toBe('#3388ff')
  })
})

describe('toApcaCSSTokens via index', () => {
  it('produces CSS for the result', () => {
    const css = toApcaCSSTokens(generateApcaPalette('#3b82f6', 'white'), 'ui')
    expect(css).toContain('--ui-700:')
  })
})
