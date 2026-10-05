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
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-light": "var(--surface-light)",
        "surface-hover": "var(--surface-hover)",
        hoop: {
          orange: "var(--hoop-orange)",
          glow: "var(--hoop-glow)",
          amber: "var(--hoop-amber)",
          yellow: "var(--hoop-yellow)",
        },
        victim: {
          red: "#EF4444",
          dark: "#7F1D1D",
        },
        champion: {
          gold: "var(--champion-gold)",
          glow: "#FDE047",
        },
      },
      animation: {
        "bounce-subtle": "bounce 1.5s infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        marquee: "marquee 22s linear infinite",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 15px rgba(255, 85, 0, 0.3)" },
          "100%": { boxShadow: "0 0 30px rgba(255, 85, 0, 0.7)" },
        },
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
