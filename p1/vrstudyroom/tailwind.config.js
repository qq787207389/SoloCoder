/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        background: "#FAF8F5",
        foreground: "#4A4543",
        muted: "#F2EFE9",
        "muted-foreground": "#8B8680",
        primary: "#7D9D8D",
        "primary-foreground": "#FFFFFF",
        secondary: "#E8A598",
        "secondary-foreground": "#FFFFFF",
        accent: "#D4C4B0",
        "accent-foreground": "#4A4543",
        card: "#FFFFFF",
        "card-foreground": "#4A4543",
        border: "#E5E0D8",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      animation: {
        "breathe": "breathe 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { opacity: 0.7 },
          "50%": { opacity: 1 },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: 0, transform: "scale(0.9)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
