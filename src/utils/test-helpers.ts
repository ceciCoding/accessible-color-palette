import { BgColor, LightResult, ShadesObj, Shade } from "../types"

const VALID_HEX_COLORS: string[] = [
  '#1A6646',
  '#AC9FE4',
  '#DD45AA',
  '#00BAF5',
  '#1C734E',
  '#8FFFA3',
  '#FF9161',
  '#1145F8',
  '#2d7fbd',
  '#000',
  '#aaa'
]

const VALID_BG_COLORS: BgColor[] = ['black', 'white']

const INVALID_HEX_COLORS: string[] = [
  'notAColor',
  '#56hppa',
  '#909',
  'test',
  '#fff1az',
  '>_%&'
]

const INVALID_BG_COLORS: string[] = [
  'notAValidValue',
  'thing',
  '#000000',
  'wite',
  '>_%&'
]

const VALID_LIGHT_ARGS: LightResult[] = [
  { ratio: 1.5, hex: '#aaaaaa' },
  { ratio: 2.9, hex: '#afafaf' },
  { ratio: 3.4, hex: '#12afaf' },
  { ratio: 4.5, hex: '#aa3ec2' }
]

const INVALID_LIGHT_ARGS: any = [
  { ratio: null, hex: '#abc' },
  { ratio: '3.4', hex: 'thing' },
  { ratio: undefined, hex: '#' },
  { ratio: true, hex: 120 }
]

const COLOR_NAMES: string[] = ['100', '300', '600', '700', '800', '900']

const ratios: ShadesObj = {
  '100': 4.5,
  '300': 3.1,
  '600': 3.1,
  '700': 5.1,
  '800': 3.1,
  '900': 3.1
}

/*the palette doesn't need to have the exact ratios as the target ones, but they have to be close and never be less*/
const FINAL_PALETTE_VALID_RATIOS: any =
  COLOR_NAMES.reduce((acc: any, colorName: Shade) => {
    acc[colorName] = getValidRatios(ratios[colorName])
    return acc
  }, {})


function getRandomBgColor(): BgColor {
  return Math.random() < 0.5 ? 'white' : 'black'
}

function getValidRatios(ratio: number): number[] {
  if (typeof ratio !== "number") throw new TypeError('ratio should be a number')
  if (!ratio) throw new TypeError('Missing parameter: ratio')
  return [
    ratio,
    (Math.round((ratio + 0.1) * 10) / 10),
    (Math.round((ratio + 0.2) * 10) / 10)
  ]
}

export {
  getRandomBgColor,
  getValidRatios,
  VALID_HEX_COLORS,
  VALID_BG_COLORS,
  VALID_LIGHT_ARGS,
  INVALID_BG_COLORS,
  INVALID_HEX_COLORS,
  INVALID_LIGHT_ARGS,
  COLOR_NAMES,
  FINAL_PALETTE_VALID_RATIOS
}