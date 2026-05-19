/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        classic: {
          primary: '#1a365d',
          secondary: '#2d3748',
          accent: '#3182ce',
          background: '#ffffff',
          paper: '#f7fafc'
        },
        modern: {
          primary: '#0d9488',
          secondary: '#134e4a',
          accent: '#06b6d4',
          background: '#f0fdfa',
          paper: '#ffffff'
        },
        simple: {
          primary: '#374151',
          secondary: '#1f2937',
          accent: '#6b7280',
          background: '#f9fafb',
          paper: '#ffffff'
        }
      }
    },
  },
  plugins: [],
}
