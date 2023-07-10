export type BgColor = 'white' | 'black'

export type BgColorHex = '#000000' | '#ffffff'

export type Shade = '100' | '300' | '600' | '700' | '800' | '900'

export type Adjustment = 1 | -1

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

export interface PaletteColor {
  name: string
  rgb: Record<RGB, number>
  hex: string
  hsl: Record<HSL, number>
  info: string
}

export interface CompletePaletteColor {
  name: string
  rgb: Record<RGB, number>
  hex: string
  hsl: Record<HSL, number>
  info: string
  compatibilities: string[]
}

export type Palette = Record<Shade, PaletteColor>

export type CompletePalette = Record<Shade, CompletePaletteColor>

export type ShadesObj = Record<Shade, number>

export type HSLColor = Record<HSL, number>

export type RGBColor = Record<RGB, number>
