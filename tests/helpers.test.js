import {
  paletteColorBuilder,
  adjustColor,
  calculateColor
} from '../src/utils/helpers'

import { hexToRgb, rgb2Hsl } from 'colorsys'


const validPaletteBuilderArgs = [
  { name: '100', color: '#1A6646', info: 'some text' },
  { name: '200', color: '#AC9FE4', info: 'some text' },
  { name: '300', color: '#DD45AA', info: 'some text' },
  { name: '400', color: '#00BAF5', info: 'some text' },
  { name: '500', color: '#1C734E', info: 'some text' },
  { name: '600', color: '#8FFFA3', info: 'some text' },
  { name: '700', color: '#FF9161', info: 'some text' },
]

describe('Helper functions', () => {
  describe('paletteColorBuilder function', () => {
    test('it returns a complete object if given correct arguments', () => {
      validPaletteBuilderArgs.forEach(arg => {
        const rgb = hexToRgb(arg.color)
        const expectedObject = {
          name: arg.name,
          rgb: hexToRgb(arg.color),
          hex: arg.color,
          hsl: rgb2Hsl(rgb.r, rgb.g, rgb.b),
          info: arg.info
        }
        expect(paletteColorBuilder(arg.name, arg.color, arg.info)).toMatchObject(expectedObject)
      })
    })

    test('it throws an error when missing info param', () => {
      validPaletteBuilderArgs.forEach(arg => {
        expect(() => {
          paletteColorBuilder(arg.name, arg.color)
        }).toThrow('Missing info')
      })
    })

    test('it throws an error when missing color param', () => {
      validPaletteBuilderArgs.forEach(arg => {
        expect(() => {
          paletteColorBuilder(arg.name, null, arg.info)
        }).toThrow('Missing color')
      })
    })

    test('it throws an error when missing name param', () => {
      validPaletteBuilderArgs.forEach(arg => {
        expect(() => {
          paletteColorBuilder(null, arg.color, arg.info)
        }).toThrow('Missing name')
      })
    })

    test('it throws an error when given wrong type for name param', () => {
      const invalidArgs = [{}, 123, true]
      invalidArgs.forEach(param => {
        expect(() => {
          paletteColorBuilder(param, '#aaaaaa', 'info')
        }).toThrow('Wrong type. All Args for validatePaletteColorBuilderArgs should be strings')
      })
    })
  })
  describe('adjustColor function', () => {
    test('test', () => {
      //
    })
  })

  describe('calculateColor function', () => {
    test('test', () => {
      //
    })
  })
})