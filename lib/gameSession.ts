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

export function saveGameSetup(data: GameSetupData) {
  inMemoryGameSetup = data;
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
  try {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("current_game_setup");
      localStorage.removeItem("current_game_setup_backup");
    }
  } catch {
    // Ignore
  }
}
