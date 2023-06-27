export const validateParams = (colorHex, bgColor) => {
  const errorMessage = getErrorMessage(colorHex, bgColor)

  if (errorMessage) {
    console.error('Accessible color palette:', errorMessage)
    return false
  }

  return true
}

const isValidHexColor = hex => {
  if (!hex) return false
  const regex = /[0-9A-Fa-f]{6}/g
  return Boolean(hex.match(regex))
}

const isBgColorValid = bgColor => {
  return bgColor === 'white' || bgColor === 'black'
}

const getErrorMessage = (colorHex, bgColor) => {
  if (!colorHex) {
    return 'Missing base color'
  }

  if (!bgColor) {
    return 'Missing contrast color'
  }

  if (!isValidHexColor(colorHex)) {
    return 'Invalid base color. Use a valid hex color'
  }

  if (!isBgColorValid(bgColor)) {
    return 'Invalid contrast color. Use "white" or "black"'
  }

  return ''
}

