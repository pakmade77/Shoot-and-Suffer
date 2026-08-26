"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Dumbbell,
  Target,
  Flame,
  Award,
  ChevronLeft,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Activity,
  Sparkles,
} from "lucide-react";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { formatDate } from "@/lib/utils";
import { Achievement, PlayerStats } from "@/lib/calculations";

interface PlayerGameItem {
  id: string;
  gameId: string;
  playedAt: string;
  punishmentAmount: number;
  shot1: boolean;
  shot2: boolean;
  shot3: boolean;
  totalScore: number;
  rank: number;
  isWinner: boolean;
  isLoser: boolean;
  pushupAmount: number;
  pushupsCompleted: boolean;
  otherPlayers: Array<{
    name: string;
    totalScore: number;
    isWinner: boolean;
    isLoser: boolean;
  }>;
}

export default function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [gameHistory, setGameHistory] = useState<PlayerGameItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlayer = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/players/${id}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setAchievements(data.achievements || []);
        setGameHistory(data.gameHistory || []);
      }
    } catch (err) {
      console.error("Failed to load player", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlayer();
  }, [fetchPlayer]);

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center text-gray-400">
        Loading player statistics...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-2xl border border-white/10 p-8 text-center space-y-4">
        <p className="text-gray-400">Player not found.</p>
        <Link
          href="/players"
          className="inline-flex items-center gap-2 rounded-xl bg-hoop-orange px-4 py-2 text-sm font-bold text-white"
        >
          Return to Players
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* TOP BACK BAR */}
      <div>
        <Link
          href="/players"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wide transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Roster
        </Link>
      </div>

      {/* PLAYER HERO CARD */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-surface via-surface-light to-surface p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <PlayerAvatar
            avatar={stats.avatar}
            name={stats.name}
            size="2xl"
            ring
            className="shadow-2xl"
          />

          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
                {stats.name}
              </h1>
              {stats.nickname && (
                <span className="rounded-full bg-hoop-orange/15 border border-hoop-orange/30 px-3 py-0.5 text-xs font-bold text-hoop-amber">
                  &quot;{stats.nickname}&quot;
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400">
              Shooting record: {stats.wins} Wins • {stats.losses} Losses • {stats.totalGames} Total Matches
            </p>

            {/* QUICK HIGHLIGHT BADGES */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="rounded-xl bg-champion-gold/15 border border-champion-gold/30 px-3 py-1 text-xs font-black text-champion-gold">
                🏆 {stats.winRate}% Win Rate
              </span>
              <span className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-black text-emerald-300">
                🎯 {stats.accuracy}% Shooting Accuracy
              </span>
              <span className="rounded-xl bg-victim-red/15 border border-victim-red/30 px-3 py-1 text-xs font-black text-rose-400">
                💪 {stats.totalPushups} Total Push-ups
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS MATRIX CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-white/10 bg-surface/80 p-4">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold uppercase">Points</span>
            <Target className="w-4 h-4 text-hoop-amber" />
          </div>
          <p className="text-2xl font-black text-white">{stats.totalPoints}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Avg: {stats.averageScore} / game (Best: {stats.bestScore}/3)
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface/80 p-4">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold uppercase">Accuracy</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{stats.accuracy}%</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {stats.totalHits} Hits / {stats.totalShots} Shots
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface/80 p-4">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold uppercase">Win Streak</span>
            <Flame className="w-4 h-4 text-hoop-orange" />
          </div>
          <p className="text-2xl font-black text-hoop-amber">{stats.maxWinStreak}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Current streak: {stats.currentWinStreak}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface/80 p-4">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold uppercase">Push-ups</span>
            <Dumbbell className="w-4 h-4 text-victim-red" />
          </div>
          <p className="text-2xl font-black text-rose-400">{stats.totalPushups}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Total Push-ups Accumulated
          </p>
        </div>
      </div>

      {/* ACHIEVEMENTS SHOWCASE */}
      <section className="rounded-3xl border border-white/10 bg-surface/80 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-lg font-black uppercase text-white tracking-wide flex items-center gap-2">
            <Award className="w-5 h-5 text-champion-gold" />
            Achievements &amp; Badges
          </h2>
          <span className="text-xs font-bold text-hoop-amber">
            {achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`rounded-2xl border p-4 transition-all ${
                ach.unlocked
                  ? "border-champion-gold/30 bg-champion-gold/10 shadow-sm shadow-champion-gold/5"
                  : "border-white/5 bg-white/[0.02] opacity-40 grayscale"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-2xl">{ach.icon}</span>
                <h4 className="font-black text-xs uppercase text-white truncate">
                  {ach.title}
                </h4>
              </div>
              <p className="text-[11px] text-gray-300 leading-snug">{ach.description}</p>
              {ach.progress && (
                <p className="text-[10px] font-bold text-hoop-amber mt-2 uppercase">
                  {ach.progress}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* MATCH HISTORY FOR THIS PLAYER */}
      <section className="rounded-3xl border border-white/10 bg-surface/80 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-lg font-black uppercase text-white tracking-wide flex items-center gap-2">
            <Calendar className="w-5 h-5 text-hoop-orange" />
            Match History
          </h2>
          <span className="text-xs text-gray-400">{gameHistory.length} Matches</span>
        </div>

        {gameHistory.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">No games played yet.</div>
        ) : (
          <div className="space-y-2.5">
            {gameHistory.map((g) => (
              <Link
                key={g.id}
                href={`/game/result/${g.gameId}`}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 hover:border-hoop-orange/30 hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${
                      g.isWinner
                        ? "bg-champion-gold text-black"
                        : g.isLoser
                        ? "bg-victim-red text-white"
                        : "bg-white/10 text-gray-300"
                    }`}
                  >
                    #{g.rank}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{g.isWinner ? "🏆 Victory" : g.isLoser ? "💀 Defeat" : "Played"}</span>
                      <span className="text-[11px] text-gray-400 font-normal">
                        vs {g.otherPlayers.map((o) => o.name).join(", ")}
                      </span>
                    </p>
                    <p className="text-[10px] text-gray-500">{formatDate(g.playedAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Shot Dots */}
                  <div className="flex items-center gap-1">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        g.shot1 ? "bg-emerald-400" : "bg-rose-500"
                      }`}
                    />
                    <span
                      className={`h-2 w-2 rounded-full ${
                        g.shot2 ? "bg-emerald-400" : "bg-rose-500"
                      }`}
                    />
                    <span
                      className={`h-2 w-2 rounded-full ${
                        g.shot3 ? "bg-emerald-400" : "bg-rose-500"
                      }`}
                    />
                  </div>

                  <span className="text-sm font-black text-white">
                    {g.totalScore}/3
                  </span>

                  {g.isLoser && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      +{g.pushupAmount} Push-ups
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
