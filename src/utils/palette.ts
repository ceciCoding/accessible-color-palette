// DOCUMENTATION: https://shorturl.at/fgqRW
import {
  ShadesObj,
  BgColor,
  Palette,
  PaletteColor,
  LightResult,
  Adjustment,
  HSLColor,
  BgColorHex,
  Shade,
  CompletePalette
} from '../types'
import { colorContrastRatioCalculator } from '@mdhnpm/color-contrast-ratio-calculator'
import { darken, illuminate } from './light'
import { paletteColorBuilder, adjustColor, calculateColor } from './helpers'
import { validatePaletteArgs } from './validations'
import { getCompatibilities } from './compatibilities'
import { convert } from 'color-convert'

const RATIOS: any = {
  '100': 4.5,
  '300': 3.1,
  '600': 3.1,
  '700': 5.1,
  '800': 3.1,
  '900': 3.1,
}

const ORIGIN_COLORS: any = {
  '100': 700,
  '300': 700,
  '600': 100,
  '700': null,
  '800': 600,
  '900': 700
}

let cache: any = {}

const generatePalette = (colorHex: string, bgColor: BgColor): CompletePalette => {
  if (!validatePaletteArgs(colorHex, bgColor)) return null

  //check for short hex like #000 or #aaa. colorContrastRatioCalculator requires full hex
  if (colorHex.length === 4) {
    colorHex = colorHex[0] + colorHex[1].repeat(6)
  }

  const cacheKey: string = `${colorHex}-${bgColor}`
  if (cache[cacheKey]) return cache[cacheKey]

  let colors: any = {}
  const bgColorHex: BgColorHex = bgColor === 'white' ? '#ffffff' : '#000000'
  const currentContrastRatio: number = Number(
    colorContrastRatioCalculator(colorHex, bgColorHex)
      .toFixed(1)
  )

  colors[700] = get700(colorHex, bgColorHex, currentContrastRatio)

  //the order is important
  const paletteColors: any = ['100', '300', '600', '800', '900'].map((name: Shade) => {
    const localHex: any = colors[ORIGIN_COLORS[name]].hex
    return colors[name] = getPaletteColor(name, bgColorHex, localHex)
  })
  const compatibilities = getCompatibilities(bgColorHex, colors)
  const completePalette = Object.fromEntries(
    Object.entries(colors).map(([shade, color]) => [
      shade,
      {
        ...(color as PaletteColor),
        compatibilities: compatibilities[shade]
      }
    ])
  )
  cache[cacheKey] = completePalette
  return completePalette as CompletePalette
}

const get700 = (colorHex: string, bgColorHex: BgColorHex, currentContrastRatio: number): PaletteColor => {
  const name: string = "700"
  const targetRatio: number = RATIOS[name as Shade] ?? 0
  let info: string = `(${targetRatio}:1 on background)`
  const colorHsl: HSLColor = convert.hex.hsl(colorHex)

  if (currentContrastRatio === targetRatio) {
    return paletteColorBuilder(name, colorHex, info)
  }

  const adjustment: Adjustment = bgColorHex === "#000000" ?
    (currentContrastRatio > targetRatio ? -1 : 1) :
    (currentContrastRatio > targetRatio ? 1 : -1)

  let { hex, ratio }: LightResult = adjustColor(
    colorHsl,
    bgColorHex,
    currentContrastRatio,
    targetRatio,
    adjustment
  )

  info = `(${ratio}:1 on background)`
  return paletteColorBuilder(name, hex, info) as PaletteColor
}

const getPaletteColor = (name: Shade, bgColor: BgColorHex, originColor: string): PaletteColor => {
  const action: ((desiredContrastRatio: number, colorHex: string) => LightResult)[] =
    (name === '100' || name === '300')
      ? [illuminate, darken]
      : [darken, illuminate]
  const newColor: LightResult = calculateColor(action[0], action[1], RATIOS[name], originColor, bgColor)
  const info: string = `(${newColor.ratio}:1 on ${ORIGIN_COLORS[name]})`
  return paletteColorBuilder(name, newColor.hex, info) as PaletteColor
}


export { generatePalette, get700, getPaletteColor }





