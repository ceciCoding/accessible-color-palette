import { describe, expect, it } from 'vitest'
import {
  buildApcaPalette,
  find100,
  find300,
  find600,
  find700,
  find800,
  find900,
} from '../../../src/algorithm/apca/palette.js'
import {
  LC_ANCHOR_700,
  LC_TARGET_100,
  LC_TARGET_300,
  LC_TARGET_600,
  LC_TARGET_800,
  LC_TARGET_900,
} from '../../../src/algorithm/apca/thresholds.js'
import { apcaContrastHex } from '../../../src/math/apca.js'
import { hexToHSL, parseHex } from '../../../src/math/color.js'

const WHITE = parseHex('#ffffff')
const BLACK = parseHex('#000000')

const lc = (text: ReturnType<typeof parseHex>, bg: ReturnType<typeof parseHex>) =>
  Math.abs(apcaContrastHex(text, bg))

const cases = [
  { input: '#3b82f6', theme: 'white' as const },
  { input: '#e11d48', theme: 'white' as const },
  { input: '#10b981', theme: 'white' as const },
  { input: '#f59e0b', theme: 'white' as const },
  { input: '#888888', theme: 'white' as const },
  { input: '#1A6646', theme: 'white' as const },
  { input: '#3b82f6', theme: 'black' as const },
  { input: '#e11d48', theme: 'black' as const },
  { input: '#10b981', theme: 'black' as const },
  { input: '#f59e0b', theme: 'black' as const },
  { input: '#888888', theme: 'black' as const },
  { input: '#1C734E', theme: 'black' as const },
]

describe('buildApcaPalette — every shade meets its Lc contract', () => {
  for (const { input, theme } of cases) {
    describe(`${input} / ${theme}`, () => {
      const bg = theme === 'white' ? WHITE : BLACK
      const palette = buildApcaPalette(parseHex(input), theme)
      const s = (k: keyof typeof palette) => palette[k].hex

      it(`700 on background >= Lc ${LC_ANCHOR_700} (anchor)`, () => {
        expect(lc(s('700'), bg)).toBeGreaterThanOrEqual(LC_ANCHOR_700)
        expect(lc(s('700'), bg)).toBeLessThan(LC_ANCHOR_700 + 2)
      })

      it(`700 as text on 100 >= Lc ${LC_TARGET_100}`, () => {
        expect(lc(s('700'), s('100'))).toBeGreaterThanOrEqual(LC_TARGET_100)
      })

      it(`300 as text on 100 >= Lc ${LC_TARGET_300}`, () => {
        expect(lc(s('300'), s('100'))).toBeGreaterThanOrEqual(LC_TARGET_300)
      })

      it(`600 as text on 100 >= Lc ${LC_TARGET_600}`, () => {
        expect(lc(s('600'), s('100'))).toBeGreaterThanOrEqual(LC_TARGET_600)
      })

      it(`800 as text on 100 >= Lc ${LC_TARGET_800}`, () => {
        expect(lc(s('800'), s('100'))).toBeGreaterThanOrEqual(LC_TARGET_800)
      })

      it(`900 as text on background >= Lc ${LC_TARGET_900}`, () => {
        expect(lc(s('900'), bg)).toBeGreaterThanOrEqual(LC_TARGET_900)
      })

      it('900 is never pure black / pure white', () => {
        expect(s('900')).not.toBe('#000000')
        expect(s('900')).not.toBe('#ffffff')
      })

      it('lightness is monotonic: 100 → 300 → 600 → 700 → 800 → 900 moves away from the background', () => {
        const order = (['100', '300', '600', '700', '800', '900'] as const).map((k) => hexToHSL(s(k)).l)
        for (let i = 1; i < order.length; i++) {
          if (theme === 'white') expect(order[i]!).toBeLessThan(order[i - 1]!)
          else expect(order[i]!).toBeGreaterThan(order[i - 1]!)
        }
      })

      it('sign matches theme: positive on white, negative on black', () => {
        const signed = apcaContrastHex(s('700'), bg)
        if (theme === 'white') expect(signed).toBeGreaterThan(0)
        else expect(signed).toBeLessThan(0)
      })
    })
  }
})

describe('find700 — anchor adjusts in both directions', () => {
  it('darkens a too-light input on white', () => {
    const input = parseHex('#9ad0ff')
    const result = find700(input, 'white')
    expect(hexToHSL(result).l).toBeLessThan(hexToHSL(input).l)
    expect(lc(result, WHITE)).toBeGreaterThanOrEqual(LC_ANCHOR_700)
  })

  it('lightens a too-dark input on white and keeps the last value still >= 75', () => {
    const input = parseHex('#0b1a33')
    const result = find700(input, 'white')
    expect(hexToHSL(result).l).toBeGreaterThan(hexToHSL(input).l)
    expect(lc(result, WHITE)).toBeGreaterThanOrEqual(LC_ANCHOR_700)
    expect(lc(result, WHITE)).toBeLessThan(LC_ANCHOR_700 + 2)
  })

  it('lightens a too-dark input on black', () => {
    const input = parseHex('#1C734E')
    const result = find700(input, 'black')
    expect(hexToHSL(result).l).toBeGreaterThan(hexToHSL(input).l)
    expect(lc(result, BLACK)).toBeGreaterThanOrEqual(LC_ANCHOR_700)
  })

  it('darkens a too-light input on black', () => {
    const input = parseHex('#f5f5f5')
    const result = find700(input, 'black')
    expect(hexToHSL(result).l).toBeLessThan(hexToHSL(input).l)
    expect(lc(result, BLACK)).toBeGreaterThanOrEqual(LC_ANCHOR_700)
  })

  it('handles pure black on white (max contrast → retreat)', () => {
    const result = find700(BLACK, 'white')
    expect(lc(result, WHITE)).toBeGreaterThanOrEqual(LC_ANCHOR_700)
    expect(lc(result, WHITE)).toBeLessThan(LC_ANCHOR_700 + 2)
  })

  it('handles pure white on white (zero contrast → increase)', () => {
    const result = find700(WHITE, 'white')
    expect(lc(result, WHITE)).toBeGreaterThanOrEqual(LC_ANCHOR_700)
  })
})

describe('find* — direction per theme', () => {
  const s700w = find700(parseHex('#1A6646'), 'white')
  const s700b = find700(parseHex('#1C734E'), 'black')

  it('find100 lightens on white, darkens on black', () => {
    expect(hexToHSL(find100(s700w, 'white')).l).toBeGreaterThan(hexToHSL(s700w).l)
    expect(hexToHSL(find100(s700b, 'black')).l).toBeLessThan(hexToHSL(s700b).l)
  })

  it('find300 / find600 / find800 move away from the background starting at 100', () => {
    const s100w = find100(s700w, 'white')
    const s100b = find100(s700b, 'black')
    for (const fn of [find300, find600, find800]) {
      expect(hexToHSL(fn(s100w, 'white')).l).toBeLessThan(hexToHSL(s100w).l)
      expect(hexToHSL(fn(s100b, 'black')).l).toBeGreaterThan(hexToHSL(s100b).l)
    }
  })

  it('find900 is strictly beyond 800', () => {
    const s800w = find800(find100(s700w, 'white'), 'white')
    const s800b = find800(find100(s700b, 'black'), 'black')
    expect(hexToHSL(find900(s800w, 'white')).l).toBeLessThan(hexToHSL(s800w).l)
    expect(hexToHSL(find900(s800b, 'black')).l).toBeGreaterThan(hexToHSL(s800b).l)
  })
})

describe('buildApcaPalette — entry shape', () => {
  const palette = buildApcaPalette(parseHex('#3b82f6'), 'white')

  it('every shade has hex, rgb (0–255 ints) and hsl (ints)', () => {
    for (const key of ['100', '300', '600', '700', '800', '900'] as const) {
      const entry = palette[key]
      expect(entry.hex).toMatch(/^#[0-9a-f]{6}$/)
      for (const c of [entry.rgb.r, entry.rgb.g, entry.rgb.b]) {
        expect(Number.isInteger(c)).toBe(true)
        expect(c).toBeGreaterThanOrEqual(0)
        expect(c).toBeLessThanOrEqual(255)
      }
      expect(Number.isInteger(entry.hsl.l)).toBe(true)
    }
  })
})
