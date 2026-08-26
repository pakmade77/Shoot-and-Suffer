"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Flame, Trophy, Users, History, Settings, Volume2, VolumeX, Play } from "lucide-react";
import { sounds } from "@/lib/sound";

export function Navbar() {
  const pathname = usePathname();
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(sounds.isEnabled());
  }, []);

  const handleToggleSound = () => {
    const next = sounds.toggle();
    setSoundOn(next);
    if (next) {
      sounds.playClick();
    }
  };

  const navItems = [
    { name: "Home", href: "/", icon: Flame },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "History", href: "/history", icon: History },
    { name: "Players", href: "/players", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 h-16">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-hoop-orange to-hoop-amber shadow-md shadow-hoop-orange/20 group-hover:scale-105 transition-transform">
            <span className="text-2xl">🏀</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-wider text-white uppercase group-hover:text-hoop-orange transition-colors">
                SHOOT & SUFFER
              </span>
            </div>
            <p className="text-[11px] font-medium text-gray-400 tracking-wide">
              Coffee Break Basketball
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "bg-white/10 text-hoop-orange shadow-inner"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-hoop-orange" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundOn ? "Mute Sound Effects" : "Enable Sound Effects"}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            {soundOn ? (
              <Volume2 className="w-5 h-5 text-hoop-amber" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {/* New Game CTA */}
          <Link
            href="/game/new"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-hoop-orange to-hoop-amber px-4 py-2 text-sm font-bold text-white shadow-lg shadow-hoop-orange/25 hover:from-hoop-glow hover:to-hoop-yellow hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            NEW GAME
          </Link>
        </div>
      </div>
    </header>
  );
}
