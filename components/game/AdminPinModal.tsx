"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldCheck, KeyRound, X, AlertCircle, Check } from "lucide-react";
import { getClientAdminPin, setSessionAdminVerified, isSessionAdminVerified } from "@/lib/auth";
import { sounds } from "@/lib/sound";

interface AdminPinModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  onSuccess: (pin: string) => void;
  onClose: () => void;
}

export function AdminPinModal({
  isOpen,
  title = "Admin PIN Verification",
  description = "Enter Admin PIN to edit match results & manage scores.",
  onSuccess,
  onClose,
}: AdminPinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [rememberSession, setRememberSession] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setError(null);
      // If already verified in session, auto proceed
      if (isSessionAdminVerified()) {
        const clientPin = getClientAdminPin();
        onSuccess(clientPin);
      }
    }
  }, [isOpen, onSuccess]);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    sounds.playClick();
    setError(null);
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verify(nextPin);
      }
    }
  };

  const handleDelete = () => {
    sounds.playClick();
    setError(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    sounds.playClick();
    setError(null);
    setPin("");
  };

  const verify = (enteredPin: string) => {
    const validPin = getClientAdminPin();
    if (enteredPin === validPin) {
      sounds.playVictory();
      if (rememberSession) {
        setSessionAdminVerified(true);
      }
      onSuccess(enteredPin);
    } else {
      sounds.playBrick();
      setError("Incorrect PIN. Please try again.");
      setTimeout(() => {
        setPin("");
      }, 500);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) {
      setError("Please enter your PIN");
      return;
    }
    verify(pin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* MODAL CARD */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border-2 border-hoop-orange/40 bg-surface p-6 sm:p-7 shadow-2xl z-10 space-y-5"
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
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-hoop-orange/20 to-champion-gold/20 border border-hoop-orange/40 text-hoop-orange shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center justify-center gap-2">
            <span>🛡️</span> {title}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed px-2">
            {description}
          </p>
        </div>

        {/* PIN DISPLAY DIGITS */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-3 py-2">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <motion.div
                  key={idx}
                  animate={{ scale: isFilled ? 1.15 : 1 }}
                  className={`h-4 w-4 rounded-full transition-all ${
                    isFilled
                      ? "bg-hoop-orange ring-4 ring-hoop-orange/30 shadow-md shadow-hoop-orange/50"
                      : "bg-white/15 border border-white/20"
                  }`}
                />
              );
            })}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold text-rose-400 flex items-center gap-1 mt-1"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </motion.p>
          )}
        </div>

        {/* NUMERIC KEYPAD */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-lg font-black text-white hover:border-hoop-orange/40 hover:bg-hoop-orange/15 active:scale-95 transition-all shadow-sm"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] text-xs font-black uppercase text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress("0")}
            className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-lg font-black text-white hover:border-hoop-orange/40 hover:bg-hoop-orange/15 active:scale-95 transition-all shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] text-xs font-black uppercase text-rose-400 hover:bg-rose-500/15 active:scale-95 transition-all"
          >
            ⌫
          </button>
        </div>

        {/* REMEMBER & FOOTER */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberSession}
              onChange={(e) => setRememberSession(e.target.checked)}
              className="rounded border-white/20 bg-white/10 text-hoop-orange focus:ring-0"
            />
            <span>Remember session</span>
          </label>
        </div>
      </motion.div>
    </div>
  );
}
