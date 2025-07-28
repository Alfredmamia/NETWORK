/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cameroon-green': '#228B22',
        'cameroon-red': '#DC143C',
        'cameroon-yellow': '#FFD700',
      }
    },
  },
  plugins: [],
}