/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#fef7ed',
          100: '#fdecd3',
          200: '#fad6a5',
          300: '#f7b76d',
          400: '#f39035',
          500: '#f07214',
          600: '#e1580a',
          700: '#ba410b',
          800: '#943412',
          900: '#772d12',
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.15)',
          border: 'rgba(255, 255, 255, 0.2)',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(240, 114, 20, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(240, 114, 20, 0.8), 0 0 30px rgba(240, 114, 20, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
