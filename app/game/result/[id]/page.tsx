"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Trophy,
  Dumbbell,
  RotateCcw,
  Home,
  Flame,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { WinnerConfetti } from "@/components/ui/WinnerConfetti";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { PlayerShuffleModal } from "@/components/game/PlayerShuffleModal";
import { sounds } from "@/lib/sound";
import { formatDate } from "@/lib/utils";

interface GameDetail {
  id: string;
  playedAt: string;
  punishmentAmount: number;
  gamePlayers: Array<{
    id: string;
    playerId: string;
    shot1: boolean;
    shot2: boolean;
    shot3: boolean;
    totalScore: number;
    rank: number;
    isWinner: boolean;
    isLoser: boolean;
    pushupAmount: number;
    pushupsCompleted: boolean;
    player: {
      id: string;
      name: string;
      nickname: string | null;
      avatar: string | null;
    };
  }>;
}

export default function GameResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [game, setGame] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShuffleModalOpen, setIsShuffleModalOpen] = useState(false);

  const fetchGame = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/games/${id}`);
      if (res.ok) {
        const data = await res.json();
        setGame(data);
      }
    } catch (err) {
      console.error("Failed to load game result", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  const handleRematch = () => {
    if (!game) return;
    sounds.playClick();
    setIsShuffleModalOpen(true);
  };

  const handleConfirmRematch = (shuffledPlayers: Array<{ id: string; name: string; nickname: string | null; avatar: string | null }>) => {
    if (!game) return;
    sessionStorage.setItem(
      "current_game_setup",
      JSON.stringify({
        players: shuffledPlayers,
        punishmentAmount: game.punishmentAmount,
      })
    );
    router.push("/game/play");
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center text-gray-400">
        Loading game results...
      </div>
    );
  }

  if (!game) {
    return (
      <div className="rounded-2xl border border-white/10 p-8 text-center space-y-4">
        <p className="text-gray-400">Game not found.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-hoop-orange px-4 py-2 text-sm font-bold text-white"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const winners = game.gamePlayers.filter((gp) => gp.isWinner);
  const losers = game.gamePlayers.filter((gp) => gp.isLoser);
  const isSuddenDeathWin = winners.length > 0 && winners.every((w) => !w.shot1 && !w.shot2 && !w.shot3);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      <WinnerConfetti duration={4000} />

      {/* SECTION 1: WINNER CELEBRATION BANNER */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl border-2 border-champion-gold/50 bg-gradient-to-b from-champion-gold/20 via-surface to-surface p-6 sm:p-8 text-center shadow-2xl"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full bg-champion-gold/20 px-3.5 py-1 text-xs font-black text-champion-gold uppercase tracking-wider mb-2">
          {isSuddenDeathWin ? (
            <>
              <Flame className="w-3.5 h-3.5 text-hoop-orange" />
              <span>⚡ Sudden Death Champion!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Coffee Break Champion</span>
            </>
          )}
        </div>

        <div className="mx-auto flex justify-center my-3">
          <PlayerAvatar
            avatar={winners[0]?.player.avatar}
            name={winners[0]?.player.name}
            size="xl"
            ring
            className="ring-champion-gold/50 shadow-lg"
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
          {winners.map((w) => w.player.name).join(" & ")}
        </h1>
        <p className="text-sm font-semibold text-champion-gold mt-1">
          {isSuddenDeathWin
            ? "⚡ Clutch shot in Sudden Death Overtime!"
            : `🔥 Absolute bucket machine! (${winners[0]?.totalScore} / 3 Hits)`}
        </p>
      </motion.div>

      {/* SECTION 2: LOSER FITNESS TAX SECTION */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="rounded-3xl border border-victim-red/30 bg-gradient-to-b from-victim-red/15 via-surface to-surface p-6 text-center space-y-4 shadow-xl"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full bg-victim-red/20 px-3 py-1 text-xs font-black text-rose-400 uppercase tracking-wider">
          <Dumbbell className="w-3.5 h-3.5" />
          {losers.length > 1 ? "The Push-up Crew" : "Today's Victim"}
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-rose-400">
            {losers.map((l) => l.player.name).join(" & ")}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            💀 Time to pay the fitness tax. Your contribution to office health is recorded.
          </p>
        </div>

        {/* Loser Push-up Cards */}
        <div className="space-y-3 pt-2">
          {losers.map((loser) => {
            return (
              <div
                key={loser.id}
                className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left"
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <PlayerAvatar
                    avatar={loser.player.avatar}
                    name={loser.player.name}
                    size="md"
                    className="ring-1 ring-rose-500/40"
                  />
                  <div>
                    <p className="font-bold text-white text-base">{loser.player.name}</p>
                    <p className="text-xs font-semibold text-rose-400">
                      💀 Defeated ({loser.totalScore}/3 Hits)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-victim-red/20 border border-victim-red/40 px-4 py-2.5 text-xs font-black text-rose-300 uppercase tracking-wider">
                  <Dumbbell className="w-4 h-4 text-victim-red" />
                  <span>+{loser.pushupAmount} Push-ups Added</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* SECTION 3: FULL MATCH SCOREBOARD TABLE */}
      <section className="rounded-3xl border border-white/10 bg-surface/80 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-base font-black uppercase tracking-wide text-white flex items-center gap-2">
            <span>📊</span> Full Match Scoreboard
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            {formatDate(game.playedAt)}
          </span>
        </div>

        <div className="space-y-2">
          {game.gamePlayers.map((gp, idx) => (
            <div
              key={gp.id}
              className={`flex items-center justify-between rounded-2xl border p-3.5 transition-colors ${
                gp.isWinner
                  ? "border-champion-gold/40 bg-champion-gold/10"
                  : gp.isLoser
                  ? "border-victim-red/30 bg-victim-red/5"
                  : "border-white/5 bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                    gp.isWinner
                      ? "bg-champion-gold text-black"
                      : gp.isLoser
                      ? "bg-victim-red text-white"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  {gp.rank}
                </span>
                <PlayerAvatar avatar={gp.player.avatar} name={gp.player.name} size="sm" />
                <div>
                  <p className="text-sm font-bold text-white flex items-center gap-1.5">
                    {gp.player.name}
                    {gp.isWinner && <span className="text-xs text-champion-gold">🏆</span>}
                    {gp.isLoser && <span className="text-xs text-victim-red">💀</span>}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {gp.isLoser ? `+${gp.pushupAmount} push-ups` : "Survived"}
                  </p>
                </div>
              </div>

              {/* Shot Dots & Total Score */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      gp.shot1 ? "bg-emerald-400 ring-2 ring-emerald-400/30" : "bg-rose-500"
                    }`}
                    title="Shot 1"
                  />
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      gp.shot2 ? "bg-emerald-400 ring-2 ring-emerald-400/30" : "bg-rose-500"
                    }`}
                    title="Shot 2"
                  />
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      gp.shot3 ? "bg-emerald-400 ring-2 ring-emerald-400/30" : "bg-rose-500"
                    }`}
                    title="Shot 3"
                  />
                </div>

                <span className="text-base font-black text-white min-w-[32px] text-right">
                  {gp.totalScore} <span className="text-xs text-gray-500 font-normal">/ 3</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: ACTION NAVIGATION BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={handleRematch}
          className="flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-hoop-orange to-hoop-amber px-4 py-3 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-hoop-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Play Rematch
        </button>

        <Link
          href="/leaderboard"
          className="flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black uppercase tracking-wider text-gray-200 hover:bg-white/10 hover:text-white transition-all"
        >
          <Trophy className="w-4 h-4 text-champion-gold" />
          Leaderboard
        </Link>

        <Link
          href="/"
          className="flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black uppercase tracking-wider text-gray-200 hover:bg-white/10 hover:text-white transition-all"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </Link>
      </div>

      {/* REMATCH SHUFFLE MODAL */}
      {game && (
        <PlayerShuffleModal
          isOpen={isShuffleModalOpen}
          players={game.gamePlayers.map((gp) => gp.player)}
          onConfirm={handleConfirmRematch}
          onClose={() => setIsShuffleModalOpen(false)}
        />
      )}
    </div>
  );
}
