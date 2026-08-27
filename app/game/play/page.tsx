"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Trophy,
  AlertCircle,
  ChevronLeft,
  RefreshCw,
  Zap,
  Check,
  X,
  Flame,
  Dumbbell,
  Users,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { ShotButton } from "@/components/game/ShotButton";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { sounds } from "@/lib/sound";

interface PlayerSetup {
  id: string;
  name: string;
  nickname: string | null;
  avatar: string | null;
}

interface PlayerShotState {
  playerId: string;
  shot1: boolean | null;
  shot2: boolean | null;
  shot3: boolean | null;
}

export default function PlayGamePage() {
  const router = useRouter();
  const [players, setPlayers] = useState<PlayerSetup[]>([]);
  const [punishmentAmount, setPunishmentAmount] = useState<number>(10);
  const [shootingMode, setShootingMode] = useState<"round_by_round" | "consecutive">("round_by_round");

  // In Consecutive mode: index of active player
  const [playerIndex, setPlayerIndex] = useState<number>(0);

  // In Round-by-Round mode: active round (1, 2, 3) and active player within that round
  const [currentRound, setCurrentRound] = useState<1 | 2 | 3>(1);
  const [roundPlayerIndex, setRoundPlayerIndex] = useState<number>(0);

  const [playerShots, setPlayerShots] = useState<PlayerShotState[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- SUDDEN DEATH STATES ---
  const [isSuddenDeath, setIsSuddenDeath] = useState<boolean>(false);
  const [suddenDeathRound, setSuddenDeathRound] = useState<number>(1);
  const [suddenDeathPlayerIndex, setSuddenDeathPlayerIndex] = useState<number>(0);
  const [suddenDeathShots, setSuddenDeathShots] = useState<Record<string, boolean | null>>({});
  const [showSuddenDeathModal, setShowSuddenDeathModal] = useState<boolean>(false);
  const [suddenDeathAlertMessage, setSuddenDeathAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("current_game_setup");
    if (!raw) {
      router.replace("/game/new");
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed.players || parsed.players.length < 1) {
        router.replace("/game/new");
        return;
      }
      setPlayers(parsed.players);
      setPunishmentAmount(parsed.punishmentAmount || 10);
      if (parsed.shootingMode === "consecutive" || parsed.shootingMode === "round_by_round") {
        setShootingMode(parsed.shootingMode);
      }
      setPlayerShots(
        parsed.players.map((p: PlayerSetup) => ({
          playerId: p.id,
          shot1: null,
          shot2: null,
          shot3: null,
        }))
      );
    } catch {
      router.replace("/game/new");
    }
  }, [router]);

  if (players.length === 0 || playerShots.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Loading game session...
      </div>
    );
  }

  // Active shooter based on mode
  const activeIndex = isSuddenDeath
    ? suddenDeathPlayerIndex
    : shootingMode === "round_by_round"
    ? roundPlayerIndex
    : playerIndex;

  const currentPlayer = players[activeIndex];
  const currentShots = playerShots[activeIndex];

  // Shot value for active turn in Round-by-Round mode
  const activeRoundShotKey = `shot${currentRound}` as "shot1" | "shot2" | "shot3";
  const activeRoundShotValue = currentShots ? currentShots[activeRoundShotKey] : null;

  // Shot value in Sudden Death mode
  const activeSuddenDeathShotValue = currentPlayer
    ? suddenDeathShots[currentPlayer.id] ?? null
    : null;

  const handleShotChange = (shotKey: "shot1" | "shot2" | "shot3", value: boolean) => {
    setError(null);
    setPlayerShots((prev) => {
      const copy = [...prev];
      copy[activeIndex] = {
        ...copy[activeIndex],
        [shotKey]: value,
      };
      return copy;
    });
  };

  const handleSuddenDeathShotChange = (value: boolean) => {
    if (!currentPlayer) return;
    setError(null);
    setSuddenDeathAlertMessage(null);
    setSuddenDeathShots((prev) => ({
      ...prev,
      [currentPlayer.id]: value,
    }));
  };

  // Consecutive mode completion check
  const isConsecutiveComplete =
    currentShots &&
    currentShots.shot1 !== null &&
    currentShots.shot2 !== null &&
    currentShots.shot3 !== null;

  // Round-by-round mode single shot completion check
  const isRoundShotComplete = activeRoundShotValue !== null;

  // Sudden Death single shot completion check
  const isSuddenDeathShotComplete = activeSuddenDeathShotValue !== null;

  // Total completed shots in whole regular game
  const totalCompletedShots = playerShots.reduce((acc, p) => {
    return (
      acc +
      (p.shot1 !== null ? 1 : 0) +
      (p.shot2 !== null ? 1 : 0) +
      (p.shot3 !== null ? 1 : 0)
    );
  }, 0);
  const maxPossibleShots = players.length * 3;

  // Check if all regular shots resulted in 0-0 tie across all players
  const checkCompletionOrSuddenDeath = async () => {
    const maxScore = playerShots.reduce((max, ps) => {
      const score = (ps.shot1 ? 1 : 0) + (ps.shot2 ? 1 : 0) + (ps.shot3 ? 1 : 0);
      return Math.max(max, score);
    }, 0);

    // If NO ONE scored a single point (everyone 0/3) -> TRIGGER SUDDEN DEATH!
    if (maxScore === 0) {
      sounds.playBuzzer();
      setIsSuddenDeath(true);
      setSuddenDeathRound(1);
      setSuddenDeathPlayerIndex(0);
      const initialSdShots: Record<string, boolean | null> = {};
      players.forEach((p) => {
        initialSdShots[p.id] = null;
      });
      setSuddenDeathShots(initialSdShots);
      setShowSuddenDeathModal(true);
    } else {
      // Normal completion
      await submitGame();
    }
  };

  // --- NAVIGATION FOR CONSECUTIVE MODE ---
  const handleConsecutiveNext = async () => {
    if (!isConsecutiveComplete) {
      setError("Please record all 3 shots for this player before proceeding.");
      return;
    }

    if (playerIndex < players.length - 1) {
      sounds.playClick();
      setPlayerIndex((prev) => prev + 1);
    } else {
      await checkCompletionOrSuddenDeath();
    }
  };

  const handleConsecutivePrev = () => {
    if (playerIndex > 0) {
      sounds.playClick();
      setPlayerIndex((prev) => prev - 1);
    }
  };

  // --- NAVIGATION FOR ROUND-BY-ROUND MODE ---
  const handleRoundNext = async () => {
    if (!isRoundShotComplete) {
      setError(`Record the result for Round ${currentRound} before proceeding.`);
      return;
    }

    if (roundPlayerIndex < players.length - 1) {
      sounds.playClick();
      setRoundPlayerIndex((prev) => prev + 1);
    } else if (currentRound < 3) {
      sounds.playBuzzer();
      setCurrentRound((prev) => (prev + 1) as 1 | 2 | 3);
      setRoundPlayerIndex(0);
    } else {
      await checkCompletionOrSuddenDeath();
    }
  };

  const handleRoundPrev = () => {
    if (roundPlayerIndex > 0) {
      sounds.playClick();
      setRoundPlayerIndex((prev) => prev - 1);
    } else if (currentRound > 1) {
      sounds.playClick();
      setCurrentRound((prev) => (prev - 1) as 1 | 2 | 3);
      setRoundPlayerIndex(players.length - 1);
    }
  };

  // --- NAVIGATION FOR SUDDEN DEATH MODE ---
  const handleSuddenDeathNext = async () => {
    if (!isSuddenDeathShotComplete) {
      setError(`Tentukan hasil tembakan untuk ${currentPlayer.name} sebelum lanjut.`);
      return;
    }

    if (suddenDeathPlayerIndex < players.length - 1) {
      sounds.playClick();
      setSuddenDeathPlayerIndex((prev) => prev + 1);
    } else {
      // Evaluate Sudden Death Round
      const makes = players.filter((p) => suddenDeathShots[p.id] === true);
      const misses = players.filter((p) => suddenDeathShots[p.id] === false);

      if (makes.length === 0) {
        // All players missed in this sudden death round -> Add another round!
        sounds.playBrick();
        setSuddenDeathAlertMessage(
          `🧱 SEMUA SHOOTER MISS LAGI DI SUDDEN DEATH ROUND ${suddenDeathRound}! Otomatis lanjut ke Putaran Tambahan Round ${suddenDeathRound + 1}...`
        );
        setSuddenDeathRound((prev) => prev + 1);
        setSuddenDeathPlayerIndex(0);
        const nextSdShots: Record<string, boolean | null> = {};
        players.forEach((p) => {
          nextSdShots[p.id] = null;
        });
        setSuddenDeathShots(nextSdShots);
      } else if (misses.length === 0) {
        // All players made it in this sudden death round -> Add another round!
        sounds.playSwish();
        setSuddenDeathAlertMessage(
          `🏀 SEMUA SHOOTER BERHASIL MASUKKAN BOLA DI ROUND ${suddenDeathRound}! Imbang lagi, lanjut ke Putaran Tambahan Round ${suddenDeathRound + 1}...`
        );
        setSuddenDeathRound((prev) => prev + 1);
        setSuddenDeathPlayerIndex(0);
        const nextSdShots: Record<string, boolean | null> = {};
        players.forEach((p) => {
          nextSdShots[p.id] = null;
        });
        setSuddenDeathShots(nextSdShots);
      } else {
        // Definitive outcome!
        // Players with HIT win, players with MISS lose!
        await submitGame({
          round: suddenDeathRound,
          makers: makes.map((m) => m.id),
          missers: misses.map((m) => m.id),
        });
      }
    }
  };

  const handleSuddenDeathPrev = () => {
    if (suddenDeathPlayerIndex > 0) {
      sounds.playClick();
      setSuddenDeathPlayerIndex((prev) => prev - 1);
    }
  };

  // Submit Game to Backend
  const submitGame = async (suddenDeathData?: {
    round: number;
    makers: string[];
    missers: string[];
  }) => {
    setSubmitting(true);
    setError(null);
    try {
      const formattedShots = playerShots.map((ps) => ({
        playerId: ps.playerId,
        shot1: Boolean(ps.shot1),
        shot2: Boolean(ps.shot2),
        shot3: Boolean(ps.shot3),
      }));

      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          punishmentAmount,
          shots: formattedShots,
          suddenDeath: suddenDeathData,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save game results");
      }

      const created = await res.json();
      sounds.playVictory();
      sessionStorage.removeItem("current_game_setup");
      router.push(`/game/result/${created.id}`);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Error saving game";
      setError(msg);
      setSubmitting(false);
    }
  };

  // Quick Score Calculator
  const getPlayerScore = (shots: PlayerShotState) => {
    if (!shots) return 0;
    return (
      (shots.shot1 ? 1 : 0) +
      (shots.shot2 ? 1 : 0) +
      (shots.shot3 ? 1 : 0)
    );
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* SUDDEN DEATH ALERT MODAL */}
      <AnimatePresence>
        {showSuddenDeathModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative z-10 w-full max-w-md rounded-3xl bg-gradient-to-b from-amber-500/20 via-surface to-surface border-2 border-hoop-orange p-6 text-center shadow-2xl space-y-4"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-hoop-orange/20 border border-hoop-orange/40 text-4xl shadow-inner animate-pulse">
                ⚡
              </div>

              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-hoop-amber bg-hoop-orange/20 px-3 py-1 rounded-full border border-hoop-orange/30">
                  <Flame className="w-3.5 h-3.5" /> SKOR 0 - 0 • SUDDEN DEATH!
                </span>
                <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight mt-2">
                  BABAK PENENTUAN
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mt-2">
                  Semua shooter miss di 3 putaran reguler! Tidak ada yang langsung kalah atau kena push-up.
                </p>
                <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left space-y-1.5 text-xs text-gray-200">
                  <p className="flex items-center gap-2 font-bold text-emerald-400">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span><strong>1 Tembakan per Pemain</strong> di setiap putaran tambahan.</span>
                  </p>
                  <p className="flex items-center gap-2 font-bold text-hoop-amber">
                    <Sparkles className="w-4 h-4 flex-shrink-0" />
                    <span>Yang <strong>berhasil memasukkan bola</strong> langsung SELAMAT &amp; MENANG!</span>
                  </p>
                  <p className="flex items-center gap-2 font-bold text-rose-400">
                    <X className="w-4 h-4 flex-shrink-0" />
                    <span>Yang <strong>tidak memasukkan bola</strong> otomatis KALAH &amp; Push-up.</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setShowSuddenDeathModal(false);
                }}
                className="w-full rounded-2xl bg-gradient-to-r from-hoop-orange to-hoop-amber py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-hoop-orange/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                MULAI BABAK PENENTUAN! 🏀⚡
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUDDEN DEATH ACTIVE BANNER OR HEADER */}
      {isSuddenDeath ? (
        <div className="rounded-3xl border-2 border-hoop-orange/60 bg-gradient-to-r from-hoop-orange/20 via-amber-500/10 to-hoop-orange/20 p-4 shadow-xl text-center space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-hoop-amber tracking-wider">
            <span className="flex h-2 w-2 rounded-full bg-hoop-orange animate-ping" />
            <Zap className="w-4 h-4 text-hoop-orange" />
            <span>SUDDEN DEATH • PUTARAN #{suddenDeathRound}</span>
          </div>
          <h2 className="text-lg font-black uppercase tracking-tight text-white">
            1 Tembakan Penentu Kemenangan!
          </h2>
          <p className="text-[11px] text-gray-300">
            Masukkan bola untuk menang. Yang miss setelah ada yang mencetak skor akan langsung kalah &amp; push-up!
          </p>
        </div>
      ) : (
        /* STANDARD MODE SWITCHER & HEADER BAR */
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="inline-flex rounded-2xl bg-surface p-1 border border-white/10 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShootingMode("round_by_round");
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                shootingMode === "round_by_round"
                  ? "bg-hoop-orange text-white shadow-md shadow-hoop-orange/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Round-Robin</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShootingMode("consecutive");
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                shootingMode === "consecutive"
                  ? "bg-hoop-amber text-black shadow-md shadow-hoop-amber/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>3 Consecutive</span>
            </button>
          </div>

          {/* Punishment Badge */}
          <span className="text-xs font-black text-victim-red bg-victim-red/10 border border-victim-red/20 px-3 py-1.5 rounded-full flex items-center gap-1">
            <Dumbbell className="w-3.5 h-3.5" />
            {punishmentAmount} Push-ups
          </span>
        </div>
      )}

      {/* ROUND INDICATOR TABS (ROUND-BY-ROUND MODE - ONLY IF NOT SUDDEN DEATH) */}
      {!isSuddenDeath && shootingMode === "round_by_round" && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((rNum) => {
              const isActive = currentRound === rNum;
              const completedInRound = playerShots.filter(
                (ps) => ps[`shot${rNum as 1 | 2 | 3}`] !== null
              ).length;
              const isRoundAllDone = completedInRound === players.length;

              return (
                <button
                  key={rNum}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setCurrentRound(rNum as 1 | 2 | 3);
                  }}
                  className={`rounded-2xl p-2.5 text-center transition-all ${
                    isActive
                      ? "border-2 border-hoop-orange bg-hoop-orange/20 text-white shadow-md shadow-hoop-orange/20"
                      : isRoundAllDone
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border border-white/10 bg-surface/60 text-gray-400 hover:bg-surface"
                  }`}
                >
                  <p className="text-xs font-black uppercase tracking-wider">
                    {rNum === 3 ? "🎯 ROUND 3 (FINAL)" : `ROUND ${rNum}`}
                  </p>
                  <p className="text-[10px] opacity-75 mt-0.5">
                    {completedInRound}/{players.length} Shooters
                  </p>
                </button>
              );
            })}
          </div>

          {/* Shooter navigation within round */}
          <div className="flex items-center justify-between px-1 text-xs">
            <button
              type="button"
              onClick={handleRoundPrev}
              disabled={(roundPlayerIndex === 0 && currentRound === 1) || submitting}
              className="flex items-center gap-1 font-bold text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Prev Shooter
            </button>
            <span className="font-black text-hoop-amber uppercase">
              Shooter {roundPlayerIndex + 1} of {players.length} (Round {currentRound})
            </span>
          </div>
        </div>
      )}

      {/* CONSECUTIVE MODE STATUS BAR (ONLY IF NOT SUDDEN DEATH) */}
      {!isSuddenDeath && shootingMode === "consecutive" && (
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <button
            type="button"
            onClick={handleConsecutivePrev}
            disabled={playerIndex === 0 || submitting}
            className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev Shooter
          </button>
          <span className="text-[11px] font-black uppercase tracking-wider text-hoop-amber bg-hoop-orange/10 border border-hoop-orange/20 px-3 py-1 rounded-full">
            Shooter {playerIndex + 1} of {players.length} (3 Consecutive Shots)
          </span>
        </div>
      )}

      {/* SUDDEN DEATH STATUS BAR */}
      {isSuddenDeath && (
        <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs">
          <button
            type="button"
            onClick={handleSuddenDeathPrev}
            disabled={suddenDeathPlayerIndex === 0 || submitting}
            className="flex items-center gap-1 font-bold text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev Shooter
          </button>
          <span className="font-black text-hoop-amber uppercase">
            Shooter {suddenDeathPlayerIndex + 1} of {players.length} (Sudden Death #{suddenDeathRound})
          </span>
        </div>
      )}

      {/* PLAYER PROGRESS DOTS */}
      <div className="flex items-center gap-1.5">
        {players.map((p, idx) => {
          const isCurrent = idx === activeIndex;
          let dotColorClass = "bg-white/10 h-2";

          if (isSuddenDeath) {
            const sdShot = suddenDeathShots[p.id];
            if (isCurrent) {
              dotColorClass = "bg-hoop-orange ring-2 ring-hoop-orange/50 h-3";
            } else if (sdShot === true) {
              dotColorClass = "bg-emerald-500 h-2";
            } else if (sdShot === false) {
              dotColorClass = "bg-rose-500 h-2";
            }
          } else {
            const ps = playerShots[idx];
            const doneShotsCount =
              (ps.shot1 !== null ? 1 : 0) +
              (ps.shot2 !== null ? 1 : 0) +
              (ps.shot3 !== null ? 1 : 0);

            if (isCurrent) {
              dotColorClass = "bg-hoop-orange ring-2 ring-hoop-orange/50 h-3";
            } else if (doneShotsCount === 3) {
              dotColorClass = "bg-emerald-500 h-2";
            } else if (doneShotsCount > 0) {
              dotColorClass = "bg-amber-400 h-2";
            }
          }

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                if (isSuddenDeath) {
                  setSuddenDeathPlayerIndex(idx);
                } else if (shootingMode === "round_by_round") {
                  setRoundPlayerIndex(idx);
                } else {
                  setPlayerIndex(idx);
                }
              }}
              className={`flex-1 rounded-full transition-all ${dotColorClass}`}
              title={`${p.name}`}
            />
          );
        })}
      </div>

      {suddenDeathAlertMessage && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-amber-200 flex items-center gap-2.5 text-xs font-bold animate-bounce">
          <Zap className="w-4 h-4 flex-shrink-0 text-hoop-amber" />
          <span>{suddenDeathAlertMessage}</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-rose-300 flex items-center gap-2.5 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* ACTIVE SHOOTER HERO CARD */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentPlayer.id}-${isSuddenDeath ? `sd-${suddenDeathRound}` : shootingMode === "round_by_round" ? currentRound : "all"}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`rounded-3xl border p-6 text-center shadow-xl relative overflow-hidden ${
            isSuddenDeath
              ? "border-hoop-orange/50 bg-gradient-to-b from-hoop-orange/15 via-surface to-surface-light shadow-hoop-orange/10"
              : "border-white/10 bg-gradient-to-b from-surface via-surface to-surface-light"
          }`}
        >
          {/* Top Score Badge */}
          <div className="absolute top-3 right-4">
            <span className="text-xs font-black uppercase text-gray-500">
              {isSuddenDeath ? (
                <span className="text-hoop-amber font-black">⚡ 1 SHOT ONLY</span>
              ) : (
                <>
                  Total: <strong className="text-white text-base">{getPlayerScore(currentShots)}</strong> / 3 PTS
                </>
              )}
            </span>
          </div>

          {/* Current Mode Badge */}
          <div className="absolute top-3 left-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-hoop-orange bg-hoop-orange/10 px-2.5 py-1 rounded-full border border-hoop-orange/20">
              {isSuddenDeath
                ? `⚡ SUDDEN DEATH #${suddenDeathRound}`
                : shootingMode === "round_by_round"
                ? `🎯 ROUND ${currentRound}`
                : "⚡ 3 SHOTS"}
            </span>
          </div>

          <div className="mx-auto flex justify-center mb-3 mt-4">
            <PlayerAvatar
              avatar={currentPlayer.avatar}
              name={currentPlayer.name}
              size="xl"
              ring
              className={isSuddenDeath ? "ring-hoop-orange" : ""}
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            {currentPlayer.name}
          </h2>
          {currentPlayer.nickname && (
            <p className="text-xs font-semibold text-hoop-amber tracking-wide mt-0.5">
              &quot;{currentPlayer.nickname}&quot;
            </p>
          )}

          {/* --- VIEW 1: SUDDEN DEATH CONSOLE --- */}
          {isSuddenDeath && (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-hoop-orange/30 bg-surface-light/90 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-hoop-amber mb-3 flex items-center justify-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  TEMBAKAN PENENTUAN (SUDDEN DEATH #{suddenDeathRound})
                </p>

                <div className="grid grid-cols-2 gap-3.5">
                  {/* HIT BUTTON */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      sounds.playSwish();
                      handleSuddenDeathShotChange(true);
                    }}
                    disabled={submitting}
                    className={`flex min-h-[68px] items-center justify-center gap-2 rounded-2xl font-black text-base uppercase tracking-wider transition-all ${
                      activeSuddenDeathShotValue === true
                        ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/40 ring-4 ring-emerald-300 scale-[1.02]"
                        : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 active:bg-emerald-500/30"
                    }`}
                  >
                    <span className="text-2xl">🏀</span>
                    <span>MASUK! (HIT)</span>
                    {activeSuddenDeathShotValue === true && <Check className="w-5 h-5 stroke-[3]" />}
                  </motion.button>

                  {/* MISS BUTTON */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      sounds.playBrick();
                      handleSuddenDeathShotChange(false);
                    }}
                    disabled={submitting}
                    className={`flex min-h-[68px] items-center justify-center gap-2 rounded-2xl font-black text-base uppercase tracking-wider transition-all ${
                      activeSuddenDeathShotValue === false
                        ? "bg-rose-600 text-white shadow-xl shadow-rose-600/40 ring-4 ring-rose-400 scale-[1.02]"
                        : "border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 active:bg-rose-500/30"
                    }`}
                  >
                    <span className="text-2xl">🧱</span>
                    <span>MISS! (BRICK)</span>
                    {activeSuddenDeathShotValue === false && <X className="w-5 h-5 stroke-[3]" />}
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {/* --- VIEW 2: REGULAR ROUND-BY-ROUND CONSOLE --- */}
          {!isSuddenDeath && shootingMode === "round_by_round" && (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-surface-light/80 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  ROUND {currentRound} SHOT RESULT
                </p>

                <div className="grid grid-cols-2 gap-3.5">
                  {/* HIT BUTTON */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      sounds.playSwish();
                      handleShotChange(activeRoundShotKey, true);
                    }}
                    disabled={submitting}
                    className={`flex min-h-[64px] items-center justify-center gap-2 rounded-2xl font-black text-base uppercase tracking-wider transition-all ${
                      activeRoundShotValue === true
                        ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/40 ring-4 ring-emerald-300 scale-[1.02]"
                        : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 active:bg-emerald-500/30"
                    }`}
                  >
                    <span className="text-2xl">🏀</span>
                    <span>SWISH! (HIT)</span>
                    {activeRoundShotValue === true && <Check className="w-5 h-5 stroke-[3]" />}
                  </motion.button>

                  {/* MISS BUTTON */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      sounds.playBrick();
                      handleShotChange(activeRoundShotKey, false);
                    }}
                    disabled={submitting}
                    className={`flex min-h-[64px] items-center justify-center gap-2 rounded-2xl font-black text-base uppercase tracking-wider transition-all ${
                      activeRoundShotValue === false
                        ? "bg-rose-600 text-white shadow-xl shadow-rose-600/40 ring-4 ring-rose-400 scale-[1.02]"
                        : "border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 active:bg-rose-500/30"
                    }`}
                  >
                    <span className="text-2xl">🧱</span>
                    <span>BRICK! (MISS)</span>
                    {activeRoundShotValue === false && <X className="w-5 h-5 stroke-[3]" />}
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {/* --- VIEW 3: REGULAR CONSECUTIVE 3-SHOTS CONSOLE --- */}
          {!isSuddenDeath && shootingMode === "consecutive" && (
            <div className="mt-6 space-y-3">
              <ShotButton
                shotNumber={1}
                value={currentShots.shot1}
                onChange={(val) => handleShotChange("shot1", val)}
                disabled={submitting}
              />
              <ShotButton
                shotNumber={2}
                value={currentShots.shot2}
                onChange={(val) => handleShotChange("shot2", val)}
                disabled={submitting}
              />
              <ShotButton
                shotNumber={3}
                value={currentShots.shot3}
                onChange={(val) => handleShotChange("shot3", val)}
                disabled={submitting}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ACTION BUTTON */}
      <div className="pt-1">
        {isSuddenDeath ? (
          <button
            type="button"
            onClick={handleSuddenDeathNext}
            disabled={!isSuddenDeathShotComplete || submitting}
            className={`w-full flex min-h-[58px] items-center justify-center gap-2 rounded-2xl font-black text-base sm:text-lg uppercase tracking-wider text-white shadow-xl transition-all ${
              isSuddenDeathShotComplete
                ? suddenDeathPlayerIndex === players.length - 1
                  ? "bg-gradient-to-r from-hoop-orange via-amber-500 to-emerald-500 shadow-hoop-orange/30 hover:scale-[1.01] active:scale-[0.98]"
                  : "bg-gradient-to-r from-hoop-orange to-hoop-amber shadow-hoop-orange/30 hover:scale-[1.01] active:scale-[0.98]"
                : "bg-white/10 opacity-50 cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <span>Menyimpan Hasil Sudden Death... 🏀</span>
            ) : suddenDeathPlayerIndex === players.length - 1 ? (
              <>
                <Trophy className="w-5 h-5" />
                SELESAIKAN SUDDEN DEATH #{suddenDeathRound}!
              </>
            ) : (
              <>
                <span>NEXT SHOOTER ({players[suddenDeathPlayerIndex + 1]?.name})</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        ) : shootingMode === "round_by_round" ? (
          <button
            type="button"
            onClick={handleRoundNext}
            disabled={!isRoundShotComplete || submitting}
            className={`w-full flex min-h-[58px] items-center justify-center gap-2 rounded-2xl font-black text-base sm:text-lg uppercase tracking-wider text-white shadow-xl transition-all ${
              isRoundShotComplete
                ? currentRound === 3 && roundPlayerIndex === players.length - 1
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.98]"
                  : "bg-gradient-to-r from-hoop-orange to-hoop-amber shadow-hoop-orange/30 hover:scale-[1.01] active:scale-[0.98]"
                : "bg-white/10 opacity-50 cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <span>Calculating Results... 🏀</span>
            ) : currentRound === 3 && roundPlayerIndex === players.length - 1 ? (
              <>
                <Trophy className="w-5 h-5" />
                SELESAIKAN MATCH &amp; CEK HASIL
              </>
            ) : roundPlayerIndex === players.length - 1 ? (
              <>
                <span>ADVANCE TO ROUND {currentRound + 1} ({players[0]?.name})</span>
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <span>NEXT SHOOTER ({players[roundPlayerIndex + 1]?.name})</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConsecutiveNext}
            disabled={!isConsecutiveComplete || submitting}
            className={`w-full flex min-h-[58px] items-center justify-center gap-2 rounded-2xl font-black text-base sm:text-lg uppercase tracking-wider text-white shadow-xl transition-all ${
              isConsecutiveComplete
                ? playerIndex === players.length - 1
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.98]"
                  : "bg-gradient-to-r from-hoop-orange to-hoop-amber shadow-hoop-orange/30 hover:scale-[1.01] active:scale-[0.98]"
                : "bg-white/10 opacity-50 cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <span>Calculating Results... 🏀</span>
            ) : playerIndex === players.length - 1 ? (
              <>
                <Trophy className="w-5 h-5" />
                SELESAIKAN MATCH &amp; CEK HASIL
              </>
            ) : (
              <>
                <span>NEXT SHOOTER ({players[playerIndex + 1]?.name})</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        )}
      </div>

      {/* LIVE MINI SCOREBOARD & ROUND SUMMARY */}
      <section className="rounded-3xl border border-white/10 bg-surface/80 p-5 backdrop-blur-md space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-hoop-orange" />
            <h3 className="text-xs font-black uppercase text-white tracking-wider">
              {isSuddenDeath
                ? `⚡ Sudden Death Standings (Putaran #${suddenDeathRound})`
                : `Live Game Standings (${totalCompletedShots}/${maxPossibleShots} Shots)`}
            </h3>
          </div>
          <span className="text-[10px] text-gray-400 font-bold uppercase">
            {isSuddenDeath
              ? "⚡ Sudden Death Format"
              : shootingMode === "round_by_round"
              ? "Round-Robin Format"
              : "Consecutive Format"}
          </span>
        </div>

        <div className="space-y-1.5">
          {players.map((p, idx) => {
            const ps = playerShots[idx];
            const isCurrent = idx === activeIndex;
            const score = getPlayerScore(ps);
            const sdShot = suddenDeathShots[p.id];

            return (
              <div
                key={p.id}
                onClick={() => {
                  if (isSuddenDeath) {
                    setSuddenDeathPlayerIndex(idx);
                  } else if (shootingMode === "round_by_round") {
                    setRoundPlayerIndex(idx);
                  } else {
                    setPlayerIndex(idx);
                  }
                }}
                className={`flex items-center justify-between rounded-xl p-2 text-xs cursor-pointer transition-all ${
                  isCurrent
                    ? "bg-hoop-orange/20 border border-hoop-orange/40"
                    : "bg-white/[0.02] border border-white/5 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <PlayerAvatar avatar={p.avatar} name={p.name} size="xs" />
                  <span className={`font-black truncate ${isCurrent ? "text-hoop-orange" : "text-white"}`}>
                    {p.name}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] bg-hoop-orange text-white font-black px-1.5 py-0.2 rounded uppercase">
                      SHOOTING
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {isSuddenDeath ? (
                    <div>
                      {sdShot === true ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                          <Check className="w-3 h-3" /> MASUK (AMAN)
                        </span>
                      ) : sdShot === false ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-md">
                          <X className="w-3 h-3" /> MISS (BAHAYA)
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500 font-semibold italic">
                          Belum menembak
                        </span>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* 3 Shot Indicators */}
                      <div className="flex items-center gap-1">
                        {[ps.shot1, ps.shot2, ps.shot3].map((val, sIdx) => (
                          <span
                            key={sIdx}
                            className={`h-3 w-3 rounded-full flex items-center justify-center text-[8px] font-bold ${
                              val === true
                                ? "bg-emerald-500 text-white"
                                : val === false
                                ? "bg-rose-500 text-white"
                                : "bg-white/10 text-gray-500"
                            }`}
                          >
                            {val === true ? "✓" : val === false ? "✕" : ""}
                          </span>
                        ))}
                      </div>

                      <span className="font-black text-white min-w-[28px] text-right">
                        {score} pts
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
