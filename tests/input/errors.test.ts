import { describe, expect, it } from 'vitest'
import { InvalidColorError, checkContrast, generatePalette } from '../../src/index.js'
import { parseColor } from '../../src/input/parse.js'
import type { ColorInput } from '../../src/index.js'

const thrown = (fn: () => unknown): unknown => {
  try {
    fn()
  } catch (e) {
    return e
  }
  return undefined
}

const cases: ReadonlyArray<{ label: string; input: unknown; format: string; message: string; field: string }> = [
  { label: 'invalid hex', input: '#12345', format: 'hex', message: 'Invalid hex color: #12345.', field: '#12345' },
  { label: 'rgb out of range', input: 'rgb(300,0,0)', format: 'rgb', message: 'Invalid rgb color: rgb(300,0,0).', field: 'rgb(300,0,0)' },
  { label: 'hsl out of range', input: 'hsl(10, 200%, 50%)', format: 'hsl', message: 'Invalid hsl color: hsl(10, 200%, 50%).', field: 'hsl(10, 200%, 50%)' },
  { label: 'malformed rgb()', input: 'rgb(1,2)', format: 'rgb', message: 'Invalid rgb color: rgb(1,2).', field: 'rgb(1,2)' },
  { label: 'malformed hsl()', input: 'hsl(oops)', format: 'hsl', message: 'Invalid hsl color: hsl(oops).', field: 'hsl(oops)' },
  { label: 'rgb object out of range', input: { r: 300, g: 0, b: 0 }, format: 'rgb', message: 'Invalid rgb color: {"r":300,"g":0,"b":0}.', field: '{"r":300,"g":0,"b":0}' },
  { label: 'hsl object out of range', input: { h: 10, s: 200, l: 50 }, format: 'hsl', message: 'Invalid hsl color: {"h":10,"s":200,"l":50}.', field: '{"h":10,"s":200,"l":50}' },
  { label: 'garbage object', input: { foo: 1 }, format: 'unknown', message: 'Invalid color: {"foo":1}.', field: '{"foo":1}' },
  { label: 'null', input: null, format: 'unknown', message: 'Invalid color: null.', field: 'null' },
  { label: 'undefined', input: undefined, format: 'unknown', message: 'Invalid color: undefined.', field: 'undefined' },
]

describe('InvalidColorError', () => {
  it.each(cases)('generatePalette throws it for $label', ({ input, format, message, field }) => {
    const error = thrown(() => generatePalette(input as ColorInput, 'white'))
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(InvalidColorError)
    expect(error).toMatchObject({ name: 'InvalidColorError', format, input: field })
    expect((error as Error).message.startsWith(message)).toBe(true)
  })

  it('checkContrast throws it for invalid foreground and background', () => {
    expect(thrown(() => checkContrast('nope', '#ffffff'))).toBeInstanceOf(InvalidColorError)
    expect(thrown(() => checkContrast('#ffffff', 'rgb(300,0,0)'))).toBeInstanceOf(InvalidColorError)
  })

  it('parseColor throws it too', () => {
    expect(thrown(() => parseColor('zzz'))).toBeInstanceOf(InvalidColorError)
  })

  it('keeps the message identical to the previous plain Error', () => {
    const error = thrown(() => generatePalette('#12345', 'white')) as Error
    expect(error.message).toBe(
      'Invalid hex color: #12345. Accepts 3 or 6 hex digits, with or without a leading "#" (e.g. "#1f7a54", "1f7a54", "#fa0").',
    )
  })

  it('still never clamps out-of-range values', () => {
    expect(() => generatePalette('rgb(256,0,0)', 'white')).toThrow(InvalidColorError)
  })
})
