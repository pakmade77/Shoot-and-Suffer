import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090D16",
        surface: "#121826",
        "surface-light": "#1A2234",
        "surface-hover": "#222D42",
        hoop: {
          orange: "#FF5500",
          glow: "#FF7700",
          amber: "#F59E0B",
          yellow: "#FBBF24",
        },
        victim: {
          red: "#EF4444",
          dark: "#7F1D1D",
        },
        champion: {
          gold: "#F59E0B",
          glow: "#FDE047",
        }
      },
      animation: {
        "bounce-subtle": "bounce 1.5s infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 15px rgba(255, 85, 0, 0.3)" },
          "100%": { boxShadow: "0 0 30px rgba(255, 85, 0, 0.7)" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
