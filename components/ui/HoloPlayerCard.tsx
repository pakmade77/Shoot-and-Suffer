"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, Trophy, Flame, Dumbbell, Zap, Shield, Target } from "lucide-react";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { PlayerStats } from "@/lib/calculations";

interface HoloPlayerCardProps {
  stats: PlayerStats;
  compact?: boolean;
  className?: string;
}

export function calculateOVR(stats: PlayerStats): {
  ovr: number;
  tier: "diamond" | "gold" | "silver" | "bronze";
  archetype: string;
  subArchetype: string;
  sho: number;
  clu: number;
  fit: number;
  exp: number;
} {
  const sho = Math.round(stats.accuracy || 50);
  const clu = Math.round(stats.winRate || 50);
  const fit = Math.min(99, Math.round(50 + (stats.completedPushups || stats.totalPushups || 0) * 0.4));
  const exp = Math.min(99, Math.round(50 + (stats.totalGames || 0) * 2));

  // Weighted OVR formula
  const rawOVR = Math.round(sho * 0.45 + clu * 0.35 + exp * 0.1 + fit * 0.1);
  const ovr = Math.max(58, Math.min(99, rawOVR));

  let tier: "diamond" | "gold" | "silver" | "bronze" = "bronze";
  if (ovr >= 88) tier = "diamond";
  else if (ovr >= 78) tier = "gold";
  else if (ovr >= 68) tier = "silver";

  let archetype = "ROOKIE SHOOTER";
  let subArchetype = "Developing Talent";

  if (sho >= 80 && clu >= 75) {
    archetype = "ELITE SHARPSHOOTER";
    subArchetype = "Deadly from Distance";
  } else if (sho >= 70) {
    archetype = "BUCKET MACHINE";
    subArchetype = "Pure Scoring Threat";
  } else if (clu >= 75) {
    archetype = "CLUTCH SPECIALIST";
    subArchetype = "Ice in the Veins";
  } else if (stats.totalPushups >= 80) {
    archetype = "IRON GLADIATOR";
    subArchetype = "Fitness Tax Survivor";
  } else if (stats.totalGames >= 20) {
    archetype = "VETERAN PLAYMAKER";
    subArchetype = "Seasoned Court General";
  } else if (sho < 40) {
    archetype = "BRICK ARTISAN";
    subArchetype = "Building Modern Mansions";
  }

  return { ovr, tier, archetype, subArchetype, sho, clu, fit, exp };
}

export function HoloPlayerCard({ stats, compact = false, className = "" }: HoloPlayerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt animation coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), {
    damping: 18,
    stiffness: 220,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), {
    damping: 18,
    stiffness: 220,
  });
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const cardData = calculateOVR(stats);

  // Theme styling based on tier
  const tierThemes = {
    diamond: {
      border: "border-cyan-400/80 shadow-[0_0_35px_rgba(34,211,238,0.35)]",
      headerBg: "from-cyan-500/25 via-purple-500/20 to-pink-500/20",
      cardBg: "from-[#081528] via-[#0d1b33] to-[#040814]",
      badge: "bg-cyan-400/20 text-cyan-300 border-cyan-400/40",
      glow: "rgba(34,211,238,0.25)",
      textColor: "text-cyan-300",
      ovrColor: "text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300",
    },
    gold: {
      border: "border-champion-gold/80 shadow-[0_0_35px_rgba(234,179,8,0.35)]",
      headerBg: "from-champion-gold/25 via-amber-500/20 to-orange-500/20",
      cardBg: "from-[#1a1405] via-[#241a06] to-[#0b0802]",
      badge: "bg-champion-gold/20 text-champion-gold border-champion-gold/40",
      glow: "rgba(234,179,8,0.25)",
      textColor: "text-champion-gold",
      ovrColor: "text-transparent bg-clip-text bg-gradient-to-r from-champion-gold via-amber-200 to-yellow-400",
    },
    silver: {
      border: "border-slate-300/80 shadow-[0_0_30px_rgba(203,213,225,0.25)]",
      headerBg: "from-slate-400/20 via-zinc-400/15 to-gray-500/20",
      cardBg: "from-[#111827] via-[#1a2336] to-[#0a0e17]",
      badge: "bg-slate-300/20 text-slate-200 border-slate-300/40",
      glow: "rgba(203,213,225,0.2)",
      textColor: "text-slate-200",
      ovrColor: "text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-white to-gray-300",
    },
    bronze: {
      border: "border-amber-700/80 shadow-[0_0_25px_rgba(180,83,9,0.25)]",
      headerBg: "from-amber-800/25 via-amber-700/20 to-stone-800/20",
      cardBg: "from-[#18110a] via-[#21160d] to-[#0d0905]",
      badge: "bg-amber-700/20 text-amber-300 border-amber-700/40",
      glow: "rgba(180,83,9,0.2)",
      textColor: "text-amber-400",
      ovrColor: "text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-600",
    },
  };

  const theme = tierThemes[cardData.tier];

  return (
    <div
      style={{ perspective: 1100 }}
      className={`inline-block select-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={cardRef}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`relative overflow-hidden rounded-3xl border-2 ${theme.border} bg-gradient-to-b ${theme.cardBg} p-5 sm:p-6 transition-shadow backdrop-blur-xl ${
          compact ? "w-[270px]" : "w-[300px] sm:w-[330px]"
        }`}
      >
        {/* HOLOGRAPHIC PRISMATIC RAINBOW SHEEN LAYER */}
        <motion.div
          style={{
            background: isHovered
              ? "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,100,200,0.18) 25%, rgba(100,220,255,0.2) 50%, rgba(255,230,100,0.18) 75%, rgba(255,255,255,0.15) 100%)"
              : "none",
            mixBlendMode: "color-dodge",
          }}
          className="absolute inset-0 z-20 pointer-events-none opacity-80 transition-opacity duration-300"
        />

        {/* GLOSS REFLECTION GLARE */}
        <motion.div
          style={{
            background: isHovered
              ? `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.35) 0%, transparent 60%)`
              : "none",
          }}
          className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-200"
        />

        {/* CARD TOP BANNER */}
        <div className="relative z-10 flex items-start justify-between gap-3 mb-3 border-b border-white/10 pb-3">
          {/* OVR RATING BADGE */}
          <div className="flex flex-col items-start">
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl sm:text-5xl font-black tracking-tighter ${theme.ovrColor}`}>
                {cardData.ovr}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                OVR
              </span>
            </div>
            <span
              className={`mt-0.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${theme.badge}`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              {cardData.tier}
            </span>
          </div>

          {/* LEAGUE BRAND */}
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-widest text-hoop-amber flex items-center justify-end gap-1">
              <span>☕ SS LEAGUE</span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">
              SEASON 2026
            </p>
          </div>
        </div>

        {/* PLAYER AVATAR & NAMEPLATE */}
        <div className="relative z-10 flex flex-col items-center text-center my-3">
          <div className="relative mb-3">
            <div
              style={{
                boxShadow: `0 0 30px ${theme.glow}`,
              }}
              className="rounded-full p-1"
            >
              <PlayerAvatar
                avatar={stats.avatar}
                name={stats.name}
                size="xl"
                ring
                className="ring-2 ring-white/30"
              />
            </div>
            {/* Status Fire / Shield Icon */}
            {cardData.clu >= 75 && (
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-hoop-orange to-hoop-amber text-xs text-white shadow-lg animate-pulse">
                🔥
              </div>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white truncate max-w-full">
            {stats.name}
          </h3>

          {stats.nickname ? (
            <p className={`text-xs font-black uppercase tracking-wider ${theme.textColor} mt-0.5`}>
              &quot;{stats.nickname}&quot;
            </p>
          ) : (
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-0.5">
              Official Sufferer
            </p>
          )}

          {/* ARCHETYPE BADGE */}
          <div className="mt-2 inline-flex flex-col items-center">
            <span className="rounded-lg bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white border border-white/15">
              ⚡ {cardData.archetype}
            </span>
            <span className="text-[10px] text-gray-400 italic mt-0.5">
              {cardData.subArchetype}
            </span>
          </div>
        </div>

        {/* 4 CORE METRIC BARS */}
        <div className="relative z-10 mt-4 grid grid-cols-4 gap-1.5 rounded-2xl border border-white/10 bg-black/40 p-2.5 backdrop-blur-md">
          <div className="text-center">
            <p className="text-[9px] font-black uppercase text-gray-400">SHO</p>
            <p className="text-sm font-black text-emerald-400">{cardData.sho}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black uppercase text-gray-400">CLU</p>
            <p className="text-sm font-black text-champion-gold">{cardData.clu}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black uppercase text-gray-400">FIT</p>
            <p className="text-sm font-black text-rose-400">{cardData.fit}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black uppercase text-gray-400">EXP</p>
            <p className="text-sm font-black text-hoop-amber">{cardData.exp}</p>
          </div>
        </div>

        {/* BOTTOM STATS MINI BAR */}
        <div className="relative z-10 mt-3 flex items-center justify-between text-[10px] text-gray-400 font-bold px-1">
          <span>🏆 {stats.wins}W - {stats.losses}L</span>
          <span>🎯 {stats.totalHits}/{stats.totalShots} Shots</span>
          <span>💪 {stats.totalPushups} Push-ups</span>
        </div>
      </motion.div>
    </div>
  );
}
