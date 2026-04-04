/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Industrial Slate Backgrounds
        slate: {
          950: '#020617', 
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        // Metallic Chrome & Silver highlights
        chrome: {
          light: '#f8fafc',
          DEFAULT: '#e2e8f0',
          dark: '#94a3b8',
        }
      },
    },
  },
  plugins: [],
}