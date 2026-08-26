"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { sounds } from "@/lib/sound";

interface ShotButtonProps {
  shotNumber: number;
  value: boolean | null; // null: not selected, true: HIT, false: MISS
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ShotButton({ shotNumber, value, onChange, disabled }: ShotButtonProps) {
  const handleHit = () => {
    if (disabled) return;
    sounds.playSwish();
    onChange(true);
  };

  const handleMiss = () => {
    if (disabled) return;
    sounds.playBrick();
    onChange(false);
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-surface/80 p-3.5 sm:p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-black uppercase tracking-wider text-gray-400">
          Shot {shotNumber}
        </span>
        {value === true && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xs font-black text-emerald-400 flex items-center gap-1 uppercase tracking-wide"
          >
            🏀 SWISH! (+1)
          </motion.span>
        )}
        {value === false && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xs font-black text-rose-400 flex items-center gap-1 uppercase tracking-wide"
          >
            🧱 BRICK! (0)
          </motion.span>
        )}
        {value === null && (
          <span className="text-xs text-gray-500 font-medium">Select result</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* HIT BUTTON */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={handleHit}
          disabled={disabled}
          className={`flex min-h-[56px] items-center justify-center gap-2 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${
            value === true
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-300"
              : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 active:bg-emerald-500/30"
          }`}
        >
          <span className="text-lg">🏀</span>
          <span>HIT</span>
          {value === true && <Check className="w-4 h-4 ml-1 stroke-[3]" />}
        </motion.button>

        {/* MISS BUTTON */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={handleMiss}
          disabled={disabled}
          className={`flex min-h-[56px] items-center justify-center gap-2 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${
            value === false
              ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-400"
              : "border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 active:bg-rose-500/30"
          }`}
        >
          <span className="text-lg">🧱</span>
          <span>MISS</span>
          {value === false && <X className="w-4 h-4 ml-1 stroke-[3]" />}
        </motion.button>
      </div>
    </div>
  );
}
