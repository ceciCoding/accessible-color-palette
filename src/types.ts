export type BgColor = 'white' | 'black'

export type Shade = '100' | '300' | '600' | '700' | '800' | '900'

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
  [key: string]: number[];
}

export type RatiosObj = Record<Shade, number>

export type HSLColor = Record<HSL, number>