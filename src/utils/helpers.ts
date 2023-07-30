import { PaletteColor, RGBColor, LightResult, HSLColor, Adjustment } from '../types'
import { colorContrastRatioCalculator } from '@mdhnpm/color-contrast-ratio-calculator'
import { validatePaletteColorBuilderArgs } from './validations'
import { darken, illuminate } from './light'
import { convert } from 'color-convert'

const paletteColorBuilder = (name: string, color: string, info: string): PaletteColor => {
  if (!validatePaletteColorBuilderArgs(name, color, info)) return null
  const rgb: RGBColor = convert.hex.rgb(color)
  if (!rgb) {
    console.error(`Invalid color: ${color}`)
    return null
  }
  return {
    name,
    rgb,
    hex: color,
    hsl: convert.rgb.hsl(rgb.r, rgb.g, rgb.b),
    info,
  } as PaletteColor
}

const adjustColor = (
  colorHsl: HSLColor,
  bgColorHex: string,
  currentContrastRatio: number,
  targetRatio: number,
  adjustment: Adjustment
): LightResult => {

  let newColorHex
  let newContrastRatio = currentContrastRatio

  while (
    Math.abs(newContrastRatio - targetRatio) > 0.1
    && colorHsl.l >= 0
    && colorHsl.l <= 100
  ) {
    colorHsl.l += adjustment
    newColorHex = convert.hsl.hex(colorHsl)
    newContrastRatio = Number(colorContrastRatioCalculator(bgColorHex, newColorHex).toFixed(1))
  }

  // if resultant ratio after loop is less than target ratio
  if (newContrastRatio < targetRatio && colorHsl.l >= 0 && colorHsl.l <= 100) {
    adjustment = bgColorHex === "#000000" ? 1 : -1
    colorHsl.l += adjustment
    newColorHex = convert.hsl.hex(colorHsl)
    newContrastRatio = Number(colorContrastRatioCalculator(bgColorHex, newColorHex).toFixed(1))
  }

  return {
    hex: newColorHex,
    ratio: newContrastRatio
  } as LightResult
}

const calculateColor = (
  action1: (ratio: number, color: string) => LightResult,
  action2: (ratio: number, color: string) => LightResult,
  ratio: number,
  color: string,
  bgColor: string
): LightResult => {
  return bgColor === '#ffffff' ? action1(ratio, color) : action2(ratio, color)
}

export { calculateColor, paletteColorBuilder, adjustColor }
