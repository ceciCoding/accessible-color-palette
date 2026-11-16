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

// ─── APCA (WCAG 3 draft) ─────────────────────────────────────────────────────

export type ContrastModel = 'wcag2' | 'apca'

// Role a text/background pair qualifies for, by |Lc|. Highest level only.
export type ApcaLevel =
  | 'preferred-text' // |Lc| >= 90
  | 'body-text'      // |Lc| >= 75
  | 'content-text'   // |Lc| >= 60
  | 'large-text'     // |Lc| >= 45
  | 'non-text'       // |Lc| >= 15
  | 'fail'           // below 15

// 'dark-on-light' = positive Lc, 'light-on-dark' = negative Lc
export type ApcaPolarity = 'dark-on-light' | 'light-on-dark' | 'none'

export interface ApcaMatrixEntry {
  lc: number // signed
  level: ApcaLevel
}

// matrix[text][background] — ordered, asymmetric
export type ApcaMatrix = Record<MatrixKey, Partial<Record<MatrixKey, ApcaMatrixEntry>>>

export interface ApcaPair {
  key: BackgroundKey
  hex: HexColor
  lc: number // signed
}

// usage[shade] describes that shade AS TEXT. Each background appears in its
// highest qualifying bucket only. Pairs below Lc 15 are omitted entirely.
export interface ApcaShadeUsage {
  hex: HexColor
  preferredText: ApcaPair[]
  bodyText: ApcaPair[]
  contentText: ApcaPair[]
  largeText: ApcaPair[]
  nonText: ApcaPair[]
}

export type ApcaPaletteUsage = Record<ShadeKey, ApcaShadeUsage>

export interface ApcaPaletteResult {
  model: 'apca'
  palette: Palette
  usage: ApcaPaletteUsage
  theme: Theme
  sourceColor: HexColor
}
