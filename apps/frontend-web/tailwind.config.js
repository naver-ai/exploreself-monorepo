const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const colors = require('tailwindcss/colors')
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

        zoomIn: {
          '0%': { transform: 'scale(0)' },
          '100%': { transform: 'scale(1)' },
        },

        'bounce-emphasized': {
          '0%, 100%': {
            "transform": "translateY(-30%)scale(1.3)", 
            "animation-timing-function": "cubic-bezier(0.8, 0, 1, 1)"},
          "50%": {
            "transform": "translateY(0)scale(1)",
            "animation-timing-function": "cubic-bezier(0, 0, 0.2, 1)"
          }
        },
        'focus-indicate': {
          '0%': { "outline-width": "0", "outline-color": colors.teal[500]},
          "100%": {"outline-width": "8px", "outline-color": "rgba(146, 243, 238, 0.2)"}
        },
      },
      animation: {
        "slidein-up": 'slideInUp .25s ease-out',
        "slidein-down": 'slideInDown .1s ease-out',
        "focus-indicate": "focus-indicate 0.7s linear infinite",
        fadein: 'fadeIn, 5s',
        "bounce-emphasized": "bounce-emphasized 0.7s infinite", 
        "zoom-in": 'zoomIn .25s ease-out'
      },
    },
  },
  plugins: [],
};
