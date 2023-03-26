

import { rgb2Hsl, hexToRgb } from 'colorsys'
import { colorContrastRatioCalculator } from '@mdhnpm/color-contrast-ratio-calculator'
import { darken, lighten } from './light'

const RATIO100 = 4.5
const RATIO300 = 1.46
const RATIO600 = 3.08
const RATIO700 = 5.12
const RATIO800 = 9
const RATIO900 = 14.1
let color100
let color300
let color600
let color700
let color800
let color900


export function generatePalette(color, contrastColor) {
  let palette = []
  const contrastColorHex = contrastColor === 'white' ? '#ffffff' : '#000000'
  const contrastRatio = colorContrastRatioCalculator(color, contrastColorHex)
  get700()
  get100()
  get300()
  get600()
  get800()
  get900()
  return [...palette].sort((a, b) => {
    return a.name - b.name
  })

  function adjustLight(color, ratio) {
    return contrastColor === "black"
      ? lighten(color, color, ratio)
      : darken(color, color, ratio)
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

  function get700() {
    let newColor
    const name = "700"
    const info = `(${RATIO700}:1 on background)`
    const contrastColorHex = contrastColor === 'white' ? '#ffffff' : '#000000'

    if (contrastRatio === RATIO700) {
      color700 = color
      palette.push(paletteColorBuilder(name, color700, info))
      return
    }

    if (contrastColor === "black") {
      contrastRatio > RATIO700
        ? (newColor = darken(color, contrastColorHex, RATIO700))
        : (newColor = lighten(color, contrastColorHex, RATIO700))
    } else {
      contrastRatio > RATIO700
        ? (newColor = lighten(color, contrastColorHex, RATIO700))
        : (newColor = darken(color, contrastColorHex, RATIO700))
    }
    color700 = newColor.hex
    palette.push(paletteColorBuilder(name, color700, info))
  }

  function get100() {
    let newColor
    const name = "100"
    contrastColor === "black"
      ? newColor = darken(color700, color700, RATIO100)
      : newColor = lighten(color700, color700, RATIO100)
    color100 = newColor.hex
    palette.push(paletteColorBuilder(name, color100, `(${newColor.ratio}:1 on 700)`))
  }

  function get300() {
    const name = "300"
    const newColor = adjustLight(color100, RATIO300, contrastColor)
    color300 = newColor.hex
    palette.push(paletteColorBuilder(name, color300, `(${newColor.ratio} on 100)`))
  }

  function get600() {
    const name = "600"
    const newColor = adjustLight(color100, RATIO600, contrastColor)
    color600 = newColor.hex
    palette.push(paletteColorBuilder(name, color600, `(${newColor.ratio}:1 on 100)`))
  }

  function get800() {
    const name = "800"
    const newColor = adjustLight(color100, RATIO800, contrastColor)
    color800 = newColor.hex
    palette.push(paletteColorBuilder(name, color800, `(${newColor.ratio}:1 on 100)`))
  }

  function get900() {
    const name = "900"
    const newColor = adjustLight(color100, RATIO900, contrastColor)
    color900 = newColor.hex
    palette.push(paletteColorBuilder(name, color900, `(${newColor.ratio}:1 on 100)`))
  }
}






