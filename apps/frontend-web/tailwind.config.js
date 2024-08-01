const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        border: '#B9DBDC',
      },
      container: {
        padding: 0,
        center: true,
        screens: {
          sm: '640px',
          md: '720px',
          lg: '720px',
          xl: '840px',
          '2xl': '840px',
        },
      },

      keyframes: {
        slideInUp: {
          '0%': { opacity: 0.5, transform: 'translateY(120%)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },

        slideInDown: {
          '0%': { opacity: 0.5, transform: 'translateY(-120%)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },

        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        "slidein-up": 'slideInUp .25s ease-out',
        "slidein-down": 'slideInDown .1s ease-out',
        fadein: 'fadeIn, 5s',
      },
    },
  },
  plugins: [],
};
