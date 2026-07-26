import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        terminal: ['"VT323"', 'monospace'],
      },
      colors: {
        primary: {
          50: '#fef6f2',
          100: '#fce8df',
          200: '#f8d1bf',
          300: '#f3b091',
          400: '#ee8e62',
          500: '#e96a2f',
          600: '#c85b28',
          700: '#a54b21',
          800: '#893e1c',
          900: '#6f3216',
        },
      },
    },
  },
  plugins: [
    typography,
  ],
}

