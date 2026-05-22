/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#FFF5ED',
          100: '#FFE6D3',
          200: '#FFCCAA',
          300: '#FFB280',
          400: '#FF9F59',
          500: '#FF8C42',
          600: '#FF7024',
          700: '#FF5500',
          800: '#CC4400',
          900: '#993300',
        },
        secondary: {
          50: '#F0FAF1',
          100: '#DAF4DC',
          200: '#B5E9B9',
          300: '#90DE96',
          400: '#76D47E',
          500: '#6BCB77',
          600: '#55C062',
          700: '#3EB24E',
          800: '#28A43A',
          900: '#008914',
        },
        warm: {
          50: '#FFFBF5',
          100: '#FFF7EB',
          200: '#FFEFD6',
          300: '#FFE7C2',
          400: '#FFDFAD',
          500: '#F5F0E6',
        }
      },
      animation: {
        'pull-refresh': 'pullRefresh 0.5s ease-in-out',
        'bounce-in': 'bounceIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        pullRefresh: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
