"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Trophy,
  Dumbbell,
  Sparkles,
  Save,
  AlertCircle,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { calculateGameResults, ShotInput } from "@/lib/calculations";
import { sounds } from "@/lib/sound";

interface EditGameModalProps {
  isOpen: boolean;
  gameId: string;
  initialPlayers: Array<{
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
    player: {
      id?: string;
      name: string;
      avatar: string | null;
      nickname: string | null;
    };
  }>;
  initialPunishment: number;
  adminPin: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function EditGameModal({
  isOpen,
  gameId,
  initialPlayers,
  initialPunishment,
  adminPin,
  onSuccess,
  onClose,
}: EditGameModalProps) {
  const [shotsState, setShotsState] = useState<ShotInput[]>([]);
  const [punishmentAmount, setPunishmentAmount] = useState<number>(initialPunishment || 10);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialPlayers) {
      setShotsState(
        initialPlayers.map((p) => ({
          playerId: p.playerId,
          shot1: Boolean(p.shot1),
          shot2: Boolean(p.shot2),
          shot3: Boolean(p.shot3),
        }))
      );
      setPunishmentAmount(initialPunishment || 10);
      setError(null);
    }
  }, [isOpen, initialPlayers, initialPunishment]);

  const toggleShot = (playerId: string, shotKey: "shot1" | "shot2" | "shot3") => {
    sounds.playClick();
    setError(null);
    setShotsState((prev) =>
      prev.map((s) => {
        if (s.playerId === playerId) {
          const newVal = !s[shotKey];
          return {
            ...s,
            [shotKey]: newVal,
          };
        }
        return s;
      })
    );
  };

  // Live recalculated preview results
  const previewResults = useMemo(() => {
    if (shotsState.length === 0) return [];
    try {
      return calculateGameResults(shotsState, punishmentAmount);
    } catch {
      return [];
    }
  }, [shotsState, punishmentAmount]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/games/${gameId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": adminPin,
        },
        body: JSON.stringify({
          shots: shotsState,
          punishmentAmount,
          adminPin,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update match results");
      }

      sounds.playVictory();
      onSuccess();
    } catch (err: unknown) {
      console.error(err);
      sounds.playBrick();
      const msg = err instanceof Error ? err.message : "Error saving changes";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
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
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border-2 border-hoop-orange/50 bg-surface p-5 sm:p-7 shadow-2xl z-10"
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="border-b border-white/10 pb-4 mb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-hoop-orange/15 px-3 py-0.5 text-xs font-black text-hoop-orange uppercase tracking-wider mb-1.5 border border-hoop-orange/30">
            <span>🛡️ Admin Score Editor</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <span>🏀</span> Edit Match Results
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Modify player shots and punishment. Winners, losers, and push-ups will recalculate automatically.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-300 flex items-center gap-2.5 text-xs font-bold">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* PUNISHMENT SELECTOR */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-white tracking-wide flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-victim-red" />
              Push-up Punishment Tax
            </p>
            <p className="text-[11px] text-gray-400">Amount paid by loser(s)</p>
          </div>

          <div className="flex items-center gap-2">
            {[5, 10, 15].map((amt) => {
              const isSelected = punishmentAmount === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setPunishmentAmount(amt);
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase transition-all ${
                    isSelected
                      ? "bg-victim-red text-white shadow-md shadow-victim-red/30 ring-1 ring-rose-400"
                      : "border border-white/10 bg-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  {amt} Push-ups
                </button>
              );
            })}
          </div>
        </div>

        {/* PLAYERS LIST & SHOTS EDITOR */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {initialPlayers.map((p) => {
            const currentShot = shotsState.find((s) => s.playerId === p.playerId) || {
              playerId: p.playerId,
              shot1: false,
              shot2: false,
              shot3: false,
            };
            const preview = previewResults.find((pr) => pr.playerId === p.playerId);
            const isWinner = preview ? preview.isWinner : p.isWinner;
            const isLoser = preview ? preview.isLoser : p.isLoser;
            const currentTotal =
              (currentShot.shot1 ? 1 : 0) +
              (currentShot.shot2 ? 1 : 0) +
              (currentShot.shot3 ? 1 : 0);

            return (
              <div
                key={p.playerId}
                className={`rounded-2xl border p-3.5 transition-all ${
                  isWinner
                    ? "border-champion-gold/40 bg-champion-gold/[0.08]"
                    : isLoser
                    ? "border-victim-red/30 bg-victim-red/[0.04]"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* PLAYER INFO */}
                  <div className="flex items-center gap-3 min-w-0">
                    <PlayerAvatar
                      avatar={p.player.avatar}
                      name={p.player.name}
                      size="sm"
                      className={isWinner ? "ring-2 ring-champion-gold" : ""}
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-white flex items-center gap-1.5 truncate">
                        {p.player.name}
                        {isWinner && (
                          <span className="text-xs text-champion-gold font-bold">🏆 Winner</span>
                        )}
                        {isLoser && (
                          <span className="text-xs text-rose-400 font-bold">
                            💀 Loser (+{preview?.pushupAmount ?? punishmentAmount} push-ups)
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Score:{" "}
                        <strong className="text-white">
                          {currentTotal} / 3 Hits
                        </strong>
                      </p>
                    </div>
                  </div>

                  {/* 3 SHOT TOGGLES */}
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((shotNum) => {
                      const shotKey = `shot${shotNum}` as "shot1" | "shot2" | "shot3";
                      const isHit = currentShot[shotKey];

                      return (
                        <button
                          key={shotNum}
                          type="button"
                          onClick={() => toggleShot(p.playerId, shotKey)}
                          className={`flex items-center justify-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-black uppercase transition-all ${
                            isHit
                              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300"
                              : "border border-rose-500/30 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
                          }`}
                          title={`Toggle Shot ${shotNum}`}
                        >
                          <span>{isHit ? "🏀" : "🧱"}</span>
                          <span>#{shotNum}</span>
                          {isHit ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <X className="w-3 h-3 stroke-[3]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-wider text-gray-300 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-hoop-orange to-hoop-amber px-5 py-3 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-hoop-orange/30 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes & Recalculating..." : "Save & Recalculate Match"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
