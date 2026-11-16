import { hexToHSL, hexToRGB } from '../math/color.js'
import type { HexColor, ShadeEntry } from '../types.js'

// Formats a hex into the public ShadeEntry shape. Shared by every palette
// builder so that the output shape is defined in exactly one place.
export function toShadeEntry(hex: HexColor): ShadeEntry {
  const rgb = hexToRGB(hex)
  const hsl = hexToHSL(hex)
  return {
    hex,
    rgb: { r: Math.round(rgb.r * 255), g: Math.round(rgb.g * 255), b: Math.round(rgb.b * 255) },
    hsl: { h: Math.round(hsl.h), s: Math.round(hsl.s * 100), l: Math.round(hsl.l * 100) },
  }
}
