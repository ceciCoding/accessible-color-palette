
import { hsl2Hex, hex2Hsl } from 'colorsys'
import { colorContrastRatioCalculator } from '@mdhnpm/color-contrast-ratio-calculator'

export function darken(colorHex1, colorHex2, ratio) {
  function darkenSecuence() {
    colorHsl1.l = colorHsl1.l - 1
    colorHex1 = hsl2Hex(colorHsl1)
    contrastRatio = colorContrastRatioCalculator(colorHex1, colorHex2)
  }

  const colorHsl1 = hex2Hsl(colorHex1)
  let contrastRatio = colorContrastRatioCalculator(colorHex1, colorHex2)
  if (contrastRatio > ratio) {
    do {
      darkenSecuence()
    } while (contrastRatio - ratio > 0.1 && colorHsl1.l >= 0)
  } else {
    do {
      darkenSecuence()
    } while (ratio - contrastRatio > 0.1 && colorHsl1.l >= 0)
  }
  return { hex: hsl2Hex(colorHsl1), ratio: contrastRatio }
}

export function lighten(colorHex1, colorHex2, ratio) {
  function lightenSecuence() {
    colorHsl1.l = colorHsl1.l + 1
    colorHex1 = hsl2Hex(colorHsl1)
    contrastRatio = colorContrastRatioCalculator(colorHex1, colorHex2)
  }
  const colorHsl1 = hex2Hsl(colorHex1)
  let contrastRatio = colorContrastRatioCalculator(colorHex1, colorHex2)
  if (contrastRatio > ratio) {
    do {
      lightenSecuence()
    } while (contrastRatio - ratio > 0.1 && colorHsl1.l < 100)
  } else {
    do {
      lightenSecuence()
    } while (ratio - contrastRatio > 0.1 && colorHsl1.l < 100)
  }
  return { hex: hsl2Hex(colorHsl1), ratio: contrastRatio }
}