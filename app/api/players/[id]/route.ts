import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateAchievements, PlayerStats } from "@/lib/calculations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const player = await db.player.findUnique({
      where: { id },
      include: {
        gamePlayers: {
          include: {
            game: {
              include: {
                gamePlayers: {
                  include: {
                    player: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const totalGames = player.gamePlayers.length;
    const wins = player.gamePlayers.filter((gp) => gp.isWinner).length;
    const losses = player.gamePlayers.filter((gp) => gp.isLoser).length;
    const totalPoints = player.gamePlayers.reduce((sum, gp) => sum + gp.totalScore, 0);
    const totalShots = totalGames * 3;
    const totalHits = totalPoints;
    const totalMisses = totalShots - totalHits;
    const accuracy = totalShots > 0 ? (totalHits / totalShots) * 100 : 0;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
    const lossRate = totalGames > 0 ? (losses / totalGames) * 100 : 0;
    const averageScore = totalGames > 0 ? totalPoints / totalGames : 0;
    const bestScore = player.gamePlayers.reduce((max, gp) => Math.max(max, gp.totalScore), 0);

    const totalPushups = player.gamePlayers.reduce((sum, gp) => sum + gp.pushupAmount, 0);
    const completedPushups = player.gamePlayers
      .filter((gp) => gp.pushupsCompleted)
      .reduce((sum, gp) => sum + gp.pushupAmount, 0);
    const pendingPushups = totalPushups - completedPushups;
    const avgPushupsPerGame = totalGames > 0 ? totalPushups / totalGames : 0;

    // Calculate streaks (ordered newest to oldest)
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let tempWinStreak = 0;

    // Ordered chronological for max streak
    const chronological = [...player.gamePlayers].reverse();
    for (const gp of chronological) {
      if (gp.isWinner) {
        tempWinStreak++;
        if (tempWinStreak > maxWinStreak) maxWinStreak = tempWinStreak;
      } else {
        tempWinStreak = 0;
      }
    }

    // Current streaks
    for (let i = 0; i < player.gamePlayers.length; i++) {
      if (player.gamePlayers[i].isWinner) {
        currentWinStreak++;
      } else {
        break;
      }
    }
    for (let i = 0; i < player.gamePlayers.length; i++) {
      if (player.gamePlayers[i].isLoser) {
        currentLossStreak++;
      } else {
        break;
      }
    }

    const stats: PlayerStats = {
      id: player.id,
      name: player.name,
      nickname: player.nickname,
      avatar: player.avatar || "🏀",
      active: player.active,
      totalGames,
      wins,
      losses,
      winRate: Math.round(winRate * 10) / 10,
      lossRate: Math.round(lossRate * 10) / 10,
      totalPoints,
      averageScore: Math.round(averageScore * 10) / 10,
      bestScore,
      totalShots,
      totalHits,
      totalMisses,
      accuracy: Math.round(accuracy * 10) / 10,
      totalPushups,
      completedPushups,
      pendingPushups,
      avgPushupsPerGame: Math.round(avgPushupsPerGame * 10) / 10,
      currentWinStreak,
      currentLossStreak,
      maxWinStreak,
    };

    const achievements = calculateAchievements(stats, player.gamePlayers);

    return NextResponse.json({
      player: {
        id: player.id,
        name: player.name,
        nickname: player.nickname,
        avatar: player.avatar || "🏀",
        active: player.active,
        createdAt: player.createdAt,
      },
      stats,
      achievements,
      gameHistory: player.gamePlayers.map((gp) => ({
        id: gp.id,
        gameId: gp.game.id,
        playedAt: gp.game.playedAt,
        punishmentAmount: gp.game.punishmentAmount,
        shot1: gp.shot1,
        shot2: gp.shot2,
        shot3: gp.shot3,
        totalScore: gp.totalScore,
        rank: gp.rank,
        isWinner: gp.isWinner,
        isLoser: gp.isLoser,
        pushupAmount: gp.pushupAmount,
        pushupsCompleted: gp.pushupsCompleted,
        otherPlayers: gp.game.gamePlayers
          .filter((ogp) => ogp.playerId !== player.id)
          .map((ogp) => ({
            name: ogp.player.name,
            totalScore: ogp.totalScore,
            isWinner: ogp.isWinner,
            isLoser: ogp.isLoser,
          })),
      })),
    });
  } catch (error) {
    console.error("Error fetching player details:", error);
    return NextResponse.json({ error: "Failed to fetch player details" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, nickname, avatar, active } = body;

    const updated = await db.player.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(nickname !== undefined && { nickname: nickname ? nickname.trim() : null }),
        ...(avatar !== undefined && { avatar }),
        ...(active !== undefined && { active: Boolean(active) }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating player:", error);
    return NextResponse.json({ error: "Failed to update player" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.player.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting player:", error);
    return NextResponse.json({ error: "Failed to delete player" }, { status: 500 });
  }
}
