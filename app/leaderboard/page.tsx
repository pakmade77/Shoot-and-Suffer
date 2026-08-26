"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Dumbbell, Flame, Sparkles, User, Award } from "lucide-react";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { Timeframe } from "@/lib/calculations";

interface LeaderboardItem {
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

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>("today");
  const [activeTab, setActiveTab] = useState<"championship" | "pushups">("championship");
  const [loading, setLoading] = useState(true);
  const [championship, setChampionship] = useState<LeaderboardItem[]>([]);
  const [pushupKings, setPushupKings] = useState<LeaderboardItem[]>([]);
  const [summary, setSummary] = useState({ totalGames: 0, totalPushups: 0, activePlayers: 0 });

  const fetchLeaderboard = useCallback(async (tf: Timeframe) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leaderboard?timeframe=${tf}`);
      if (res.ok) {
        const data = await res.json();
        setChampionship(data.championship || []);
        setPushupKings(data.pushupKings || []);
        setSummary(data.summary || { totalGames: 0, totalPushups: 0, activePlayers: 0 });
      }
    } catch (err) {
      console.error("Failed to load leaderboard data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(timeframe);
  }, [timeframe, fetchLeaderboard]);

  const timeframeTabs: { key: Timeframe; label: string }[] = [
    { key: "today", label: "TODAY" },
    { key: "week", label: "THIS WEEK" },
    { key: "month", label: "THIS MONTH" },
    { key: "all", label: "ALL TIME" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <span>🏆</span> OFFICE LEADERBOARD
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Who rules the court, and who has suffered the most?
          </p>
        </div>

        {/* TIMEFRAME PILL SWITCHER */}
        <div className="inline-flex rounded-2xl bg-surface p-1.5 border border-white/10 overflow-x-auto">
          {timeframeTabs.map((t) => {
            const isSelected = timeframe === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTimeframe(t.key)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-hoop-orange text-white shadow-md shadow-hoop-orange/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* METRIC OVERVIEW BAR */}
      <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-surface/60 p-4">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase text-gray-400">Total Matches</p>
          <p className="text-xl sm:text-2xl font-black text-white">{summary.totalGames}</p>
        </div>
        <div className="text-center border-x border-white/10">
          <p className="text-[11px] font-bold uppercase text-gray-400">Total Push-ups</p>
          <p className="text-xl sm:text-2xl font-black text-victim-red">{summary.totalPushups} 💪</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase text-gray-400">Shooters</p>
          <p className="text-xl sm:text-2xl font-black text-hoop-amber">{summary.activePlayers}</p>
        </div>
      </div>

      {/* LEADERBOARD VIEW TOGGLE */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("championship")}
          className={`flex items-center justify-center gap-2.5 rounded-2xl p-4 font-black text-sm uppercase tracking-wider transition-all ${
            activeTab === "championship"
              ? "border-2 border-champion-gold bg-champion-gold/15 text-champion-gold shadow-lg shadow-champion-gold/15"
              : "border border-white/10 bg-surface/80 text-gray-400 hover:bg-surface hover:text-white"
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>🏆 CHAMPIONSHIP</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pushups")}
          className={`flex items-center justify-center gap-2.5 rounded-2xl p-4 font-black text-sm uppercase tracking-wider transition-all ${
            activeTab === "pushups"
              ? "border-2 border-victim-red bg-victim-red/15 text-victim-red shadow-lg shadow-victim-red/15"
              : "border border-white/10 bg-surface/80 text-gray-400 hover:bg-surface hover:text-white"
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          <span>💀 PUSH-UP KING</span>
        </button>
      </div>

      {/* TABLE / LIST CONTENT */}
      {activeTab === "championship" ? (
        <section className="rounded-3xl border border-white/10 bg-surface/80 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-lg font-black uppercase text-white tracking-wide flex items-center gap-2">
                <Trophy className="w-5 h-5 text-champion-gold" />
                Championship Standings
              </h2>
              <p className="text-xs text-gray-400">Ranked by Wins &rarr; Total Points &rarr; Win Rate</p>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">Calculating rankings...</div>
          ) : championship.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-gray-400 space-y-2">
              <Trophy className="w-10 h-10 text-gray-600 mx-auto" />
              <p className="font-semibold text-sm">No games recorded in this timeframe.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {championship.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${
                    player.rank === 1
                      ? "border-champion-gold/50 bg-gradient-to-r from-champion-gold/15 to-transparent shadow-md shadow-champion-gold/10"
                      : player.rank === 2
                      ? "border-gray-400/40 bg-gray-400/5"
                      : player.rank === 3
                      ? "border-amber-700/40 bg-amber-700/5"
                      : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${
                        player.rank === 1
                          ? "bg-champion-gold text-black shadow-md"
                          : player.rank === 2
                          ? "bg-gray-300 text-black"
                          : player.rank === 3
                          ? "bg-amber-700 text-white"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {player.rank}
                    </span>

                    <PlayerAvatar avatar={player.avatar} name={player.name} size="md" />

                    <div>
                      <Link
                        href={`/players/${player.id}`}
                        className="text-base font-black text-white hover:text-hoop-orange transition-colors flex items-center gap-2"
                      >
                        {player.name}
                        {player.rank === 1 && <span>👑</span>}
                      </Link>
                      <p className="text-xs text-gray-400">
                        {player.totalGames} {player.totalGames === 1 ? "game" : "games"} played
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-8 text-right">
                    <div>
                      <p className="text-base sm:text-lg font-black text-champion-gold">
                        {player.wins} <span className="text-xs font-semibold text-gray-400">W</span>
                      </p>
                      <p className="text-[11px] text-gray-400">{player.winRate}% Win Rate</p>
                    </div>

                    <div className="min-w-[60px]">
                      <p className="text-base sm:text-lg font-black text-white">
                        {player.totalPoints} <span className="text-xs font-semibold text-gray-400">PTS</span>
                      </p>
                      <p className="text-[11px] text-gray-400">{player.avgScore} avg</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-3xl border border-white/10 bg-surface/80 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-lg font-black uppercase text-rose-400 tracking-wide flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-victim-red" />
                Push-up King Leaderboard
              </h2>
              <p className="text-xs text-gray-400">The most decorated athlete in the office... unfortunately.</p>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">Calculating victims...</div>
          ) : pushupKings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-gray-400 space-y-2">
              <Dumbbell className="w-10 h-10 text-gray-600 mx-auto" />
              <p className="font-semibold text-sm">No push-ups recorded in this timeframe.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pushupKings.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${
                    player.rank === 1
                      ? "border-victim-red/50 bg-gradient-to-r from-victim-red/15 to-transparent shadow-md shadow-victim-red/10"
                      : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${
                        player.rank === 1
                          ? "bg-victim-red text-white"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {player.rank}
                    </span>

                    <PlayerAvatar avatar={player.avatar} name={player.name} size="md" />

                    <div>
                      <Link
                        href={`/players/${player.id}`}
                        className="text-base font-black text-white hover:text-rose-400 transition-colors flex items-center gap-2"
                      >
                        {player.name}
                        {player.rank === 1 && <span>💀</span>}
                      </Link>
                      <p className="text-xs text-gray-400">
                        {player.losses} {player.losses === 1 ? "loss" : "losses"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-8 text-right">
                    <div>
                      <p className="text-base sm:text-lg font-black text-rose-400">
                        {player.totalPushups} <span className="text-xs font-semibold text-gray-400">Push-ups</span>
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {player.losses} {player.losses === 1 ? "Penalty" : "Penalties"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
