"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Dumbbell,
  UserPlus,
  Users,
  AlertTriangle,
  Shuffle,
  Sliders,
  Plus,
  Minus,
} from "lucide-react";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { PlayerShuffleModal } from "@/components/game/PlayerShuffleModal";
import { sounds } from "@/lib/sound";
import Link from "next/link";

interface Player {
  id: string;
  name: string;
  nickname: string | null;
  avatar: string | null;
  active: boolean;
  totalGames: number;
}

export default function NewGamePage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [punishmentAmount, setPunishmentAmount] = useState<number>(10);
  const [isCustomPunishment, setIsCustomPunishment] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<number>(20);
  const [shootingMode, setShootingMode] = useState<"round_by_round" | "consecutive">("round_by_round");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShuffleModalOpen, setIsShuffleModalOpen] = useState(false);

  useEffect(() => {
    async function loadPlayers() {
      try {
        setLoading(true);
        const res = await fetch("/api/players");
        if (res.ok) {
          const data = await res.json();
          setPlayers(data.filter((p: Player) => p.active));
        }
      } catch (err) {
        console.error("Failed to load players", err);
        setError("Failed to load active players.");
      } finally {
        setLoading(false);
      }
    }
    loadPlayers();

    // Load default punishment from settings
    const storedPunishment = localStorage.getItem("shoot_suffer_default_punishment");
    if (storedPunishment) {
      const parsed = parseInt(storedPunishment, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setPunishmentAmount(parsed);
        if (![5, 10, 15].includes(parsed)) {
          setCustomAmount(parsed);
          setIsCustomPunishment(true);
        }
      }
    }
  }, []);

  const togglePlayer = (id: string) => {
    sounds.playClick();
    setError(null);
    setSelectedPlayerIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((pId) => pId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    sounds.playClick();
    setError(null);
    setSelectedPlayerIds(players.map((p) => p.id));
  };

  const handleClearAll = () => {
    sounds.playClick();
    setError(null);
    setSelectedPlayerIds([]);
  };

  const handleCustomAmountChange = (val: number) => {
    const clamped = Math.max(1, Math.min(200, isNaN(val) ? 1 : val));
    setCustomAmount(clamped);
    setPunishmentAmount(clamped);
  };

  const handleStartGame = () => {
    if (selectedPlayerIds.length < 1) {
      setError("Please select at least 1 player to start the game.");
      return;
    }

    sounds.playClick();
    setIsShuffleModalOpen(true);
  };

  const handleConfirmShuffledGame = (shuffledPlayers: Player[]) => {
    sessionStorage.setItem(
      "current_game_setup",
      JSON.stringify({
        players: shuffledPlayers,
        punishmentAmount,
        shootingMode,
      })
    );

    router.push("/game/play");
  };

  const punishmentPresets = [
    { amount: 5, label: "5 PUSH-UPS", tag: "Light Coffee", desc: "For casual morning warmup" },
    { amount: 10, label: "10 PUSH-UPS", tag: "Standard Tax", desc: "The office league classic" },
    { amount: 15, label: "15 PUSH-UPS", tag: "Brutal Burn", desc: "High stakes, total arm trembling" },
  ];

  const getIntensityInfo = (amount: number) => {
    if (amount < 5) {
      return {
        tag: "Gentle Warmup ☕",
        desc: "Easy breezy morning stretch",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      };
    }
    if (amount <= 10) {
      return {
        tag: "Standard Stakes 🏀",
        desc: "Classic office league punishment",
        color: "text-hoop-amber bg-hoop-amber/10 border-hoop-amber/30",
      };
    }
    if (amount <= 20) {
      return {
        tag: "Spicy Burn 🔥",
        desc: "Serious arm trembling ahead",
        color: "text-hoop-orange bg-hoop-orange/10 border-hoop-orange/30",
      };
    }
    if (amount <= 40) {
      return {
        tag: "Extreme Suffer 💀",
        desc: "High pain, tears guaranteed",
        color: "text-victim-red bg-victim-red/10 border-victim-red/30",
      };
    }
    return {
      tag: "Hospital Mode 🚑💥",
      desc: "Total muscular failure incoming",
      color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    };
  };

  const currentIntensity = getIntensityInfo(punishmentAmount);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white flex items-center justify-center gap-3">
          <span>🏀</span> NEW GAME SETUP
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          Assemble the squad, pick your stakes, and prepare to shoot.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300 flex items-center gap-3 text-sm font-semibold">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: SELECT PLAYERS */}
      <section className="rounded-3xl border border-white/10 bg-surface/80 p-6 sm:p-8 backdrop-blur-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hoop-orange/20 text-hoop-orange font-black text-sm">
              1
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-white tracking-wide">
                Select Players
              </h2>
              <p className="text-xs text-gray-400">Play solo, duel 1v1, or with any squad size</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 mr-1">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-bold text-hoop-amber hover:text-white px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 transition-colors"
              >
                Select All ({players.length})
              </button>
              {selectedPlayerIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] font-bold text-gray-400 hover:text-rose-300 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-black tracking-wide uppercase ${
                selectedPlayerIds.length >= 1
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {selectedPlayerIds.length} {selectedPlayerIds.length === 1 ? "Player" : "Players"} Selected
            </span>
            <Link
              href="/players"
              className="inline-flex items-center gap-1 text-xs font-bold text-hoop-orange hover:text-hoop-amber p-1"
              title="Add New Player"
            >
              <UserPlus className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading active players...</div>
        ) : players.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center space-y-3">
            <Users className="w-10 h-10 text-gray-500 mx-auto" />
            <p className="text-sm font-semibold text-gray-300">
              No players found in the database.
            </p>
            <Link
              href="/players"
              className="inline-flex items-center gap-2 rounded-xl bg-hoop-orange px-4 py-2.5 text-xs font-bold text-white uppercase tracking-wider shadow-lg shadow-hoop-orange/30"
            >
              <UserPlus className="w-4 h-4" />
              Create Players
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {players.map((player) => {
              const isSelected = selectedPlayerIds.includes(player.id);
              return (
                <motion.button
                  key={player.id}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => togglePlayer(player.id)}
                  className={`flex items-center gap-3.5 rounded-2xl p-3.5 text-left transition-all ${
                    isSelected
                      ? "border-2 border-hoop-orange bg-hoop-orange/15 shadow-md shadow-hoop-orange/15"
                      : "border border-white/5 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <PlayerAvatar avatar={player.avatar} name={player.name} size="md" />
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-hoop-orange text-white text-[10px] shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-white truncate">{player.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {player.nickname ? `"${player.nickname}"` : `${player.totalGames} games`}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </section>

      {/* STEP 2: SELECT PUNISHMENT */}
      <section className="rounded-3xl border border-white/10 bg-surface/80 p-6 sm:p-8 backdrop-blur-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-victim-red/20 text-victim-red font-black text-sm">
              2
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-white tracking-wide">
                Select Punishment
              </h2>
              <p className="text-xs text-gray-400">Loser(s) with the lowest score will pay this push-up tax</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full px-3 py-1 text-xs font-black tracking-wide uppercase bg-victim-red/20 text-victim-red border border-victim-red/30 flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5" />
              {punishmentAmount} Push-ups
            </span>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {punishmentPresets.map((opt) => {
            const isSelected = !isCustomPunishment && punishmentAmount === opt.amount;
            return (
              <motion.button
                key={opt.amount}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  sounds.playClick();
                  setIsCustomPunishment(false);
                  setPunishmentAmount(opt.amount);
                }}
                className={`relative flex flex-col justify-between rounded-2xl p-4 text-left transition-all ${
                  isSelected
                    ? "border-2 border-victim-red bg-victim-red/15 shadow-lg shadow-victim-red/20 ring-1 ring-victim-red/40"
                    : "border border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-victim-red text-white"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {opt.tag}
                    </span>
                    {isSelected && <Dumbbell className="w-4 h-4 text-victim-red flex-shrink-0" />}
                  </div>
                  <p className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                    {opt.label}
                  </p>
                  <p className="mt-1 text-[11px] sm:text-xs text-gray-400 leading-snug">{opt.desc}</p>
                </div>
              </motion.button>
            );
          })}

          {/* CUSTOM CARD */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              sounds.playClick();
              setIsCustomPunishment(true);
              setPunishmentAmount(customAmount);
            }}
            className={`relative flex flex-col justify-between rounded-2xl p-4 text-left transition-all ${
              isCustomPunishment
                ? "border-2 border-victim-red bg-victim-red/15 shadow-lg shadow-victim-red/20 ring-1 ring-victim-red/40"
                : "border border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isCustomPunishment
                      ? "bg-victim-red text-white"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  Custom
                </span>
                <Sliders className={`w-4 h-4 flex-shrink-0 ${isCustomPunishment ? "text-victim-red" : "text-gray-400"}`} />
              </div>
              <p className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                {isCustomPunishment ? `${customAmount} PUSH-UPS` : "CUSTOM"}
              </p>
              <p className="mt-1 text-[11px] sm:text-xs text-gray-400 leading-snug">
                Set any custom amount
              </p>
            </div>
          </motion.button>
        </div>

        {/* CUSTOM CONTROLLER PANEL */}
        <AnimatePresence>
          {isCustomPunishment && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-victim-red/30 bg-victim-red/10 p-4 sm:p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-victim-red flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    Configure Custom Push-up Tax
                  </h3>
                  <p className="text-[11px] text-gray-300 mt-0.5">
                    Adjust push-ups from 1 to 200 using steppers or direct input
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 self-start sm:self-auto ${currentIntensity.color}`}
                >
                  <span>{currentIntensity.tag}</span>
                  <span className="text-[10px] opacity-80">({currentIntensity.desc})</span>
                </div>
              </div>

              {/* Stepper + Input */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                <button
                  type="button"
                  onClick={() => handleCustomAmountChange(customAmount - 5)}
                  className="h-11 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-black text-gray-200 active:scale-95 transition-all"
                  title="-5 Push-ups"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => handleCustomAmountChange(customAmount - 1)}
                  className="h-11 w-11 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 active:scale-95 transition-all"
                  title="-1 Push-up"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="relative flex flex-col items-center">
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(parseInt(e.target.value, 10))}
                    className="h-12 w-28 text-center text-2xl font-black text-white bg-black/50 border-2 border-victim-red/60 rounded-2xl focus:border-victim-red focus:outline-none focus:ring-2 focus:ring-victim-red/30 shadow-inner"
                  />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                    Push-ups
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCustomAmountChange(customAmount + 1)}
                  className="h-11 w-11 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 active:scale-95 transition-all"
                  title="+1 Push-up"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleCustomAmountChange(customAmount + 5)}
                  className="h-11 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-black text-gray-200 active:scale-95 transition-all"
                  title="+5 Push-ups"
                >
                  +5
                </button>
              </div>

              {/* Quick Presets */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-center gap-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Quick Picks:</span>
                {[20, 25, 30, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleCustomAmountChange(preset)}
                    className={`px-3 py-1 rounded-xl text-xs font-black uppercase transition-all ${
                      customAmount === preset
                        ? "bg-victim-red text-white shadow-md shadow-victim-red/30"
                        : "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {preset}x
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* STEP 3: SELECT SHOOTING STYLE */}
      <section className="rounded-3xl border border-white/10 bg-surface/80 p-6 sm:p-8 backdrop-blur-md space-y-5">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hoop-amber/20 text-hoop-amber font-black text-sm">
            3
          </div>
          <div>
            <h2 className="text-lg font-black uppercase text-white tracking-wide">
              Select Shooting Format
            </h2>
            <p className="text-xs text-gray-400">Choose how players take their turns at the hoop</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* OPTION 1: ROUND BY ROUND */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              sounds.playClick();
              setShootingMode("round_by_round");
            }}
            className={`relative flex flex-col justify-between rounded-2xl p-4 text-left transition-all ${
              shootingMode === "round_by_round"
                ? "border-2 border-hoop-orange bg-hoop-orange/15 shadow-lg shadow-hoop-orange/20 ring-1 ring-hoop-orange/40"
                : "border border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    shootingMode === "round_by_round"
                      ? "bg-hoop-orange text-white"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  🔄 Recommended • High Drama
                </span>
                <span className="text-xl">🔥</span>
              </div>
              <p className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                Round-Robin (1 Shot per Turn)
              </p>
              <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                All players take 1 shot in Round 1, then rotate for Round 2 and Round 3. Classic, suspenseful, and high energy!
              </p>
            </div>
          </motion.button>

          {/* OPTION 2: ALL AT ONCE */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              sounds.playClick();
              setShootingMode("consecutive");
            }}
            className={`relative flex flex-col justify-between rounded-2xl p-4 text-left transition-all ${
              shootingMode === "consecutive"
                ? "border-2 border-hoop-amber bg-hoop-amber/15 shadow-lg shadow-hoop-amber/20 ring-1 ring-hoop-amber/40"
                : "border border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    shootingMode === "consecutive"
                      ? "bg-hoop-amber text-black"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  ⚡ Fast &amp; Direct
                </span>
                <span className="text-xl">🏀</span>
              </div>
              <p className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                Consecutive (3 Shots in a Row)
              </p>
              <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                Each player takes all 3 shots consecutively before passing the ball to the next player. Fast &amp; efficient.
              </p>
            </div>
          </motion.button>
        </div>
      </section>

      {/* STEP 4: START GAME BUTTON */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleStartGame}
          disabled={selectedPlayerIds.length < 1}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-hoop-orange via-hoop-glow to-hoop-amber p-4 text-base sm:text-lg font-black uppercase tracking-wider text-white shadow-xl shadow-hoop-orange/30 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
        >
          <Shuffle className="w-5 h-5" />
          START GAME &amp; SHUFFLE LINEUP ({selectedPlayerIds.length} SHOOTERS)
        </button>
      </div>

      {/* RANDOM ORDER SHUFFLE MODAL */}
      <PlayerShuffleModal
        isOpen={isShuffleModalOpen}
        players={players.filter((p) => selectedPlayerIds.includes(p.id))}
        onConfirm={handleConfirmShuffledGame}
        onClose={() => setIsShuffleModalOpen(false)}
      />
    </div>
  );
}
