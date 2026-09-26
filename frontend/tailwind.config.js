/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'DM Sans', 'sans-serif'],
        heading: ['Ranade', 'Object Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f6fe',
          100: '#e0edfe',
          200: '#bae0fd',
          300: '#8ecae6',
          400: '#4895ef',
          500: '#2563eb',
          600: '#1e4287', // Azul corporativo Tempus Care (logo)
          700: '#1a3770',
          800: '#152b57',
          900: '#0f1f3e',
          950: '#0a1428',
        },
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488', // Verde/teal actual mantenido como color secundario
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a', // Color verde de éxito
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        brand: {
          50: '#f0f6fe',
          100: '#e0edfe',
          200: '#bae0fd',
          300: '#8ecae6',
          400: '#4895ef',
          500: '#2563eb',
          600: '#1e4287',
          700: '#1a3770',
          800: '#152b57',
          900: '#0f1f3e',
        },
      },
    },
  },
  plugins: [],
};
