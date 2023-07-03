import { BgColor, Validation } from "../types"

const validatePaletteArgs = (colorHex: string, bgColor: BgColor): boolean => {
  const errorMessage: boolean | string = getErrorMessage(colorHex, bgColor)

  if (errorMessage) {
    console.error(`Accessible color palette: ${errorMessage}`)
    return false
  }

  return true
}

const isValidHexColor = (hex: string): boolean => {
  if (typeof hex !== "string") return false
  if (!hex) return false
  const regex: RegExp = /^#[0-9A-Fa-f]{6}$/g
  //for valid hex colors like #000, #fff, #aaa, etc
  const simplifiedRegex: RegExp = /^#([0-9A-Fa-f])\1\1$/gi
  return Boolean(hex.match(regex) || hex.match(simplifiedRegex))
}


const isBgColorValid = (bgColor: BgColor): boolean => {
  return bgColor === 'white' || bgColor === 'black'
}

const getErrorMessage = (colorHex: string, bgColor: BgColor): boolean | string => {
  const validations: Validation[] = [
    {
      condition: !colorHex,
      errorMessage: 'Missing base color'
    },
    {
      condition: !bgColor,
      errorMessage: 'Missing contrast color'
    },
    {
      condition: !isValidHexColor(colorHex),
      errorMessage: 'Invalid base color. Use a valid hex color'
    },
    {
      condition: !isBgColorValid(bgColor),
      errorMessage: 'Invalid contrast color. Use "white" or "black"'
    }
  ]

  for (let validation of validations) {
    if (validation.condition) {
      return validation.message
    }
  }

  return true
}

const validatePaletteColorBuilderArgs = (name: string, color: string, info: string): boolean | Error => {
  const parameters: any = { name, color, info }
  const messages: any = {
    name: 'Missing name',
    color: 'Missing color',
    info: 'Missing info',
  }

  for (const key in parameters) {
    if (!parameters[key]) {
      throw new Error(messages[key])
    }
    if (typeof parameters[key] !== "string") {
      throw new Error('Wrong type. All Args for validatePaletteColorBuilderArgs should be strings')
    }
  }

  return true
}

const validateLightArgs = (desiredContrastRatio: number, colorHex: string): boolean | Error => {
  const validations: Validation[] = [
    {
      condition: !desiredContrastRatio || !colorHex,
      errorMessage: 'Missing arguments. Pass desired contrast ratio and color hex'
    },
    {
      condition: !isValidHexColor(colorHex),
      errorMessage: `Invalid color: ${colorHex}`
    },
    {
      condition: typeof desiredContrastRatio !== "number",
      errorMessage: 'Wrong type. Desired contrast ratio should be a number'
    },
  ]

  for (let validation of validations) {
    if (validation.condition) {
      throw new Error(validation.errorMessage)
    }
  }

  return true
}


export { validatePaletteArgs, isBgColorValid, isValidHexColor, getErrorMessage, validatePaletteColorBuilderArgs, validateLightArgs }

