/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito", "ui-sans-serif", "system-ui", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#f4f3ff",
          100: "#ebe9fe",
          200: "#d9d6fe",
          300: "#bfb8fc",
          400: "#a195f8",
          500: "#6161d8",
          600: "#5757c2",
          700: "#4c4ba3",
          800: "#403f85",
          900: "#36356b",
        },
        secondary: {
          50: "#fdfcf9",
          100: "#fbf8f0",
          200: "#f6f0e0",
          300: "#ede4c7",
          400: "#e1d5a8",
          500: "#bcb88f",
          600: "#a8a47b",
          700: "#8d8968",
          800: "#757158",
          900: "#5f5d4a",
        },
        accent: {
          50: "#f5f5f9",
          100: "#eaeaf2",
          200: "#d6d7e6",
          300: "#b8b9d3",
          400: "#9497bc",
          500: "#7678a8",
          600: "#636397",
          700: "#555587",
          800: "#484971",
          900: "#181854",
        },
      },
      animation: {
        "modal-pulse": "modalPulse 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "bounce-slow": "bounce 2s infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        float: "float 3s ease-in-out infinite",
        "winner-pulse": "winnerPulse 1.5s ease-in-out infinite",
      },
      keyframes: {
        modalPulse: {
          "0%, 100%": {
            transform: "scale(1)",
            borderColor: "#6161d8",
          },
          "50%": {
            transform: "scale(1.05)",
            borderColor: "#a195f8",
          },
        },
        glow: {
          "0%": {
            boxShadow: "0 0 5px #6161d8, 0 0 10px #6161d8, 0 0 15px #6161d8",
          },
          "100%": {
            boxShadow: "0 0 10px #a195f8, 0 0 20px #a195f8, 0 0 30px #a195f8",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        winnerPulse: {
          // ← Ajoute ça
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.7)",
          },
          "50%": {
            transform: "scale(1.08)",
            boxShadow: "0 0 0 15px rgba(34, 197, 94, 0)",
          },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
