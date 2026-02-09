/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#0d0d14',
          elevated: '#1a1a24',
          overlay: '#24242f',
        },
        gold: {
          50: '#faf6f0',
          100: '#f0e6d4',
          200: '#e6d4b3',
          300: '#dcc295',
          400: '#d4a574',
          500: '#c4935e',
          600: '#a87a4a',
          700: '#8a6138',
          800: '#6e4d2c',
          900: '#523a21',
        },
        copper: {
          300: '#d99b7e',
          400: '#c47d5a',
          500: '#a8633e',
        },
        ink: {
          50: '#e8e4df',
          100: '#d4d0cb',
          200: '#b8b4af',
          300: '#9a9691',
          400: '#7a766f',
          500: '#5a564f',
        },
        status: {
          want: '#7c8db5',
          'want-muted': 'rgba(124, 141, 181, 0.15)',
          reading: '#d4a574',
          'reading-muted': 'rgba(212, 165, 116, 0.15)',
          finished: '#7dab8a',
          'finished-muted': 'rgba(125, 171, 138, 0.15)',
        },
        danger: {
          400: '#e07070',
          500: '#d45050',
        },
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(212, 165, 116, 0.25)',
        'glow-gold-lg': '0 0 40px rgba(212, 165, 116, 0.35)',
        'card': '0 2px 15px -3px rgba(0, 0, 0, 0.3), 0 10px 20px -2px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 40px -10px rgba(0, 0, 0, 0.4), 0 0 20px rgba(212, 165, 116, 0.1)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.04)',
        'glow-subtle': '0 0 15px rgba(212, 165, 116, 0.12)',
      },
      transitionTimingFunction: {
        'refined': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(212, 165, 116, 0.1)' },
          '50%': { boxShadow: '0 0 25px rgba(212, 165, 116, 0.2)' },
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        darkrefined: {
          "primary": "#d4a574",
          "primary-content": "#0d0d14",
          "secondary": "#c47d5a",
          "secondary-content": "#0d0d14",
          "accent": "#d4a574",
          "accent-content": "#0d0d14",
          "neutral": "#1a1a24",
          "neutral-content": "#e8e4df",
          "base-100": "#0d0d14",
          "base-200": "#1a1a24",
          "base-300": "#24242f",
          "base-content": "#e8e4df",
          "info": "#7c8db5",
          "success": "#7dab8a",
          "warning": "#d4a574",
          "error": "#d45050",
        },
      },
    ],
  },
}
