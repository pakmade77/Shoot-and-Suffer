"use client";

export type ThemeId = "streetball" | "cyberpunk" | "gold" | "emerald" | "miami";

export interface ThemeOption {
  id: ThemeId;
  name: string;
  subtitle: string;
  icon: string;
  previewColors: [string, string, string]; // [accentPrimary, accentSecondary, bg]
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "streetball",
    name: "Classic Streetball",
    subtitle: "Electric Orange & Amber",
    icon: "🏀",
    previewColors: ["#ff5500", "#f59e0b", "#090d16"],
    description: "The classic high-energy streetball court with blazing orange neon.",
  },
  {
    id: "cyberpunk",
    name: "Neon Cyberpunk",
    subtitle: "Cyan Laser & Magenta",
    icon: "⚡",
    previewColors: ["#00f0ff", "#f700ff", "#060814"],
    description: "Futuristic arcade synthwave with glowing electric cyan and neon violet.",
  },
  {
    id: "gold",
    name: "Midnight Champion",
    subtitle: "Black Velvet & 24K Gold",
    icon: "🏆",
    previewColors: ["#eab308", "#fbbf24", "#080808"],
    description: "NBA Finals luxury aesthetic with deep onyx and shimmering gold.",
  },
  {
    id: "emerald",
    name: "Emerald Arena",
    subtitle: "Celtics Green & Mint",
    icon: "🌿",
    previewColors: ["#10b981", "#34d399", "#06110d"],
    description: "Fresh and sleek stadium energy inspired by classic arena courts.",
  },
  {
    id: "miami",
    name: "Miami Vice Nights",
    subtitle: "Sunset Rose & Coral",
    icon: "🌴",
    previewColors: ["#f43f5e", "#fb923c", "#0a0b16"],
    description: "Retro tropical sunset with vibrant neon magenta, coral, and purple hues.",
  },
];

export function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "streetball";
  const stored = localStorage.getItem("shoot_suffer_theme") as ThemeId;
  if (stored && THEME_OPTIONS.some((t) => t.id === stored)) {
    return stored;
  }
  return "streetball";
}

export function applyTheme(themeId: ThemeId) {
  if (typeof window === "undefined") return;
  document.documentElement.setAttribute("data-theme", themeId);
  localStorage.setItem("shoot_suffer_theme", themeId);
}
