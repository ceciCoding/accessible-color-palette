import { describe, expect, it } from 'vitest'
import { generateApcaPalette } from '../../src/index.js'
import { checkApcaContrast, validateApcaPairings } from '../../src/output/apca-validation.js'
import type { ApcaPaletteResult } from '../../src/types.js'

describe('validateApcaPairings', () => {
  const result = generateApcaPalette('#3b82f6', 'white')

  it('700 on white is body-text and passes', () => {
    const report = validateApcaPairings(result, [{ foreground: '700', background: 'white' }])
    expect(report.pairings[0]!.level).toBe('body-text')
    expect(report.pairings[0]!.hex).toBe(result.palette['700'].hex)
    expect(report.allPass).toBe(true)
    expect(report.summary).toContain('✓')
  })

  it('900 on white is preferred-text', () => {
    const report = validateApcaPairings(result, [{ foreground: '900', background: 'white' }])
    expect(report.pairings[0]!.level).toBe('preferred-text')
  })

  it('700 on 100 is content-text (passes, with a size caveat)', () => {
    const report = validateApcaPairings(result, [{ foreground: '700', background: '100' }])
    expect(report.pairings[0]!.level).toBe('content-text')
    expect(report.allPass).toBe(true)
  })

  it('600 on 100 is large-text', () => {
    const report = validateApcaPairings(result, [{ foreground: '600', background: '100' }])
    expect(report.pairings[0]!.level).toBe('large-text')
  })

  it('300 on 100 is non-text and does NOT pass as text', () => {
    const report = validateApcaPairings(result, [{ foreground: '300', background: '100' }])
    expect(report.pairings[0]!.level).toBe('non-text')
    expect(report.pairings[0]!.message).toContain('NEVER text')
    expect(report.allPass).toBe(false)
    expect(report.summary).toContain('✗')
  })

  it('100 on white fails and lists where it IS allowed as text (light on dark)', () => {
    const report = validateApcaPairings(result, [{ foreground: '100', background: 'white' }])
    expect(report.pairings[0]!.level).toBe('fail')
    expect(report.pairings[0]!.message).toContain('Allowed as text: body-text on: 900')
  })

  it('reports "none" when a shade has no text use at all', () => {
    const noText: ApcaPaletteResult = {
      ...result,
      usage: {
        ...result.usage,
        '300': { hex: result.palette['300'].hex, preferredText: [], bodyText: [], contentText: [], largeText: [], nonText: [] },
      },
    }
    const report = validateApcaPairings(noText, [{ foreground: '300', background: 'white' }])
    expect(report.pairings[0]!.level).toBe('fail')
    expect(report.pairings[0]!.message).toContain('Allowed as text: none')
  })

  it('a failing pair still lists the allowed backgrounds when some exist', () => {
    const report = validateApcaPairings(result, [{ foreground: '700', background: '900' }])
    expect(report.allPass).toBe(false)
    expect(report.pairings[0]!.message).toMatch(/Allowed as text: .*body-text on:/)
  })

  it('rejects an invalid shade key', () => {
    const report = validateApcaPairings(result, [{ foreground: '500', background: 'white' }])
    expect(report.pairings[0]!.level).toBe('invalid')
    expect(report.allPass).toBe(false)
  })

  it('is directional: 100 on 900 is not the same pairing as 900 on 100', () => {
    const forward = validateApcaPairings(result, [{ foreground: '900', background: '100' }])
    const reverse = validateApcaPairings(result, [{ foreground: '100', background: '900' }])
    expect(forward.pairings[0]!.message).toContain('shade-900 as text on 100')
    expect(reverse.pairings[0]!.message).toContain('shade-100 as text on 900')
  })

  it('allPass requires every pairing to be a text level', () => {
    const report = validateApcaPairings(result, [
      { foreground: '700', background: 'white' },
      { foreground: '300', background: '100' },
    ])
    expect(report.allPass).toBe(false)
  })
})

describe('checkApcaContrast', () => {
  it('black on white is preferred-text, dark-on-light', () => {
    const r = checkApcaContrast('#000000', '#ffffff')
    expect(r.level).toBe('preferred-text')
    expect(r.polarity).toBe('dark-on-light')
    expect(r.lc).toBeGreaterThan(100)
    expect(r.message).toContain('Lc 106.0')
  })

  it('white on black is preferred-text, light-on-dark', () => {
    const r = checkApcaContrast('#fff', '#000')
    expect(r.level).toBe('preferred-text')
    expect(r.polarity).toBe('light-on-dark')
    expect(r.lc).toBeLessThan(-100)
    expect(r.foreground).toBe('#ffffff')
  })

  it('#888 on #fff is content-text (Lc 63)', () => {
    expect(checkApcaContrast('#888888', '#ffffff').level).toBe('content-text')
  })

  it('near-identical colors fail with polarity none', () => {
    const r = checkApcaContrast('#808080', '#808080')
    expect(r.level).toBe('fail')
    expect(r.polarity).toBe('none')
  })

  it('throws on invalid hex', () => {
    expect(() => checkApcaContrast('nope', '#ffffff')).toThrow('Invalid hex color')
  })
})
