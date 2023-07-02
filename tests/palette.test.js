import { generatePalette, get700, getPaletteColor } from '../src/utils/palette'
import {
  getRandomBgColor,
  getValidRatios,
  VALID_HEX_COLORS,
  FINAL_PALETTE_VALID_RATIOS,
  COLOR_NAMES
} from '../src/utils/test-helpers'

describe('palette functions', () => {
  describe('getPalette function', () => {
    test('it returns an object with correct contrast ratios for each color of the palette', () => {
      VALID_HEX_COLORS.forEach(color => {
        const result = generatePalette(color, getRandomBgColor())
        COLOR_NAMES.forEach(name => {
          const containsCorrectRatio = FINAL_PALETTE_VALID_RATIOS[name].some(ratio => result[name].info.includes(ratio.toString()))
          expect(containsCorrectRatio).toBe(true)
        })
      })
    })
  })
})