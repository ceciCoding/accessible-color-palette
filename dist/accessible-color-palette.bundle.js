/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["AccessibleColorPalette"] = factory();
	else
		root["AccessibleColorPalette"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@mdhnpm/color-contrast-ratio-calculator/dist/colorContrastRatioCalculator.js":
/*!***************************************************************************************************!*\
  !*** ./node_modules/@mdhnpm/color-contrast-ratio-calculator/dist/colorContrastRatioCalculator.js ***!
  \***************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.colorContrastRatioCalculator = void 0;\nconst rgb_hex_converter_1 = __webpack_require__(/*! @mdhnpm/rgb-hex-converter */ \"./node_modules/@mdhnpm/rgb-hex-converter/dist/index.js\");\nconst colorContrastRatioCalculator = (foregroundColor, backgroundColor) => {\n    const l1 = calculateRelativeLuminance(foregroundColor);\n    const l2 = calculateRelativeLuminance(backgroundColor);\n    if (l2 < l1) {\n        const ratio = (l1 + 0.05) / (l2 + 0.05);\n        return Math.round((ratio * 100)) / 100;\n    }\n    else {\n        const ratio = (l2 + 0.05) / (l1 + 0.05);\n        return Math.round((ratio * 100)) / 100;\n    }\n};\nexports.colorContrastRatioCalculator = colorContrastRatioCalculator;\nconst calculateRelativeLuminanceComponent1 = (rgbValue) => {\n    const relativeRgb = rgbValue / 255;\n    if (relativeRgb <= 0.03928) {\n        return relativeRgb / 12.92;\n    }\n    return Math.pow(((relativeRgb + 0.055) / 1.055), 2.4);\n};\nconst calculateRelativeLuminanceComponent2 = (input) => {\n    return 0.2126 * calculateRelativeLuminanceComponent1(input[0])\n        + 0.7152 * calculateRelativeLuminanceComponent1(input[1])\n        + 0.0722 * calculateRelativeLuminanceComponent1(input[2]);\n};\nconst calculateRelativeLuminance = (input) => {\n    if (Array.isArray(input) && input.length === 3) {\n        return calculateRelativeLuminanceComponent2(input);\n    }\n    else if (typeof input === 'string') {\n        const rgb = rgb_hex_converter_1.convertHexToRgb(input);\n        return calculateRelativeLuminanceComponent2(rgb);\n    }\n    else {\n        throw new Error('Input must be array of number or string');\n    }\n};\n//# sourceMappingURL=colorContrastRatioCalculator.js.map\n\n//# sourceURL=webpack://AccessibleColorPalette/./node_modules/@mdhnpm/color-contrast-ratio-calculator/dist/colorContrastRatioCalculator.js?");

/***/ }),

/***/ "./node_modules/@mdhnpm/color-contrast-ratio-calculator/dist/index.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@mdhnpm/color-contrast-ratio-calculator/dist/index.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.colorContrastRatioCalculator = void 0;\nconst colorContrastRatioCalculator_1 = __webpack_require__(/*! ./colorContrastRatioCalculator */ \"./node_modules/@mdhnpm/color-contrast-ratio-calculator/dist/colorContrastRatioCalculator.js\");\nObject.defineProperty(exports, \"colorContrastRatioCalculator\", ({ enumerable: true, get: function () { return colorContrastRatioCalculator_1.colorContrastRatioCalculator; } }));\n//# sourceMappingURL=index.js.map\n\n//# sourceURL=webpack://AccessibleColorPalette/./node_modules/@mdhnpm/color-contrast-ratio-calculator/dist/index.js?");

/***/ }),

/***/ "./node_modules/@mdhnpm/rgb-hex-converter/dist/convertHexToRgb.js":
/*!************************************************************************!*\
  !*** ./node_modules/@mdhnpm/rgb-hex-converter/dist/convertHexToRgb.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.convertHexToRgb = void 0;\nconst convertHexToRgb = (hex) => {\n    const sanitisedHex = hex.replace(\"#\", \"\").toLowerCase();\n    if (validateHexString(sanitisedHex)) {\n        const chars = [...sanitisedHex];\n        return [\n            parseInt(chars[0] + chars[1], 16),\n            parseInt(chars[2] + chars[3], 16),\n            parseInt(chars[4] + chars[5], 16),\n        ];\n    }\n    else {\n        throw new Error(\"Invalid HEX input\");\n    }\n};\nexports.convertHexToRgb = convertHexToRgb;\nconst validateHexString = (hex) => {\n    const regex = new RegExp(/[0-9a-f]{6}/);\n    if (hex.length === 6 || regex.test(hex)) {\n        return true;\n    }\n    return false;\n};\n//# sourceMappingURL=convertHexToRgb.js.map\n\n//# sourceURL=webpack://AccessibleColorPalette/./node_modules/@mdhnpm/rgb-hex-converter/dist/convertHexToRgb.js?");

/***/ }),

/***/ "./node_modules/@mdhnpm/rgb-hex-converter/dist/convertRgbToHex.js":
/*!************************************************************************!*\
  !*** ./node_modules/@mdhnpm/rgb-hex-converter/dist/convertRgbToHex.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.convertRgbToHex = void 0;\nconst convertRgbToHex = (red, green, blue) => {\n    if (isValidRgb(red, green, blue)) {\n        return returnHex(red) + returnHex(green) + returnHex(blue);\n    }\n    else {\n        throw new Error(\"Invalid RGB input\");\n    }\n};\nexports.convertRgbToHex = convertRgbToHex;\nconst isValidRgb = (red, green, blue) => {\n    if (!isValidNumber(red) || !isValidNumber(green) || !isValidNumber(blue)) {\n        return false;\n    }\n    return true;\n};\nconst isValidNumber = (value) => {\n    if (value > 255 || value < 0) {\n        return false;\n    }\n    return true;\n};\nconst returnHex = (value) => {\n    if (value < 10) {\n        return \"0\" + value.toString(16);\n    }\n    else {\n        return value.toString(16);\n    }\n};\n//# sourceMappingURL=convertRgbToHex.js.map\n\n//# sourceURL=webpack://AccessibleColorPalette/./node_modules/@mdhnpm/rgb-hex-converter/dist/convertRgbToHex.js?");

/***/ }),

/***/ "./node_modules/@mdhnpm/rgb-hex-converter/dist/index.js":
/*!**************************************************************!*\
  !*** ./node_modules/@mdhnpm/rgb-hex-converter/dist/index.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.convertRgbToHex = exports.convertHexToRgb = void 0;\nconst convertHexToRgb_1 = __webpack_require__(/*! ./convertHexToRgb */ \"./node_modules/@mdhnpm/rgb-hex-converter/dist/convertHexToRgb.js\");\nObject.defineProperty(exports, \"convertHexToRgb\", ({ enumerable: true, get: function () { return convertHexToRgb_1.convertHexToRgb; } }));\nconst convertRgbToHex_1 = __webpack_require__(/*! ./convertRgbToHex */ \"./node_modules/@mdhnpm/rgb-hex-converter/dist/convertRgbToHex.js\");\nObject.defineProperty(exports, \"convertRgbToHex\", ({ enumerable: true, get: function () { return convertRgbToHex_1.convertRgbToHex; } }));\n//# sourceMappingURL=index.js.map\n\n//# sourceURL=webpack://AccessibleColorPalette/./node_modules/@mdhnpm/rgb-hex-converter/dist/index.js?");

/***/ }),

/***/ "./node_modules/colorsys/colorsys.js":
/*!*******************************************!*\
  !*** ./node_modules/colorsys/colorsys.js ***!
  \*******************************************/
/***/ ((module) => {

eval("\nconst RGB_MAX = 255\nconst HUE_MAX = 360\nconst SV_MAX = 100\n\nvar colorsys = module.exports = {}\n\ncolorsys.rgb2Hsl = function (r, g, b) {\n  if (typeof r === 'object') {\n    const args = r\n    r = args.r; g = args.g; b = args.b;\n  }\n  // It converts [0,255] format, to [0,1]\n  r = (r === RGB_MAX) ? 1 : (r % RGB_MAX / parseFloat(RGB_MAX))\n  g = (g === RGB_MAX) ? 1 : (g % RGB_MAX / parseFloat(RGB_MAX))\n  b = (b === RGB_MAX) ? 1 : (b % RGB_MAX / parseFloat(RGB_MAX))\n\n  var max = Math.max(r, g, b)\n  var min = Math.min(r, g, b)\n  var h, s, l = (max + min) / 2\n\n  if (max === min) {\n    h = s = 0 // achromatic\n  } else {\n    var d = max - min\n    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)\n    switch (max) {\n      case r:\n        h = (g - b) / d + (g < b ? 6 : 0)\n        break\n      case g:\n        h = (b - r) / d + 2\n        break\n      case b:\n        h = (r - g) / d + 4\n        break\n    }\n    h /= 6\n  }\n\n  return {\n    h: Math.round(h * HUE_MAX),\n    s: Math.round(s * SV_MAX),\n    l: Math.round(l * SV_MAX)\n  }\n}\n\ncolorsys.rgb_to_hsl = colorsys.rgbToHsl = colorsys.rgb2Hsl\n\ncolorsys.rgb2Hsv = function (r, g, b) {\n  if (typeof r === 'object') {\n    const args = r\n    r = args.r; g = args.g; b = args.b;\n  }\n\n  // It converts [0,255] format, to [0,1]\n  r = (r === RGB_MAX) ? 1 : (r % RGB_MAX / parseFloat(RGB_MAX))\n  g = (g === RGB_MAX) ? 1 : (g % RGB_MAX / parseFloat(RGB_MAX))\n  b = (b === RGB_MAX) ? 1 : (b % RGB_MAX / parseFloat(RGB_MAX))\n\n  var max = Math.max(r, g, b)\n  var min = Math.min(r, g, b)\n  var h, s, v = max\n\n  var d = max - min\n\n  s = max === 0 ? 0 : d / max\n\n  if (max === min) {\n    h = 0 // achromatic\n  } else {\n    switch (max) {\n      case r:\n        h = (g - b) / d + (g < b ? 6 : 0)\n        break\n      case g:\n        h = (b - r) / d + 2\n        break\n      case b:\n        h = (r - g) / d + 4\n        break\n    }\n    h /= 6\n  }\n\n  return {\n    h: Math.round(h * HUE_MAX),\n    s: Math.round(s * SV_MAX),\n    v: Math.round(v * SV_MAX)\n  }\n}\n\ncolorsys.rgb_to_hsv = colorsys.rgbToHsv = colorsys.rgb2Hsv\n\ncolorsys.hsl2Rgb = function (h, s, l) {\n  if (typeof h === 'object') {\n    const args = h\n    h = args.h; s = args.s; l = args.l;\n  }\n\n  var r, g, b\n\n  h = _normalizeAngle(h)\n  h = (h === HUE_MAX) ? 1 : (h % HUE_MAX / parseFloat(HUE_MAX))\n  s = (s === SV_MAX) ? 1 : (s % SV_MAX / parseFloat(SV_MAX))\n  l = (l === SV_MAX) ? 1 : (l % SV_MAX / parseFloat(SV_MAX))\n\n  if (s === 0) {\n    r = g = b = l // achromatic\n  } else {\n    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;\n    var p = 2 * l - q;\n    r = _hue2Rgb(p, q, h + 1 / 3)\n    g = _hue2Rgb(p, q, h)\n    b = _hue2Rgb(p, q, h - 1 / 3)\n  }\n\n  return {\n    r: Math.round(r * RGB_MAX),\n    g: Math.round(g * RGB_MAX),\n    b: Math.round(b * RGB_MAX),\n  }\n}\n\ncolorsys.hsl_to_rgb = colorsys.hslToRgb = colorsys.hsl2Rgb\n\ncolorsys.hsv2Rgb = function (h, s, v) {\n  if (typeof h === 'object') {\n    const args = h\n    h = args.h; s = args.s; v = args.v;\n  }\n\n  h = _normalizeAngle(h)\n  h = (h === HUE_MAX) ? 1 : (h % HUE_MAX / parseFloat(HUE_MAX) * 6)\n  s = (s === SV_MAX) ? 1 : (s % SV_MAX / parseFloat(SV_MAX))\n  v = (v === SV_MAX) ? 1 : (v % SV_MAX / parseFloat(SV_MAX))\n\n  var i = Math.floor(h)\n  var f = h - i\n  var p = v * (1 - s)\n  var q = v * (1 - f * s)\n  var t = v * (1 - (1 - f) * s)\n  var mod = i % 6\n  var r = [v, q, p, p, t, v][mod]\n  var g = [t, v, v, q, p, p][mod]\n  var b = [p, p, t, v, v, q][mod]\n\n  return {\n    r: Math.floor(r * RGB_MAX),\n    g: Math.floor(g * RGB_MAX),\n    b: Math.floor(b * RGB_MAX),\n  }\n}\n\ncolorsys.hsv_to_rgb = colorsys.hsv2Rgb\ncolorsys.hsvToRgb = colorsys.hsv2Rgb\n\ncolorsys.rgb2Hex = function (r, g, b) {\n  if (typeof r === 'object') {\n    const args = r\n    r = args.r; g = args.g; b = args.b;\n  }\n  r = Math.round(r).toString(16)\n  g = Math.round(g).toString(16)\n  b = Math.round(b).toString(16)\n\n  r = r.length === 1 ? '0' + r : r\n  g = g.length === 1 ? '0' + g : g\n  b = b.length === 1 ? '0' + b : b\n\n  return '#' + r + g + b\n}\n\ncolorsys.rgb_to_hex = colorsys.rgbToHex = colorsys.rgb2Hex\n\ncolorsys.hex2Rgb = function (hex) {\n  var result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex)\n  return result ? {\n    r: parseInt(result[1], 16),\n    g: parseInt(result[2], 16),\n    b: parseInt(result[3], 16)\n  } : null\n}\n\ncolorsys.hex_to_rgb = colorsys.hexToRgb = colorsys.hex2Rgb\n\ncolorsys.hsv2Hex = function (h, s, v) {\n  var rgb = colorsys.hsv2Rgb(h, s, v)\n  return colorsys.rgb2Hex(rgb.r, rgb.g, rgb.b)\n}\n\ncolorsys.hsv_to_hex = colorsys.hsv2Hex\ncolorsys.hsvToHex = colorsys.hsv2Hex\n\ncolorsys.hex2Hsv = function (hex) {\n  var rgb = colorsys.hex2Rgb(hex)\n  return colorsys.rgb2Hsv(rgb.r, rgb.g, rgb.b)\n}\n\ncolorsys.hex_to_hsv = colorsys.hexToHsv = colorsys.hex2Hsv\n\ncolorsys.hsl2Hex = function (h, s, l) {\n  var rgb = colorsys.hsl2Rgb(h, s, l)\n  return colorsys.rgb2Hex(rgb.r, rgb.g, rgb.b)\n}\n\ncolorsys.hsl_to_hex = colorsys.hslToHex = colorsys.hsl2Hex\n\ncolorsys.hex2Hsl = function (hex) {\n  var rgb = colorsys.hex2Rgb(hex)\n  return colorsys.rgb2Hsl(rgb.r, rgb.g, rgb.b)\n}\n\ncolorsys.hex_to_hsl = colorsys.hexToHsl = colorsys.hex2Hsl\n\ncolorsys.rgb2Cmyk = function (r, g, b) {\n  if (typeof r === 'object') {\n    const args = r\n    r = args.r; g = args.g; b = args.b;\n  }\n\n  var rprim = r / 255\n  var gprim = g / 255\n  var bprim = b / 255\n\n  var k = 1 - Math.max(rprim, gprim, bprim)\n\n  var c = (1 - rprim - k) / (1 - k)\n  var m = (1 - gprim - k) / (1 - k)\n  var y = (1 - bprim - k) / (1 - k)\n\n  return {\n    c: c.toFixed(3),\n    m: m.toFixed(3),\n    y: y.toFixed(3),\n    k: k.toFixed(3)\n  }\n}\n\ncolorsys.rgb_to_cmyk = colorsys.rgbToCmyk = colorsys.rgb2Cmyk\n\ncolorsys.cmyk2Rgb = function (c, m, y, k) {\n  if (typeof c === 'object') {\n    const args = c\n    c = args.c; m = args.m; y = args.y; k = args.k;\n  }\n\n  var r = 255 * (1 - c) * (1 - k)\n  var g = 255 * (1 - m) * (1 - k)\n  var b = 255 * (1 - y) * (1 - k)\n\n  return {\n    r: Math.floor(r),\n    g: Math.floor(g),\n    b: Math.floor(b)\n  }\n}\n\ncolorsys.cmyk_to_rgb = colorsys.cmykToRgb = colorsys.cmyk2Rgb\n\ncolorsys.hsv2Hsl = function (h, s, v) {\n  if (typeof h === 'object') {\n    const args = h\n    h = args.h; s = args.s; v = args.v;\n  }\n\n  var l = (2 - s) * v / 2\n\n  if (l !== 0) {\n    if (l === SV_MAX) {\n      s = 0\n    } else if (l < SV_MAX / 2) {\n      s = s * v / (l * 2)\n    } else {\n      s = s * v / (2 - l * 2)\n    }\n  }\n\n  return { h: h, s: s, l: l }\n}\n\ncolorsys.hsv_to_hsl = colorsys.hsvToHsl = colorsys.hsv2Hsl\n\ncolorsys.hsl2Hsv = function (h, s, l) {\n  if (typeof h === 'object') {\n    const args = h\n    h = args.h; s = args.s; l = args.l;\n  }\n\n  s = s * (l < 50 ? l : (100 - l))\n\n  return {\n    h: h,\n    s: Math.floor(2 * s / (l + s)),\n    v: Math.floor(l + s),\n  }\n}\n\ncolorsys.hsl_to_hsv = colorsys.hslToHsv = colorsys.hsl2Hsv\n\n/**\n* Parses values from a string into a javascript object\n* e.g: hsla(140, 30%, 40%, .5) => { h: 140, s: 30, l: 40, alpha: 0.5}\n*/\ncolorsys.parseCss = function (cssString) {\n  if (cssString.indexOf('#') > -1) {\n    return colorsys.hex2Rgb(cssString)\n  }\n\n  const prefix = cssString.split('(')[0]\n  const args = cssString.split('(')[1].split(')')[0].split(',')\n\n  // Use the prefix as an array [r, g, b, a] to parse the colours\n  return prefix.split('').reduce(function (color, param, idx) {\n    const nextColor = color\n    nextColor[param] = parseFloat(args[idx])\n    return nextColor\n  }, {})\n}\n\ncolorsys.parse_css = colorsys.parseCss\n\ncolorsys.stringify = function (obj) {\n  const prefix = Object.keys(obj).join('')\n  const values = Object.keys(obj).map(function (key) {\n    var val = obj[key]\n    if (key === 's' || key === 'v' || key === 'l') {\n      val = val + '%'\n    }\n    return val\n  })\n  return prefix + '(' + values.join(', ') + ')'\n}\n\n// Google Assistant API uses this format in SmartHome Apps. Example => \"spectrumRGB\": 16711680\ncolorsys.hex_to_decimal = colorsys.hexToDecimal = colorsys.hex2Decimal\n\ncolorsys.hex2Decimal = function(hexColor) {\n  if (typeof hexColor === \"string\") {\n    return parseInt(hexColor.replace(\"#\", \"\"), 16)\n  }\n}\ncolorsys.decimal_to_hex = colorsys.decimalToHex = colorsys.decimal2Hex\n\ncolorsys.decimal2Hex = function(decimalColor) {\n  if (typeof decimalColor === \"string\") {\n    return \"#\" + parseInt(decimalColor).toString(16)\n  }\n  return \"#\" + decimalColor.toString(16)\n}\n\n// Will return a random hex colour\ncolorsys.random = function () {\n  const base = '000000'\n  const number = Math.floor(Math.random() * 16777215).toString(16)\n  return '#' + (base + number).substr(-6)\n}\n\ncolorsys.rotateHue = function (hue, amount) {\n  if (amount === void 0) { amount = 0; }\n  const aux = typeof hue === 'object'\n      ? (hue.h + amount) % 360\n      : (hue + amount) % 360\n      \n  const nextHue = aux < 0 ? (360 + aux) : aux\n  return typeof hue === 'object'\n      ? Object.assign(hue, { h: nextHue })\n      : nextHue\n}\n\n\ncolorsys.getColorEncoding = function (color) {\n  if (typeof color === 'string') {\n    try {\n      colorsys.hex2Rgb(color)\n      return 'hex'\n    } catch (err) { /* Silent catch */ }\n  }\n\n  if (typeof color !== 'object') {\n    return 'unknown'\n  }\n\n  // Now check that the sum of the components is still a number\n  // And different than NaN (for that the boolean check)\n  const c = color\n\n  if ((c.r + c.g + c.b) && typeof (c.r + c.g + c.b) === 'number') {\n    return 'rgb'\n  }\n\n  if ((c.h + c.s + c.v) && typeof (c.h + c.s + c.v) === 'number') {\n    return 'hsv'\n  }\n\n  if ((c.h + c.s + c.l) && typeof (c.h + c.s + c.l) === 'number') {\n    return 'hsl'\n  }\n\n  if ((c.c + c.m + c.y + c.k) && typeof (c.c + c.m + c.y + c.k) === 'number') {\n    return 'cmyk'\n  }\n\n  return 'unknown'\n}\n\nfunction _normalizeAngle (degrees) {\n  return (degrees % 360 + 360) % 360;\n}\n\nfunction _hue2Rgb (p, q, t) {\n  if (t < 0) t += 1\n  if (t > 1) t -= 1\n  if (t < 1 / 6) return p + (q - p) * 6 * t\n  if (t < 1 / 2) return q\n  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6\n  return p\n}\n\n// It's easier to change luminosity in HSL\ncolorsys.any2Hsl = function (color) {\n  const colorEncoding = colorsys.getColorEncoding(color)\n\n  switch (colorEncoding) {\n    case 'hsl':\n      return color\n    case 'rgb':\n      return colorsys.rgb2Hsl(color)\n    case 'hex':\n      return colorsys.hex2Hsl(color)\n    case 'hsv':\n      return colorsys.hsv2Hsl(color)\n    case 'cmyk':\n      return colorsys.rgb2Hsl(colorsys.cmyk2Rgb(color))\n    default:\n      return 'unknown'\n  }\n}\n\n// Aliases\ncolorsys.any_to_hsl = colorsys.anyToHsl = colorsys.any2Hsl\n\n// Will return the transforming to encode function\n// or undefined\ncolorsys.getTransformEncodingFunction = function (color, desiredEncoding) {\n  const originalEncoding = colorsys.getColorEncoding(color)\n  return colorsys[originalEncoding + '_to_' + desiredEncoding]\n}\n\n// TODO:\n// Create darken / lighten methods with same input/output format\ncolorsys.darken = function (color, percentage) {\n  const encoding = colorsys.getColorEncoding(color)\n\n  if (encoding === 'unknown') {\n    return color\n  }\n\n  // Missing transformation function between hsl and cmyk\n  // Also, this algo is simple and precise\n  if (encoding === 'cmyk') {\n    const nextCmyk = color\n    nextCmyk.k = Math.min(100, 100 * percentage + nextCmyk.k)\n    return nextCmyk\n  }\n\n  const hsl = colorsys.any2Hsl(color)\n  const nextHsl = {h: hsl.h, s: hsl.s, l: Math.round(hsl.l * (1 - percentage))}\n\n  const transformFn = encoding === 'hsl'\n    ? c => c // If HSL return as incame\n    : colorsys.getTransformEncodingFunction(nextHsl, encoding)\n\n  if (typeof transformFn !== 'function') {\n    return color\n  }\n\n  return transformFn(nextHsl)\n}\n\n\n//# sourceURL=webpack://AccessibleColorPalette/./node_modules/colorsys/colorsys.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"generatePalette\": () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_0__.generatePalette)\n/* harmony export */ });\n/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ \"./src/utils/index.js\");\n\n\n//# sourceURL=webpack://AccessibleColorPalette/./src/index.js?");

/***/ }),

/***/ "./src/utils/helpers.js":
/*!******************************!*\
  !*** ./src/utils/helpers.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"adjustColor\": () => (/* binding */ adjustColor),\n/* harmony export */   \"calculateColor\": () => (/* binding */ calculateColor),\n/* harmony export */   \"paletteColorBuilder\": () => (/* binding */ paletteColorBuilder)\n/* harmony export */ });\n/* harmony import */ var colorsys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! colorsys */ \"./node_modules/colorsys/colorsys.js\");\n/* harmony import */ var colorsys__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(colorsys__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _mdhnpm_color_contrast_ratio_calculator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @mdhnpm/color-contrast-ratio-calculator */ \"./node_modules/@mdhnpm/color-contrast-ratio-calculator/dist/index.js\");\n/* harmony import */ var _validations__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./validations */ \"./src/utils/validations.js\");\n\n\n\n\nconst paletteColorBuilder = (name, color, info) => {\n  if (!(0,_validations__WEBPACK_IMPORTED_MODULE_2__.validatePaletteColorBuilderArgs)(name, color, info)) return null\n  const rgb = (0,colorsys__WEBPACK_IMPORTED_MODULE_0__.hexToRgb)(color)\n  if (!rgb) {\n    console.error(`Invalid color: ${color}`)\n    return null\n  }\n  return {\n    name,\n    rgb,\n    hex: color,\n    hsl: (0,colorsys__WEBPACK_IMPORTED_MODULE_0__.rgb2Hsl)(rgb.r, rgb.g, rgb.b),\n    info,\n  }\n}\n\nconst adjustColor = (colorHsl, bgColorHex, currentContrastRatio, targetRatio, adjustment) => {\n  let newColorHex, newContrastRatio = currentContrastRatio\n\n  while (Math.abs(newContrastRatio - targetRatio) > 0.1 && colorHsl.l >= 0 && colorHsl.l <= 100) {\n    colorHsl.l += adjustment\n    newColorHex = (0,colorsys__WEBPACK_IMPORTED_MODULE_0__.hsl2Hex)(colorHsl)\n    newContrastRatio = (0,_mdhnpm_color_contrast_ratio_calculator__WEBPACK_IMPORTED_MODULE_1__.colorContrastRatioCalculator)(bgColorHex, newColorHex).toFixed(1)\n  }\n\n  // if resultant ratio after loop is less than target ratio\n  if (newContrastRatio < targetRatio && colorHsl.l >= 0 && colorHsl.l <= 100) {\n    adjustment = bgColorHex === \"#000000\" ? 1 : -1\n    colorHsl.l += adjustment\n    newColorHex = (0,colorsys__WEBPACK_IMPORTED_MODULE_0__.hsl2Hex)(colorHsl)\n    newContrastRatio = (0,_mdhnpm_color_contrast_ratio_calculator__WEBPACK_IMPORTED_MODULE_1__.colorContrastRatioCalculator)(bgColorHex, newColorHex).toFixed(1)\n  }\n\n  return {\n    newColorHex: newColorHex,\n    newContrastRatio: newContrastRatio\n  }\n}\n\nconst calculateColor = (action1, action2, ratio, color, bgColor) => {\n  return bgColor === '#ffffff' ? action1(ratio, color) : action2(ratio, color)\n}\n\n\n//# sourceURL=webpack://AccessibleColorPalette/./src/utils/helpers.js?");

/***/ }),

/***/ "./src/utils/index.js":
/*!****************************!*\
  !*** ./src/utils/index.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"generatePalette\": () => (/* reexport safe */ _palette__WEBPACK_IMPORTED_MODULE_0__.generatePalette)\n/* harmony export */ });\n/* harmony import */ var _palette__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./palette */ \"./src/utils/palette.js\");\n\n\n//# sourceURL=webpack://AccessibleColorPalette/./src/utils/index.js?");

/***/ }),

/***/ "./src/utils/light.js":
/*!****************************!*\
  !*** ./src/utils/light.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"darken\": () => (/* binding */ darken),\n/* harmony export */   \"illuminate\": () => (/* binding */ illuminate)\n/* harmony export */ });\n/* harmony import */ var colorsys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! colorsys */ \"./node_modules/colorsys/colorsys.js\");\n/* harmony import */ var colorsys__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(colorsys__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _mdhnpm_color_contrast_ratio_calculator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @mdhnpm/color-contrast-ratio-calculator */ \"./node_modules/@mdhnpm/color-contrast-ratio-calculator/dist/index.js\");\n/* harmony import */ var _validations__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./validations */ \"./src/utils/validations.js\");\n\n\n\n\n\nconst darken = (desiredContrastRatio, colorHex) => {\n  if (!(0,_validations__WEBPACK_IMPORTED_MODULE_2__.validateLightArgs)(desiredContrastRatio, colorHex)) return null\n\n  let newColorHex\n  let currentContrastRatio = 1\n  const colorHsl = (0,colorsys__WEBPACK_IMPORTED_MODULE_0__.hex2Hsl)(colorHex)\n\n  while (currentContrastRatio < desiredContrastRatio && colorHsl.l > 0) {\n    colorHsl.l = colorHsl.l - 1\n    newColorHex = (0,colorsys__WEBPACK_IMPORTED_MODULE_0__.hsl2Hex)(colorHsl)\n    currentContrastRatio = (0,_mdhnpm_color_contrast_ratio_calculator__WEBPACK_IMPORTED_MODULE_1__.colorContrastRatioCalculator)(colorHex, newColorHex).toFixed(1)\n  }\n  return { hex: newColorHex, ratio: Number(currentContrastRatio) }\n}\n\nconst illuminate = (desiredContrastRatio, colorHex) => {\n  if (!(0,_validations__WEBPACK_IMPORTED_MODULE_2__.validateLightArgs)(desiredContrastRatio, colorHex)) return null\n\n  let newColorHex\n  let currentContrastRatio = 1\n  const colorHsl = (0,colorsys__WEBPACK_IMPORTED_MODULE_0__.hex2Hsl)(colorHex)\n\n  while (currentContrastRatio < desiredContrastRatio && colorHsl.l < 100) {\n    colorHsl.l = colorHsl.l + 1\n    newColorHex = (0,colorsys__WEBPACK_IMPORTED_MODULE_0__.hsl2Hex)(colorHsl)\n    currentContrastRatio = (0,_mdhnpm_color_contrast_ratio_calculator__WEBPACK_IMPORTED_MODULE_1__.colorContrastRatioCalculator)(colorHex, newColorHex).toFixed(1)\n  }\n  return { hex: newColorHex, ratio: Number(currentContrastRatio) }\n}\n\n\n\n\n//# sourceURL=webpack://AccessibleColorPalette/./src/utils/light.js?");

/***/ }),

/***/ "./src/utils/palette.js":
/*!******************************!*\
  !*** ./src/utils/palette.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"generatePalette\": () => (/* binding */ generatePalette)\n/* harmony export */ });\n/* harmony import */ var colorsys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! colorsys */ \"./node_modules/colorsys/colorsys.js\");\n/* harmony import */ var colorsys__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(colorsys__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _mdhnpm_color_contrast_ratio_calculator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @mdhnpm/color-contrast-ratio-calculator */ \"./node_modules/@mdhnpm/color-contrast-ratio-calculator/dist/index.js\");\n/* harmony import */ var _light__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./light */ \"./src/utils/light.js\");\n/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./helpers */ \"./src/utils/helpers.js\");\n/* harmony import */ var _validations__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./validations */ \"./src/utils/validations.js\");\n// DOCUMENTATION: https://shorturl.at/fgqRW\n\n\n\n\n\n\nconst RATIOS = {\n  100: 4.5,\n  300: 3.1,\n  600: 3.1,\n  700: 5.1,\n  800: 3.1,\n  900: 3.1,\n}\n\nconst ORIGIN_COLORS = {\n  100: 700,\n  300: 700,\n  600: 100,\n  800: 600,\n  900: 700\n}\n\nlet cache = {}\n\nconst generatePalette = (colorHex, bgColor) => {\n  if (!(0,_validations__WEBPACK_IMPORTED_MODULE_4__.validatePaletteArgs)(colorHex, bgColor)) return null\n  const cacheKey = `${colorHex}-${bgColor}`\n  if (cache[cacheKey]) return cache[cacheKey]\n\n  let colors = {}\n\n  const bgColorHex = bgColor === 'white' ? '#ffffff' : '#000000'\n  const currentContrastRatio = (0,_mdhnpm_color_contrast_ratio_calculator__WEBPACK_IMPORTED_MODULE_1__.colorContrastRatioCalculator)(colorHex, bgColorHex).toFixed(1)\n\n  colors[700] = get700(colorHex, bgColorHex, currentContrastRatio)\n  const paletteColors = ['100', '300', '600', '800', '900'].map((name) => {\n    return colors[name] = getPaletteColor(name, bgColorHex, colors[ORIGIN_COLORS[name]].hex)\n  })\n  cache[cacheKey] = colors\n  return colors\n}\n\nconst get700 = (colorHex, bgColorHex, currentContrastRatio) => {\n  const name = \"700\"\n  const targetRatio = RATIOS[name]\n  let info = `(${targetRatio}:1 on background)`\n  const colorHsl = (0,colorsys__WEBPACK_IMPORTED_MODULE_0__.hex2Hsl)(colorHex)\n\n  if (currentContrastRatio === targetRatio) {\n    colors[name] = (0,_helpers__WEBPACK_IMPORTED_MODULE_3__.paletteColorBuilder)(name, colorHex, info)\n    return\n  }\n\n  const adjustment = bgColorHex === \"#000000\" ?\n    (currentContrastRatio > targetRatio ? -1 : 1) :\n    (currentContrastRatio > targetRatio ? 1 : -1)\n\n  let { newColorHex, newContrastRatio } = (0,_helpers__WEBPACK_IMPORTED_MODULE_3__.adjustColor)(colorHsl, bgColorHex, currentContrastRatio, targetRatio, adjustment)\n\n  info = `(${newContrastRatio}:1 on background)`\n  return (0,_helpers__WEBPACK_IMPORTED_MODULE_3__.paletteColorBuilder)(name, newColorHex, info)\n}\n\nconst getPaletteColor = (name, bgColor, originColor) => {\n  const action = (name === '100' || name === '300') ? [_light__WEBPACK_IMPORTED_MODULE_2__.illuminate, _light__WEBPACK_IMPORTED_MODULE_2__.darken] : [_light__WEBPACK_IMPORTED_MODULE_2__.darken, _light__WEBPACK_IMPORTED_MODULE_2__.illuminate]\n  const newColor = (0,_helpers__WEBPACK_IMPORTED_MODULE_3__.calculateColor)(...action, RATIOS[name], originColor, bgColor)\n  return (0,_helpers__WEBPACK_IMPORTED_MODULE_3__.paletteColorBuilder)(name, newColor.hex, `(${newColor.ratio}:1 on ${ORIGIN_COLORS[name]})`)\n}\n\n\n\n\n\n\n\n\n//# sourceURL=webpack://AccessibleColorPalette/./src/utils/palette.js?");

/***/ }),

/***/ "./src/utils/validations.js":
/*!**********************************!*\
  !*** ./src/utils/validations.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"getErrorMessage\": () => (/* binding */ getErrorMessage),\n/* harmony export */   \"isBgColorValid\": () => (/* binding */ isBgColorValid),\n/* harmony export */   \"isValidHexColor\": () => (/* binding */ isValidHexColor),\n/* harmony export */   \"validateLightArgs\": () => (/* binding */ validateLightArgs),\n/* harmony export */   \"validatePaletteArgs\": () => (/* binding */ validatePaletteArgs),\n/* harmony export */   \"validatePaletteColorBuilderArgs\": () => (/* binding */ validatePaletteColorBuilderArgs)\n/* harmony export */ });\nconst validatePaletteArgs = (colorHex, bgColor) => {\n  const errorMessage = getErrorMessage(colorHex, bgColor)\n\n  if (errorMessage) {\n    console.error(`Accessible color palette: ${errorMessage}`)\n    return false\n  }\n\n  return true\n}\n\nconst isValidHexColor = hex => {\n  if (typeof hex !== \"string\") return false\n  if (!hex) return false\n  const regex = /^#[0-9A-Fa-f]{6}$/g\n  //for valid hex colors like #000, #fff, #aaa, etc\n  const simplifiedRegex = /^#([0-9A-Fa-f])\\1\\1$/gi\n  return Boolean(hex.match(regex) || hex.match(simplifiedRegex))\n}\n\n\nconst isBgColorValid = bgColor => {\n  return bgColor === 'white' || bgColor === 'black'\n}\n\nconst getErrorMessage = (colorHex, bgColor) => {\n  const checks = {\n    'Missing base color': colorHex,\n    'Missing contrast color': bgColor,\n    'Invalid base color. Use a valid hex color': isValidHexColor(colorHex),\n    'Invalid contrast color. Use \"white\" or \"black\"': isBgColorValid(bgColor),\n  }\n\n  for (const message in checks) {\n    if (!checks[message]) {\n      return message\n    }\n  }\n\n  return null\n}\n\nconst validatePaletteColorBuilderArgs = (name, color, info) => {\n  const parameters = { name, color, info }\n  const messages = {\n    name: 'Missing name',\n    color: 'Missing color',\n    info: 'Missing info',\n  }\n\n  for (const key in parameters) {\n    if (typeof parameters[key] !== \"string\") {\n      throw new Error('Wrong type. All Args for validatePaletteColorBuilderArgs should be strings')\n    }\n\n    if (!parameters[key]) {\n      throw new Error(messages[key])\n    }\n  }\n\n  return true\n}\n\nconst validateLightArgs = (desiredContrastRatio, colorHex) => {\n  const validations = [\n    {\n      condition: !desiredContrastRatio || !colorHex,\n      errorMessage: 'Missing arguments. Pass desired contrast ratio and color hex'\n    },\n    {\n      condition: !isValidHexColor(colorHex),\n      errorMessage: `Invalid color: ${colorHex}`\n    },\n    {\n      condition: typeof desiredContrastRatio !== \"number\",\n      errorMessage: 'Wrong type. Desired contrast ratio should be a number'\n    },\n  ]\n\n  for (let validation of validations) {\n    if (validation.condition) {\n      throw new Error(validation.errorMessage)\n    }\n  }\n\n  return true\n}\n\n\n\n\n\n\n//# sourceURL=webpack://AccessibleColorPalette/./src/utils/validations.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});