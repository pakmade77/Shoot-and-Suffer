"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Dumbbell, Play, UserPlus, Users, AlertTriangle, Shuffle } from "lucide-react";
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

  const punishmentOptions = [
    { amount: 5, label: "5 PUSH-UPS", tag: "Light Coffee", desc: "For casual morning warmup" },
    { amount: 10, label: "10 PUSH-UPS", tag: "Standard Tax", desc: "The office league classic", recommended: true },
    { amount: 15, label: "15 PUSH-UPS", tag: "Brutal Burn", desc: "High stakes, total arm trembling" },
  ];

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
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {punishmentOptions.map((opt) => {
            const isSelected = punishmentAmount === opt.amount;
            return (
              <motion.button
                key={opt.amount}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  sounds.playClick();
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
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-victim-red text-white"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {opt.tag}
                    </span>
                    {isSelected && <Dumbbell className="w-4 h-4 text-victim-red" />}
                  </div>
                  <p className="text-xl font-black uppercase tracking-tight text-white">
                    {opt.label}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{opt.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
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
