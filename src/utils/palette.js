import { rgb2Hsl, hexToRgb, hex2Hsl, hsl2Hex } from 'colorsys'
import { colorContrastRatioCalculator } from '@mdhnpm/color-contrast-ratio-calculator'
import { darken, illuminate } from './light'

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

export function generatePalette(colorHex, bgColor) {
  if (!validateParams()) return null
  const cacheKey = `${colorHex}-${bgColor}`
  if (cache[cacheKey]) return cache[cacheKey]
  let colors = {
    100: null,
    300: null,
    600: null,
    700: null,
    800: null,
    900: null,
  }
  const bgColorHex = bgColor === 'white' ? '#ffffff' : '#000000'
  const currentContrastRatio = colorContrastRatioCalculator(colorHex, bgColorHex).toFixed(1)
  colors[700] = get700(colorHex, bgColorHex, currentContrastRatio)
  const paletteColors = ['100', '300', '600', '800', '900'].map((name) => {
    return colors[name] = getColor(name, bgColorHex)
  })
  cache[cacheKey] = colors
  return colors


  function validateParams() {
    let errorMessage = ''

    if (!colorHex) {
      errorMessage = 'Missing base color'
    } else if (!bgColor) {
      errorMessage = 'Missing contrast color'
    } else if (!isValidHexColor(colorHex)) {
      errorMessage = 'Invalid base color. Use a valid hex color'
    } else if (bgColor !== 'white' && bgColor !== 'black') {
      errorMessage = 'Invalid contrast color. Use "white" or "black"'
    }

    if (errorMessage) {
      console.error('Accessible color palette:', errorMessage)
      return false
    }

    return true
  }

  function getColor(name, bgColor) {
    let newColor
    if (name === '100' || name === '300') {
      bgColor === '#ffffff' ?
        newColor = illuminate(RATIOS[name], colors[ORIGIN_COLORS[name]].hex) :
        newColor = darken(RATIOS[name], colors[ORIGIN_COLORS[name]].hex)
    } else {
      bgColor === '#ffffff' ?
        newColor = darken(RATIOS[name], colors[ORIGIN_COLORS[name]].hex) :
        newColor = illuminate(RATIOS[name], colors[ORIGIN_COLORS[name]].hex)
    }
    return paletteColorBuilder(name, newColor.hex, `(${newColor.ratio}:1 on ${ORIGIN_COLORS[name]})`)
  }

  function get700(colorHex, bgColorHex, currentContrastRatio) {
    let newColorHex
    let newContrastRatio = currentContrastRatio
    const name = "700"
    let info = `(${RATIOS[name]}:1 on background)`
    const colorHsl = hex2Hsl(colorHex)

    if (currentContrastRatio === RATIOS[name]) {
      colors[name] = paletteColorBuilder(name, color, info)
      return
    }

    if (bgColorHex === "#000000") {
      if (currentContrastRatio > RATIOS[name]) {
        while (newContrastRatio > RATIOS[name] && colorHsl.l > 0) {
          colorHsl.l = colorHsl.l - 1
          newColorHex = hsl2Hex(colorHsl)
          newContrastRatio = colorContrastRatioCalculator(bgColorHex, newColorHex).toFixed(1)
        }
        if (newContrastRatio < RATIOS[name]) {
          colorHsl.l = colorHsl.l + 1
          newColorHex = hsl2Hex(colorHsl)
          newContrastRatio = colorContrastRatioCalculator(bgColorHex, newColorHex).toFixed(1)
        }
      } else {
        while (newContrastRatio < RATIOS[name] && colorHsl.l < 100) {
          colorHsl.l = colorHsl.l + 1
          newColorHex = hsl2Hex(colorHsl)
          newContrastRatio = colorContrastRatioCalculator(bgColorHex, newColorHex).toFixed(1)
        }
      }
    } else {
      if (currentContrastRatio > RATIOS[name]) {
        while (newContrastRatio > RATIOS[name] && colorHsl.l < 100) {
          colorHsl.l = colorHsl.l + 1
          newColorHex = hsl2Hex(colorHsl)
          newContrastRatio = colorContrastRatioCalculator(bgColorHex, newColorHex).toFixed(1)
        }
        if (newContrastRatio < RATIOS[name]) {
          colorHsl.l = colorHsl.l - 1
          newColorHex = hsl2Hex(colorHsl)
          newContrastRatio = colorContrastRatioCalculator(bgColorHex, newColorHex).toFixed(1)
        }
      } else {
        while (newContrastRatio < RATIOS[name] && colorHsl.l > 0) {
          colorHsl.l = colorHsl.l - 1
          newColorHex = hsl2Hex(colorHsl)
          newContrastRatio = colorContrastRatioCalculator(bgColorHex, newColorHex).toFixed(1)
        }
      }
    }
    info = `(${newContrastRatio}:1 on background)`
    return paletteColorBuilder(name, newColorHex, info)
  }
}

function paletteColorBuilder(name, color, info) {
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


function isValidHexColor(hex) {
  if (!hex) return false
  const regex = /[0-9A-Fa-f]{6}/g
  return Boolean(hex.match(regex))
}





