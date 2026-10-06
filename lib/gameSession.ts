export interface GameSetupData {
  players: Array<{
    id: string;
    name: string;
    nickname?: string | null;
    avatar?: string | null;
  }>;
  punishmentAmount: number;
  shootingMode: "round_by_round" | "consecutive";
}

let inMemoryGameSetup: GameSetupData | null = null;

export interface GameProgress {
  playerIds: string[];
  shootingMode: "round_by_round" | "consecutive";
  playerIndex: number;
  currentRound: 1 | 2 | 3;
  roundPlayerIndex: number;
  playerShots: Array<{
    playerId: string;
    shot1: boolean | null;
    shot2: boolean | null;
    shot3: boolean | null;
  }>;
  isSuddenDeath: boolean;
  suddenDeathRound: number;
  suddenDeathPlayerIndex: number;
  suddenDeathShots: Record<string, boolean | null>;
  updatedAt: number;
}

const PROGRESS_KEY = "current_game_progress";

export function saveGameProgress(progress: Omit<GameProgress, "updatedAt">) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...progress, updatedAt: Date.now() }));
    }
  } catch {
    // Ignore storage errors
  }
}

export function getGameProgress(): GameProgress | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameProgress;
    // Discard stale progress older than 12 hours
    if (!parsed || !Array.isArray(parsed.playerShots) || Date.now() - (parsed.updatedAt || 0) > 12 * 60 * 60 * 1000) {
      localStorage.removeItem(PROGRESS_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearGameProgress() {
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(PROGRESS_KEY);
    }
  } catch {
    // Ignore
  }
}

export function saveGameSetup(data: GameSetupData) {
  inMemoryGameSetup = data;
  clearGameProgress(); // A fresh setup always starts a fresh game
  try {
    if (typeof window !== "undefined") {
      const json = JSON.stringify(data);
      sessionStorage.setItem("current_game_setup", json);
      localStorage.setItem("current_game_setup_backup", json);
    }
  } catch (err) {
    console.warn("Storage write error (using memory fallback):", err);
  }
}

export function getGameSetup(): GameSetupData | null {
  if (inMemoryGameSetup && inMemoryGameSetup.players?.length > 0) {
    return inMemoryGameSetup;
  }

  if (typeof window === "undefined") return null;

  try {
    const rawSession = sessionStorage.getItem("current_game_setup");
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (parsed && Array.isArray(parsed.players) && parsed.players.length > 0) {
        inMemoryGameSetup = parsed;
        return parsed;
      }
    }
  } catch {
    // Ignore
  }

  try {
    const rawLocal = localStorage.getItem("current_game_setup_backup");
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (parsed && Array.isArray(parsed.players) && parsed.players.length > 0) {
        inMemoryGameSetup = parsed;
        return parsed;
      }
    }
  } catch {
    // Ignore
  }

  return null;
}

export function clearGameSetup() {
  inMemoryGameSetup = null;
  clearGameProgress();
  try {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("current_game_setup");
      localStorage.removeItem("current_game_setup_backup");
    }
  } catch {
    // Ignore
  }
}
