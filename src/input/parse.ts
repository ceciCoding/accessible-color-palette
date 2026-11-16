import { hslToHex, rgbToHex } from '../math/color.js'
import { InvalidColorError } from './errors.js'
import type { ColorInput, HexColor, HSLInput, RGBInput } from '../types.js'

const HEX_ACCEPTS = 'Accepts 3 or 6 hex digits, with or without a leading "#" (e.g. "#1f7a54", "1f7a54", "#fa0").'
const RGB_ACCEPTS =
  'Accepts "rgb(r, g, b)" (comma or space separated) or { r, g, b }, each channel a number from 0 to 255.'
const HSL_ACCEPTS =
  'Accepts "hsl(h, s%, l%)" (comma or space separated, optional "deg") or { h, s, l }, with h 0–360 and s/l 0–100.'

export function parseHex(input: string): HexColor {
  const trimmed = input.trim()
  const stripped = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed

  const expanded =
    stripped.length === 3
      ? stripped
          .split('')
          .map((c) => c + c)
          .join('')
      : stripped

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    throw new InvalidColorError('hex', input, `Invalid hex color: ${input}. ${HEX_ACCEPTS}`)
  }

  return `#${expanded.toLowerCase()}` as HexColor
}

const NUM = '(-?\\d+(?:\\.\\d+)?)'
// Unambiguous separator: either a comma (with optional spaces around it) or
// pure whitespace. The old `\s*[,\s]\s*` let one space match three different
// ways, which made failing inputs backtrack cubically (ReDoS).
const SEP = '(?:\\s*,\\s*|\\s+)'

// No valid color is anywhere near this long; checked BEFORE any regex runs so
// hostile input can never reach the matcher.
const MAX_COLOR_LENGTH = 64
const PREVIEW_LENGTH = 32

// JSON.stringify throws on circular structures and BigInt; an error report
// must never mask the real problem with an unrelated TypeError.
function describeInput(input: unknown): string {
  try {
    return String(JSON.stringify(input))
  } catch {
    return String(input)
  }
}
const RGB_STRING = new RegExp(`^rgb\\(\\s*${NUM}${SEP}${NUM}${SEP}${NUM}\\s*\\)$`, 'i')
const HSL_STRING = new RegExp(`^hsl\\(\\s*${NUM}(?:deg)?${SEP}${NUM}%${SEP}${NUM}%\\s*\\)$`, 'i')

const inRange = (n: number, min: number, max: number): boolean =>
  Number.isFinite(n) && n >= min && n <= max

function rgbInputToHex(rgb: RGBInput, original: string): HexColor {
  const { r, g, b } = rgb
  if (![r, g, b].every((channel) => inRange(channel, 0, 255))) {
    throw new InvalidColorError('rgb', original, `Invalid rgb color: ${original}. ${RGB_ACCEPTS}`)
  }
  return rgbToHex({ r: r / 255, g: g / 255, b: b / 255 })
}

function hslInputToHex(hsl: HSLInput, original: string): HexColor {
  const { h, s, l } = hsl
  if (!inRange(h, 0, 360) || !inRange(s, 0, 100) || !inRange(l, 0, 100)) {
    throw new InvalidColorError('hsl', original, `Invalid hsl color: ${original}. ${HSL_ACCEPTS}`)
  }
  return hslToHex({ h, s: s / 100, l: l / 100 })
}

// Accepts hex, `rgb(r, g, b)` / `hsl(h, s%, l%)` strings (comma or space
// separated), or { r, g, b } (0–255) / { h, s, l } (h 0–360, s/l 0–100) objects.
// Everything funnels into a validated HexColor — out-of-range values throw,
// they are never clamped.
export function parseColor(input: ColorInput): HexColor {
  if (typeof input === 'string') {
    const trimmed = input.trim()

    if (trimmed.length > MAX_COLOR_LENGTH) {
      const preview = `${trimmed.slice(0, PREVIEW_LENGTH)}…`
      throw new InvalidColorError(
        'unknown',
        preview,
        `Invalid color: ${preview} (${trimmed.length} chars, max ${MAX_COLOR_LENGTH}). ${HEX_ACCEPTS} ${RGB_ACCEPTS} ${HSL_ACCEPTS}`,
      )
    }

    const rgb = RGB_STRING.exec(trimmed)
    if (rgb) {
      return rgbInputToHex({ r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) }, input)
    }

    const hsl = HSL_STRING.exec(trimmed)
    if (hsl) {
      return hslInputToHex({ h: Number(hsl[1]), s: Number(hsl[2]), l: Number(hsl[3]) }, input)
    }

    // Looks like rgb()/hsl() but didn't match the grammar: report it as such
    // instead of falling through to a misleading hex error.
    if (/^rgb\(/i.test(trimmed)) {
      throw new InvalidColorError('rgb', input, `Invalid rgb color: ${input}. ${RGB_ACCEPTS}`)
    }
    if (/^hsl\(/i.test(trimmed)) {
      throw new InvalidColorError('hsl', input, `Invalid hsl color: ${input}. ${HSL_ACCEPTS}`)
    }

    return parseHex(input)
  }

  if (typeof input === 'object' && input !== null) {
    if ('r' in input) return rgbInputToHex(input, describeInput(input))
    if ('h' in input) return hslInputToHex(input, describeInput(input))
  }

  const serialized = describeInput(input)
  throw new InvalidColorError(
    'unknown',
    serialized,
    `Invalid color: ${serialized}. Expected one of: a hex string, an rgb()/hsl() string, a { r, g, b } object or a { h, s, l } object. ${HEX_ACCEPTS} ${RGB_ACCEPTS} ${HSL_ACCEPTS}`,
  )
}
