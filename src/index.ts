import { parseHex } from './math/color.js'
import { buildCompatibilityMatrix } from './algorithm/compatibility.js'
import { buildPalette } from './algorithm/palette.js'
import { buildApcaMatrix } from './algorithm/apca/compatibility.js'
import { buildApcaPalette } from './algorithm/apca/palette.js'
import { toCSSTokens as _toCSSTokens } from './output/tokens.js'
import { toApcaCSSTokens as _toApcaCSSTokens } from './output/apca-tokens.js'
import { buildPaletteUsage } from './output/usage.js'
import { buildApcaUsage } from './output/apca-usage.js'
import { validatePairings as _validatePairings, checkContrast as _checkContrast } from './output/validation.js'
import {
  validateApcaPairings as _validateApcaPairings,
  checkApcaContrast as _checkApcaContrast,
} from './output/apca-validation.js'
import type { ApcaPaletteResult, PaletteResult, Theme } from './types.js'

// ─── WCAG 2.2 AA ─────────────────────────────────────────────────────────────

export function generatePalette(hex: string, theme: Theme): PaletteResult {
  const parsed = parseHex(hex)
  const palette = buildPalette(parsed, theme)
  const compatibility = buildCompatibilityMatrix(palette, theme)
  const usage = buildPaletteUsage(palette, compatibility, theme)
  return { palette, usage, theme, sourceColor: parsed }
}

export function toCSSTokens(result: PaletteResult, prefix?: string): string {
  return _toCSSTokens(result, prefix)
}

export const validatePairings = _validatePairings
export const checkContrast = _checkContrast

// ─── APCA (WCAG 3 draft) ─────────────────────────────────────────────────────

export function generateApcaPalette(hex: string, theme: Theme): ApcaPaletteResult {
  const parsed = parseHex(hex)
  const palette = buildApcaPalette(parsed, theme)
  const matrix = buildApcaMatrix(palette, theme)
  const usage = buildApcaUsage(palette, matrix, theme)
  return { model: 'apca', palette, usage, theme, sourceColor: parsed }
}

export function toApcaCSSTokens(result: ApcaPaletteResult, prefix?: string): string {
  return _toApcaCSSTokens(result, prefix)
}

export const validateApcaPairings = _validateApcaPairings
export const checkApcaContrast = _checkApcaContrast

export type {
  PaletteResult,
  Palette,
  ShadeEntry,
  ContrastLevel,
  Theme,
  ShadeKey,
  MatrixKey,
  HexColor,
  CSSTokens,
  BackgroundKey,
  CompatiblePair,
  ShadeUsage,
  PaletteUsage,
  CompatibilityEntry,
  CompatibilityMatrix,
  ContrastModel,
  ApcaLevel,
  ApcaPolarity,
  ApcaMatrixEntry,
  ApcaMatrix,
  ApcaPair,
  ApcaShadeUsage,
  ApcaPaletteUsage,
  ApcaPaletteResult,
} from './types.js'

export type { PairingLevel, PairingResult, ValidationReport, ContrastCheckResult } from './output/validation.js'
export type {
  ApcaPairingLevel,
  ApcaPairingResult,
  ApcaValidationReport,
  ApcaContrastCheckResult,
} from './output/apca-validation.js'
