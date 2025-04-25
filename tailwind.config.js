/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          200: '#E1E3C1',
          500: '#9A9D4D',
          600: '#7D8040',
        }
      },
    },
  },
  plugins: [],
}