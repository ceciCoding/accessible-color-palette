import { apcaContrastHex } from '../../math/apca.js'
import { classifyLc } from './thresholds.js'
import type { ApcaMatrix, ApcaMatrixEntry, HexColor, MatrixKey, Palette, Theme } from '../../types.js'

const SHADE_KEYS: MatrixKey[] = ['100', '300', '600', '700', '800', '900']
const ALL_KEYS: MatrixKey[] = ['theme', ...SHADE_KEYS]

const WHITE = '#ffffff' as HexColor
const BLACK = '#000000' as HexColor

// matrix[text][background] — ORDERED. Unlike WCAG 2, matrix[a][b] and
// matrix[b][a] are genuinely different numbers (and signs). The diagonal is
// always undefined.
export function buildApcaMatrix(palette: Palette, theme: Theme): ApcaMatrix {
  const themeHex = theme === 'white' ? WHITE : BLACK

  const hexFor = (key: MatrixKey): HexColor =>
    key === 'theme' ? themeHex : palette[key].hex

  const matrix = Object.fromEntries(
    ALL_KEYS.map((key) => [key, {}])
  ) as ApcaMatrix

  for (const text of ALL_KEYS) {
    for (const background of ALL_KEYS) {
      if (text === background) continue

      const lc = apcaContrastHex(hexFor(text), hexFor(background))
      const entry: ApcaMatrixEntry = { lc, level: classifyLc(lc) }
      matrix[text][background] = entry
    }
  }

  return matrix
}
