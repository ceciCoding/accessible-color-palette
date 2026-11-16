import { parseColor } from './input/parse.js'
import { buildCompatibilityMatrix } from './algorithm/compatibility.js'
import { buildPalette } from './algorithm/palette.js'
import { toCSSTokens as _toCSSTokens, buildCompatMatrix as _buildCompatMatrix } from './output/tokens.js'
import type { ShadeCompat } from './output/tokens.js'
import { buildPaletteUsage } from './output/usage.js'
import { validatePairings as _validatePairings, describeContrast } from './output/validation.js'
import type { ContrastCheckResult } from './output/validation.js'
import type { ColorInput, PaletteResult, ShadeKey, Theme } from './types.js'

export function generatePalette(color: ColorInput, theme: Theme): PaletteResult {
  const parsed = parseColor(color)
  const palette = buildPalette(parsed, theme)
  const compatibility = buildCompatibilityMatrix(palette, theme)
  const usage = buildPaletteUsage(palette, compatibility, theme)
  return { palette, usage, theme, sourceColor: parsed }
}

export function toCSSTokens(result: PaletteResult, prefix?: string): string {
  return _toCSSTokens(result, prefix)
}

export const validatePairings = _validatePairings

export function buildCompatMatrix(result: PaletteResult): Record<ShadeKey, ShadeCompat> {
  return _buildCompatMatrix(result)
}

export function checkContrast(foreground: ColorInput, background: ColorInput): ContrastCheckResult {
  return describeContrast(parseColor(foreground), parseColor(background))
}

export { InvalidColorError } from './input/errors.js'
export type { InvalidColorFormat } from './input/errors.js'

export type {
  PaletteResult,
  Palette,
  ShadeEntry,
  ContrastLevel,
  Theme,
  ShadeKey,
  MatrixKey,
  HexColor,
  ColorInput,
  RGBInput,
  HSLInput,
  CSSTokens,
  BackgroundKey,
  CompatiblePair,
  ShadeUsage,
  PaletteUsage,
  CompatibilityEntry,
  CompatibilityMatrix,
} from './types.js'

export type { ShadeCompat } from './output/tokens.js'

export type { PairingLevel, PairingResult, ValidationReport, ContrastCheckResult } from './output/validation.js'
