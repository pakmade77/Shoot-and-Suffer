"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlayCircle, Trophy, Users, History } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Rankings", href: "/leaderboard", icon: Trophy },
    { name: "Game", href: "/game/new", icon: PlayCircle, highlight: true },
    { name: "History", href: "/history", icon: History },
    { name: "Players", href: "/players", icon: Users },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t border-white/10 bg-surface/95 backdrop-blur-lg pb-safe">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href === "/game/new" && pathname.startsWith("/game"));

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-hoop-orange to-hoop-amber shadow-lg shadow-hoop-orange/40 ring-4 ring-background">
                  <span className="text-2xl">🏀</span>
                </div>
                <span className="mt-1 text-[11px] font-bold text-hoop-orange">
                  PLAY
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center py-1 transition-colors ${
                active ? "text-hoop-orange" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-hoop-orange" : "text-gray-400"}`} />
              <span className="text-[10px] font-semibold mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
