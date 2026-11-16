import { describe, expect, it } from 'vitest'
import { buildApcaMatrix } from '../../src/algorithm/apca/compatibility.js'
import { buildApcaPalette } from '../../src/algorithm/apca/palette.js'
import { buildApcaUsage } from '../../src/output/apca-usage.js'
import { parseHex } from '../../src/math/color.js'
import type { ApcaShadeUsage } from '../../src/types.js'

const SHADES = ['100', '300', '600', '700', '800', '900'] as const
const BUCKETS = ['preferredText', 'bodyText', 'contentText', 'largeText', 'nonText'] as const

const allPairs = (u: ApcaShadeUsage) => BUCKETS.flatMap((b) => u[b])

describe('buildApcaUsage — white theme', () => {
  const palette = buildApcaPalette(parseHex('#3b82f6'), 'white')
  const matrix = buildApcaMatrix(palette, 'white')
  const usage = buildApcaUsage(palette, matrix, 'white')

  it('every shade is present with its hex', () => {
    for (const s of SHADES) expect(usage[s].hex).toBe(palette[s].hex)
  })

  it('700 as text on theme is body-text (the anchor contract)', () => {
    const pair = usage['700'].bodyText.find((p) => p.key === 'theme')
    expect(pair).toBeDefined()
    expect(pair!.hex).toBe('#ffffff')
    expect(pair!.lc).toBeGreaterThanOrEqual(75)
  })

  it('900 as text on theme is preferred-text', () => {
    expect(usage['900'].preferredText.some((p) => p.key === 'theme')).toBe(true)
  })

  it('300 as text on 100 lands in nonText', () => {
    expect(usage['300'].nonText.some((p) => p.key === '100')).toBe(true)
  })

  it('each background appears in at most one bucket per shade', () => {
    for (const s of SHADES) {
      const keys = allPairs(usage[s]).map((p) => p.key)
      expect(new Set(keys).size).toBe(keys.length)
    }
  })

  it('a shade never lists itself', () => {
    for (const s of SHADES) expect(allPairs(usage[s]).some((p) => p.key === s)).toBe(false)
  })

  it('omits failing pairs (below Lc 15)', () => {
    for (const s of SHADES) {
      for (const p of allPairs(usage[s])) expect(Math.abs(p.lc)).toBeGreaterThanOrEqual(15)
    }
  })

  it('is directional: 100 as text on 900 differs from 900 as text on 100', () => {
    const forward = allPairs(usage['900']).find((p) => p.key === '100')
    const reverse = allPairs(usage['100']).find((p) => p.key === '900')
    expect(forward).toBeDefined()
    expect(reverse).toBeDefined()
    expect(Math.sign(forward!.lc)).not.toBe(Math.sign(reverse!.lc))
  })
})

describe('buildApcaUsage — black theme', () => {
  const palette = buildApcaPalette(parseHex('#3b82f6'), 'black')
  const matrix = buildApcaMatrix(palette, 'black')
  const usage = buildApcaUsage(palette, matrix, 'black')

  it('theme pair uses #000000 and negative Lc', () => {
    const pair = usage['700'].bodyText.find((p) => p.key === 'theme')
    expect(pair!.hex).toBe('#000000')
    expect(pair!.lc).toBeLessThan(0)
  })
})
