"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Flame, Play, Volume2, X } from "lucide-react";
import { sounds } from "@/lib/sound";

interface BasketballEntranceProps {
  onComplete?: () => void;
  autoCloseDuration?: number; // in ms (default 3200ms)
}

export function BasketballEntrance({
  onComplete,
  autoCloseDuration = 3600,
}: BasketballEntranceProps) {
  const [phase, setPhase] = useState<"drop" | "dunk" | "burst" | "ready">("drop");
  const [show, setShow] = useState<boolean>(true);

  const handleFinish = useCallback(() => {
    setShow(false);
    sounds.playClick();
    if (onComplete) onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Sound effect sequence
    const t0 = setTimeout(() => {
      sounds.playBounce(); // initial bounce sound
    }, 400);

    const t1 = setTimeout(() => {
      setPhase("dunk");
      sounds.playSwish(); // swish through the hoop!
    }, 900);

    const t2 = setTimeout(() => {
      setPhase("burst");
      sounds.playWhistle(); // referee whistle fanfare!
    }, 1400);

    const t3 = setTimeout(() => {
      setPhase("ready");
    }, 2000);

    // Auto complete after duration
    const tAuto = setTimeout(() => {
      handleFinish();
    }, autoCloseDuration);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(tAuto);
    };
  }, [autoCloseDuration, handleFinish]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0b0f19] via-[#05070c] to-[#000000]"
      >
        {/* BACKGROUND COURT & GLOW EFFECTS */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Stadium Spotlights */}
          <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-hoop-orange/20 blur-[120px] animate-pulse" />
          <div className="absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-hoop-amber/20 blur-[120px] animate-pulse" />

          {/* Neon Court Arc Line */}
          <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-t-full border-4 border-dashed border-hoop-orange/20" />
          <div className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 w-[320px] h-[180px] rounded-t-full border-2 border-white/10" />

          {/* Floating Embers */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(249,115,22,0.15),transparent_60%)]" />
        </div>

        {/* SKIP BUTTON */}
        <button
          type="button"
          onClick={handleFinish}
          className="absolute top-6 right-6 z-20 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-wider text-gray-300 backdrop-blur-md hover:bg-white/15 hover:text-white transition-all shadow-lg"
        >
          <span>Skip</span>
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto select-none">
          {/* BASKETBALL HOOP & BACKBOARD ANIMATION */}
          <div className="relative h-44 w-44 flex items-center justify-center mb-6">
            {/* Glow Backboard Frame */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="absolute -top-4 h-24 w-32 rounded-2xl border-2 border-white/20 bg-white/[0.03] backdrop-blur-sm shadow-2xl flex items-center justify-center"
            >
              <div className="h-10 w-14 rounded-lg border border-hoop-orange/60 bg-hoop-orange/10" />
            </motion.div>

            {/* Glowing Orange Rim */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="absolute top-16 h-4 w-20 rounded-full border-4 border-hoop-orange bg-hoop-orange/40 shadow-[0_0_25px_rgba(249,115,22,0.8)] z-20"
            />

            {/* Basketball Net Netting */}
            <motion.div
              animate={
                phase === "dunk" || phase === "burst"
                  ? { scaleY: [1, 1.4, 0.9, 1.1, 1], rotate: [0, -3, 3, 0] }
                  : { scaleY: 1 }
              }
              transition={{ duration: 0.5 }}
              className="absolute top-[76px] h-12 w-16 border-x-2 border-b-2 border-dashed border-white/40 rounded-b-xl [clip-path:polygon(10%_0%,90%_0%,75%_100%,25%_100%)] bg-white/5"
            />

            {/* SHOCKWAVE RING ON DUNK */}
            {(phase === "dunk" || phase === "burst" || phase === "ready") && (
              <motion.div
                initial={{ scale: 0.4, opacity: 0.9 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute top-16 h-20 w-20 rounded-full border-4 border-hoop-orange shadow-lg"
              />
            )}

            {/* THE BOUNCING & DUNKED BASKETBALL */}
            <motion.div
              initial={{ y: -260, scale: 0.7, rotate: 0 }}
              animate={
                phase === "drop"
                  ? {
                      y: [-260, 20, -60, 10, 0],
                      rotate: [0, 180, 360, 540, 720],
                      scale: [0.7, 1.2, 0.9, 1.05, 1],
                    }
                  : phase === "dunk"
                  ? {
                      y: [-80, 60],
                      rotate: [720, 1080],
                      scale: [1.3, 0.95],
                    }
                  : {
                      y: 70,
                      scale: 1,
                      rotate: 1080,
                    }
              }
              transition={{
                duration: phase === "drop" ? 0.9 : 0.4,
                ease: phase === "drop" ? "easeOut" : "easeInOut",
              }}
              className="relative z-10 text-6xl sm:text-7xl filter drop-shadow-[0_10px_25px_rgba(249,115,22,0.8)]"
            >
              🏀
            </motion.div>
          </div>

          {/* TITLE & LOGO REVEAL */}
          <motion.div
            initial={{ y: 25, opacity: 0, scale: 0.9 }}
            animate={
              phase === "burst" || phase === "ready"
                ? { y: 0, opacity: 1, scale: 1 }
                : { y: 25, opacity: 0, scale: 0.9 }
            }
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="space-y-3"
          >
            {/* League Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-hoop-orange/40 bg-gradient-to-r from-hoop-orange/20 via-amber-500/20 to-hoop-orange/20 px-4 py-1 text-xs font-black text-hoop-amber uppercase tracking-widest shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-hoop-amber animate-spin" />
              Coffee Break Basketball League
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              SHOOT <span className="text-transparent bg-clip-text bg-gradient-to-r from-hoop-orange via-hoop-amber to-champion-gold">&amp;</span> SUFFER
            </h1>

            {/* Slogan */}
            <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-black uppercase tracking-wider text-gray-300">
              <span className="text-white flex items-center gap-1">
                <Flame className="w-4 h-4 text-hoop-orange" /> SHOOT
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-hoop-amber flex items-center gap-1">
                <Zap className="w-4 h-4 text-hoop-amber" /> SCORE
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-rose-400 flex items-center gap-1">
                💀 SURVIVE
              </span>
            </div>
          </motion.div>

          {/* ACTION / ENTER BUTTON */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={
              phase === "ready"
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 20 }
            }
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mt-8 w-full max-w-xs space-y-3"
          >
            <button
              type="button"
              onClick={handleFinish}
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-hoop-orange via-hoop-amber to-champion-gold py-4 px-6 text-sm sm:text-base font-black uppercase tracking-wider text-white shadow-2xl shadow-hoop-orange/40 hover:scale-[1.03] active:scale-[0.97] transition-all group"
            >
              <Play className="w-4 h-4 fill-white group-hover:translate-x-0.5 transition-transform" />
              <span>ENTER ARENA 🏀</span>
            </button>

            {/* Auto progress bar */}
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: autoCloseDuration / 1000, ease: "linear" }}
                className="h-full bg-gradient-to-r from-hoop-orange to-hoop-amber"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
