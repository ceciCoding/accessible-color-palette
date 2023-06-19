import { rgb2Hsl, hexToRgb } from 'colorsys'
import { colorContrastRatioCalculator } from '@mdhnpm/color-contrast-ratio-calculator'
import { darken, lighten } from './light'

const RATIOS = {
  100: 4.5,
  300: 1.46,
  600: 3.08,
  700: 5.12,
  800: 9,
  900: 14.1,
}

let cache = {}

export const generatePalette = (color, contrastColor) => {
  let colors = {
    100: null,
    300: null,
    600: null,
    700: null,
    800: null,
    900: null,
  }

  const contrastColorHex = contrastColor === 'white' ? '#ffffff' : '#000000'

  const getColor = (name, contrastColor) => {
    const newColor = adjustLight(colors['100'].hex, RATIOS[name], contrastColor)
    colors[name] = paletteColorBuilder(name, newColor.hex, `(${newColor.ratio}:1 on 100)`)
  }

  const get100 = contrastColor => {
    let newColor
    const name = "100"
    contrastColor === "black"
      ? newColor = darken(colors['700'].hex, colors['700'].hex, RATIOS[name])
      : newColor = lighten(colors['700'].hex, colors['700'].hex, RATIOS[name])

    return colors[name] = paletteColorBuilder(name, newColor.hex, `(${newColor.ratio}:1 on 700)`)
  }

  const get700 = (color, contrastColor, contrastRatio) => {
    let newColor
    const name = "700"

    if (contrastRatio === RATIOS[name]) {
      colors[name] = paletteColorBuilder(name, color, `(${RATIOS[name]}:1 on background)`)
      return
    }

    if (contrastColor === "black") {
      contrastRatio > RATIOS[name]
        ? (newColor = darken(color, contrastColorHex, RATIOS[name]))
        : (newColor = lighten(color, contrastColorHex, RATIOS[name]))
    } else {
      contrastRatio > RATIOS[name]
        ? (newColor = lighten(color, contrastColorHex, RATIOS[name]))
        : (newColor = darken(color, contrastColorHex, RATIOS[name]))
    }
    return colors[name] = paletteColorBuilder(name, newColor.hex, `(${newColor.ratio}:1 on background)`)
  }

  if (!validateParams(color, contrastColor)) return null
  const cacheKey = `${color}-${contrastColor}`
  if (cache[cacheKey]) return cache[cacheKey]

  const contrastRatio = colorContrastRatioCalculator(color, contrastColorHex)
  const colorFunctions = {
    '100': () => get100(contrastColor),
    '700': () => get700(color, contrastColor, contrastRatio),
  }

  const paletteColors = ['700', '100', '300', '600', '800', '900'].map((name) => {
    return colorFunctions[name] ? colorFunctions[name]() : getColor(name, contrastColor)
  })

  cache[cacheKey] = colors
  return colors
}


const isValidHexColor = hex => {
  if (!hex) return false
  const regex = /[0-9A-Fa-f]{6}/g
  return Boolean(hex.match(regex))
}


const adjustLight = (color, ratio, contrastColor) => {
  return contrastColor === "black"
    ? lighten(color, color, ratio)
    : darken(color, color, ratio)
}

const validateParams = (color, contrastColor) => {
  let errorMessage = ''
  if (!color) {
    errorMessage = 'Missing base color'
  } else if (!contrastColor) {
    errorMessage = 'Missing contrast color'
  } else if (!isValidHexColor(color)) {
    errorMessage = 'Invalid base color. Use a valid hex color'
  } else if (contrastColor !== 'white' && contrastColor !== 'black') {
    errorMessage = 'Invalid contrast color. Use "white" or "black"'
  }

  if (errorMessage) {
    console.error('Accessible color palette:', errorMessage)
    return false
  }

  return true
}

const paletteColorBuilder = (name, color, info) => {
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



