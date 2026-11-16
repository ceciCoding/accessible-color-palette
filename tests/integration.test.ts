import { describe, expect, it } from 'vitest'
import { generatePalette, toCSSTokens } from '../src/index.js'
import { parseHex } from '../src/input/parse.js'
import { hexToHSL, hexToRGB } from '../src/math/color.js'

const bgRatio = (result: ReturnType<typeof generatePalette>, shade: '100' | '300' | '600' | '700' | '800' | '900') => {
  const allPairs = [...result.usage[shade].normalText, ...result.usage[shade].largeText]
  return allPairs.find((p) => p.key === 'theme')?.ratio ?? 0
}

describe('generatePalette — #1F7A54 white', () => {
  const result = generatePalette('#1F7A54', 'white')

  it('shade 700 passes normal text on background', () => {
    expect(result.usage['700'].normalText.some((p) => p.key === 'theme')).toBe(true)
  })

  it('sourceColor is the parsed input', () => {
    expect(result.sourceColor).toBe('#1f7a54')
  })

  it('theme is preserved in result', () => {
    expect(result.theme).toBe('white')
  })
})

describe('generatePalette — dark theme inverts lightness order', () => {
  const light = generatePalette('#2dc384', 'white')
  const dark = generatePalette('#239062', 'black')

  it('white theme: shade 100 has lower contrast on background than 900', () => {
    expect(bgRatio(light, '100')).toBeLessThan(bgRatio(light, '900'))
  })

  it('black theme: shade 100 has lower contrast on background than 900', () => {
    expect(bgRatio(dark, '100')).toBeLessThan(bgRatio(dark, '900'))
  })
})

describe('generatePalette — #239062 black (expected values from spec)', () => {
  const result = generatePalette('#239062', 'black')

  it('shade 700 is the anchor with >= 4.5 contrast against black', () => {
    const ratio = bgRatio(result, '700')
    expect(ratio).toBeGreaterThanOrEqual(4.5)
    expect(ratio).toBeLessThanOrEqual(6.0)
  })

  it('shade 900 has the highest contrast on background', () => {
    const shades = ['100', '300', '600', '700', '800', '900'] as const
    const ratios = shades.map((s) => bgRatio(result, s))
    expect(bgRatio(result, '900')).toBe(Math.max(...ratios))
  })

  it('shade 100 has the lowest contrast on background', () => {
    const shades = ['100', '300', '600', '700', '800', '900'] as const
    const ratios = shades.map((s) => bgRatio(result, s))
    expect(bgRatio(result, '100')).toBe(Math.min(...ratios))
  })
})

describe('toCSSTokens integration', () => {
  const result = generatePalette('#1f7a54', 'white')

  it('output contains all 6 shade declarations matching palette hex values', () => {
    const tokens = toCSSTokens(result)
    for (const key of ['100', '300', '600', '700', '800', '900'] as const) {
      expect(tokens).toContain(`--color-${key}: ${result.palette[key].hex.toLowerCase()};`)
    }
  })

  it('custom prefix appears in all token declaration lines', () => {
    const tokens = toCSSTokens(result, 'theme')
    const tokenLines = tokens.split('\n').filter(l => l.trimStart().startsWith('--'))
    expect(tokenLines).toHaveLength(6)
    for (const line of tokenLines) {
      expect(line.startsWith('--theme-')).toBe(true)
    }
  })
})

describe('generatePalette — color input formats', () => {
  const fromHex = generatePalette('#1f7a54', 'white')

  it.each([
    ['rgb string', 'rgb(31, 122, 84)'],
    ['hsl string', 'hsl(155, 59%, 30%)'],
    ['rgb object', { r: 31, g: 122, b: 84 }],
    ['hsl object', { h: 155, s: 59, l: 30 }],
  ] as const)('%s produces the same palette as the equivalent hex', (_label, input) => {
    expect(generatePalette(input, 'white')).toEqual(fromHex)
  })

  it('throws for out-of-range rgb instead of clamping', () => {
    expect(() => generatePalette('rgb(300, 0, 0)', 'white')).toThrow('Invalid rgb color')
  })
})

// Deterministic pseudo-random hex colors (LCG) so failures are reproducible.
const sampleHexes = (count: number): string[] => {
  const next = (seed: number): number => (seed * 1664525 + 1013904223) % 4294967296
  return Array.from({ length: count }).reduce<{ seed: number; out: string[] }>(
    (acc) => {
      const seed = next(acc.seed)
      const hex = `#${Math.floor((seed / 4294967296) * 0xffffff).toString(16).padStart(6, '0')}`
      return { seed, out: [...acc.out, hex] }
    },
    { seed: 42, out: [] },
  ).out
}

describe('generatePalette — equivalent inputs yield identical palettes (sampled colors)', () => {
  const hexes = sampleHexes(300)

  for (const theme of ['white', 'black'] as const) {
    it(`rgb string, rgb object and full-precision hsl object match hex on ${theme}`, () => {
      for (const hex of hexes) {
        const expected = generatePalette(hex, theme)
        const rgb = hexToRGB(parseHex(hex))
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => Math.round(v * 255)) as [number, number, number]
        const hsl = hexToHSL(parseHex(hex))

        expect(generatePalette(`rgb(${r}, ${g}, ${b})`, theme), hex).toEqual(expected)
        expect(generatePalette({ r, g, b }, theme), hex).toEqual(expected)
        expect(generatePalette({ h: hsl.h, s: hsl.s * 100, l: hsl.l * 100 }, theme), hex).toEqual(expected)
      }
    })
  }
})

describe('generatePalette — error handling', () => {
  it('throws for invalid hex', () => {
    expect(() => generatePalette('notacolor', 'white')).toThrow()
  })

  it('error message contains the invalid input', () => {
    expect(() => generatePalette('notacolor', 'white')).toThrow('notacolor')
  })

  it('throws for empty string', () => {
    expect(() => generatePalette('', 'white')).toThrow()
  })
})
