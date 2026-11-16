import type {
  ApcaLevel,
  ApcaMatrix,
  ApcaMatrixEntry,
  ApcaPair,
  ApcaPaletteUsage,
  ApcaShadeUsage,
  BackgroundKey,
  HexColor,
  Palette,
  ShadeKey,
  Theme,
} from '../types.js'

const SHADE_KEYS: ShadeKey[] = ['100', '300', '600', '700', '800', '900']
const BACKGROUND_KEYS: BackgroundKey[] = ['theme', ...SHADE_KEYS]

const THEME_HEX = { white: '#ffffff', black: '#000000' } as const

type Bucket = Exclude<ApcaLevel, 'fail'>

const BUCKET_FIELD: Record<Bucket, keyof Omit<ApcaShadeUsage, 'hex'>> = {
  'preferred-text': 'preferredText',
  'body-text': 'bodyText',
  'content-text': 'contentText',
  'large-text': 'largeText',
  'non-text': 'nonText',
}

const emptyUsage = (hex: HexColor): ApcaShadeUsage => ({
  hex,
  preferredText: [],
  bodyText: [],
  contentText: [],
  largeText: [],
  nonText: [],
})

// usage[shade] = that shade AS TEXT, on each background it can sit on.
// Directional by construction: it reads matrix[text][background] only.
export function buildApcaUsage(
  palette: Palette,
  matrix: ApcaMatrix,
  theme: Theme
): ApcaPaletteUsage {
  const hexFor = (key: BackgroundKey): HexColor =>
    key === 'theme' ? (THEME_HEX[theme] as HexColor) : palette[key].hex

  const usage = {} as ApcaPaletteUsage

  for (const text of SHADE_KEYS) {
    usage[text] = BACKGROUND_KEYS.filter((bg) => bg !== text).reduce<ApcaShadeUsage>(
      (acc, bg) => {
        const entry: ApcaMatrixEntry = matrix[text][bg]!
        if (entry.level === 'fail') return acc

        const pair: ApcaPair = { key: bg, hex: hexFor(bg), lc: entry.lc }
        const field = BUCKET_FIELD[entry.level]
        return { ...acc, [field]: [...acc[field], pair] }
      },
      emptyUsage(palette[text].hex)
    )
  }

  return usage
}
