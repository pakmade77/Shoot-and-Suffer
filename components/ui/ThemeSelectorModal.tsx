"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check, Sparkles, X } from "lucide-react";
import { THEME_OPTIONS, ThemeId, applyTheme, getStoredTheme } from "@/lib/theme";
import { sounds } from "@/lib/sound";

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeSelectorModal({ isOpen, onClose }: ThemeSelectorModalProps) {
  const [activeTheme, setActiveTheme] = useState<ThemeId>("streetball");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const current = getStoredTheme();
      setActiveTheme(current);
      applyTheme(current);
    }
  }, []);

  const handleSelectTheme = (themeId: ThemeId) => {
    setActiveTheme(themeId);
    applyTheme(themeId);
    sounds.playClick();
    sounds.haptic("medium");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative z-10 w-full max-w-lg rounded-3xl border-2 border-white/10 bg-surface p-6 shadow-2xl space-y-5 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-hoop-orange/20 text-hoop-orange text-xl shadow-inner">
                🎨
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-white tracking-wide flex items-center gap-1.5">
                  <span>Pilih Tema Game</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Ubah palet visual, glow neon, dan aura arena game
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* THEMES LIST */}
          <div className="space-y-2.5">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = activeTheme === theme.id;
              return (
                <motion.button
                  key={theme.id}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`w-full flex items-center justify-between rounded-2xl p-4 text-left transition-all border ${
                    isSelected
                      ? "border-2 border-hoop-orange bg-white/[0.08] shadow-lg shadow-hoop-orange/15 ring-1 ring-hoop-orange/40"
                      : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-2xl">{theme.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black uppercase text-white tracking-wide">
                          {theme.name}
                        </p>
                        {isSelected && (
                          <span className="rounded-full bg-hoop-orange/20 border border-hoop-orange/40 px-2 py-0.2 text-[9px] font-black uppercase text-hoop-amber">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{theme.subtitle}</p>
                    </div>
                  </div>

                  {/* COLOR SWATCHES & CHECKMARK */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center -space-x-1.5">
                      {theme.previewColors.map((color, idx) => (
                        <span
                          key={idx}
                          style={{ backgroundColor: color }}
                          className="h-5 w-5 rounded-full border-2 border-surface shadow-md"
                        />
                      ))}
                    </div>

                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                        isSelected
                          ? "bg-hoop-orange text-white"
                          : "border border-white/20 bg-transparent text-transparent"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="border-t border-white/10 pt-3 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Tema otomatis tersimpan di perangkat ini.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-gradient-to-r from-hoop-orange to-hoop-amber px-5 py-2.5 text-xs font-black uppercase text-white shadow-md shadow-hoop-orange/20 hover:scale-105 active:scale-95 transition-all"
            >
              Gunakan Tema Ini 🏀
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
