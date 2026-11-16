import { describe, expect, it } from 'vitest'
import { generateApcaPalette } from '../../src/index.js'
import { buildApcaCompatMatrix, toApcaCSSTokens } from '../../src/output/apca-tokens.js'
import type { ApcaPaletteResult, ShadeKey } from '../../src/types.js'

// Returns a copy of `result` where `shade` keeps only a single non-text pairing (on 100).
const withEmptyText = (result: ApcaPaletteResult, shade: ShadeKey): ApcaPaletteResult => ({
  ...result,
  usage: {
    ...result.usage,
    [shade]: {
      hex: result.palette[shade].hex,
      preferredText: [],
      bodyText: [],
      contentText: [],
      largeText: [],
      nonText: [{ key: '100', hex: result.palette['100'].hex, lc: 20 }],
    },
  },
})

describe('buildApcaCompatMatrix', () => {
  const result = generateApcaPalette('#3b82f6', 'white')
  const matrix = buildApcaCompatMatrix(result)

  it('labels the theme background by its name', () => {
    expect(matrix['700'].bodyText).toContain('white')
  })

  it('sorts bucket labels by |Lc| descending', () => {
    const pairs = result.usage['900'].preferredText
    const sorted = [...pairs].sort((a, b) => Math.abs(b.lc) - Math.abs(a.lc)).map((p) => (p.key === 'theme' ? 'white' : p.key))
    expect(matrix['900'].preferredText).toEqual(sorted)
  })

  it('100 is text-safe on white: it works as light text on 900/800 (APCA is directional)', () => {
    expect(matrix['100'].textSafe).toBe(true)
    expect(matrix['100'].bodyText).toContain('900')
  })

  it('marks a shade with only non-text pairings as not text-safe', () => {
    const matrixNoText = buildApcaCompatMatrix(withEmptyText(result, '300'))
    expect(matrixNoText['300'].textSafe).toBe(false)
    expect(matrixNoText['300'].nonText).toEqual(['100'])
  })

  it('black theme labels the theme background "black"', () => {
    const dark = buildApcaCompatMatrix(generateApcaPalette('#3b82f6', 'black'))
    expect(dark['700'].bodyText).toContain('black')
  })
})

describe('toApcaCSSTokens', () => {
  const result = generateApcaPalette('#3b82f6', 'white')
  const css = toApcaCSSTokens(result)

  it('emits a manifest header naming the model and source', () => {
    expect(css).toContain('APCA PAIRING MANIFEST')
    expect(css).toContain('source: #3b82f6')
    expect(css).toContain('theme: white')
  })

  it('warns that pairings are directional', () => {
    expect(css).toContain('DIRECTIONAL')
  })

  it('emits one variable per shade with the default prefix', () => {
    for (const s of ['100', '300', '600', '700', '800', '900']) {
      expect(css).toMatch(new RegExp(`--color-${s}: #[0-9a-f]{6};`))
    }
  })

  it('honours a custom prefix', () => {
    expect(toApcaCSSTokens(result, 'brand')).toContain('--brand-700:')
  })

  it('marks shades with no text use', () => {
    const cssNoText = toApcaCSSTokens(withEmptyText(result, '300'))
    expect(cssNoText).toMatch(/--color-300: #[0-9a-f]{6}; \/\* no-text-use  ▫ non-text→100/)
    expect(cssNoText).toContain('NO SAFE TEXT USE (background / non-text only):')
    expect(cssNoText).toContain(`shade-300 (${result.palette['300'].hex})`)
  })

  it('omits the NO SAFE TEXT USE section when every shade has a text use', () => {
    expect(css).not.toContain('NO SAFE TEXT USE')
  })

  it('lists 700 under BODY TEXT and 900 under PREFERRED BODY TEXT', () => {
    expect(css).toContain('PREFERRED BODY TEXT')
    expect(css).toContain('BODY TEXT (Lc 75–90')
    expect(css).toMatch(/★ preferred→[^\n]*white/)
  })

  it('wraps variables in :root', () => {
    expect(css).toContain(':root {')
    expect(css.trim().endsWith('}')).toBe(true)
  })
})
