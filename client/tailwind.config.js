/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d5fe",
          300: "#a4b8fc",
          400: "#8b5cf6",
          500: "#7c3aed",
          600: "#6d28d9",
          700: "#5b21b6",
          800: "#4c1d95",
          900: "#3b0764",
        },
        secondary: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d5fe",
          300: "#a4b8fc",
          400: "#8093f8",
          500: "#667eea",
          600: "#5465d6",
          700: "#4650b5",
          800: "#3c4493",
          900: "#363e75",
        },
        /* ── Dark theme tokens ── */
        "dark-bg": "#0a0118",
        "dark-surface": "#160e35",
        "dark-card": "#1c1242",
        "dark-border": "rgba(255, 255, 255, 0.08)",
        "dark-hover": "rgba(139, 92, 246, 0.12)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        urdu: ["Noto Nastaliq Urdu", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 8s ease-in-out 2s infinite",
        "float-slow": "float 10s ease-in-out 1s infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        blob: "blob 7s infinite",
        "blob-delayed": "blob 7s infinite 2s",
        "blob-slow": "blob 10s infinite 4s",
        orbit: "orbit 20s linear infinite",
        "orbit-reverse": "orbit 25s linear infinite reverse",
        "gradient-x": "gradientX 6s ease infinite",
        "gradient-y": "gradientY 8s ease infinite",
        "spin-slow": "spin 8s linear infinite",
        "bounce-gentle": "bounceGentle 2s ease-in-out infinite",
        "scale-in": "scaleIn 0.5s ease-out",
        "slide-in-left": "slideInLeft 0.4s ease-out",
        "slide-in-right": "slideInRight 0.4s ease-out",
        marquee: "marquee 40s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-10px) rotate(1deg)" },
          "66%": { transform: "translateY(5px) rotate(-1deg)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateX(100px) rotate(0deg)" },
          "100%": {
            transform: "rotate(360deg) translateX(100px) rotate(-360deg)",
          },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        gradientY: {
          "0%, 100%": { backgroundPosition: "50% 0%" },
          "50%": { backgroundPosition: "50% 100%" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(139, 92, 246, 0.3)",
        "glow-lg": "0 0 40px rgba(139, 92, 246, 0.4)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.3)",
        "glow-primary": "0 0 30px rgba(139, 92, 246, 0.25)",
        "inner-glow": "inset 0 0 20px rgba(139, 92, 246, 0.1)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
