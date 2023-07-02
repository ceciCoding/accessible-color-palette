import { hsl2Hex, hexToRgb, rgb2Hsl } from 'colorsys'
import { colorContrastRatioCalculator } from '@mdhnpm/color-contrast-ratio-calculator'
import { validatePaletteColorBuilderArgs } from './validations'

const paletteColorBuilder = (name, color, info) => {
  if (!validatePaletteColorBuilderArgs(name, color, info)) return null
  const rgb = hexToRgb(color)
  if (!rgb) {
    console.error(`Invalid color: ${color}`)
    return null
  }
  return {
    name,
    rgb,
    hex: color,
    hsl: rgb2Hsl(rgb.r, rgb.g, rgb.b),
    info,
  }
}

const adjustColor = (colorHsl, bgColorHex, currentContrastRatio, targetRatio, adjustment) => {
  let newColorHex, newContrastRatio = currentContrastRatio

  while (Math.abs(newContrastRatio - targetRatio) > 0.1 && colorHsl.l >= 0 && colorHsl.l <= 100) {
    colorHsl.l += adjustment
    newColorHex = hsl2Hex(colorHsl)
    newContrastRatio = colorContrastRatioCalculator(bgColorHex, newColorHex).toFixed(1)
  }

  // if resultant ratio after loop is less than target ratio
  if (newContrastRatio < targetRatio && colorHsl.l >= 0 && colorHsl.l <= 100) {
    adjustment = bgColorHex === "#000000" ? 1 : -1
    colorHsl.l += adjustment
    newColorHex = hsl2Hex(colorHsl)
    newContrastRatio = colorContrastRatioCalculator(bgColorHex, newColorHex).toFixed(1)
  }

  return {
    newColorHex: newColorHex,
    newContrastRatio: newContrastRatio
  }
}

const calculateColor = (action1, action2, ratio, color, bgColor) => {
  return bgColor === '#ffffff' ? action1(ratio, color) : action2(ratio, color)
}

export { calculateColor, paletteColorBuilder, adjustColor }
