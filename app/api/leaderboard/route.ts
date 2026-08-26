import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getTimeframeDateRange, Timeframe } from "@/lib/calculations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = (searchParams.get("timeframe") || "all") as Timeframe;

    const startDate = getTimeframeDateRange(timeframe);

    // Fetch players with their game history within timeframe
    const players = await db.player.findMany({
      where: { active: true },
      include: {
        gamePlayers: {
          where: startDate
            ? {
                game: {
                  playedAt: {
                    gte: startDate,
                  },
                },
              }
            : undefined,
          include: {
            game: true,
          },
        },
      },
    });

    // 1. Calculate stats per player
    const statsList = players.map((p) => {
      const totalGames = p.gamePlayers.length;
      const wins = p.gamePlayers.filter((gp) => gp.isWinner).length;
      const losses = p.gamePlayers.filter((gp) => gp.isLoser).length;
      const totalPoints = p.gamePlayers.reduce((sum, gp) => sum + gp.totalScore, 0);
      const totalPushups = p.gamePlayers.reduce((sum, gp) => sum + gp.pushupAmount, 0);
      const completedPushups = p.gamePlayers
        .filter((gp) => gp.pushupsCompleted)
        .reduce((sum, gp) => sum + gp.pushupAmount, 0);
      const pendingPushups = totalPushups - completedPushups;
      const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
      const avgScore = totalGames > 0 ? totalPoints / totalGames : 0;

      return {
        id: p.id,
        name: p.name,
        nickname: p.nickname,
        avatar: p.avatar || "🏀",
        totalGames,
        wins,
        losses,
        winRate: Math.round(winRate * 10) / 10,
        totalPoints,
        avgScore: Math.round(avgScore * 10) / 10,
        totalPushups,
        completedPushups,
        pendingPushups,
      };
    });

    // 2. Championship Ranking: Wins (desc) -> Total Points (desc) -> Win Rate (desc)
    const championship = [...statsList]
      .filter((p) => p.totalGames > 0)
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        return b.winRate - a.winRate;
      })
      .map((p, idx) => ({
        ...p,
        rank: idx + 1,
      }));

    // 3. Push-up King Ranking: Total Pushups (desc) -> Losses (desc)
    const pushupKings = [...statsList]
      .filter((p) => p.totalPushups > 0)
      .sort((a, b) => {
        if (b.totalPushups !== a.totalPushups) return b.totalPushups - a.totalPushups;
        return b.losses - a.losses;
      })
      .map((p, idx) => ({
        ...p,
        rank: idx + 1,
      }));

    // Total metrics for summary banner
    const totalGamesCount = await db.game.count({
      where: startDate
        ? {
            playedAt: {
              gte: startDate,
            },
          }
        : undefined,
    });

    const totalPushupsSum = statsList.reduce((sum, p) => sum + p.totalPushups, 0);

    return NextResponse.json({
      timeframe,
      championship,
      pushupKings,
      todayChampion: championship.length > 0 ? championship[0] : null,
      pushupKing: pushupKings.length > 0 ? pushupKings[0] : null,
      summary: {
        totalGames: totalGamesCount,
        totalPushups: totalPushupsSum,
        activePlayers: players.length,
      },
    });
  } catch (error) {
    console.error("Error generating leaderboard:", error);
    return NextResponse.json({ error: "Failed to generate leaderboard" }, { status: 500 });
  }
}
