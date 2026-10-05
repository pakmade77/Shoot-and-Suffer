"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Skull,
  Dumbbell,
  Share2,
  CheckCircle2,
  X,
  AlertTriangle,
  Flame,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { sounds } from "@/lib/sound";

interface DebtorItem {
  player: {
    id: string;
    name: string;
    nickname: string | null;
    avatar: string | null;
  };
  totalDebt: number;
  unpaidGamesCount: number;
  records: Array<{
    id: string;
    gameId: string;
    playedAt: string;
    pushupAmount: number;
  }>;
}

interface DebtCollectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettled?: () => void;
}

export function DebtCollectorModal({
  isOpen,
  onClose,
  onSettled,
}: DebtCollectorModalProps) {
  const [debtors, setDebtors] = useState<DebtorItem[]>([]);
  const [totalOutstanding, setTotalOutstanding] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/debts");
      if (res.ok) {
        const data = await res.json();
        setDebtors(data.debtors || []);
        setTotalOutstanding(data.totalOutstandingPushups || 0);
      }
    } catch (err) {
      console.error("Failed to load debts", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchDebts();
    }
  }, [isOpen, fetchDebts]);

  const handleSettleAll = async (playerId: string, playerName: string) => {
    sounds.playClick();
    setSettlingId(playerId);
    try {
      const res = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, settleAll: true }),
      });
      if (res.ok) {
        sounds.playPushup();
        sounds.haptic("success");
        await fetchDebts();
        if (onSettled) onSettled();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSettlingId(null);
    }
  };

  const handleWhatsAppShare = (debtor: DebtorItem) => {
    sounds.playClick();
    const text = `🚨 *SURAT TAGIHAN PUSH-UP KANTOR* 🚨%0A%0AHalo *${debtor.player.name}*! %F0%9F%92%AA%0ACatatan *Shoot %26 Suffer League* mendeteksi kamu masih memiliki tunggakan *${debtor.totalDebt} PUSH-UPS* dari ${debtor.unpaidGamesCount} game! %F0%9F%92%80%0A%0AYuk segera dilunasi di area ring kantor biar lengan makin kekar! %F0%9F%94%A5%F0%9F%8F%80%0A%0A_Semangat berotot!_`;
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative z-10 w-full max-w-xl rounded-3xl border-2 border-victim-red/50 bg-surface p-6 shadow-2xl space-y-5 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-victim-red/20 text-victim-red text-xl shadow-inner">
                💀
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-white tracking-wide flex items-center gap-1.5">
                  <span>Hall of Shame &amp; Debt Collector</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Daftar hutang push-up kantor yang belum lunas
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* OUTSTANDING SUMMARY BANNER */}
          <div className="rounded-2xl border border-victim-red/30 bg-gradient-to-r from-victim-red/20 via-rose-950/30 to-victim-red/20 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-rose-300">
                Total Tunggakan Kantor
              </p>
              <p className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 mt-0.5">
                <span>{totalOutstanding}</span>
                <span className="text-sm font-bold text-rose-400">Push-ups Belum Bayar 💪</span>
              </p>
            </div>
            <span className="rounded-full bg-victim-red/30 px-3 py-1 text-xs font-black text-rose-300 border border-victim-red/40">
              {debtors.length} Penunggak
            </span>
          </div>

          {/* DEBTORS LIST */}
          <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1">
            {loading ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                Memeriksa buku hutang...
              </div>
            ) : debtors.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-2">
                <span className="text-3xl">🎉</span>
                <p className="font-bold text-white text-sm">
                  Luar biasa! Tidak ada hutang push-up yang tertunggak.
                </p>
                <p className="text-xs text-gray-400">
                  Semua kekalahan sudah dibayar tuntas.
                </p>
              </div>
            ) : (
              debtors.map((d, idx) => (
                <div
                  key={d.player.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 hover:border-victim-red/40 hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black ${
                        idx === 0
                          ? "bg-victim-red text-white shadow-md shadow-victim-red/30"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <PlayerAvatar
                      avatar={d.player.avatar}
                      name={d.player.name}
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-1.5">
                        {d.player.name}
                        {d.player.nickname && (
                          <span className="text-xs text-rose-300 font-semibold">
                            &quot;{d.player.nickname}&quot;
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {d.unpaidGamesCount} Game belum push-up
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                    <span className="rounded-xl bg-victim-red/20 border border-victim-red/30 px-3 py-1.5 text-xs font-black text-rose-300">
                      💪 {d.totalDebt} Push-ups
                    </span>

                    {/* WHATSAPP TAGIH BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleWhatsAppShare(d)}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                      title="Tagih via WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Tagih WA</span>
                    </button>

                    {/* SETTLE BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleSettleAll(d.player.id, d.player.name)}
                      disabled={settlingId === d.player.id}
                      className="inline-flex items-center gap-1 rounded-xl bg-white/10 hover:bg-emerald-500 hover:text-white px-3 py-1.5 text-xs font-bold text-gray-200 transition-all active:scale-95 disabled:opacity-40"
                      title="Tandai Semua Lunas"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Lunas</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/10 pt-3 text-center">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl bg-white/10 py-3 text-xs font-black uppercase tracking-wider text-gray-300 hover:bg-white/15 hover:text-white transition-all"
            >
              Tutup Buku Hutang
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
