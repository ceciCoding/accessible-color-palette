import { illuminate, darken } from '../src/utils/light'
import { getValidRatios } from '../src/utils/test-helpers'

const desiredContrastRatios = [4.5, 5.1, 9, 3, 3.5, 2.7, 6.7]

describe('Light related functions', () => {
  describe('darken function', () => {
    test('it returns a contrast ratio close to desired ratio but never less', () => {
      desiredContrastRatios.forEach(ratio => {
        //use light color
        const result = darken(ratio, '#aaaaaa')
        const validRatios = getValidRatios(ratio)
        expect(validRatios).toContain(result.ratio)
      })
    })
  })

  describe('illuminate function', () => {
    test('it returns a contrast ratio close to desired ratio but never less', () => {
      desiredContrastRatios.forEach(ratio => {
        //use dark color
        const result = illuminate(ratio, '#2b2b2b')
        const validRatios = getValidRatios(ratio)
        expect(validRatios).toContain(result.ratio)
      })
    })
  })
})

