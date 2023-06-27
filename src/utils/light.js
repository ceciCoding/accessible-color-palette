
import { hsl2Hex, hex2Hsl } from 'colorsys'
import { colorContrastRatioCalculator } from '@mdhnpm/color-contrast-ratio-calculator'

export const darken = (desiredContrastRatio, colorHex) => {
  let newColorHex
  let currentContrastRatio = 1
  const colorHsl = hex2Hsl(colorHex)

  while (currentContrastRatio < desiredContrastRatio && colorHsl.l > 0) {
    colorHsl.l = colorHsl.l - 1
    newColorHex = hsl2Hex(colorHsl)
    currentContrastRatio = colorContrastRatioCalculator(colorHex, newColorHex).toFixed(1)
  }
  return { hex: newColorHex, ratio: currentContrastRatio }
}

export const illuminate = (desiredContrastRatio, colorHex) => {
  let newColorHex
  let currentContrastRatio = 1
  const colorHsl = hex2Hsl(colorHex)

  while (currentContrastRatio < desiredContrastRatio && colorHsl.l < 100) {
    colorHsl.l = colorHsl.l + 1
    newColorHex = hsl2Hex(colorHsl)
    currentContrastRatio = colorContrastRatioCalculator(colorHex, newColorHex).toFixed(1)
  }
  return { hex: newColorHex, ratio: currentContrastRatio }
}


