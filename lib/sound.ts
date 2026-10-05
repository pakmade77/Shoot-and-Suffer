"use client";

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private failSoundIndex: number = 0;

  private voiceEnabled: boolean = true;

  constructor() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("shoot_suffer_sound");
      this.enabled = stored !== null ? stored === "true" : true;
      const storedVoice = localStorage.getItem("shoot_suffer_voice_announcer");
      this.voiceEnabled = storedVoice !== null ? storedVoice === "true" : true;
    }
  }

  private initCtx() {
    try {
      if (!this.ctx && typeof window !== "undefined") {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // Audio not permitted or supported
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("shoot_suffer_sound", String(enabled));
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  public isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("shoot_suffer_voice_announcer", String(enabled));
    }
  }

  public toggleVoice(): boolean {
    this.setVoiceEnabled(!this.voiceEnabled);
    return this.voiceEnabled;
  }

  // 📳 Haptic Vibration Feedback for Mobile Devices
  public haptic(type: "light" | "medium" | "heavy" | "success" | "warning" | "error" = "light") {
    if (typeof window === "undefined" || !("vibrate" in navigator)) return;
    try {
      switch (type) {
        case "light":
          navigator.vibrate(15);
          break;
        case "medium":
          navigator.vibrate(35);
          break;
        case "heavy":
          navigator.vibrate([40, 20, 40]);
          break;
        case "success":
          navigator.vibrate([20, 30, 60]);
          break;
        case "warning":
          navigator.vibrate([40, 40, 40]);
          break;
        case "error":
          navigator.vibrate([80, 40, 80, 40, 120]);
          break;
      }
    } catch {
      // Vibration not permitted or supported
    }
  }

  // 🎙️ Streetball Voice Announcer via Web Speech Synthesis
  public voiceAnnounce(text: string, options?: { pitch?: number; rate?: number }) {
    if (!this.voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate ?? 1.12; // Fast and energetic streetball pace
      utterance.pitch = options?.pitch ?? 1.05; // Slightly high hype tone
      utterance.volume = 0.9;
      
      // Prefer English voice for arcade punchiness, or fallback to default
      const rawVoices = window.speechSynthesis.getVoices();
      const voices = Array.isArray(rawVoices) ? rawVoices : [];
      if (voices.length > 0) {
        const preferred = voices.find(
          (v) => v.lang && v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("David"))
        ) || voices[0];
        if (preferred) utterance.voice = preferred;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis not available
    }
  }

  // 🎙️ Voice Callouts
  public announceTurn(playerName: string, round?: number) {
    if (round) {
      this.voiceAnnounce(`Round ${round}! Up next: ${playerName}!`);
    } else {
      this.voiceAnnounce(`Next shooter: ${playerName}! Let's see it!`);
    }
  }

  public announceHit() {
    this.haptic("success");
    const phrases = ["Swish!", "Splash!", "Nothing but net!", "Bucket!", "Pure silk!", "That's cash!"];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    this.voiceAnnounce(phrase, { rate: 1.25, pitch: 1.1 });
  }

  public announceMiss() {
    this.haptic("error");
    const phrases = ["Airball!", "Brick!", "Clank!", "Off the iron!", "No good!", "Ouch, that hurts!"];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    this.voiceAnnounce(phrase, { rate: 1.2, pitch: 0.95 });
  }

  public announceSuddenDeath() {
    this.haptic("warning");
    this.voiceAnnounce("Sudden death! All or nothing! One shot to survive!");
  }

  public announceVictory(winnerName: string, loserName: string) {
    this.haptic("success");
    this.voiceAnnounce(`Game over! ${winnerName} takes the crown! ${loserName} pays the push-up tax!`);
  }

  // 🏀 CONGRATS / SWISH SOUND: Crisp net swoosh + uplifting, sparkling triumphant chime arpeggio
  public playSwish() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // 1. Crisp Net Brush Swoosh (White noise with rapid bandpass downward sweep)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.22);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(700, now + 0.18);
      filter.Q.setValueAtTime(4, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      whiteNoise.start(now);

      // 2. Celebratory "Congrats / Nice Shot!" Bell Chime Arpeggio: [G5, C6, E6, G6, C7]
      const chimeNotes = [
        { freq: 783.99, delay: 0.03, dur: 0.25, vol: 0.25 }, // G5
        { freq: 1046.5, delay: 0.08, dur: 0.3, vol: 0.3 },  // C6
        { freq: 1318.51, delay: 0.14, dur: 0.35, vol: 0.35 }, // E6
        { freq: 1567.98, delay: 0.2, dur: 0.4, vol: 0.4 },  // G6
        { freq: 2093.0, delay: 0.27, dur: 0.55, vol: 0.45 }, // C7 (High Sparkle)
      ];

      chimeNotes.forEach(({ freq, delay, dur, vol }) => {
        const osc = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + delay);

        // Subtle shimmer vibrato on the highest note
        if (freq >= 2000) {
          osc.frequency.exponentialRampToValueAtTime(freq * 1.01, now + delay + dur);
        }

        oscGain.gain.setValueAtTime(0.001, now + delay);
        oscGain.gain.linearRampToValueAtTime(vol, now + delay + 0.015);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);

        osc.connect(oscGain);
        oscGain.connect(this.ctx!.destination);

        osc.start(now + delay);
        osc.stop(now + delay + dur);
      });

      // 3. Subtle Warm Glass Harmonic Underneath
      const padOsc = this.ctx.createOscillator();
      const padGain = this.ctx.createGain();
      padOsc.type = "triangle";
      padOsc.frequency.setValueAtTime(523.25, now + 0.05); // C5 fundamental
      padGain.gain.setValueAtTime(0.001, now + 0.05);
      padGain.gain.linearRampToValueAtTime(0.18, now + 0.1);
      padGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      padOsc.connect(padGain);
      padGain.connect(this.ctx.destination);
      padOsc.start(now + 0.05);
      padOsc.stop(now + 0.6);
    } catch {
      // Audio not supported or policy blocked
    }
  }

  // 🤡 HILARIOUS CARTOON FAIL SOUNDS: Very funny comical sounds for missed shots
  public playBrick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // Cycle through 3 hilarious cartoon fail sound styles
      const soundType = this.failSoundIndex % 3;
      this.failSoundIndex++;

      if (soundType === 0) {
        // 🎺 Style 1: Comedic Sad Trombone "Womp-Womp-Womp-Waaaaah"
        this.playCartoonWompTrombone();
      } else if (soundType === 1) {
        // 🌀 Style 2: Goofy Spring "Boing-Boing-Twang"
        this.playCartoonSpringBoing();
      } else {
        // 🦆 Style 3: Comical Slide Whistle Drop & Squeak
        this.playCartoonSlideDrop();
      }
    } catch {
      // Ignore
    }
  }

  // 🎺 Style 1: Classic Sad Trombone Wah-Wah-Wah-Waaaaah
  private playCartoonWompTrombone() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 4 Descending notes with funny wah-wah mute: Eb4 -> D4 -> Db4 -> C4 (bending down with vibrato)
    const notes = [
      { f: 311.13, delay: 0.0, dur: 0.18 }, // Eb4
      { f: 293.66, delay: 0.19, dur: 0.18 }, // D4
      { f: 277.18, delay: 0.38, dur: 0.18 }, // Db4
      { f: 261.63, delay: 0.57, dur: 0.65, bendTo: 233.08 }, // C4 -> Bb3 slide with heavy vibrato
    ];

    notes.forEach((note, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      // Sawtooth + Lowpass filter for plunger mute brass trombone timbre
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(note.f, now + note.delay);

      filter.type = "bandpass";
      filter.Q.setValueAtTime(3.5, now + note.delay);

      // Comedic "Wah" filter sweep on each note
      filter.frequency.setValueAtTime(450, now + note.delay);
      filter.frequency.exponentialRampToValueAtTime(1100, now + note.delay + 0.06);
      filter.frequency.exponentialRampToValueAtTime(400, now + note.delay + note.dur);

      if (note.bendTo) {
        // Final long note: funny slide down + comedic wobbling vibrato
        osc.frequency.exponentialRampToValueAtTime(note.bendTo, now + note.delay + note.dur);

        // Add LFO for funny trembling vibrato
        const lfo = this.ctx!.createOscillator();
        const lfoGain = this.ctx!.createGain();
        lfo.frequency.setValueAtTime(7, now + note.delay); // 7Hz funny wobble
        lfoGain.gain.setValueAtTime(12, now + note.delay);
        lfo.connect(osc.frequency);
        lfo.start(now + note.delay + 0.1);
        lfo.stop(now + note.delay + note.dur);
      }

      gain.gain.setValueAtTime(0.001, now + note.delay);
      gain.gain.linearRampToValueAtTime(0.35, now + note.delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.delay + note.dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + note.delay);
      osc.stop(now + note.delay + note.dur + 0.02);
    });
  }

  // 🌀 Style 2: Goofy Cartoon Spring Boing
  private playCartoonSpringBoing() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc.type = "triangle";
    // Fast pitch rise with funny wobble
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.55);

    // Fast 30Hz spring FM vibration
    lfo.frequency.setValueAtTime(28, now);
    lfoGain.gain.setValueAtTime(45, now);
    lfoGain.gain.exponentialRampToValueAtTime(2, now + 0.55);

    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.55);
    osc.stop(now + 0.55);

    // Second smaller comical bounce
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(320, now + 0.22);
    osc2.frequency.exponentialRampToValueAtTime(180, now + 0.45);

    gain2.gain.setValueAtTime(0.001, now + 0.22);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.24);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);

    osc2.start(now + 0.22);
    osc2.stop(now + 0.45);
  }

  // 🦆 Style 3: Comical Cartoon Slide Whistle Drop & Splat
  private playCartoonSlideDrop() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Slide whistle sliding down from 1500Hz down to 180Hz
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.42);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.42);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.43);

    // Goofy "splat / pop" at the bottom
    const popOsc = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    popOsc.type = "triangle";
    popOsc.frequency.setValueAtTime(180, now + 0.42);
    popOsc.frequency.exponentialRampToValueAtTime(60, now + 0.55);

    popGain.gain.setValueAtTime(0.3, now + 0.42);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    popOsc.connect(popGain);
    popGain.connect(this.ctx.destination);

    popOsc.start(now + 0.42);
    popOsc.stop(now + 0.55);
  }

  // 🏀 Basketball Bounce Sound: Clean natural leather ball bounce on court
  public playBounce() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.16);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Ignore
    }
  }

  // 🏆 Victory Fanfare
  public playVictory() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [
        { f: 523.25, d: 0.1, t: 0 },    // C5
        { f: 659.25, d: 0.1, t: 0.1 },  // E5
        { f: 783.99, d: 0.1, t: 0.2 },  // G5
        { f: 1046.5, d: 0.4, t: 0.3 }, // C6
      ];

      notes.forEach(({ f, d, t }) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.35, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + t);
        osc.stop(now + t + d);
      });
    } catch {
      // Ignore
    }
  }

  // 📢 Buzzer
  public playBuzzer() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Ignore
    }
  }

  // 💪 Pushup Done Chime
  public playPushup() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Ignore
    }
  }

  // 🔘 Click feedback
  public playClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }

  // 🎲 Shuffle / Roulette tick
  public playShuffleTick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      const freq = 400 + Math.random() * 400;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.04);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Ignore
    }
  }

  // 🎺 Order Reveal Fanfare
  public playDrawReveal() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [
        { f: 440, d: 0.08, t: 0 },
        { f: 554.37, d: 0.08, t: 0.08 },
        { f: 659.25, d: 0.08, t: 0.16 },
        { f: 880, d: 0.25, t: 0.24 },
      ];

      notes.forEach(({ f, d, t }) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.3, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + t);
        osc.stop(now + t + d);
      });
    } catch {
      // Ignore
    }
  }

  // 🏁 Referee Whistle: Energetic double-trill whistle
  public playWhistle() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bursts = [0, 0.14];

      bursts.forEach((startTime) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(2600, now + startTime);
        osc.frequency.linearRampToValueAtTime(2900, now + startTime + 0.04);
        osc.frequency.linearRampToValueAtTime(2700, now + startTime + 0.08);

        gain.gain.setValueAtTime(0.25, now + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, now + startTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + startTime);
        osc.stop(now + startTime + 0.1);
      });
    } catch {
      // Ignore
    }
  }

  // 💥 Slam Dunk: Powerful rim impact + whoosh
  public playSlamDunk() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.playBounce();
      setTimeout(() => this.playSwish(), 60);
      setTimeout(() => this.playWhistle(), 250);
    } catch {
      // Ignore
    }
  }
}

export const sounds = new SoundManager();

