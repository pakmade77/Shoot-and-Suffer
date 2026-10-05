"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  History as HistoryIcon,
  Trophy,
  Dumbbell,
  Trash2,
  ExternalLink,
  Edit3,
  Lock,
} from "lucide-react";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { AdminPinModal } from "@/components/game/AdminPinModal";
import { EditGameModal } from "@/components/game/EditGameModal";
import { formatDate } from "@/lib/utils";
import { sounds } from "@/lib/sound";
import { isSessionAdminVerified, getClientAdminPin } from "@/lib/auth";

interface GameRecord {
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

export default function HistoryPage() {
  const [games, setGames] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin Modal States
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    { type: "edit"; game: GameRecord } | { type: "delete"; gameId: string } | null
  >(null);
  const [verifiedAdminPin, setVerifiedAdminPin] = useState<string>("");
  const [editingGame, setEditingGame] = useState<GameRecord | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/games?limit=50");
      if (res.ok) {
        const data = await res.json();
        setGames(data);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleTriggerEdit = (game: GameRecord) => {
    sounds.playClick();
    if (isSessionAdminVerified()) {
      setVerifiedAdminPin(getClientAdminPin());
      setEditingGame(game);
    } else {
      setPendingAction({ type: "edit", game });
      setIsPinModalOpen(true);
    }
  };

  const handleTriggerDelete = (gameId: string) => {
    sounds.playClick();
    if (isSessionAdminVerified()) {
      executeDelete(gameId, getClientAdminPin());
    } else {
      setPendingAction({ type: "delete", gameId });
      setIsPinModalOpen(true);
    }
  };

  const executeDelete = async (gameId: string, pin: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this match record?")) {
      return;
    }
    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": pin,
        },
        body: JSON.stringify({ adminPin: pin }),
      });
      if (res.ok) {
        sounds.playClick();
        await fetchHistory();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete record");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePinSuccess = (pin: string) => {
    setVerifiedAdminPin(pin);
    setIsPinModalOpen(false);

    if (pendingAction?.type === "edit") {
      setEditingGame(pendingAction.game);
    } else if (pendingAction?.type === "delete") {
      executeDelete(pendingAction.gameId, pin);
    }
    setPendingAction(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <span>📜</span> MATCH HISTORY
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Complete record of all coffee break basketball games and punishments.
          </p>
        </div>

        <Link
          href="/game/new"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-hoop-orange to-hoop-amber px-5 py-3 text-sm font-black text-white uppercase tracking-wider shadow-lg shadow-hoop-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          START NEW GAME
        </Link>
      </div>

      {/* GAMES LIST */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">Loading match history...</div>
      ) : games.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-gray-400 space-y-4">
          <HistoryIcon className="w-12 h-12 text-gray-600 mx-auto" />
          <p className="font-semibold">No matches played yet.</p>
          <Link
            href="/game/new"
            className="inline-flex items-center gap-2 rounded-xl bg-hoop-orange px-4 py-2 text-xs font-bold text-white uppercase tracking-wider"
          >
            Play First Game
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {games.map((game) => {
            const winners = game.gamePlayers.filter((gp) => gp.isWinner);
            const losers = game.gamePlayers.filter((gp) => gp.isLoser);

            return (
              <motion.div
                key={game.id}
                whileHover={{ y: -2 }}
                className="rounded-3xl border border-white/10 bg-surface/80 p-5 sm:p-6 backdrop-blur-md transition-all hover:border-hoop-orange/30 shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                    <span>{formatDate(game.playedAt)}</span>
                    <span>•</span>
                    <span className="text-rose-400 font-bold">
                      {game.punishmentAmount} Push-ups tax
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTriggerEdit(game)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-hoop-amber hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl uppercase tracking-wide transition-all"
                      title="Edit Match (Admin PIN Required)"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Skor</span>
                    </button>

                    <Link
                      href={`/game/result/${game.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-hoop-orange hover:text-hoop-amber bg-hoop-orange/10 hover:bg-hoop-orange/20 border border-hoop-orange/20 px-3 py-1.5 rounded-xl uppercase tracking-wide transition-all"
                    >
                      <span>View</span> <ExternalLink className="w-3 h-3" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleTriggerDelete(game.id)}
                      className="rounded-xl p-2 text-gray-400 hover:bg-rose-500/20 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-colors"
                      title="Delete Record (Admin PIN Required)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* WINNER & LOSER HIGHLIGHT */}
                <div className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5 rounded-xl bg-champion-gold/10 border border-champion-gold/20 p-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <p className="text-[11px] font-bold text-champion-gold uppercase">Winner</p>
                      <p className="text-sm font-black text-white">
                        {winners.map((w) => w.player.name).join(", ")} ({winners[0]?.totalScore}/3)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 rounded-xl bg-victim-red/10 border border-victim-red/20 p-3">
                    <span className="text-2xl">💀</span>
                    <div>
                      <p className="text-[11px] font-bold text-rose-400 uppercase">Loser / Victim</p>
                      <p className="text-sm font-black text-white">
                        {losers.map((l) => l.player.name).join(", ")} ({losers[0]?.totalScore}/3)
                      </p>
                    </div>
                  </div>
                </div>

                {/* PLAYERS BREAKDOWN */}
                <div className="space-y-2 pt-1">
                  {game.gamePlayers.map((gp) => (
                    <div
                      key={gp.id}
                      className="flex items-center justify-between rounded-xl bg-white/[0.02] p-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <PlayerAvatar avatar={gp.player.avatar} name={gp.player.name} size="xs" />
                        <Link
                          href={`/players/${gp.player.id}`}
                          className="font-bold text-white hover:text-hoop-orange transition-colors"
                        >
                          {gp.player.name}
                        </Link>
                        {gp.isWinner && <span className="text-champion-gold text-xs">🏆</span>}
                        {gp.isLoser && <span className="text-victim-red text-xs">💀</span>}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Dots */}
                        <div className="flex items-center gap-1">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              gp.shot1 ? "bg-emerald-400" : "bg-rose-500"
                            }`}
                          />
                          <span
                            className={`h-2 w-2 rounded-full ${
                              gp.shot2 ? "bg-emerald-400" : "bg-rose-500"
                            }`}
                          />
                          <span
                            className={`h-2 w-2 rounded-full ${
                              gp.shot3 ? "bg-emerald-400" : "bg-rose-500"
                            }`}
                          />
                        </div>

                        <span className="font-black text-white min-w-[24px] text-right">
                          {gp.totalScore}/3
                        </span>

                        {gp.isLoser && (
                          <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <Dumbbell className="w-3 h-3 text-victim-red" />
                            +{gp.pushupAmount} Push-ups
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ADMIN PIN VERIFICATION MODAL */}
      <AdminPinModal
        isOpen={isPinModalOpen}
        onSuccess={handlePinSuccess}
        onClose={() => {
          setIsPinModalOpen(false);
          setPendingAction(null);
        }}
      />

      {/* EDIT GAME MODAL */}
      {editingGame && (
        <EditGameModal
          isOpen={Boolean(editingGame)}
          gameId={editingGame.id}
          initialPlayers={editingGame.gamePlayers}
          initialPunishment={editingGame.punishmentAmount}
          adminPin={verifiedAdminPin}
          onSuccess={() => {
            setEditingGame(null);
            fetchHistory();
          }}
          onClose={() => setEditingGame(null)}
        />
      )}
    </div>
  );
}

