import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateGameResults, ShotInput, SuddenDeathInput } from "@/lib/calculations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const games = await db.game.findMany({
      take: limit,
      orderBy: { playedAt: "desc" },
      include: {
        gamePlayers: {
          include: {
            player: true,
          },
          orderBy: { rank: "asc" },
        },
      },
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { punishmentAmount = 10, shots, suddenDeath } = body as {
      punishmentAmount?: number;
      shots: ShotInput[];
      suddenDeath?: SuddenDeathInput;
    };

    if (!shots || !Array.isArray(shots) || shots.length < 1) {
      return NextResponse.json(
        { error: "Games must have at least 1 player" },
        { status: 400 }
      );
    }

    const parsedPunishment = parseInt(String(punishmentAmount), 10);
    const finalPunishment =
      !isNaN(parsedPunishment) && parsedPunishment > 0 && parsedPunishment <= 500
        ? parsedPunishment
        : 10;

    // Validate player existence
    const playerIds = shots.map((s) => s.playerId);
    const uniqueIds = new Set(playerIds);
    if (uniqueIds.size !== playerIds.length) {
      return NextResponse.json(
        { error: "Duplicate players are not allowed in the same game" },
        { status: 400 }
      );
    }

    const existingPlayers = await db.player.findMany({
      where: { id: { in: playerIds } },
    });

    if (existingPlayers.length !== playerIds.length) {
      return NextResponse.json(
        { error: "One or more selected players do not exist" },
        { status: 400 }
      );
    }

    // Calculate winners, losers, ranks, and pushups
    const calculatedResults = calculateGameResults(shots, finalPunishment, suddenDeath);

    // Save Game and GamePlayers in a transaction
    const newGame = await db.$transaction(async (tx) => {
      const game = await tx.game.create({
        data: {
          punishmentAmount: finalPunishment,
          playedAt: new Date(),
        },
      });

      await tx.gamePlayer.createMany({
        data: calculatedResults.map((p) => ({
          gameId: game.id,
          playerId: p.playerId,
          shot1: p.shot1,
          shot2: p.shot2,
          shot3: p.shot3,
          totalScore: p.totalScore,
          rank: p.rank,
          isWinner: p.isWinner,
          isLoser: p.isLoser,
          pushupAmount: p.pushupAmount,
          pushupsCompleted: false,
        })),
      });

      return tx.game.findUnique({
        where: { id: game.id },
        include: {
          gamePlayers: {
            include: {
              player: true,
            },
            orderBy: { rank: "asc" },
          },
        },
      });
    });

    return NextResponse.json(newGame, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating game:", error);
    const message = error instanceof Error ? error.message : "Failed to create game";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
