import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#4CAF50",
          deep: "#0F5132",
          mint: "#D4EDDA",
          canvas: "#F5F7FA",
          surface: "#FFFFFF",
        },
        ink: {
          900: "#0F172A",
          700: "#334155",
          500: "#64748B",
          300: "#94A3B8",
        },
        line: {
          200: "#E2E8F0",
          100: "#F1F5F9",
        },
        severity: {
          critical: "#B91C1C",
          high: "#C2410C",
          medium: "#A16207",
          low: "#0E7490",
        },
      },
      borderRadius: {
        card: "12px",
        button: "8px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.04)",
        focus: "0 0 0 3px rgba(15,81,50,0.2)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        display: ["Source Serif Pro", "Georgia", "serif"],
      },
      fontVariantNumeric: {
        tabular: "tabular-nums",
      },
    },
  },
  plugins: [],
};

export default config;
