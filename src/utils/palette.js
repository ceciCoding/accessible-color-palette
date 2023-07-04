// DOCUMENTATION: https://shorturl.at/fgqRW
import { hex2Hsl } from 'colorsys'
import { colorContrastRatioCalculator } from '@mdhnpm/color-contrast-ratio-calculator'
import { darken, illuminate } from './light'
import { paletteColorBuilder, adjustColor, calculateColor } from './helpers'
import { validatePaletteArgs } from './validations'

const RATIOS = {
  100: 4.5,
  300: 3.1,
  600: 3.1,
  700: 5.1,
  800: 3.1,
  900: 3.1,
}

const ORIGIN_COLORS = {
  100: 700,
  300: 700,
  600: 100,
  800: 600,
  900: 700
}

let cache = {}

const generatePalette = (colorHex, bgColor) => {
  if (!validatePaletteArgs(colorHex, bgColor)) return null

  //check for short hex like #000 or #aaa. colorContrastRatioCalculator requires full hex
  if (colorHex.length === 4) {
    colorHex = colorHex[0] + colorHex[1].repeat(6)
  }

  const cacheKey = `${colorHex}-${bgColor}`
  if (cache[cacheKey]) return cache[cacheKey]

  let colors = {}
  const bgColorHex = bgColor === 'white' ? '#ffffff' : '#000000'
  const currentContrastRatio = colorContrastRatioCalculator(colorHex, bgColorHex).toFixed(1)

  colors[700] = get700(colorHex, bgColorHex, currentContrastRatio)

  //the order is important
  const paletteColors = ['100', '300', '600', '800', '900'].map((name) => {
    const localHex = colors[ORIGIN_COLORS[name]].hex
    return colors[name] = getPaletteColor(name, bgColorHex, localHex)
  })
  cache[cacheKey] = colors
  return colors
}

const get700 = (colorHex, bgColorHex, currentContrastRatio) => {
  const name = "700"
  const targetRatio = RATIOS[name]
  let info = `(${targetRatio}:1 on background)`
  const colorHsl = hex2Hsl(colorHex)

  if (currentContrastRatio === targetRatio) {
    colors[name] = paletteColorBuilder(name, colorHex, info)
    return
  }

  const adjustment = bgColorHex === "#000000" ?
    (currentContrastRatio > targetRatio ? -1 : 1) :
    (currentContrastRatio > targetRatio ? 1 : -1)

  let { hex, ratio } = adjustColor(colorHsl, bgColorHex, currentContrastRatio, targetRatio, adjustment)

  info = `(${ratio}:1 on background)`
  return paletteColorBuilder(name, hex, info)
}

const getPaletteColor = (name, bgColor, originColor) => {
  const action = (name === '100' || name === '300') ? [illuminate, darken] : [darken, illuminate]
  const newColor = calculateColor(...action, RATIOS[name], originColor, bgColor)
  const info = `(${newColor.ratio}:1 on ${ORIGIN_COLORS[name]})`
  return paletteColorBuilder(name, newColor.hex, info)
}

export { generatePalette, get700, getPaletteColor }





