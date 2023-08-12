import { RGBColor } from '../types'
import { convert } from 'color-convert'

const getLuminance = (r: number, g: number, b: number): number => {
  let a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

export const getContrastRatio = (hexcolor1: string, hexcolor2: string): number => {
  let rgb1 = convert.hex.rgb(hexcolor1);
  let rgb2 = convert.hex.rgb(hexcolor2);

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color hex provided.');
  }

  let luminance1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  let luminance2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  if (luminance1 > luminance2) {
    return (luminance1 + 0.05) / (luminance2 + 0.05);
  } else {
    return (luminance2 + 0.05) / (luminance1 + 0.05);
  }
}
  