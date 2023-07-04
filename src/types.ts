export type BgColor = 'white' | 'black'

export type Shade = '100' | '300' | '600' | '700' | '800' | '900'

export type adjustment = 1 | -1

type HSL = 'h' | 's' | 'l'

type RGB = 'r' | 'g' | 'b'

export interface Validation {
  condition: boolean
  errorMessage: string
}

export interface LightResult {
  ratio: number
  hex: string
}

export interface FinalPaletteRatios {
  [key: string]: number[]
}

export interface PaletteColor {
  name: string
  rgb: Record<RGB, number>
  hex: string
  hsl: Record<HSL, number>
  info: string
}

export type RatiosObj = Record<Shade, number>

export type HSLColor = Record<HSL, number>

export type RGBColor = Record<RGB, number>