import { BgColorHex, Palette, CompletePalette } from './../types'
import { COLOR_NAMES } from './test-helpers'

export const getCompatibilities = (BgColorHex: BgColorHex, palette: Palette): any => {
  const isBlackBg = BgColorHex === '#000000'

  return {
    100: {
      largeText: [palette['600'].hex] as string[],
      smallText: [palette['700'].hex, palette['800'].hex, palette['900'].hex] as string[]
    },
    300: {
      largeText: [palette['700'].hex] as string[],
      smallText: [palette['800'].hex, palette['900'].hex] as string[]
    },
    600: {
      largeText: isBlackBg
        ? [BgColorHex, palette['100'].hex, palette['800'].hex]
        : [BgColorHex, palette['100'].hex, palette['800'].hex, palette['900'].hex] as string[],
      smallText: isBlackBg ? [palette['900'].hex] : [] as string[]
    },
    700: {
      largeText: isBlackBg
        ? [palette['300'].hex, palette['900'].hex]
        : [palette['300'].hex] as string[],
      smallText: [palette['100'].hex, BgColorHex]
    },
    800: {
      largeText: [palette['600'].hex] as string[],
      smallText: [palette['300'].hex, palette['100'].hex, BgColorHex] as string[]
    },
    900: {
      largeText: isBlackBg ? [palette['700'].hex] : [palette['800'].hex] as string[],
      smallText: isBlackBg
        ? [BgColorHex, palette['100'].hex, palette['300'].hex, palette['600'].hex]
        : [BgColorHex, palette['100'].hex, palette['300'].hex] as string[]
    }
  }
}



