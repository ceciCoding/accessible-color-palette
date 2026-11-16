import { describe, expect, it } from 'vitest'
import { checkContrast } from '../src/index.js'

// checkContrast is the public boundary: it accepts raw ColorInput and funnels
// it through parseColor before delegating to the pure describeContrast.
describe('checkContrast (public boundary)', () => {
  it('accepts rgb/hsl strings and objects, normalizing to hex', () => {
    const result = checkContrast('rgb(0, 0, 0)', { h: 0, s: 0, l: 100 })
    expect(result.foreground).toBe('#000000')
    expect(result.background).toBe('#ffffff')
    expect(result.ratio).toBe(21)
  })

  it('normalizes hex without leading # and short form', () => {
    const a = checkContrast('000', 'fff')
    const b = checkContrast('#000000', '#ffffff')
    expect(a.ratio).toBe(b.ratio)
    expect(a.foreground).toBe('#000000')
    expect(a.background).toBe('#ffffff')
  })

  it('throws for an invalid color', () => {
    expect(() => checkContrast('not-a-color', '#ffffff')).toThrow('Invalid hex color')
  })
})
