import colorString from 'color-string';

export const isValidColor = (color: string) => !!colorString.get(color.toLowerCase());

export const isValidHexColor = (hex: string): boolean => {
  const hexRegex = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
  return hexRegex.test(hex);
};

export const isLightColor = (color: string): boolean => {
  const rgb = colorString.get.rgb(color);
  if (!rgb) return false;

  const [r, g, b] = rgb;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const dddLuminance = 0.2126 * 221 + 0.7152 * 221 + 0.0722 * 221;
  return luminance > dddLuminance;
};

/* #region WCAG Luminance */

function getLuminance([r, g, b]: [number, number, number]): number {
  const toLinear = (value: number): number => {
    value /= 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export const getContrastRatio = (luminance1: number, luminance2: number): number =>
  (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05);

export const isTextWhite = ([r, g, b]: [number, number, number] | [number, number, number, number]): boolean => {
  const backgroundLuminance = getLuminance([r, g, b]);

  const whiteLuminance = getLuminance([255, 255, 255]);
  const contrastWithWhite = (whiteLuminance + 0.05) / (backgroundLuminance + 0.05);

  const blackLuminance = getLuminance([0, 0, 0]);
  const contrastWithBlack = (backgroundLuminance + 0.05) / (blackLuminance + 0.05);

  return contrastWithWhite > contrastWithBlack;
};

/* #endregion */
