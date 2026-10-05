"use client";

import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  ShieldAlert,
  Check,
  Dumbbell,
  Info,
  Sliders,
  Plus,
  Minus,
} from "lucide-react";
import { sounds } from "@/lib/sound";

export default function SettingsPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [defaultPunishment, setDefaultPunishment] = useState(10);
  const [isCustomDefault, setIsCustomDefault] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    setSoundEnabled(sounds.isEnabled());
    const storedPunishment = localStorage.getItem("shoot_suffer_default_punishment");
    if (storedPunishment) {
      const num = Number(storedPunishment);
      if (!isNaN(num) && num > 0) {
        setDefaultPunishment(num);
        if (![5, 10, 15].includes(num)) {
          setIsCustomDefault(true);
        }
      }
    }
    const storedAnim = localStorage.getItem("shoot_suffer_animations");
    if (storedAnim !== null) setAnimationsEnabled(storedAnim === "true");
  }, []);

  const handleToggleSound = () => {
    const next = sounds.toggle();
    setSoundEnabled(next);
  };

  const handleToggleAnimations = () => {
    const next = !animationsEnabled;
    setAnimationsEnabled(next);
    localStorage.setItem("shoot_suffer_animations", String(next));
  };

  const handleSetDefaultPunishment = (amount: number, isCustom = false) => {
    const clamped = Math.max(1, Math.min(200, isNaN(amount) ? 1 : amount));
    setDefaultPunishment(clamped);
    setIsCustomDefault(isCustom);
    localStorage.setItem("shoot_suffer_default_punishment", String(clamped));
    sounds.playClick();
  };

  const handleResetDatabase = async () => {
    try {
      setResetting(true);
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        sounds.playVictory();
        setResetSuccess(true);
        setShowConfirmModal(false);
        setTimeout(() => setResetSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Reset error", err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3">
          <span>⚙️</span> APP SETTINGS
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Configure game defaults, sounds, animations, and database preferences.
        </p>
      </div>

      {resetSuccess && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-300 flex items-center gap-3 text-sm font-bold">
          <Check className="w-5 h-5 text-emerald-400" />
          <span>Database was reset and re-seeded with demo data successfully!</span>
        </div>
      )}

      {/* GAME DEFAULTS */}
      <section className="rounded-3xl border border-white/10 bg-surface/80 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black uppercase text-white tracking-wide flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-hoop-orange" />
              Default Punishment
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              The preselected push-up punishment amount when creating a new game.
            </p>
          </div>
          <span className="rounded-full px-3 py-1 text-xs font-black tracking-wide uppercase bg-hoop-orange/20 text-hoop-orange border border-hoop-orange/30">
            {defaultPunishment} Push-ups
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {[5, 10, 15].map((amount) => {
            const isSelected = !isCustomDefault && defaultPunishment === amount;
            return (
              <button
                key={amount}
                type="button"
                onClick={() => handleSetDefaultPunishment(amount, false)}
                className={`rounded-2xl p-3.5 text-center font-black uppercase transition-all ${
                  isSelected
                    ? "border-2 border-hoop-orange bg-hoop-orange/20 text-white shadow-lg shadow-hoop-orange/20"
                    : "border border-white/10 bg-white/[0.03] text-gray-400 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <span className="text-lg">{amount}</span>
                <span className="block text-[10px] text-gray-400 mt-0.5">Push-ups</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => handleSetDefaultPunishment(isCustomDefault ? defaultPunishment : 20, true)}
            className={`rounded-2xl p-3.5 text-center font-black uppercase transition-all ${
              isCustomDefault
                ? "border-2 border-hoop-orange bg-hoop-orange/20 text-white shadow-lg shadow-hoop-orange/20"
                : "border border-white/10 bg-white/[0.03] text-gray-400 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            <span className="text-lg">{isCustomDefault ? defaultPunishment : "Custom"}</span>
            <span className="block text-[10px] text-gray-400 mt-0.5">
              {isCustomDefault ? "Push-ups" : "Set Custom"}
            </span>
          </button>
        </div>

        {isCustomDefault && (
          <div className="rounded-2xl border border-hoop-orange/30 bg-hoop-orange/10 p-4 space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-hoop-orange flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                Custom Default Push-ups
              </span>
              <span className="text-[11px] text-gray-300">Min 1 • Max 200</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleSetDefaultPunishment(defaultPunishment - 5, true)}
                className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-black text-gray-200 active:scale-95 transition-all"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => handleSetDefaultPunishment(defaultPunishment - 1, true)}
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 active:scale-95 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="number"
                min={1}
                max={200}
                value={defaultPunishment}
                onChange={(e) => handleSetDefaultPunishment(parseInt(e.target.value, 10), true)}
                className="h-11 w-24 text-center text-xl font-black text-white bg-black/50 border-2 border-hoop-orange/60 rounded-xl focus:border-hoop-orange focus:outline-none"
              />

              <button
                type="button"
                onClick={() => handleSetDefaultPunishment(defaultPunishment + 1, true)}
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleSetDefaultPunishment(defaultPunishment + 5, true)}
                className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-black text-gray-200 active:scale-95 transition-all"
              >
                +5
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {[20, 25, 30, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSetDefaultPunishment(preset, true)}
                  className={`px-3 py-1 rounded-xl text-xs font-black uppercase transition-all ${
                    defaultPunishment === preset
                      ? "bg-hoop-orange text-white shadow-md shadow-hoop-orange/30"
                      : "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {preset}x
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* AUDIO & VISUAL TOGGLES */}
      <section className="rounded-3xl border border-white/10 bg-surface/80 p-6 backdrop-blur-md space-y-4">
        <h2 className="text-base font-black uppercase text-white tracking-wide flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-hoop-amber" />
          Audio &amp; Visuals
        </h2>

        <div className="space-y-3">
          {/* Sound toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-hoop-amber" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <p className="text-sm font-bold text-white">Sound Effects (Web Audio Synthesizer)</p>
                <p className="text-xs text-gray-400">
                  Swish, brick, buzzer, and victory sound effects (100% offline).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleSound}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                soundEnabled ? "bg-hoop-orange" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white transition-transform ${
                  soundEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Animations toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-champion-gold" />
              <div>
                <p className="text-sm font-bold text-white">UI Animations &amp; Confetti</p>
                <p className="text-xs text-gray-400">
                  Celebration confetti and smooth framer transitions.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleAnimations}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                animationsEnabled ? "bg-champion-gold" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white transition-transform ${
                  animationsEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Sound Effect Previews */}
          <div className="pt-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
              🔊 Test Sound Effects
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => sounds.playSwish()}
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-black uppercase text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-sm"
              >
                <span>🏀</span>
                <span>Congrats! (Masuk)</span>
              </button>

              <button
                type="button"
                onClick={() => sounds.playBrick()}
                className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-black uppercase text-rose-300 hover:bg-rose-500/20 active:scale-95 transition-all shadow-sm"
              >
                <span>🤡</span>
                <span>Funny Fail (Miss)</span>
              </button>

              <button
                type="button"
                onClick={() => sounds.playVictory()}
                className="flex items-center justify-center gap-2 rounded-xl border border-champion-gold/30 bg-champion-gold/10 p-3 text-xs font-black uppercase text-champion-gold hover:bg-champion-gold/20 active:scale-95 transition-all shadow-sm"
              >
                <span>🏆</span>
                <span>Victory Fanfare</span>
              </button>

              <button
                type="button"
                onClick={() => sounds.playBuzzer()}
                className="flex items-center justify-center gap-2 rounded-xl border border-hoop-orange/30 bg-hoop-orange/10 p-3 text-xs font-black uppercase text-hoop-orange hover:bg-hoop-orange/20 active:scale-95 transition-all shadow-sm"
              >
                <span>📢</span>
                <span>Buzzer</span>
              </button>

              <button
                type="button"
                onClick={() => sounds.playWhistle()}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-black uppercase text-gray-200 hover:bg-white/10 active:scale-95 transition-all shadow-sm"
              >
                <span>🏁</span>
                <span>Whistle</span>
              </button>

              <button
                type="button"
                onClick={() => sounds.playBounce()}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-black uppercase text-gray-200 hover:bg-white/10 active:scale-95 transition-all shadow-sm"
              >
                <span>🏀</span>
                <span>Ball Bounce</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ADMIN PIN & SECURITY */}
      <section className="rounded-3xl border border-white/10 bg-surface/80 p-6 backdrop-blur-md space-y-4">
        <h2 className="text-base font-black uppercase text-white tracking-wide flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-champion-gold" />
          Admin PIN &amp; Score Editing Security
        </h2>
        <p className="text-xs text-gray-400">
          Set the secret 4-6 digit PIN required to edit match history scores, recalculate rankings, and delete games.
        </p>

        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <div>
              <p className="text-sm font-bold text-white">Custom Admin PIN</p>
              <p className="text-xs text-gray-400">
                Default PIN is <strong className="text-champion-gold font-black">8888</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="password"
                maxLength={6}
                placeholder="4-6 Digits"
                id="admin-pin-input"
                className="h-10 w-28 text-center text-sm font-black text-white bg-black/50 border border-white/20 rounded-xl focus:border-hoop-orange focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById("admin-pin-input") as HTMLInputElement;
                  if (input && input.value.trim().length >= 4) {
                    localStorage.setItem("shoot_suffer_admin_pin", input.value.trim());
                    sounds.playVictory();
                    alert("Admin PIN updated successfully!");
                    input.value = "";
                  } else {
                    sounds.playBrick();
                    alert("PIN must be at least 4 digits.");
                  }
                }}
                className="h-10 px-4 rounded-xl bg-hoop-orange text-white text-xs font-black uppercase hover:bg-hoop-amber transition-colors shadow-md"
              >
                Save PIN
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("shoot_suffer_admin_pin");
                  sessionStorage.removeItem("shoot_suffer_admin_auth");
                  sounds.playClick();
                  alert("Admin PIN reset to default (8888)");
                }}
                className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 text-gray-400 text-xs font-bold uppercase hover:text-white hover:bg-white/10 transition-colors"
                title="Reset to 8888"
              >
                Reset (8888)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* DATABASE MANAGEMENT */}
      <section className="rounded-3xl border border-rose-500/20 bg-surface/80 p-6 backdrop-blur-md space-y-4">
        <h2 className="text-base font-black uppercase text-rose-400 tracking-wide flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-victim-red" />
          Data &amp; Reset
        </h2>
        <p className="text-xs text-gray-400">
          Reset all game scores, player stats, and push-up counters back to the initial demo seed data.
        </p>

        <button
          type="button"
          onClick={() => setShowConfirmModal(true)}
          className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-xs font-black uppercase tracking-wider text-rose-300 hover:bg-rose-500/20 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Demo Data
        </button>
      </section>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-surface border border-white/10 p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-3xl text-rose-400">
              ⚠️
            </div>
            <h3 className="text-xl font-black uppercase text-white">Reset Database?</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              This will wipe all custom matches and restore the default office players (Mul, Jessy, Azhar, Zainul, Prabu, Naufal, Surya).
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-gray-300 uppercase hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetDatabase}
                disabled={resetting}
                className="rounded-xl bg-victim-red py-3 text-xs font-black text-white uppercase hover:bg-rose-600 shadow-lg shadow-victim-red/30 disabled:opacity-50"
              >
                {resetting ? "Resetting..." : "Yes, Reset Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
