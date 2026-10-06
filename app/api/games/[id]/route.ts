import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateGameResults, ShotInput } from "@/lib/calculations";

import { verifyAdminPin as verifyPin } from "@/lib/adminPin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const game = await db.game.findUnique({
      where: { id },
      include: {
        gamePlayers: {
          include: {
            player: true,
          },
          orderBy: { rank: "asc" },
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json({ error: "Failed to fetch game" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { shots, punishmentAmount, adminPin } = body as {
      shots: ShotInput[];
      punishmentAmount?: number;
      adminPin?: string;
    };

    if (!verifyPin(req, adminPin)) {
      return NextResponse.json(
        { error: "Invalid Admin PIN / Unauthorized" },
        { status: 401 }
      );
    }

    if (!shots || !Array.isArray(shots) || shots.length < 1) {
      return NextResponse.json(
        { error: "Invalid shots data (must have at least 1 player)" },
        { status: 400 }
      );
    }

    const validPunishments = [5, 10, 15];
    const finalPunishment = validPunishments.includes(Number(punishmentAmount))
      ? Number(punishmentAmount)
      : Number(punishmentAmount) > 0
      ? Number(punishmentAmount)
      : 10;

    // Recalculate results
    const calculatedResults = calculateGameResults(shots, finalPunishment);

    // Update Game & GamePlayers in a single transaction
    const updatedGame = await db.$transaction(async (tx) => {
      await tx.game.update({
        where: { id },
        data: {
          punishmentAmount: finalPunishment,
        },
      });

      for (const res of calculatedResults) {
        await tx.gamePlayer.updateMany({
          where: {
            gameId: id,
            playerId: res.playerId,
          },
          data: {
            shot1: res.shot1,
            shot2: res.shot2,
            shot3: res.shot3,
            totalScore: res.totalScore,
            rank: res.rank,
            isWinner: res.isWinner,
            isLoser: res.isLoser,
            pushupAmount: res.pushupAmount,
            pushupsCompleted: false,
          },
        });
      }

      return tx.game.findUnique({
        where: { id },
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

    if (!updatedGame) {
      return NextResponse.json({ error: "Game record not found" }, { status: 404 });
    }

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error("Error updating game:", error);
    const msg = error instanceof Error ? error.message : "Failed to update game";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { playerId, pushupsCompleted } = body as {
      playerId: string;
      pushupsCompleted: boolean;
    };

    if (!playerId) {
      return NextResponse.json({ error: "playerId is required" }, { status: 400 });
    }

    // Find and update the gamePlayer
    const gamePlayer = await db.gamePlayer.findFirst({
      where: {
        gameId: id,
        playerId: playerId,
      },
    });

    if (!gamePlayer) {
      return NextResponse.json({ error: "Game player record not found" }, { status: 404 });
    }

    const updated = await db.gamePlayer.update({
      where: { id: gamePlayer.id },
      data: {
        pushupsCompleted: Boolean(pushupsCompleted),
      },
      include: {
        player: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating punishment status:", error);
    return NextResponse.json({ error: "Failed to update punishment status" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let bodyPin: string | undefined;
    try {
      const body = await req.json();
      bodyPin = body?.adminPin;
    } catch {
      // Body might be empty
    }

    if (!verifyPin(req, bodyPin)) {
      return NextResponse.json(
        { error: "Invalid Admin PIN / Unauthorized" },
        { status: 401 }
      );
    }

    await db.game.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json({ error: "Failed to delete game" }, { status: 500 });
  }
}

