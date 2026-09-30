/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          bg: "#0A0A0C",
          "bg-elevated": "#12141A",
          surface: "#111217",
          panel: "rgba(14, 15, 20, 0.75)",
          "panel-heavy": "rgba(10, 11, 15, 0.92)",
          border: "#1F222E",
          "border-subtle": "rgba(255, 255, 255, 0.08)",
          "border-acrylic": "rgba(255, 255, 255, 0.14)",
          text: "#E6E8EE",
          "text-muted": "#8A8F9E",
          "text-dim": "#575C6C",
          charcoal: "#16161A",
          graphite: "#1E2026",
        },
        accent: {
          DEFAULT: "#0078D4", // Microsoft Blue
          hover: "#1084DE",
          active: "#0063B1",
          muted: "rgba(0, 120, 212, 0.16)",
          border: "rgba(0, 120, 212, 0.45)",
          glow: "rgba(0, 120, 212, 0.35)",
        },
        warning: {
          DEFAULT: "#FFB900", // Amber
          hover: "#FFC526",
          active: "#DDA000",
          muted: "rgba(255, 185, 0, 0.16)",
          border: "rgba(255, 185, 0, 0.45)",
          glow: "rgba(255, 185, 0, 0.35)",
        },
        error: {
          DEFAULT: "#D13438", // Soft Red
          hover: "#E04347",
          active: "#B02327",
          muted: "rgba(209, 52, 56, 0.16)",
          border: "rgba(209, 52, 56, 0.45)",
          glow: "rgba(209, 52, 56, 0.35)",
        },
        nominal: {
          DEFAULT: "#107C41",
          bright: "#00CC6A",
          muted: "rgba(16, 124, 65, 0.16)",
        }
      },
      fontFamily: {
        sans: ["'Segoe UI'", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["'JetBrains Mono'", "Consolas", "'Segoe UI Mono'", "Menlo", "monospace"],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
        normal: "0em",
        wide: "0.04em",
        wider: "0.08em",
        widest: "0.15em",
        ultra: "0.25em",
      },
      borderRadius: {
        DEFAULT: "0px",
        sm: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        full: "0px",
      },
      boxShadow: {
        acrylic: "0 8px 32px 0 rgba(0, 0, 0, 0.55), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
        "acrylic-accent": "0 8px 32px 0 rgba(0, 120, 212, 0.2), inset 0 1px 0 0 rgba(0, 120, 212, 0.5)",
        "acrylic-warning": "0 8px 32px 0 rgba(255, 185, 0, 0.2), inset 0 1px 0 0 rgba(255, 185, 0, 0.5)",
        "acrylic-error": "0 8px 32px 0 rgba(209, 52, 56, 0.2), inset 0 1px 0 0 rgba(209, 52, 56, 0.5)",
        "glow-accent": "0 0 18px rgba(0, 120, 212, 0.45)",
        "glow-warning": "0 0 18px rgba(255, 185, 0, 0.45)",
        "glow-error": "0 0 18px rgba(209, 52, 56, 0.45)",
        "card-shadow": "0 14px 28px rgba(0,0,0,0.6), 0 10px 10px rgba(0,0,0,0.5)",
      },
      backdropBlur: {
        acrylic: "18px",
        "acrylic-sm": "8px",
        "acrylic-lg": "28px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scanline": "scanline 8s linear infinite",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        }
      }
    },
  },
  plugins: [],
}
