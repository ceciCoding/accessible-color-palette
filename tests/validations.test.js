import {
  validatePaletteArgs,
  isValidHexColor,
  isBgColorValid,
  getErrorMessage,
  validatePaletteColorBuilderArgs,
  validateLightArgs
} from '../src/utils/validations'

const validHexColors = ['#fcba03', '#388a65', '#6d8ccf', '#257a1f', '#2d7fbd', '#000', '#aaa']
const validBgColors = ['black', 'white']
const invalidHexColors = ['notAColor', '#56hppa', '#909', 'test', '#fff1az', '>_%&']
const invalidBgColors = ['notAValidValue', 'thing', '#000000', 'wite', '>_%&']
const validLightArgs = [
  {
    ratio: 1.5,
    hex: '#aaaaaa'
  },
  {
    ratio: 2.9,
    hex: '#afafaf'
  },
  {
    ratio: 3.4,
    hex: '#12afaf'
  },
  {
    ratio: 4.5,
    hex: '#aa3ec2'
  }
]

const invalidLightArgs = [
  {
    ratio: null,
    hex: '#abc'
  },
  {
    ratio: '3.4',
    hex: 'thing'
  },
  {
    ratio: undefined,
    hex: '#'
  },
  {
    ratio: true,
    hex: 120
  }
]

describe('Validation tests', () => {
  describe('validatePaletteArgs function', () => {
    test('it returns true with correct arguments and white', () => {
      validHexColors.forEach(color => {
        expect(validatePaletteArgs(color, 'white')).toBe(true)
      })
    })

    test('it returns true with correct arguments and black', () => {
      validHexColors.forEach(color => {
        expect(validatePaletteArgs(color, 'black')).toBe(true)
      })
    })

    test('it returns false with incorrect color hex', () => {
      invalidHexColors.forEach(param => {
        expect(validatePaletteArgs(param, 'white')).toBe(false)
      })
    })

    test('it returns false with incorrect bg color', () => {
      invalidBgColors.forEach(param => {
        expect(validatePaletteArgs('#fcba03', param)).toBe(false)
      })
    })

    test('it logs an error to the console if invalid color hex', () => {
      const logSpy = jest.spyOn(global.console, 'error')
      invalidHexColors.forEach(color => {
        validatePaletteArgs(color, 'white')
        expect(logSpy).toHaveBeenCalledWith('Accessible color palette: Invalid base color. Use a valid hex color')
      })
    })

    test('it logs an error to the console if invalid bg color', () => {
      const logSpy = jest.spyOn(global.console, 'error')
      invalidBgColors.forEach(color => {
        validatePaletteArgs(color, 'white')
        expect(logSpy).toHaveBeenCalledWith('Accessible color palette: Invalid base color. Use a valid hex color')
      })
    })
  })

  describe('isValidHexColor function', () => {
    test('it returns true when passed valid hex color', () => {
      validHexColors.forEach(color => {
        expect(isValidHexColor(color)).toBe(true)
      })
    })

    test('it returns false when passed invalid hex color', () => {
      invalidHexColors.forEach(color => {
        expect(isValidHexColor(color)).toBe(false)
      })
    })
  })

  describe('isBgColorValid function', () => {
    test('it returns true for correct bg color', () => {
      validBgColors.forEach(color => {
        expect(isBgColorValid(color)).toBe(true)
      })
    })


    test('it returns false for incorrect bg color', () => {
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
      invalidHexColors.forEach(hex => {
        expect(getErrorMessage(hex, 'white')).toBe('Invalid base color. Use a valid hex color')
      })
    })

    test('it returns correct error with invalid bg color passed', () => {
      invalidBgColors.forEach(color => {
        expect(getErrorMessage('#aaaaaa', color)).toBe('Invalid contrast color. Use "white" or "black"')
      })
    })
  })

  describe('validatePaletteColorBuilderArgs function', () => {
    test('it returns true with valid arguments', () => {
      expect(validatePaletteColorBuilderArgs('name', '#aaaaaa', 'info')).toBe(true)
    })

    test('it returns false with no arguments', () => {
      expect(validatePaletteColorBuilderArgs()).toBe(false)
    })

    test('it returns false with no name or wrong type', () => {
      const invalidArgs = [undefined, null, 123, '']
      invalidArgs.forEach(param => {
        expect(validatePaletteColorBuilderArgs(param, '#aaaaaa', 'info')).toBe(false)
      })
    })

    test('it returns false with no color or wrong type', () => {
      const invalidArgs = [undefined, null, 123, '']
      invalidArgs.forEach(param => {
        expect(validatePaletteColorBuilderArgs('name', param, 'info')).toBe(false)
      })
    })

    test('it returns false with no info or wrong type', () => {
      const invalidArgs = [undefined, null, 123, '']
      invalidArgs.forEach(param => {
        expect(validatePaletteColorBuilderArgs('700', '#aaaaaa', param)).toBe(false)
      })
    })

    test('it logs an error to the console if no name', () => {
      const logSpy = jest.spyOn(global.console, 'error')
      validatePaletteColorBuilderArgs('', '#aaaaaa', 'info')
      expect(logSpy).toHaveBeenCalledWith('Missing name')
    })

    test('it logs an error to the console if no color', () => {
      const logSpy = jest.spyOn(global.console, 'error')
      validatePaletteColorBuilderArgs('700', '', 'info')
      expect(logSpy).toHaveBeenCalledWith('Missing color')
    })

    test('it logs an error to the console if no info', () => {
      const logSpy = jest.spyOn(global.console, 'error')
      validatePaletteColorBuilderArgs('700', '#aaaaaa', '')
      expect(logSpy).toHaveBeenCalledWith('Missing info')
    })
  })

  describe('validateLightArgs function', () => {
    test('returns true when all args are valid', () => {
      validLightArgs.forEach(args => {
        expect(validateLightArgs(args.ratio, args.hex)).toBe(true)
      })
    })

    test('it returns false when args are invalid', () => {
      invalidLightArgs.forEach(args => {
        expect(validateLightArgs(args.ratio, args.hex)).toBe(false)
      })
    })

    test('it logs an error to the console when missing both arguments', () => {
      const logSpy = jest.spyOn(global.console, 'error')
      validateLightArgs()
      expect(logSpy).toHaveBeenCalledWith('Missing arguments. Pass desired contrast ratio and color hex')
    })

    test('it logs an error to the console when missing one argument', () => {
      const logSpy = jest.spyOn(global.console, 'error')
      validateLightArgs(1.6)
      expect(logSpy).toHaveBeenCalledWith('Missing arguments. Pass desired contrast ratio and color hex')
    })
  })
})