import { illuminate, darken } from '../src/utils/light'

const desiredContrastRatios = [4.5, 5.1, 9, 3, 3.5, 2.7, 6.7]

describe('Light related functions', () => {
  describe('darken function', () => {
    test('it returns a contrast ratio close to desired ratio but never less', () => {
      desiredContrastRatios.forEach(ratio => {
        //use light color
        const result = darken(ratio, '#aaaaaa')
        const validRatios = getValidRatio(ratio)
        expect(validRatios).toContain(result.ratio)
      })
    })
  })

  describe('illuminate function', () => {
    test('it returns a contrast ratio close to desired ratio but never less', () => {
      desiredContrastRatios.forEach(ratio => {
        //use dark color
        const result = illuminate(ratio, '#2b2b2b')
        const validRatios = getValidRatio(ratio)
        expect(validRatios).toContain(result.ratio)
      })
    })
  })
})

const getValidRatio = ratio => {
  if (typeof ratio !== "number") throw new TypeError('ratio should be a number')
  if (!ratio) throw new TypeError('Missing parameter: ratio')
  return [
    ratio,
    (Math.round((ratio + 0.1) * 10) / 10),
    (Math.round((ratio + 0.2) * 10) / 10)
  ]
}