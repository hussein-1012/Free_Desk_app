/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/renderer/src/**/*.{js,ts,jsx,tsx}',
    './src/renderer/index.html',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      colors: {
        // لون التمييز الوحيد (أزرق نيلي هادئ)
        accent: {
          50:  'hsl(221, 100%, 97%)',
          100: 'hsl(221, 90%, 93%)',
          200: 'hsl(221, 85%, 85%)',
          300: 'hsl(221, 80%, 74%)',
          400: 'hsl(221, 75%, 62%)',
          500: 'hsl(221, 70%, 53%)',
          600: 'hsl(221, 68%, 45%)',
          700: 'hsl(221, 65%, 37%)',
          800: 'hsl(221, 62%, 29%)',
          900: 'hsl(221, 58%, 22%)',
        },
      },
      boxShadow: {
        'card':      '0 1px 4px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover':'0 4px 16px 0 rgba(0,0,0,0.10), 0 2px 6px -1px rgba(0,0,0,0.06)',
        'modal':     '0 20px 60px -12px rgba(0,0,0,0.18), 0 8px 24px -8px rgba(0,0,0,0.10)',
        'glow':      '0 0 20px rgba(67, 97, 238, 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in':  'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
};
