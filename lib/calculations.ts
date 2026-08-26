export interface ShotInput {
  playerId: string;
  shot1: boolean;
  shot2: boolean;
  shot3: boolean;
}

export interface SuddenDeathInput {
  round: number;
  makers: string[]; // playerIds who scored in sudden death
  missers: string[]; // playerIds who missed in sudden death
}

export interface CalculatedGamePlayer {
  playerId: string;
  shot1: boolean;
  shot2: boolean;
  shot3: boolean;
  totalScore: number;
  rank: number;
  isWinner: boolean;
  isLoser: boolean;
  pushupAmount: number;
}

/**
 * Calculates results for a completed game.
 * - Each player gets a score (0-3).
 * - Highest score => Winner (if multiple share max, all are winners).
 * - Lowest score => Loser (if multiple share min, all are losers).
 * - All losers receive the full game punishment amount.
 * - If Sudden Death occurred (when all players scored 0 in regular shots),
 *   players who made the sudden death shot win, and those who missed lose.
 */
export function calculateGameResults(
  shots: ShotInput[],
  punishmentAmount: number,
  suddenDeath?: SuddenDeathInput
): CalculatedGamePlayer[] {
  if (!shots || shots.length < 3 || shots.length > 7) {
    throw new Error("Game must have between 3 and 7 players");
  }

  // Handle Sudden Death outcome if provided
  if (suddenDeath && suddenDeath.makers && suddenDeath.makers.length > 0) {
    const makerSet = new Set(suddenDeath.makers);
    return shots.map((s) => {
      const isWinner = makerSet.has(s.playerId);
      const isLoser = !isWinner;
      const regularScore = (s.shot1 ? 1 : 0) + (s.shot2 ? 1 : 0) + (s.shot3 ? 1 : 0);
      const totalScore = isWinner ? regularScore + 1 : regularScore;
      const rank = isWinner ? 1 : 2;
      const pushupAmountFinal = isLoser ? punishmentAmount : 0;

      return {
        playerId: s.playerId,
        shot1: s.shot1,
        shot2: s.shot2,
        shot3: s.shot3,
        totalScore,
        rank,
        isWinner,
        isLoser,
        pushupAmount: pushupAmountFinal,
      };
    });
  }

  // Calculate scores
  const withScores = shots.map((s) => {
    const score = (s.shot1 ? 1 : 0) + (s.shot2 ? 1 : 0) + (s.shot3 ? 1 : 0);
    return {
      ...s,
      totalScore: score,
    };
  });

  // Find max and min scores
  const maxScore = Math.max(...withScores.map((p) => p.totalScore));

  // Sort descending by score for ranking
  const sorted = [...withScores].sort((a, b) => b.totalScore - a.totalScore);

  // Assign ranks (standard competition ranking: 1, 2, 2, 4...)
  const rankMap = new Map<string, number>();
  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].totalScore < sorted[i - 1].totalScore) {
      currentRank = i + 1;
    }
    rankMap.set(sorted[i].playerId, currentRank);
  }

  return withScores.map((p) => {
    // Only the player(s) with the highest score (and at least 1 make) win and are spared
    const isWinner = p.totalScore === maxScore && maxScore > 0;
    // Everyone else who did not get the highest score must do push-ups
    const isLoser = !isWinner;
    const rank = rankMap.get(p.playerId) || 1;
    const pushups = isLoser ? punishmentAmount : 0;

    return {
      playerId: p.playerId,
      shot1: p.shot1,
      shot2: p.shot2,
      shot3: p.shot3,
      totalScore: p.totalScore,
      rank,
      isWinner,
      isLoser,
      pushupAmount: pushups,
    };
  });
}

export type Timeframe = "today" | "week" | "month" | "all";

export function getTimeframeDateRange(timeframe: Timeframe): Date | null {
  const now = new Date();
  if (timeframe === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start;
  } else if (timeframe === "week") {
    const start = new Date(now);
    const day = start.getDay(); // 0 is Sunday
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  } else if (timeframe === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  }
  return null; // all time
}

export interface PlayerStats {
  id: string;
  name: string;
  nickname: string | null;
  avatar: string | null;
  active: boolean;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number; // percentage 0-100
  lossRate: number; // percentage 0-100
  totalPoints: number;
  averageScore: number;
  bestScore: number;
  totalShots: number;
  totalHits: number;
  totalMisses: number;
  accuracy: number; // percentage 0-100
  totalPushups: number;
  completedPushups: number;
  pendingPushups: number;
  avgPushupsPerGame: number;
  currentWinStreak: number;
  currentLossStreak: number;
  maxWinStreak: number;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlocked: boolean;
  progress?: string;
}

export function calculateAchievements(stats: PlayerStats, gameHistory: Array<{ isWinner: boolean; isLoser: boolean; totalScore: number; shot1: boolean; shot2: boolean; shot3: boolean }>): Achievement[] {
  // Sniper: shooting accuracy >= 70% with at least 9 shots (3 games)
  const isSniper = stats.totalShots >= 9 && stats.accuracy >= 70;
  
  // Hot Hand: 3 consecutive wins at any point or current
  const hasHotHand = stats.maxWinStreak >= 3;

  // Unbeatable: 5 consecutive wins
  const isUnbeatable = stats.maxWinStreak >= 5;

  // Push-up King: 100+ total push-ups
  const isPushupKing = stats.totalPushups >= 100;

  // Regular Victim: 3 consecutive losses
  let maxLossStreak = 0;
  let currentLoss = 0;
  for (const g of gameHistory) {
    if (g.isLoser) {
      currentLoss++;
      if (currentLoss > maxLossStreak) maxLossStreak = currentLoss;
    } else {
      currentLoss = 0;
    }
  }
  const isRegularVictim = maxLossStreak >= 3;

  // Office Legend: 50+ games played
  const isOfficeLegend = stats.totalGames >= 50;

  // Brick Master: Miss count >= 20
  const isBrickMaster = stats.totalMisses >= 20;

  // Clutch: Has at least one 3/3 perfect game
  const hasClutch = gameHistory.some((g) => g.totalScore === 3);

  return [
    {
      id: "clutch",
      title: "⚡ CLUTCH SHOOTER",
      icon: "🎯",
      description: "Hit a perfect 3/3 in a single game",
      unlocked: hasClutch,
    },
    {
      id: "sniper",
      title: "🎯 SNIPER",
      icon: "🎯",
      description: "Shooting accuracy 70%+ (min. 9 shots)",
      unlocked: isSniper,
      progress: `${stats.accuracy.toFixed(0)}% accuracy (${stats.totalShots} shots)`,
    },
    {
      id: "hot_hand",
      title: "🔥 HOT HAND",
      icon: "🔥",
      description: "3 consecutive wins in a row",
      unlocked: hasHotHand,
      progress: `Best streak: ${stats.maxWinStreak} wins`,
    },
    {
      id: "unbeatable",
      title: "👑 UNBEATABLE",
      icon: "👑",
      description: "5 consecutive wins in a row",
      unlocked: isUnbeatable,
      progress: `Best streak: ${stats.maxWinStreak}/5`,
    },
    {
      id: "pushup_king",
      title: "💀 PUSH-UP KING",
      icon: "💪",
      description: "Accumulated 100+ push-ups",
      unlocked: isPushupKing,
      progress: `${stats.totalPushups}/100 push-ups`,
    },
    {
      id: "regular_victim",
      title: "😂 REGULAR VICTIM",
      icon: "💀",
      description: "Suffered 3 consecutive losses",
      unlocked: isRegularVictim,
    },
    {
      id: "brick_master",
      title: "🧱 BRICK MASTER",
      icon: "🧱",
      description: "Accumulated 20+ missed shots",
      unlocked: isBrickMaster,
      progress: `${stats.totalMisses}/20 bricks`,
    },
    {
      id: "office_legend",
      title: "🏆 OFFICE LEGEND",
      icon: "🏆",
      description: "Played 50+ coffee break games",
      unlocked: isOfficeLegend,
      progress: `${stats.totalGames}/50 games`,
    },
  ];
}
