/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          50: '#fdfcf9',
          100: '#f7f4ee',
          200: '#ede6d8',
          300: '#ded2be',
          400: '#cab79b',
          500: '#b29874',
        },
        brown: {
          50: '#f8f5f0',
          100: '#eee4d7',
          200: '#dcc6b0',
          300: '#c5a383',
          400: '#aa7e58',
          500: '#8c5a3c', // Warm Chestnut
          600: '#72462c',
          700: '#58341e',
          800: '#3d2212', // Dark Coffee
          900: '#25140a', // Deep Espresso
          950: '#170c06',
        }
      }
    },
  },
  plugins: [],
}
