/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./gimbooks-purchase-order.html",
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "./**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          green: '#22c55e',
          dark: '#16a34a',
          light: '#4ade80'
        }
      }
    },
  },
  plugins: [],
}
