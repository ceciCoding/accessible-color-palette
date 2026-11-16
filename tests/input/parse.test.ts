import { describe, expect, it } from 'vitest'
import { InvalidColorError } from '../../src/input/errors.js'
import { parseColor, parseHex } from '../../src/input/parse.js'

describe('parseHex', () => {
  it('accepts 6-char hex with #', () => {
    expect(parseHex('#1f7a54')).toBe('#1f7a54')
  })

  it('accepts 6-char hex without #', () => {
    expect(parseHex('1f7a54')).toBe('#1f7a54')
  })

  it('accepts 3-char shorthand with #', () => {
    expect(parseHex('#abc')).toBe('#aabbcc')
  })

  it('accepts 3-char shorthand without #', () => {
    expect(parseHex('abc')).toBe('#aabbcc')
  })

  it('normalizes to lowercase', () => {
    expect(parseHex('#1F7A54')).toBe('#1f7a54')
  })

  it('throws for empty string', () => {
    expect(() => parseHex('')).toThrow('Invalid hex color')
  })

  it('throws for invalid chars', () => {
    expect(() => parseHex('gg0000')).toThrow('Invalid hex color')
  })

  it('throws for wrong length', () => {
    expect(() => parseHex('#12345')).toThrow('Invalid hex color')
  })

  it('throws for non-hex string', () => {
    expect(() => parseHex('notacolor')).toThrow('Invalid hex color')
  })

  it('error message includes the invalid input', () => {
    expect(() => parseHex('notacolor')).toThrow('notacolor')
  })
})

describe('parseColor', () => {
  describe('hex strings (unchanged behavior)', () => {
    it('accepts 6-char hex with and without #', () => {
      expect(parseColor('#1F7A54')).toBe('#1f7a54')
      expect(parseColor('1f7a54')).toBe('#1f7a54')
    })

    it('accepts 3-char shorthand', () => {
      expect(parseColor('#abc')).toBe('#aabbcc')
    })

    it('throws the hex error for unrecognized strings', () => {
      expect(() => parseColor('notacolor')).toThrow('Invalid hex color: notacolor')
    })

    it('reports malformed rgb()/hsl() with their own format error', () => {
      expect(() => parseColor('rgb(1, 2)')).toThrow('Invalid rgb color: rgb(1, 2)')
      expect(() => parseColor('hsl(10, 50, 50)')).toThrow('Invalid hsl color: hsl(10, 50, 50)')
    })
  })

  describe('rgb strings', () => {
    it('accepts comma-separated values', () => {
      expect(parseColor('rgb(31, 122, 84)')).toBe('#1f7a54')
    })

    it('accepts space-separated values', () => {
      expect(parseColor('rgb(31 122 84)')).toBe('#1f7a54')
    })

    it('is case-insensitive and tolerates extra whitespace', () => {
      expect(parseColor('  RGB( 31,122,84 )  ')).toBe('#1f7a54')
    })

    it('handles the extremes', () => {
      expect(parseColor('rgb(0, 0, 0)')).toBe('#000000')
      expect(parseColor('rgb(255, 255, 255)')).toBe('#ffffff')
    })

    it('throws (never clamps) when a channel is above 255', () => {
      expect(() => parseColor('rgb(256, 0, 0)')).toThrow('Invalid rgb color: rgb(256, 0, 0)')
    })

    it('throws when a channel is negative', () => {
      expect(() => parseColor('rgb(-1, 0, 0)')).toThrow('Invalid rgb color')
    })
  })

  describe('hsl strings', () => {
    it('accepts comma-separated values', () => {
      expect(parseColor('hsl(155, 59%, 30%)')).toBe('#1f7a54')
    })

    it('accepts space-separated values with a deg unit', () => {
      expect(parseColor('hsl(155deg 59% 30%)')).toBe('#1f7a54')
    })

    it('treats 0 and 360 as the same hue', () => {
      expect(parseColor('hsl(0, 100%, 50%)')).toBe('#ff0000')
      expect(parseColor('hsl(360, 100%, 50%)')).toBe('#ff0000')
    })

    it('converts a hue in the yellow-green sector', () => {
      expect(parseColor('hsl(90, 100%, 50%)')).toBe('#80ff00')
    })

    it('throws when hue is out of range', () => {
      expect(() => parseColor('hsl(361, 50%, 50%)')).toThrow('Invalid hsl color: hsl(361, 50%, 50%)')
    })

    it('throws when saturation is out of range', () => {
      expect(() => parseColor('hsl(10, 101%, 50%)')).toThrow('Invalid hsl color')
    })

    it('throws when lightness is out of range', () => {
      expect(() => parseColor('hsl(10, 50%, -1%)')).toThrow('Invalid hsl color')
    })
  })

  describe('rgb objects', () => {
    it('accepts { r, g, b } in 0–255', () => {
      expect(parseColor({ r: 31, g: 122, b: 84 })).toBe('#1f7a54')
    })

    it('accepts the rgb shape a ShadeEntry already exposes', () => {
      const entry = { hex: '#1f7a54', rgb: { r: 31, g: 122, b: 84 } }
      expect(parseColor(entry.rgb)).toBe(entry.hex)
    })

    it('throws when a channel is out of range', () => {
      expect(() => parseColor({ r: 300, g: 0, b: 0 })).toThrow('Invalid rgb color')
    })

    it('throws when a channel is missing', () => {
      // @ts-expect-error — runtime guard for untyped (JS / JSON) callers
      expect(() => parseColor({ r: 1, g: 2 })).toThrow('Invalid rgb color')
    })

    it('throws when a channel is not a number', () => {
      // @ts-expect-error — runtime guard for untyped (JS / JSON) callers
      expect(() => parseColor({ r: '31', g: 122, b: 84 })).toThrow('Invalid rgb color')
    })
  })

  describe('hsl objects', () => {
    it('accepts { h, s, l } with s/l in 0–100', () => {
      expect(parseColor({ h: 155, s: 59, l: 30 })).toBe('#1f7a54')
    })

    it('throws when a component is out of range', () => {
      expect(() => parseColor({ h: 0, s: 101, l: 50 })).toThrow('Invalid hsl color')
    })
  })

  describe('invalid shapes', () => {
    it('throws for an object that is neither rgb nor hsl', () => {
      // @ts-expect-error — runtime guard for untyped (JS / JSON) callers
      expect(() => parseColor({})).toThrow('Invalid color')
    })

    it('throws for null', () => {
      // @ts-expect-error — runtime guard for untyped (JS / JSON) callers
      expect(() => parseColor(null)).toThrow('Invalid color')
    })

    it('throws for a number', () => {
      // @ts-expect-error — runtime guard for untyped (JS / JSON) callers
      expect(() => parseColor(255)).toThrow('Invalid color')
    })

    it('throws InvalidColorError (not TypeError) for a circular object', () => {
      const circular: Record<string, unknown> = {}
      circular['self'] = circular
      // @ts-expect-error — runtime guard for untyped (JS / JSON) callers
      expect(() => parseColor(circular)).toThrow(InvalidColorError)
    })

    it('throws InvalidColorError (not TypeError) for a BigInt channel', () => {
      // @ts-expect-error — runtime guard for untyped (JS / JSON) callers
      expect(() => parseColor({ r: 1n, g: 0, b: 0 })).toThrow(InvalidColorError)
    })
  })

  describe('hex whitespace', () => {
    it('trims surrounding whitespace on hex strings', () => {
      expect(parseColor('  #FFF ')).toBe('#ffffff')
      expect(parseColor('\t1f7a54\n')).toBe('#1f7a54')
    })

    it('still rejects whitespace inside a hex string', () => {
      expect(() => parseColor('1f 7a54')).toThrow('Invalid hex color')
    })
  })

  describe('hostile input (ReDoS guard)', () => {
    it('rejects oversized input immediately, with a short message', () => {
      const hostile = `rgb(1${' '.repeat(5000)}2${' '.repeat(5000)}3${' '.repeat(5000)}x`
      const start = performance.now()
      let error: unknown
      try {
        parseColor(hostile)
      } catch (e) {
        error = e
      }
      expect(error).toBeInstanceOf(InvalidColorError)
      expect((error as InvalidColorError).message.length).toBeLessThan(600)
      expect(performance.now() - start).toBeLessThan(100)
    })

    it('fails fast on near-limit separator-heavy input that does not match', () => {
      // 60 chars: under the cap, so it DOES reach the regex (sanity check on
      // the unambiguous separator; the cap alone bounds the worst case).
      const nearLimit = `rgb(1${' '.repeat(18)}2${' '.repeat(18)}3${' '.repeat(18)}x`
      const start = performance.now()
      expect(() => parseColor(nearLimit)).toThrow(InvalidColorError)
      expect(performance.now() - start).toBeLessThan(100)
    })

    it('still accepts comma, comma+space and space separators', () => {
      expect(parseColor('rgb(1,2,3)')).toBe('#010203')
      expect(parseColor('rgb(1 , 2 ,3)')).toBe('#010203')
      expect(parseColor('rgb(1    2   3)')).toBe('#010203')
    })
  })
})
