var AccessibleColorPalette = (function (exports, colorContrastRatioCalculator, colorConvert) {
  'use strict';

  const validatePaletteArgs = (colorHex, bgColor) => {
      const errorMessage = getErrorMessage(colorHex, bgColor);
      if (errorMessage) {
          console.error(`Accessible color palette: ${errorMessage}`);
          return false;
      }
      return true;
  };
  const isValidHexColor = (hex) => {
      if (typeof hex !== "string")
          return false;
      if (!hex)
          return false;
      const regex = /^#[0-9A-Fa-f]{6}$/g;
      //for valid hex colors like #000, #fff, #aaa, etc
      const simplifiedRegex = /^#([0-9A-Fa-f])\1\1$/gi;
      return Boolean(hex.match(regex) || hex.match(simplifiedRegex));
  };
  const isBgColorValid = (bgColor) => {
      return bgColor === 'white' || bgColor === 'black';
  };
  const getErrorMessage = (colorHex, bgColor) => {
      const checks = {
          'Missing base color': colorHex,
          'Missing contrast color': bgColor,
          // 'Wrong color hex format. Format "#aaaaaa" is expected.': colorHex.charAt(0) !== '#',
          'Invalid base color. Use a valid hex color': isValidHexColor(colorHex),
          'Invalid contrast color. Use "white" or "black"': isBgColorValid(bgColor),
      };
      for (const message in checks) {
          if (!checks[message]) {
              return message;
          }
      }
      return null;
  };
  const validatePaletteColorBuilderArgs = (name, color, info) => {
      const parameters = { name, color, info };
      const messages = {
          name: 'Missing name',
          color: 'Missing color',
          info: 'Missing info',
      };
      for (const key in parameters) {
          if (!parameters[key]) {
              throw new Error(messages[key]);
          }
          if (typeof parameters[key] !== "string") {
              throw new Error('Wrong type. All Args for validatePaletteColorBuilderArgs should be strings');
          }
      }
      return true;
  };
  const validateLightArgs = (desiredContrastRatio, colorHex) => {
      const validations = [
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
      ];
      for (let validation of validations) {
          if (validation.condition) {
              throw new Error(validation.errorMessage);
          }
      }
      return true;
  };

  const darken = (desiredContrastRatio, colorHex) => {
      if (!validateLightArgs(desiredContrastRatio, colorHex))
          ;
      let newColorHex;
      let currentContrastRatio = 1;
      const colorHsl = colorConvert.convert.hex.hsl(colorHex);
      while (currentContrastRatio < desiredContrastRatio && colorHsl.l > 0) {
          colorHsl.l = colorHsl.l - 1;
          newColorHex = colorConvert.convert.hsl.hex(colorHsl);
          currentContrastRatio = Number(colorContrastRatioCalculator.colorContrastRatioCalculator(colorHex, newColorHex).toFixed(1));
      }
      return { hex: newColorHex, ratio: currentContrastRatio };
  };
  const illuminate = (desiredContrastRatio, colorHex) => {
      if (!validateLightArgs(desiredContrastRatio, colorHex))
          ;
      let newColorHex;
      let currentContrastRatio = 1;
      const colorHsl = colorConvert.convert.hex.hsl(colorHex);
      while (currentContrastRatio < desiredContrastRatio && colorHsl.l < 100) {
          colorHsl.l = colorHsl.l + 1;
          newColorHex = colorConvert.convert.hsl.hex(colorHsl);
          currentContrastRatio = Number(colorContrastRatioCalculator.colorContrastRatioCalculator(colorHex, newColorHex).toFixed(1));
      }
      return { hex: newColorHex, ratio: currentContrastRatio };
  };

  const paletteColorBuilder = (name, color, info) => {
      if (!validatePaletteColorBuilderArgs(name, color, info))
          ;
      const rgb = colorConvert.convert.hex.rgb(color);
      if (!rgb) {
          console.error(`Invalid color: ${color}`);
          return null;
      }
      return {
          name,
          rgb,
          hex: color,
          hsl: colorConvert.convert.rgb.hsl(rgb.r, rgb.g, rgb.b),
          info,
      };
  };
  const adjustColor = (colorHsl, bgColorHex, currentContrastRatio, targetRatio, adjustment) => {
      let newColorHex;
      let newContrastRatio = currentContrastRatio;
      while (Math.abs(newContrastRatio - targetRatio) > 0.1
          && colorHsl.l >= 0
          && colorHsl.l <= 100) {
          colorHsl.l += adjustment;
          newColorHex = colorConvert.convert.hsl.hex(colorHsl);
          newContrastRatio = Number(colorContrastRatioCalculator.colorContrastRatioCalculator(bgColorHex, newColorHex).toFixed(1));
      }
      // if resultant ratio after loop is less than target ratio
      if (newContrastRatio < targetRatio && colorHsl.l >= 0 && colorHsl.l <= 100) {
          adjustment = bgColorHex === "#000000" ? 1 : -1;
          colorHsl.l += adjustment;
          newColorHex = colorConvert.convert.hsl.hex(colorHsl);
          newContrastRatio = Number(colorContrastRatioCalculator.colorContrastRatioCalculator(bgColorHex, newColorHex).toFixed(1));
      }
      return {
          hex: newColorHex,
          ratio: newContrastRatio
      };
  };
  const calculateColor = (action1, action2, ratio, color, bgColor) => {
      return bgColor === '#ffffff' ? action1(ratio, color) : action2(ratio, color);
  };

  const getCompatibilities = (BgColorHex, palette) => {
      const isBlackBg = BgColorHex === '#000000';
      return {
          100: {
              largeText: [palette['600'].hex],
              smallText: [palette['700'].hex, palette['800'].hex, palette['900'].hex]
          },
          300: {
              largeText: [palette['700'].hex],
              smallText: [palette['800'].hex, palette['900'].hex]
          },
          600: {
              largeText: isBlackBg
                  ? [BgColorHex, palette['100'].hex, palette['800'].hex]
                  : [BgColorHex, palette['100'].hex, palette['800'].hex, palette['900'].hex],
              smallText: isBlackBg ? [palette['900'].hex] : []
          },
          700: {
              largeText: isBlackBg
                  ? [palette['300'].hex, palette['900'].hex]
                  : [palette['300'].hex],
              smallText: [palette['100'].hex, BgColorHex]
          },
          800: {
              largeText: [palette['600'].hex],
              smallText: [palette['300'].hex, palette['100'].hex, BgColorHex]
          },
          900: {
              largeText: isBlackBg ? [palette['700'].hex] : [palette['800'].hex],
              smallText: isBlackBg
                  ? [BgColorHex, palette['100'].hex, palette['300'].hex, palette['600'].hex]
                  : [BgColorHex, palette['100'].hex, palette['300'].hex]
          }
      };
  };

  const RATIOS = {
      '100': 4.5,
      '300': 3.1,
      '600': 3.1,
      '700': 5.1,
      '800': 3.1,
      '900': 3.1,
  };
  const ORIGIN_COLORS = {
      '100': 700,
      '300': 700,
      '600': 100,
      '700': null,
      '800': 600,
      '900': 700
  };
  let cache = {};
  const generatePalette = (colorHex, bgColor) => {
      if (!validatePaletteArgs(colorHex, bgColor))
          return null;
      //check for short hex like #000 or #aaa. colorContrastRatioCalculator requires full hex
      if (colorHex.length === 4) {
          colorHex = colorHex[0] + colorHex[1].repeat(6);
      }
      const cacheKey = `${colorHex}-${bgColor}`;
      if (cache[cacheKey])
          return cache[cacheKey];
      let colors = {};
      const bgColorHex = bgColor === 'white' ? '#ffffff' : '#000000';
      const currentContrastRatio = Number(colorContrastRatioCalculator.colorContrastRatioCalculator(colorHex, bgColorHex)
          .toFixed(1));
      colors[700] = get700(colorHex, bgColorHex, currentContrastRatio);
      //the order is important
      ['100', '300', '600', '800', '900'].map((name) => {
          const localHex = colors[ORIGIN_COLORS[name]].hex;
          return colors[name] = getPaletteColor(name, bgColorHex, localHex);
      });
      const compatibilities = getCompatibilities(bgColorHex, colors);
      const completePalette = Object.fromEntries(Object.entries(colors).map(([shade, color]) => [
          shade,
          Object.assign(Object.assign({}, color), { compatibilities: compatibilities[shade] })
      ]));
      cache[cacheKey] = completePalette;
      return completePalette;
  };
  const get700 = (colorHex, bgColorHex, currentContrastRatio) => {
      var _a;
      const name = "700";
      const targetRatio = (_a = RATIOS[name]) !== null && _a !== void 0 ? _a : 0;
      let info = `(${targetRatio}:1 on background)`;
      const colorHsl = colorConvert.convert.hex.hsl(colorHex);
      if (currentContrastRatio === targetRatio) {
          return paletteColorBuilder(name, colorHex, info);
      }
      const adjustment = bgColorHex === "#000000" ?
          (currentContrastRatio > targetRatio ? -1 : 1) :
          (currentContrastRatio > targetRatio ? 1 : -1);
      let { hex, ratio } = adjustColor(colorHsl, bgColorHex, currentContrastRatio, targetRatio, adjustment);
      info = `(${ratio}:1 on background)`;
      return paletteColorBuilder(name, hex, info);
  };
  const getPaletteColor = (name, bgColor, originColor) => {
      const action = (name === '100' || name === '300')
          ? [illuminate, darken]
          : [darken, illuminate];
      const newColor = calculateColor(action[0], action[1], RATIOS[name], originColor, bgColor);
      const info = `(${newColor.ratio}:1 on ${ORIGIN_COLORS[name]})`;
      return paletteColorBuilder(name, newColor.hex, info);
  };

  exports.generatePalette = generatePalette;
  exports.get700 = get700;
  exports.getPaletteColor = getPaletteColor;

  return exports;

})({}, colorContrastRatioCalculator, colorConvert);
