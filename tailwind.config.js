/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#065A82',
        accent: '#02C39A',
        danger: '#F96167',
        warning: '#F9C74F',
        bgLight: '#F7F9FC',
        bgDark: '#0A0A1A',
      },
      fontFamily: {
        heading: ['Georgia', 'serif'],
        body: ['Calibri', 'DM Sans', 'sans-serif'],
        code: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
