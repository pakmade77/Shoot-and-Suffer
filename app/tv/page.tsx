"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Dumbbell,
  Flame,
  Tv,
  Maximize2,
  RefreshCw,
  Play,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
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

export default function TvArenaPage() {
  const [champion, setChampion] = useState<LeaderboardPlayer | null>(null);
  const [pushupKing, setPushupKing] = useState<LeaderboardPlayer | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [summary, setSummary] = useState({ totalGames: 0, totalPushups: 0, activePlayers: 0 });
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
      setCurrentDate(
        now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard?timeframe=today");
      if (res.ok) {
        const data = await res.json();
        setChampion(data.todayChampion);
        setPushupKing(data.pushupKing);
        setLeaderboard(data.championship || []);
        setSummary(data.summary || { totalGames: 0, totalPushups: 0, activePlayers: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll data every 10s for live TV display
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const toggleFullscreen = () => {
    sounds.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-white p-4 sm:p-8 flex flex-col justify-between select-none">
      {/* ARENA SPOTLIGHT BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-hoop-orange/10 blur-[140px]" />
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[350px] w-[700px] rounded-full bg-rose-600/10 blur-[160px]" />
      </div>

      {/* TOP ARENA HEADER */}
      <header className="relative z-10 flex items-center justify-between border-b-2 border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-hoop-orange to-hoop-amber text-3xl shadow-xl shadow-hoop-orange/30">
            🏀
          </div>
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-hoop-amber bg-hoop-orange/20 px-3 py-0.5 rounded-full border border-hoop-orange/30">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE TV ARENA SCOREBOARD</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white mt-0.5">
              SHOOT &amp; SUFFER LEAGUE
            </h1>
          </div>
        </div>

        {/* CLOCK & CONTROLS */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
              {currentTime}
            </p>
            <p className="text-xs text-gray-400 uppercase font-semibold">{currentDate}</p>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-200 hover:bg-white/15 hover:text-white transition-all shadow-lg"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>

          <Link
            href="/game/new"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-hoop-orange to-hoop-amber px-5 py-3 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-hoop-orange/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>PLAY NOW</span>
          </Link>
        </div>
      </header>

      {/* MAIN SCOREBOARD SECTION */}
      <main className="relative z-10 my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
        {/* LEFT COLUMN: SPOTLIGHT ROYALS (5 COLUMNS) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          {/* TODAY'S CHAMPION PODIUM */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 rounded-3xl border-2 border-champion-gold/50 bg-gradient-to-br from-champion-gold/20 via-[#181308] to-[#0d0a04] p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 text-8xl pointer-events-none">
              🏆
            </div>

            <div className="flex items-center justify-between border-b border-champion-gold/30 pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-champion-gold">
                <Trophy className="w-4 h-4" /> TODAY&apos;S CROWNED CHAMPION
              </span>
              <span className="text-xs font-bold text-amber-300">🔥 ON FIRE</span>
            </div>

            {champion ? (
              <div className="my-auto py-4 flex items-center gap-5">
                <PlayerAvatar
                  avatar={champion.avatar}
                  name={champion.name}
                  size="2xl"
                  ring
                  className="ring-4 ring-champion-gold/70 shadow-[0_0_30px_rgba(234,179,8,0.4)]"
                />
                <div className="min-w-0">
                  <h2 className="text-2xl sm:text-4xl font-black uppercase text-white truncate">
                    {champion.name}
                  </h2>
                  {champion.nickname && (
                    <p className="text-sm font-bold text-champion-gold uppercase tracking-wider">
                      &quot;{champion.nickname}&quot;
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-xl bg-champion-gold/20 px-3 py-1 text-xs font-black text-champion-gold border border-champion-gold/30">
                      🏆 {champion.wins} WINS
                    </span>
                    <span className="rounded-xl bg-white/10 px-3 py-1 text-xs font-black text-white border border-white/10">
                      🎯 {champion.totalPoints} PTS
                    </span>
                    <span className="rounded-xl bg-hoop-amber/20 px-3 py-1 text-xs font-black text-hoop-amber border border-hoop-amber/30">
                      🔥 {champion.winRate}% WIN
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="my-auto py-8 text-center text-gray-400">
                <p className="text-base font-bold">No champion crowned today yet.</p>
                <p className="text-xs text-gray-500 mt-1">Start a match to claim the gold crown!</p>
              </div>
            )}

            <div className="border-t border-champion-gold/20 pt-3 flex items-center justify-between text-xs text-gray-300 font-semibold">
              <span>Status: Undefeated Defender</span>
              <span>⚡ Coffee Break Elite</span>
            </div>
          </motion.div>

          {/* TODAY'S PUSH-UP KING / HALL OF SHAME */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 rounded-3xl border-2 border-victim-red/50 bg-gradient-to-br from-victim-red/20 via-[#18090a] to-[#0c0405] p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 text-8xl pointer-events-none">
              💀
            </div>

            <div className="flex items-center justify-between border-b border-victim-red/30 pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-rose-400">
                <Dumbbell className="w-4 h-4" /> TODAY&apos;S TOP SUFFERER
              </span>
              <span className="text-xs font-bold text-rose-300">💀 FITNESS TAX PAID</span>
            </div>

            {pushupKing ? (
              <div className="my-auto py-4 flex items-center gap-5">
                <PlayerAvatar
                  avatar={pushupKing.avatar}
                  name={pushupKing.name}
                  size="2xl"
                  ring
                  className="ring-4 ring-rose-500/70 shadow-[0_0_30px_rgba(244,63,94,0.4)]"
                />
                <div className="min-w-0">
                  <h2 className="text-2xl sm:text-4xl font-black uppercase text-white truncate">
                    {pushupKing.name}
                  </h2>
                  {pushupKing.nickname && (
                    <p className="text-sm font-bold text-rose-300 uppercase tracking-wider">
                      &quot;{pushupKing.nickname}&quot;
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-xl bg-victim-red/30 px-3 py-1 text-xs font-black text-rose-300 border border-victim-red/40">
                      💪 {pushupKing.totalPushups} PUSH-UPS
                    </span>
                    <span className="rounded-xl bg-white/10 px-3 py-1 text-xs font-black text-gray-300 border border-white/10">
                      💀 {pushupKing.losses} LOSSES
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="my-auto py-8 text-center text-gray-400">
                <p className="text-base font-bold">No victims recorded today.</p>
                <p className="text-xs text-gray-500 mt-1">Arms are safe and clean so far!</p>
              </div>
            )}

            <div className="border-t border-victim-red/20 pt-3 flex items-center justify-between text-xs text-rose-300 font-semibold">
              <span>Status: Office Fitness Contributor</span>
              <span>💪 Muscle Building in Progress</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: FULL LEAGUE STANDINGS (7 COLUMNS) */}
        <div className="lg:col-span-7 rounded-3xl border-2 border-white/10 bg-surface/90 p-6 backdrop-blur-xl flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <Flame className="w-6 h-6 text-hoop-orange" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white">
                  TODAY&apos;S LIVE STANDINGS
                </h2>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                <span>Games: <strong className="text-white">{summary.totalGames}</strong></span>
                <span>•</span>
                <span>Tax: <strong className="text-rose-400">{summary.totalPushups} 💪</strong></span>
              </div>
            </div>

            {/* STANDINGS TABLE */}
            <div className="space-y-2.5 max-h-[500px] overflow-hidden">
              {leaderboard.length === 0 ? (
                <div className="py-20 text-center text-gray-500">
                  <p className="text-lg font-bold">No matches recorded today yet.</p>
                  <p className="text-xs mt-1 text-gray-600">Scores will broadcast here in real-time!</p>
                </div>
              ) : (
                leaderboard.slice(0, 7).map((p, idx) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between rounded-2xl border p-3.5 transition-all ${
                      idx === 0
                        ? "border-champion-gold/50 bg-champion-gold/15"
                        : idx === 1
                        ? "border-slate-300/30 bg-white/[0.04]"
                        : idx === 2
                        ? "border-amber-700/30 bg-white/[0.03]"
                        : "border-white/5 bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ${
                          idx === 0
                            ? "bg-champion-gold text-black shadow-lg shadow-champion-gold/30"
                            : idx === 1
                            ? "bg-slate-300 text-black font-bold"
                            : idx === 2
                            ? "bg-amber-700 text-white font-bold"
                            : "bg-white/10 text-gray-400"
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <PlayerAvatar avatar={p.avatar} name={p.name} size="md" />
                      <div>
                        <p className="text-base font-black text-white flex items-center gap-2">
                          <span>{p.name}</span>
                          {idx === 0 && <span>🏆</span>}
                        </p>
                        <p className="text-xs text-gray-400">
                          {p.wins} Wins • {p.losses} Losses • {p.totalPoints} Points
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-black text-hoop-amber">{p.winRate}% WIN</p>
                      <p className="text-xs font-bold text-rose-400">
                        {p.totalPushups > 0 ? `${p.totalPushups} Push-ups` : "0 Push-ups"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-hoop-amber" />
              Auto-updating every 10 seconds
            </span>
            <Link
              href="/"
              className="text-hoop-orange hover:text-white font-bold uppercase tracking-wider flex items-center gap-1"
            >
              Back to Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* RUNNING LIVE MARQUEE TICKER */}
      <footer className="relative z-10 rounded-2xl border border-white/10 bg-black/60 p-3 overflow-hidden">
        <div className="flex items-center gap-3 text-xs font-black uppercase tracking-wider text-hoop-amber whitespace-nowrap">
          <span className="rounded-lg bg-hoop-orange px-2.5 py-1 text-[10px] text-white">
            ARENA WIRE
          </span>
          <div className="animate-marquee inline-block">
            🏀 SHOOT &amp; SUFFER COFFEE BREAK LEAGUE • SHOOT. SCORE. SURVIVE. • {summary.totalGames} GAMES PLAYED TODAY • {summary.totalPushups} PUSH-UPS PAID INTO THE FITNESS TAX • DRINK COFFEE &amp; HIT YOUR SHOTS! ☕🔥
          </div>
        </div>
      </footer>
    </div>
  );
}
