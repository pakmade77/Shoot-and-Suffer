"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto my-16 rounded-3xl border border-white/10 bg-surface p-8 text-center space-y-5 shadow-2xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-3xl">
        🏀
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-black uppercase text-white tracking-wide">
          Shoot &amp; Suffer
        </h2>
        <p className="text-xs text-gray-400">
          Terjadi pembaruan data atau cache halaman. Silakan muat ulang atau kembali ke beranda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 pt-2">
        <button
          type="button"
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-hoop-orange to-hoop-amber py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-hoop-orange/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Muat Ulang Halaman
        </button>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-bold uppercase text-gray-300 hover:bg-white/10 hover:text-white transition-all"
        >
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
