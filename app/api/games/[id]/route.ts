import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.game.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json({ error: "Failed to delete game" }, { status: 500 });
  }
}
