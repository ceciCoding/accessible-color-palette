import {
  validatePaletteArgs,
  isValidHexColor,
  isBgColorValid,
  getErrorMessage,
  validatePaletteColorBuilderArgs,
  validateLightArgs
} from '../src/utils/validations'
import {
  VALID_HEX_COLORS,
  VALID_BG_COLORS,
  VALID_LIGHT_ARGS,
  INVALID_BG_COLORS,
  INVALID_HEX_COLORS,
  INVALID_LIGHT_ARGS
} from '../src/utils/test-helpers'

describe('Validation tests', () => {
  describe('validatePaletteArgs function', () => {
    test('it returns true with correct arguments and white', () => {
      VALID_HEX_COLORS.forEach(color => {
        expect(validatePaletteArgs(color, 'white')).toBe(true)
      })
    })

    test('it returns true with correct arguments and black', () => {
      VALID_HEX_COLORS.forEach(color => {
        expect(validatePaletteArgs(color, 'black')).toBe(true)
      })
    })

    test('it returns false with incorrect color hex', () => {
      INVALID_HEX_COLORS.forEach(param => {
        expect(validatePaletteArgs(param, 'white')).toBe(false)
      })
    })

    test('it returns false with incorrect bg color', () => {
      INVALID_BG_COLORS.forEach(param => {
        expect(validatePaletteArgs('#fcba03', param)).toBe(false)
      })
    })

    test('it logs an error to the console if invalid color hex', () => {
      const logSpy = jest.spyOn(global.console, 'error')
      INVALID_HEX_COLORS.forEach(color => {
        validatePaletteArgs(color, 'white')
        expect(logSpy).toHaveBeenCalledWith('Accessible color palette: Invalid base color. Use a valid hex color')
      })
    })

    test('it logs an error to the console if invalid bg color', () => {
      const logSpy = jest.spyOn(global.console, 'error')
      INVALID_BG_COLORS.forEach(color => {
        validatePaletteArgs(color, 'white')
        expect(logSpy).toHaveBeenCalledWith('Accessible color palette: Invalid base color. Use a valid hex color')
      })
    })
  })

  describe('isValidHexColor function', () => {
    test('it returns true when passed valid hex color', () => {
      VALID_HEX_COLORS.forEach(color => {
        expect(isValidHexColor(color)).toBe(true)
      })
    })

    test('it returns false when passed invalid hex color', () => {
      INVALID_HEX_COLORS.forEach(color => {
        expect(isValidHexColor(color)).toBe(false)
      })
    })
  })

  describe('isBgColorValid function', () => {
    test('it returns true for correct bg color', () => {
      VALID_BG_COLORS.forEach(color => {
        expect(isBgColorValid(color)).toBe(true)
      })
    })


    test('it returns false for incorrect bg color', () => {
      const VALID_BG_COLORS = ['blue', 'green', '#000000', '#ffffff']
      VALID_BG_COLORS.forEach(color => {
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
      INVALID_HEX_COLORS.forEach(hex => {
        expect(getErrorMessage(hex, 'white')).toBe('Invalid base color. Use a valid hex color')
      })
    })

    test('it returns correct error with invalid bg color passed', () => {
      INVALID_BG_COLORS.forEach(color => {
        expect(getErrorMessage('#aaaaaa', color)).toBe('Invalid contrast color. Use "white" or "black"')
      })
    })
  })

  describe('validatePaletteColorBuilderArgs function', () => {
    test('it returns true with valid arguments', () => {
      expect(validatePaletteColorBuilderArgs('name', '#aaaaaa', 'info')).toBe(true)
    })

    test('it throws error with no arguments', () => {
      expect(() => {
        validatePaletteColorBuilderArgs()
      }).toThrow()
    })

    test('it throws an error with no name or wrong type', () => {
      const invalidArgs = [undefined, null, 123, '']
      invalidArgs.forEach(param => {
        expect(() => {
          validatePaletteColorBuilderArgs(param, '#aaaaaa', 'info')
        }).toThrow()
      })
    })

    test('it throws an error with no color or wrong type', () => {
      const invalidArgs = [undefined, null, 123, '']
      invalidArgs.forEach(param => {
        expect(() => {
          validatePaletteColorBuilderArgs('name', param, 'info')
        }).toThrow()
      })
    })

    test('it throws an error with no info or wrong type', () => {
      const invalidArgs = [undefined, null, 123, '']
      invalidArgs.forEach(param => {
        expect(() => {
          validatePaletteColorBuilderArgs('700', '#aaaaaa', param)
        }).toThrow()
      })
    })

    test('it throws an error if no name', () => {
      expect(() => {
        validatePaletteColorBuilderArgs('', '#aaaaaa', 'info')
      }).toThrow(new Error('Missing name'))
    })

    test('it throws an error if no color', () => {
      expect(() => {
        validatePaletteColorBuilderArgs('700', '', 'info')
      }).toThrow(new Error('Missing color'))
    })

    test('it throws an error if no info', () => {
      expect(() => {
        validatePaletteColorBuilderArgs('700', '#aaaaaa', '')
      }).toThrow(new Error('Missing info'))
    })
  })

  describe('validateLightArgs function', () => {
    test('returns true when all args are valid', () => {
      VALID_LIGHT_ARGS.forEach(arg => {
        expect(validateLightArgs(arg.ratio, arg.hex)).toBe(true)
      })
    })

    test('it throws an error when args are invalid', () => {
      INVALID_LIGHT_ARGS.forEach(args => {
        expect(() => {
          validateLightArgs(args.ratio, args.hex)
        }).toThrow()
      })
    })

    test('it throws an error when missing both arguments', () => {
      expect(() => {
        validateLightArgs()
      }).toThrow(new Error('Missing arguments. Pass desired contrast ratio and color hex'))
    })

    test('it throws an error when missing one argument', () => {
      expect(() => {
        validateLightArgs(1.6)
      }).toThrow(new Error('Missing arguments. Pass desired contrast ratio and color hex'))
    })
  })
})
