import { LightResult, HSLColor } from '../types'
import { colorContrastRatioCalculator } from '@mdhnpm/color-contrast-ratio-calculator'
import { validateLightArgs } from './validations'
import { convert } from 'color-convert'

export const darken = (desiredContrastRatio: number, colorHex: string): LightResult | null => {
  if (!validateLightArgs(desiredContrastRatio, colorHex)) return null

  let newColorHex: string
  let currentContrastRatio: number = 1
  const colorHsl: HSLColor = convert.hex.hsl(colorHex)

  while (currentContrastRatio < desiredContrastRatio && colorHsl.l > 0) {
    colorHsl.l = colorHsl.l - 1
    newColorHex = convert.hsl.hex(colorHsl)
    currentContrastRatio = Number(colorContrastRatioCalculator(colorHex, newColorHex).toFixed(1))
  }
  return { hex: newColorHex, ratio: currentContrastRatio } as LightResult
}

export const illuminate = (desiredContrastRatio: number, colorHex: string): LightResult => {
  if (!validateLightArgs(desiredContrastRatio, colorHex)) return null

  let newColorHex: string
  let currentContrastRatio: number = 1
  const colorHsl: HSLColor = convert.hex.hsl(colorHex)

  while (currentContrastRatio < desiredContrastRatio && colorHsl.l < 100) {
    colorHsl.l = colorHsl.l + 1
    newColorHex = convert.hsl.hex(colorHsl)
    currentContrastRatio = Number(colorContrastRatioCalculator(colorHex, newColorHex).toFixed(1))
  }
  return { hex: newColorHex, ratio: currentContrastRatio } as LightResult
}


