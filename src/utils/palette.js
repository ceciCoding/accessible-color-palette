

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

let colors = {
  100: null,
  300: null,
  600: null,
  700: null,
  800: null,
  900: null,
}

export function generatePalette(color, contrastColor) {
  let palette = []
  const contrastColorHex = contrastColor === 'white' ? '#ffffff' : '#000000'
  const contrastRatio = colorContrastRatioCalculator(color, contrastColorHex)
  const colorFunctions = {
    '100': get100,
    '300': get300,
    '700': () => get700(color, contrastColor, contrastRatio),
  }
  const paletteColors = ['700', '100', '300', '600', '800', '900'].map((name) => {
    return colorFunctions[name] ? colorFunctions[name]() : getColor(name)
  })
  return palette.sort((a, b) => a.name - b.name)

  function adjustLight(color, ratio) {
    return contrastColor === "black"
      ? lighten(color, color, ratio)
      : darken(color, color, ratio)
  }

  function get700() {
    let newColor
    const name = "700"
    const info = `(${colors[name]}:1 on background)`
    const contrastColorHex = contrastColor === 'white' ? '#ffffff' : '#000000'

    if (contrastRatio === RATIOS[name]) {
      colors[name] = color
      palette.push(paletteColorBuilder(name, colors[name], info))
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
    colors[name] = newColor.hex
    palette.push(paletteColorBuilder(name, colors[name], info))
  }

  function get100() {
    let newColor
    const name = "100"
    contrastColor === "black"
      ? newColor = darken(colors['700'], colors['700'], RATIOS[name])
      : newColor = lighten(colors['700'], colors['700'], RATIOS[name])
    colors[name] = newColor.hex
    palette.push(paletteColorBuilder(name, colors[name], `(${newColor.ratio}:1 on 700)`))
  }

  function get300() {
    const name = "300"
    const newColor = adjustLight(colors['100'], RATIOS[name], contrastColor)
    colors[name] = newColor.hex
    palette.push(paletteColorBuilder(name, colors[name], `(${newColor.ratio} on 100)`))
  }

  function getColor(name) {
    const newColor = adjustLight(colors['100'], RATIOS[name], contrastColor)
    colors[name] = newColor.hex
    palette.push(paletteColorBuilder(name, colors[name], `(${newColor.ratio}:1 on 100)`))
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


