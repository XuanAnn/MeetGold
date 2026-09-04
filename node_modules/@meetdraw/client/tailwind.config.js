/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Electric Indigo Canvas Palette
        navy: {
          950: '#0a0e18', // Main deep background
          900: '#0f131d', // Surface level 1
          850: '#131824', // Surface level 2
          800: '#171b26', // Elevated card / border
          700: '#23293a',
          600: '#333b52',
        },
        indigo: {
          accent: '#4f46e5',
          light: '#6366f1',
          glow: '#818cf8',
        },
        emerald: {
          active: '#10b981',
        },
        cyan: {
          accent: '#06b6d4',
        },
        rose: {
          alert: '#f43f5e',
        },
      },
    },
  },
  plugins: [],
};
