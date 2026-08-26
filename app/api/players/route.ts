import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";

    const players = await db.player.findMany({
      where: activeOnly ? { active: true } : undefined,
      include: {
        gamePlayers: {
          include: {
            game: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = players.map((p) => {
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

      return {
        id: p.id,
        name: p.name,
        nickname: p.nickname,
        avatar: p.avatar || "🏀",
        active: p.active,
        createdAt: p.createdAt,
        totalGames,
        wins,
        losses,
        totalPoints,
        totalPushups,
        completedPushups,
        pendingPushups,
        winRate: Math.round(winRate),
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, nickname, avatar } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const player = await db.player.create({
      data: {
        name: name.trim(),
        nickname: nickname ? nickname.trim() : null,
        avatar: avatar || "🏀",
        active: true,
      },
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error("Error creating player:", error);
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 });
  }
}
