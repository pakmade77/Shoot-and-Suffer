"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface WinnerConfettiProps {
  duration?: number;
}

export function WinnerConfetti({ duration = 3000 }: WinnerConfettiProps) {
  useEffect(() => {
    const end = Date.now() + duration;

    const colors = ["#FF5500", "#F59E0B", "#FDE047", "#10B981", "#3B82F6"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, [duration]);

  return null;
}
