import defaultTheme, { aspectRatio } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      serif: ['var(--font-sohne)', 'sans-serif'],
      sans: ['var(--font-sohne)', 'sans-serif'],
      primary: ['var(--font-sohne)', 'sans-serif'],
      secondary: ['var(--font-sohne)', 'sans-serif'],
      title: ['var(--font-sohne)', 'sans-serif'],
      accent: ['var(--font-sohne)', 'sans-serif'],
      base: ['var(--font-sohne)', 'sans-serif'],
    },
    extend: {
      spacing: {
        xs: 'var(--spacing-xs, 0.25rem)',
        sm: 'var(--spacing-sm, 0.5rem)',
        md: 'var(--spacing-md, 1rem)',
        lg: 'var(--spacing-lg, 1.5rem)',
        xl: 'var(--spacing-xl, 2rem)',
        '2xl': 'var(--spacing-2xl, 3rem)',
        '3xl': 'var(--spacing-3xl, 4rem)',
      },
      letterSpacing: {
        sans: '0.015em',
      },
      rotate: {
        135: '135deg',
      },
      maxWidth: {
        'screen-2xl': '180rem',
        content: '140rem',
      },
      textColor: {
        'turquoise-dark': '#39b39b',
      },
      borderColor: {
        'turquoise-dark': '#39b39b',
      },
      fontSize: {
        '10xl': '9rem',
        '11xl': '10rem',
        '12xl': '11rem',
        '13xl': '12rem',
        md: '1rem',
        xxs: '0.7rem',
      },
      backgroundImage: {
        'gradient-text-fade': 'linear-gradient(170deg, rgb(0, 0, 0), rgb(228, 228, 228))',
        'gradient-fade-from-bottom':
          'linear-gradient(rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 70%, rgb(255, 255, 255) 100%)',
      },
      fontFamily: {
        sans: ['var(--font-sohne)'],
        serif: ['var(--font-sohne)'],
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '3/4': '3 / 4',
        '4/5': '4 / 5',
        '5/6': '5 / 6',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
    screens: {
      xs: '375px',
      ...defaultTheme.screens,
    },
    colors: {
      transparent: 'transparent',
      white: '#ffffff',
      black: '#000000',
      input: {
        error: '#DB0B2D',
        default: '#808080',
        border: '#E9DFD5',
      },
      secondary: {
        200: '#ededed',
        600: '#7f7f7f',
        800: '#727272',
        DEFAULT: '#9f9f9f',
      },
      gray: {
        200: '#f8f8f8',
        300: '#D6D6D6',
        400: '#C4C4C4',
        500: '#B3B3B3',
        600: '#A1A1A1',
        700: '#9f9f9f',
        800: '#626262',
        900: '#252525',
        DEFAULT: '#808080',
      },
      creme: {
        DEFAULT: '#d9c2b6',
        200: '#ecdfdb',
      },
      porcelain: {
        DEFAULT: '#EBE9E8',
      },
      green: {
        700: '#1B5733',
        900: '#739071',
        DEFAULT: '#6B916F',
      },
      orange: {
        600: '#e8bc72',
        DEFAULT: '#DB961F',
      },
      red: {
        600: '#D47B7B',
        DEFAULT: '#DB0B2D',
      },
      alabaster: '#f4f0ed',
      sage: {
        300: '#E9ECE3',
        700: '#B2B695',
        DEFAULT: '#D7DAC8',
      },
      seashell: {
        700: '#F0EFE9',
        DEFAULT: '#f5f0ed',
      },
      background: '#faf9f8',
      backgroundAlternative: '#DFD4C9',
    },
  },
  safelist: [
    {
      pattern: /grid-cols-+/,
      variants: ['lg'],
    },
    'overflow-hidden',
    'fill-white',
    'fill-black',
    'stroke-white',
    'stroke-black',
  ],
  corePlugins: {
    container: false,
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    ({ addComponents }) => {
      addComponents({
        // Redefining the default container with custom styles
        '.container': {
          marginRight: 'auto',
          marginLeft: 'auto',
          width: '1600px',
          maxWidth: 'calc(100vw - 50px)',

          '@screen md': {
            maxWidth: 'calc(100vw - 80px)',
          },
          '@screen lg': {
            maxWidth: 'calc(100vw - 120px)',
          },
          '@screen xl': {
            maxWidth: 'calc(100vw - 200px)',
          },
        },
      });
    },
    require('tailwindcss-animate'),
  ],
};
