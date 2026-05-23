/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        nostalgic: {
          cream: '#F5EFE0',
          creamDark: '#E8DFCE',
          paper: '#F9F5EB',
          brown: '#4A3728',
          brownLight: '#6B5D50',
          brownLighter: '#8B7355',
          orange: '#D4702C',
          orangeLight: '#E89555',
          sepia: '#704214',
        }
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'Times New Roman', 'serif'],
        display: ['"Noto Serif SC"', 'STZhongsong', 'SimSun', 'serif'],
        body: ['"Noto Sans SC"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'paper': '0 4px 6px -1px rgba(74, 55, 40, 0.1), 0 2px 4px -1px rgba(74, 55, 40, 0.06)',
        'paper-hover': '0 10px 25px -5px rgba(74, 55, 40, 0.15), 0 8px 10px -6px rgba(74, 55, 40, 0.1)',
        'vintage': '0 1px 3px rgba(74, 55, 40, 0.12), 0 1px 2px rgba(74, 55, 40, 0.24)',
        'photo': '0 2px 8px rgba(74, 55, 40, 0.15), inset 0 0 0 1px rgba(139, 115, 85, 0.2)',
      },
      borderRadius: {
        'vintage': '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
