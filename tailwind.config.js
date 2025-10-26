/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Atkinson Hyperlegible', 'Noto Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Основная темная палитра из Figma
        dark: {
          bg: '#343436',
          card: '#2a2a2c',
          border: '#474747',
          text: '#e3e3dd',
        },
        // Цвета модулей из Figma
        modules: {
          receiving: {
            bg: '#daa420',
            text: '#725a1e',
          },
          inventory: {
            bg: '#fea079',
            text: '#8c533b',
          },
          picking: {
            bg: '#f3a361',
            text: '#8b5931',
          },
          placement: {
            bg: '#86e0cb',
            text: '#2d7a6b',
          },
          shipment: {
            bg: '#91ed91',
            text: '#2d6b2d',
          },
          return: {
            bg: '#ba8f8e',
            text: '#6b3d3c',
          },
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
    },
  },
  plugins: [],
}



