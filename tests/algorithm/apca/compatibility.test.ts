import { describe, expect, it } from 'vitest'
import { buildApcaMatrix } from '../../../src/algorithm/apca/compatibility.js'
import { buildApcaPalette } from '../../../src/algorithm/apca/palette.js'
import { classifyLc, isTextLevel } from '../../../src/algorithm/apca/thresholds.js'
import { apcaContrastHex } from '../../../src/math/apca.js'
import { parseHex } from '../../../src/math/color.js'

const KEYS = ['theme', '100', '300', '600', '700', '800', '900'] as const

describe('buildApcaMatrix', () => {
  const palette = buildApcaPalette(parseHex('#3b82f6'), 'white')
  const matrix = buildApcaMatrix(palette, 'white')

  it('has all 42 ordered pairs and an undefined diagonal', () => {
    let count = 0
    for (const a of KEYS) {
      expect(matrix[a][a]).toBeUndefined()
      for (const b of KEYS) {
        if (a === b) continue
        expect(matrix[a][b]).toBeDefined()
        count++
      }
    }
    expect(count).toBe(42)
  })

  it('is directional: matrix[a][b].lc !== -matrix[b][a].lc', () => {
    const forward = matrix['900']['100']!.lc
    const reverse = matrix['100']['900']!.lc
    expect(Math.sign(forward)).not.toBe(Math.sign(reverse))
    expect(Math.abs(forward)).not.toBeCloseTo(Math.abs(reverse), 0)
  })

  it('uses the theme background for the "theme" key', () => {
    expect(matrix['700']['theme']!.lc).toBeCloseTo(apcaContrastHex(palette['700'].hex, parseHex('#ffffff')), 9)
  })

  it('level matches classifyLc of the stored lc', () => {
    for (const a of KEYS) for (const b of KEYS) {
      if (a === b) continue
      expect(matrix[a][b]!.level).toBe(classifyLc(matrix[a][b]!.lc))
    }
  })

  it('black theme uses #000000 and yields negative Lc for text on theme', () => {
    const dark = buildApcaPalette(parseHex('#3b82f6'), 'black')
    const m = buildApcaMatrix(dark, 'black')
    expect(m['700']['theme']!.lc).toBeLessThan(0)
  })
})

describe('classifyLc', () => {
  it('maps magnitudes to levels regardless of sign', () => {
    expect(classifyLc(95)).toBe('preferred-text')
    expect(classifyLc(-95)).toBe('preferred-text')
    expect(classifyLc(80)).toBe('body-text')
    expect(classifyLc(60)).toBe('content-text')
    expect(classifyLc(-50)).toBe('large-text')
    expect(classifyLc(20)).toBe('non-text')
    expect(classifyLc(5)).toBe('fail')
  })

  it('boundaries are inclusive', () => {
    expect(classifyLc(90)).toBe('preferred-text')
    expect(classifyLc(75)).toBe('body-text')
    expect(classifyLc(45)).toBe('large-text')
    expect(classifyLc(15)).toBe('non-text')
    expect(classifyLc(14.99)).toBe('fail')
  })
})

describe('isTextLevel', () => {
  it('only the four text roles count as text', () => {
    expect(isTextLevel('preferred-text')).toBe(true)
    expect(isTextLevel('body-text')).toBe(true)
    expect(isTextLevel('content-text')).toBe(true)
    expect(isTextLevel('large-text')).toBe(true)
    expect(isTextLevel('non-text')).toBe(false)
    expect(isTextLevel('fail')).toBe(false)
  })
})
