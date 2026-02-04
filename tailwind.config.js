/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Adding custom slate shades for a "High-Tech" look
        brand: {
          950: '#020617',
          900: '#0f172a',
          800: '#1e293b',
        }
      }
    },
  },
  plugins: [],
}
