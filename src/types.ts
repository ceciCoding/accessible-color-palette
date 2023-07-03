export type BgColor = 'white' | 'black'

export type Shade = '100' | '300' | '600' | '700' | '800' | '900'

export interface Validation {
  condition: boolean
  errorMessage: string
}

export interface LightArg {
  ratio: number
  hex: string
}

export type RatiosObj = Record<Shade, number>

export interface FinalPaletteRatios {
  [key: string]: number[];
}