type Brand<T, B> = T & { readonly __brand: B }

export type HexColor = Brand<string, 'HexColor'>
export type Theme = 'white' | 'black'

export type ShadeKey = '100' | '300' | '600' | '700' | '800' | '900'

export type Direction = 'lighten' | 'darken'

export interface HSL {
  h: number  // 0–360
  s: number  // 0–1
  l: number  // 0–1
}

export interface RGB {
  r: number  // 0–1 normalized
  g: number
  b: number
}

// Public input shapes. Same scale as ShadeEntry.rgb / ShadeEntry.hsl, so a
// library output can be fed straight back in as input.
export interface RGBInput {
  r: number  // 0–255
  g: number
  b: number
}

export interface HSLInput {
  h: number  // 0–360
  s: number  // 0–100
  l: number  // 0–100
}

export type ColorInput = string | RGBInput | HSLInput

export interface ShadeEntry {
  hex: HexColor
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
}

export type Palette = Record<ShadeKey, ShadeEntry>

export type ContrastLevel = 'aa-normal' | 'aa-large (≥24px only)' | 'fail'

export interface CompatibilityEntry {
  ratio: number
  level: ContrastLevel
}

export type MatrixKey = ShadeKey | 'theme'

export type CompatibilityMatrix = Record<MatrixKey, Partial<Record<MatrixKey, CompatibilityEntry>>>

export type BackgroundKey = ShadeKey | 'theme'

export interface CompatiblePair {
  key: BackgroundKey
  hex: HexColor
  ratio: number
}

export interface ShadeUsage {
  hex: HexColor
  normalText: CompatiblePair[]
  largeText: CompatiblePair[]
}

export type PaletteUsage = Record<ShadeKey, ShadeUsage>

export interface PaletteResult {
  palette: Palette
  usage: PaletteUsage
  theme: Theme
  sourceColor: HexColor
}

export type CSSTokens = string
