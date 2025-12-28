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
        // Palette principale - Violet/Bleu
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
        // Palette secondaire - Or/Bronze
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
        // Palette accent - Bleu foncé
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
        // Couleurs modernes supplémentaires
        dark: {
          DEFAULT: "#0a0a0a",
          50: "#f5f5f5",
          100: "#e5e5e5",
          200: "#cccccc",
          300: "#b3b3b3",
          400: "#999999",
          500: "#808080",
          600: "#666666",
          700: "#4d4d4d",
          800: "#333333",
          900: "#1a1a1a",
          950: "#0a0a0a",
        },
      },
      backgroundImage: {
        // Gradients modernes
        "gradient-primary": "linear-gradient(135deg, #6161d8 0%, #a195f8 100%)",
        "gradient-secondary": "linear-gradient(135deg, #bcb88f 0%, #e1d5a8 100%)",
        "gradient-accent": "linear-gradient(135deg, #181854 0%, #636397 100%)",
        "gradient-gold": "linear-gradient(135deg, #bcb88f 0%, #ffd700 50%, #bcb88f 100%)",
        "gradient-purple-blue": "linear-gradient(135deg, #6161d8 0%, #181854 100%)",
        "gradient-mesh": "radial-gradient(at 40% 20%, #6161d8 0px, transparent 50%), radial-gradient(at 80% 0%, #bcb88f 0px, transparent 50%), radial-gradient(at 0% 50%, #181854 0px, transparent 50%), radial-gradient(at 80% 50%, #a195f8 0px, transparent 50%), radial-gradient(at 0% 100%, #e1d5a8 0px, transparent 50%), radial-gradient(at 80% 100%, #6161d8 0px, transparent 50%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        // Animations existantes
        "modal-pulse": "modalPulse 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "bounce-slow": "bounce 2s infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        float: "float 3s ease-in-out infinite",
        "winner-pulse": "winnerPulse 1.5s ease-in-out infinite",

        // Nouvelles animations modernes
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in-down": "fadeInDown 0.6s ease-out",
        "slide-in-right": "slideInRight 0.5s ease-out",
        "slide-in-left": "slideInLeft 0.5s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
        "gradient-shift": "gradientShift 8s ease infinite",
        "mesh-move": "meshMove 20s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "shine": "shine 2s linear infinite",
        "float-slow": "floatSlow 6s ease-in-out infinite",
      },
      keyframes: {
        // Keyframes existantes
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
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.7)",
          },
          "50%": {
            transform: "scale(1.08)",
            boxShadow: "0 0 0 15px rgba(34, 197, 94, 0)",
          },
        },

        // Nouvelles keyframes modernes
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeInDown: {
          "0%": {
            opacity: "0",
            transform: "translateY(-20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideInRight: {
          "0%": {
            opacity: "0",
            transform: "translateX(-30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        slideInLeft: {
          "0%": {
            opacity: "0",
            transform: "translateX(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        scaleIn: {
          "0%": {
            opacity: "0",
            transform: "scale(0.9)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        gradientShift: {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },
        meshMove: {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
        },
        glowPulse: {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(97, 97, 216, 0.3), 0 0 40px rgba(97, 97, 216, 0.1)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(161, 149, 248, 0.4), 0 0 80px rgba(161, 149, 248, 0.2)",
          },
        },
        shine: {
          "0%": {
            backgroundPosition: "-200% center",
          },
          "100%": {
            backgroundPosition: "200% center",
          },
        },
        floatSlow: {
          "0%, 100%": {
            transform: "translateY(0) translateX(0)",
          },
          "25%": {
            transform: "translateY(-20px) translateX(10px)",
          },
          "50%": {
            transform: "translateY(-10px) translateX(-10px)",
          },
          "75%": {
            transform: "translateY(-30px) translateX(5px)",
          },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glow-sm": "0 0 10px rgba(97, 97, 216, 0.3)",
        "glow-md": "0 0 20px rgba(97, 97, 216, 0.4), 0 0 40px rgba(97, 97, 216, 0.1)",
        "glow-lg": "0 0 30px rgba(97, 97, 216, 0.5), 0 0 60px rgba(97, 97, 216, 0.2)",
        "glow-gold": "0 0 20px rgba(188, 184, 143, 0.4), 0 0 40px rgba(188, 184, 143, 0.1)",
        "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        "glass-lg": "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
      },
    },
  },
  plugins: [],
};
