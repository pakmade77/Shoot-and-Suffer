"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Play, Sparkles, RotateCcw, Zap } from "lucide-react";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { sounds } from "@/lib/sound";

export interface ShufflePlayer {
  id: string;
  name: string;
  nickname?: string | null;
  avatar?: string | null;
}

interface PlayerShuffleModalProps<T extends ShufflePlayer> {
  isOpen: boolean;
  players: T[];
  onConfirm: (shuffledPlayers: T[]) => void;
  onClose: () => void;
}

// Fisher-Yates True Shuffle
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function PlayerShuffleModal<T extends ShufflePlayer>({
  isOpen,
  players,
  onConfirm,
  onClose,
}: PlayerShuffleModalProps<T>) {
  const [isShuffling, setIsShuffling] = useState(true);
  const [displayList, setDisplayList] = useState<T[]>([]);
  const [countdown, setCountdown] = useState<number>(5);
  const [autoStartEnabled, setAutoStartEnabled] = useState<boolean>(true);

  const shuffleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const finalShuffledRef = useRef<T[]>([]);

  const startShuffleAnimation = useCallback(() => {
    setIsShuffling(true);
    setAutoStartEnabled(true);
    setCountdown(5);

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    let elapsed = 0;
    const duration = 2200; // 2.2 seconds shuffle
    const intervalTime = 70; // 70ms tick

    if (shuffleIntervalRef.current) {
      clearInterval(shuffleIntervalRef.current);
    }

    shuffleIntervalRef.current = setInterval(() => {
      elapsed += intervalTime;
      // Scramble for visual effect
      setDisplayList(shuffleArray(players));
      sounds.playShuffleTick();

      if (elapsed >= duration) {
        if (shuffleIntervalRef.current) {
          clearInterval(shuffleIntervalRef.current);
          shuffleIntervalRef.current = null;
        }

        // Final confirmed random order
        const finalOrder = shuffleArray(players);
        finalShuffledRef.current = finalOrder;
        setDisplayList(finalOrder);
        setIsShuffling(false);
        sounds.playDrawReveal();
      }
    }, intervalTime);
  }, [players]);

  // Start shuffle on modal open
  useEffect(() => {
    if (isOpen && players.length > 0) {
      startShuffleAnimation();
    }

    return () => {
      if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isOpen, players, startShuffleAnimation]);

  // Countdown timer after shuffle finishes
  useEffect(() => {
    if (!isShuffling && isOpen && autoStartEnabled) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            onConfirm(finalShuffledRef.current.length > 0 ? finalShuffledRef.current : displayList);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isShuffling, isOpen, autoStartEnabled, displayList, onConfirm]);

  if (!isOpen) return null;

  const handleManualStart = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    sounds.playBuzzer();
    onConfirm(finalShuffledRef.current.length > 0 ? finalShuffledRef.current : displayList);
  };

  const handleReshuffle = () => {
    setAutoStartEnabled(false);
    startShuffleAnimation();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* MODAL CARD */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-hoop-orange/40 bg-surface p-6 sm:p-8 shadow-2xl z-10"
      >
        {/* TOP GLOW BAR */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-hoop-orange via-champion-gold to-hoop-orange animate-pulse" />

        {/* HEADER */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-hoop-orange/15 px-3.5 py-1 text-xs font-black text-hoop-orange uppercase tracking-wider border border-hoop-orange/30">
            {isShuffling ? (
              <span className="flex items-center gap-1.5 animate-spin">
                <Shuffle className="w-3.5 h-3.5" />
              </span>
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-champion-gold" />
            )}
            {isShuffling ? "Drawing Shooting Order..." : "Lineup Confirmed!"}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            {isShuffling ? "🎲 SHUFFLING PLAYERS" : "🎯 SHOOTING LINEUP"}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            {isShuffling
              ? "Randomizing shooter rotation sequence..."
              : "Shooting order from first to last:"}
          </p>
        </div>

        {/* SHUFFLED PLAYER LIST */}
        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {displayList.map((player, idx) => {
              const isFirst = idx === 0;
              return (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className={`flex items-center justify-between rounded-2xl border p-3 transition-all ${
                    isFirst && !isShuffling
                      ? "border-hoop-orange bg-hoop-orange/15 shadow-md shadow-hoop-orange/20 ring-1 ring-hoop-orange/50"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* TURN RANK BADGE */}
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black flex-shrink-0 ${
                        isShuffling
                          ? "bg-white/10 text-gray-400"
                          : isFirst
                          ? "bg-hoop-orange text-white shadow-md"
                          : "bg-white/10 text-gray-300"
                      }`}
                    >
                      #{idx + 1}
                    </span>

                    <PlayerAvatar
                      avatar={player.avatar}
                      name={player.name}
                      size="sm"
                      className={isFirst && !isShuffling ? "ring-1 ring-hoop-orange" : ""}
                    />

                    <div className="min-w-0">
                      <p
                        className={`font-black text-sm truncate ${
                          isFirst && !isShuffling ? "text-hoop-orange" : "text-white"
                        }`}
                      >
                        {player.name}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {isFirst && !isShuffling
                          ? "🔥 Lead Shooter"
                          : player.nickname
                          ? `"${player.nickname}"`
                          : `Shooter #${idx + 1}`}
                      </p>
                    </div>
                  </div>

                  {!isShuffling && isFirst && (
                    <span className="flex-shrink-0 text-[10px] font-black uppercase tracking-wider bg-hoop-orange text-white px-2 py-0.5 rounded-md shadow">
                      LEAD
                    </span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* BOTTOM ACTION BAR & AUTO-START COUNTDOWN */}
        <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
          {!isShuffling && (
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Zap className="w-3.5 h-3.5 text-champion-gold" />
                {autoStartEnabled && countdown > 0
                  ? `Auto-starting in ${countdown}s...`
                  : "Ready for tip-off!"}
              </span>
              <button
                type="button"
                onClick={handleReshuffle}
                className="inline-flex items-center gap-1 text-hoop-amber hover:text-white font-bold transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Re-shuffle
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleReshuffle}
              disabled={isShuffling}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3 text-xs font-black uppercase tracking-wider text-gray-200 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4" />
              Shuffle Again
            </button>

            <button
              type="button"
              onClick={handleManualStart}
              disabled={isShuffling}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-hoop-orange to-hoop-amber py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-hoop-orange/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              Start Game!
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
