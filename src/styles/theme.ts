export const TINY = 320;
export const SMALL = 768;
export const MEDIUM = 1024;
export const LARGE = 1400;
export const XLARGE = 1600;

export const theme = {
  colors: {
    background: '#faf9f8',
    backgroundDark: '#e8e8e8',
    backgroundDarkHover: '#d1d1d1',
    black: '#191818',
    white: '#fff',
    grey: '#cccccc',
    borderLight: '#e8e8e8',
    border: '#dadada',
    borderDark: '#d6d6d6',
    turquoiseDark: '#39b39b',
    turquoiseDarker: '#2b8674',
    error: '#cc3333',
  },
  fonts: {
    bodyFontFamily:
      '"Baton Turbo", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    headingFontFamily:
      '"PT Serif", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  },
  bold: `
    font-weight: 700;
    letter-spacing: 0.05rem;
  `,
  mQ: {
    MEDIA_TINY: `@media (max-width: ${TINY}px)`,
    MEDIA_MAX_SMALL: `@media (max-width: ${SMALL}px)`,
    MEDIA_SMALL: `@media (min-width: ${TINY + 1}px) and (max-width: ${SMALL}px)`,
    MEDIA_MIN_MEDIUM: `@media (min-width: ${SMALL + 1}px)`,
    MEDIA_MAX_MEDIUM: `@media (max-width: ${MEDIUM}px)`,
    MEDIA_MEDIUM: `@media (min-width: ${SMALL + 1}px) and (max-width: ${MEDIUM}px)`,
    MEDIA_MIN_LARGE: `@media (min-width: ${MEDIUM + 1}px)`,
    MEDIA_MIN_X_LARGE: `@media (min-width: ${LARGE + 1}px)`,
    MEDIA_MIN_XX_LARGE: `@media (min-width: ${XLARGE + 1}px)`,
  },
};
