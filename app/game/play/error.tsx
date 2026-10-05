"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home, Play } from "lucide-react";

export default function GamePlayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Game Play Error:", error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto my-12 rounded-3xl border border-white/10 bg-surface p-8 text-center space-y-5 shadow-2xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-3xl">
        🏀⚠️
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-black uppercase text-white tracking-wide">
          Sesi Permainan Diperbarui
        </h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          Sesi pertandingan perlu diinisialisasi ulang untuk memastikan urutan shooter dan skor tersimpan akurat.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 pt-2">
        <Link
          href="/game/new"
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-hoop-orange to-hoop-amber py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-hoop-orange/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Play className="w-4 h-4 fill-white" />
          Mulai Game Baru (New Game)
        </Link>

        <button
          type="button"
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-bold uppercase text-gray-300 hover:bg-white/10 hover:text-white transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Coba Muat Ulang Sesi
        </button>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-300 pt-1"
        >
          <Home className="w-3.5 h-3.5" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
