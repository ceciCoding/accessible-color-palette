import {
  validateParams,
  isValidHexColor,
  isBgColorValid,
  getErrorMessage
} from '../src/utils/validations'

describe('Validation tests', () => {
  describe('validateParams function', () => {
    test('it returns true with correct parameters and white', () => {
      const colors = ['#fcba03', '#388a65', '#6d8ccf', '#257a1f', '#2d7fbd']
      colors.forEach(color => {
        expect(validateParams(color, 'white')).toBe(true)
      })
    })

    test('it returns true with correct parameters and black', () => {
      const colors = ['#bd2d2d', '#ed58a7', '#58edbb', '#204f3f']
      colors.forEach(color => {
        expect(validateParams(color, 'black')).toBe(true)
      })
    })

    test('it returns false with incorrect color hex', () => {
      const incorrectParams = ['notAColor', '#56hppa', '#909', 'test', '#fff1az']
      incorrectParams.forEach(param => {
        expect(validateParams(param, 'white')).toBe(false)
      })
    })

    test('it returns false with incorrect bg color', () => {
      const incorrectParams = ['notAValidValue', 'thing', '#000000', 'wite']
      incorrectParams.forEach(param => {
        expect(validateParams('#fcba03', param)).toBe(false)
      })
    })
  })

  describe('isValidHexColor function', () => {
    test('it returns true when passed valid hex color', () => {
      const validColors = ['#fcba03', '#388a65', '#6d8ccf', '#257a1f', '#2d7fbd', '#000', '#aaa']
      validColors.forEach(color => {
        expect(isValidHexColor(color)).toBe(true)
      })
    })

    test('it returns false when passed invalid hex color', () => {
      const invalidColors = ['notAColor', '#56hppa', '#909', '#fff1az', '#11112o', '#123457678', null]
      invalidColors.forEach(color => {
        expect(isValidHexColor(color)).toBe(false)
      })
    })
  })

  describe('isBgColorValid function', () => {
    test('it returns true for correct bg color', () => {
      const validBgColors = ['black', 'white']
      validBgColors.forEach(color => {
        expect(isBgColorValid(color)).toBe(true)
      })
    })


    test('it returns true for incorrect bg color', () => {
      const validBgColors = ['blue', 'green', '#000000', '#ffffff']
      validBgColors.forEach(color => {
        expect(isBgColorValid(color)).toBe(false)
      })
    })
  })

  describe('getErrorMessage function', () => {
    test('it returns correct error with no color hex passed', () => {
      expect(getErrorMessage(undefined, 'white')).toBe('Missing base color')
    })

    test('it returns correct error with no bg color passed', () => {
      expect(getErrorMessage('#aaaaaa')).toBe('Missing contrast color')
    })

    test('it returns correct error with invalid color hex passed', () => {
      const invalidHex = ['thing', '#8999', '#123457678', '#122', '#56hppa']
      invalidHex.forEach(hex => {
        expect(getErrorMessage(hex, 'white')).toBe('Invalid base color. Use a valid hex color')
      })
    })

    test('it returns correct error with invalid bg color passed', () => {
      const invalidBgColors = ['blue', 'green', '#000000', '#ffffff']
      invalidBgColors.forEach(color => {
        expect(getErrorMessage('#aaaaaa', color)).toBe('Invalid contrast color. Use "white" or "black"')
      })
    })
  })
})