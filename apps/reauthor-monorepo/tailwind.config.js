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
        'border': '#B9DBDC'
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
      }
    },
  },
  plugins: [],
};
