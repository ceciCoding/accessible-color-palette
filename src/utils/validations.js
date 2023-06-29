const validatePaletteArgs = (colorHex, bgColor) => {
  const errorMessage = getErrorMessage(colorHex, bgColor)

  if (errorMessage) {
    console.error(`Accessible color palette: ${errorMessage}`)
    return false
  }

  return true
}

const isValidHexColor = hex => {
  if (!hex) return false
  const regex = /^#[0-9A-Fa-f]{6}$/g
  //for valid hex colors like #000, #fff, #aaa, etc
  const simplifiedRegex = /^#([0-9A-Fa-f])\1\1$/gi
  return Boolean(hex.match(regex) || hex.match(simplifiedRegex))
}


const isBgColorValid = bgColor => {
  return bgColor === 'white' || bgColor === 'black'
}

const getErrorMessage = (colorHex, bgColor) => {
  const checks = {
    'Missing base color': colorHex,
    'Missing contrast color': bgColor,
    'Invalid base color. Use a valid hex color': isValidHexColor(colorHex),
    'Invalid contrast color. Use "white" or "black"': isBgColorValid(bgColor),
  }

  for (const message in checks) {
    if (!checks[message]) {
      return message
    }
  }

  return null
}

const validatePaletteColorBuilderArgs = (name, color, info) => {
  const parameters = { name, color, info }
  const messages = {
    name: 'Missing name',
    color: 'Missing color',
    info: 'Missing info',
  }

  for (const key in parameters) {
    if (typeof parameters[key] !== "string") {
      console.error('Wrong type. All Args for validatePaletteColorBuilderArgs should be strings')
      return false
    }

    if (!parameters[key]) {
      console.error(messages[key])
      return false
    }
  }

  return true
}


export { validatePaletteArgs, isBgColorValid, isValidHexColor, getErrorMessage, validatePaletteColorBuilderArgs }

