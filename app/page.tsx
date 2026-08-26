"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Dumbbell,
  Play,
  ArrowRight,
  TrendingUp,
  Users,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { BasketballEntrance } from "@/components/ui/BasketballEntrance";
import { formatDateShort } from "@/lib/utils";
import { sounds } from "@/lib/sound";

interface LeaderboardPlayer {
  id: string;
  name: string;
  nickname: string | null;
  avatar: string | null;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPoints: number;
  avgScore: number;
  totalPushups: number;
  completedPushups: number;
  pendingPushups: number;
  rank: number;
}

interface GameSummary {
  id: string;
  playedAt: string;
  punishmentAmount: number;
  gamePlayers: Array<{
    id: string;
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

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [showEntrance, setShowEntrance] = useState(true);
  const [champion, setChampion] = useState<LeaderboardPlayer | null>(null);
  const [pushupKing, setPushupKing] = useState<LeaderboardPlayer | null>(null);
  const [todayLeaderboard, setTodayLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [recentGames, setRecentGames] = useState<GameSummary[]>([]);
  const [metrics, setMetrics] = useState({ totalGames: 0, totalPushups: 0, activePlayers: 0 });

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [lbRes, gamesRes] = await Promise.all([
        fetch("/api/leaderboard?timeframe=today"),
        fetch("/api/games?limit=5"),
      ]);

      if (lbRes.ok) {
        const lbData = await lbRes.json();
        setChampion(lbData.todayChampion);
        setPushupKing(lbData.pushupKing);
        setTodayLeaderboard(lbData.championship || []);
        setMetrics(lbData.summary || { totalGames: 0, totalPushups: 0, activePlayers: 0 });
      }

      if (gamesRes.ok) {
        const gamesData = await gamesRes.json();
        setRecentGames(gamesData);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 🏀 BASKETBALL ENTRANCE ANIMATION OVERLAY */}
      {showEntrance && (
        <BasketballEntrance onComplete={() => setShowEntrance(false)} />
      )}

      {/* HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-surface via-surface-light to-surface p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-hoop-orange/15 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-hoop-amber/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-hoop-orange/30 bg-hoop-orange/10 px-3 py-1 text-xs font-bold text-hoop-amber uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Coffee Break Basketball League
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
              SHOOT &amp; SUFFER
            </h1>
            <p className="text-base sm:text-lg font-medium text-gray-300 flex items-center gap-2">
              <span>Shoot.</span>
              <span className="text-hoop-amber">Score.</span>
              <span className="text-rose-400">Survive.</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Link
              href="/game/new"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-hoop-orange to-hoop-amber px-6 py-4 text-base font-black text-white shadow-xl shadow-hoop-orange/30 hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              <Play className="w-5 h-5 fill-white" />
              START QUICK GAME
            </Link>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShowEntrance(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-sm font-bold text-gray-200 hover:bg-white/15 hover:text-white transition-all shadow-lg"
              title="Replay Entrance Animation"
            >
              <span>🏀 Intro FX</span>
            </button>
          </div>
        </div>

        {/* QUICK STATS CHIPS */}
        <div className="relative z-10 mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <p className="text-[11px] font-bold uppercase text-gray-400">Games Today</p>
            <p className="text-xl sm:text-2xl font-black text-white">{metrics.totalGames}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <p className="text-[11px] font-bold uppercase text-gray-400">Push-ups Tax</p>
            <p className="text-xl sm:text-2xl font-black text-rose-400">{metrics.totalPushups} 💪</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center">
            <p className="text-[11px] font-bold uppercase text-gray-400">Active Shooters</p>
            <p className="text-xl sm:text-2xl font-black text-hoop-amber">{metrics.activePlayers} 👥</p>
          </div>
        </div>
      </section>

      {/* FEATURED SPOTLIGHT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* TODAY'S CHAMPION CARD */}
        <motion.div
          whileHover={{ y: -3 }}
          className="relative overflow-hidden rounded-3xl border border-champion-gold/30 bg-gradient-to-br from-champion-gold/10 via-surface to-surface p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-champion-gold/20 text-champion-gold">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-champion-gold">
                Today&apos;s Champion
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-400">🔥 Absolute bucket machine!</span>
          </div>

          {champion ? (
            <div className="flex items-center gap-4 mt-2">
              <PlayerAvatar
                avatar={champion.avatar}
                name={champion.name}
                size="xl"
                ring
                className="ring-champion-gold/50 shadow-lg shadow-champion-gold/20"
              />
              <div className="flex-1">
                <Link
                  href={`/players/${champion.id}`}
                  className="text-2xl font-black text-white hover:text-champion-gold transition-colors flex items-center gap-2"
                >
                  {champion.name}
                  {champion.nickname && (
                    <span className="text-sm font-semibold text-champion-gold/80">
                      &quot;{champion.nickname}&quot;
                    </span>
                  )}
                </Link>
                <div className="flex items-center gap-4 mt-1 text-sm font-semibold text-gray-300">
                  <span>🏆 {champion.wins} {champion.wins === 1 ? "Win" : "Wins"}</span>
                  <span>🎯 {champion.totalPoints} Points</span>
                  <span>🔥 {champion.winRate}% Win Rate</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400">
              <Trophy className="w-10 h-10 text-gray-600 mb-2" />
              <p className="text-sm font-medium">No champion crowned today yet.</p>
              <Link
                href="/game/new"
                className="mt-3 text-xs font-bold text-hoop-orange hover:underline uppercase tracking-wide"
              >
                Play the first game &rarr;
              </Link>
            </div>
          )}
        </motion.div>

        {/* PUSH-UP KING CARD */}
        <motion.div
          whileHover={{ y: -3 }}
          className="relative overflow-hidden rounded-3xl border border-victim-red/30 bg-gradient-to-br from-victim-red/10 via-surface to-surface p-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-victim-red/20 text-victim-red">
                <Dumbbell className="w-5 h-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-victim-red">
                Today&apos;s Victim / Push-up King
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-400">💀 Time to pay the fitness tax.</span>
          </div>

          {pushupKing ? (
            <div className="flex items-center gap-4 mt-2">
              <PlayerAvatar
                avatar={pushupKing.avatar}
                name={pushupKing.name}
                size="xl"
                ring
                className="ring-victim-red/50 shadow-lg shadow-victim-red/20"
              />
              <div className="flex-1">
                <Link
                  href={`/players/${pushupKing.id}`}
                  className="text-2xl font-black text-white hover:text-rose-400 transition-colors flex items-center gap-2"
                >
                  {pushupKing.name}
                  {pushupKing.nickname && (
                    <span className="text-sm font-semibold text-rose-300/80">
                      &quot;{pushupKing.nickname}&quot;
                    </span>
                  )}
                </Link>
                <div className="flex items-center gap-4 mt-1 text-sm font-semibold text-gray-300">
                  <span className="text-rose-400 font-bold">💪 {pushupKing.totalPushups} Push-ups</span>
                  <span>💀 {pushupKing.losses} Losses</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400">
              <Dumbbell className="w-10 h-10 text-gray-600 mb-2" />
              <p className="text-sm font-medium">No victims recorded today. Clean arms so far!</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* TODAY'S LEADERBOARD & RECENT GAMES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEADERBOARD PREVIEW */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-surface/80 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-hoop-orange" />
              <h2 className="text-lg font-black uppercase tracking-wide text-white">
                Today&apos;s Standings
              </h2>
            </div>
            <Link
              href="/leaderboard"
              className="text-xs font-bold text-hoop-orange hover:text-hoop-amber flex items-center gap-1 uppercase tracking-wide transition-colors"
            >
              Full Leaderboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500 text-sm">Loading standings...</div>
          ) : todayLeaderboard.length > 0 ? (
            <div className="space-y-2.5">
              {todayLeaderboard.slice(0, 5).map((player, idx) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                        idx === 0
                          ? "bg-champion-gold text-black font-black"
                          : idx === 1
                          ? "bg-gray-300 text-black font-bold"
                          : idx === 2
                          ? "bg-amber-700 text-white font-bold"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <PlayerAvatar avatar={player.avatar} name={player.name} size="sm" />
                    <div>
                      <Link
                        href={`/players/${player.id}`}
                        className="text-sm font-bold text-white hover:text-hoop-orange transition-colors"
                      >
                        {player.name}
                      </Link>
                      <p className="text-[11px] text-gray-400">
                        {player.wins}W - {player.losses}L • {player.totalPoints} pts
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-hoop-amber">
                      {player.winRate}% Win
                    </span>
                    <p className="text-[11px] text-gray-400">
                      {player.totalPushups > 0 ? `${player.totalPushups} push-ups` : "0 push-ups"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <p className="text-sm text-gray-400 mb-2">No games played today yet.</p>
              <Link
                href="/game/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition-colors uppercase tracking-wider"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Start Today&apos;s First Game
              </Link>
            </div>
          )}
        </div>

        {/* RECENT MATCHES FEED */}
        <div className="rounded-3xl border border-white/10 bg-surface/80 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-hoop-amber" />
              <h2 className="text-lg font-black uppercase tracking-wide text-white">
                Recent Matches
              </h2>
            </div>
            <Link
              href="/history"
              className="text-xs font-bold text-hoop-orange hover:text-hoop-amber flex items-center gap-1 uppercase tracking-wide transition-colors"
            >
              All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500 text-sm">Loading history...</div>
          ) : recentGames.length > 0 ? (
            <div className="space-y-3">
              {recentGames.slice(0, 4).map((game) => {
                const winners = game.gamePlayers.filter((gp) => gp.isWinner);
                const losers = game.gamePlayers.filter((gp) => gp.isLoser);

                return (
                  <Link
                    key={game.id}
                    href={`/game/result/${game.id}`}
                    className="block rounded-2xl border border-white/5 bg-white/[0.02] p-3 hover:border-hoop-orange/30 hover:bg-white/[0.05] transition-all"
                  >
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5 font-medium">
                      <span>{formatDateShort(game.playedAt)}</span>
                      <span className="text-rose-400 font-semibold">
                        {game.punishmentAmount} Push-ups tax
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-champion-gold font-bold">
                        <span>🏆</span>
                        <span className="truncate text-white">
                          {winners.map((w) => w.player.name).join(", ")}
                        </span>
                        <span className="text-champion-gold">
                          ({winners[0]?.totalScore}/3)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-victim-red font-semibold">
                        <span>💀</span>
                        <span className="truncate text-gray-300">
                          {losers.map((l) => l.player.name).join(", ")}
                        </span>
                        <span className="text-victim-red">
                          ({losers[0]?.totalScore}/3)
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-gray-400 text-sm">
              No recent matches.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
