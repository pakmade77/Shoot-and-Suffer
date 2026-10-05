import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Get all gamePlayers with pushupAmount > 0 and pushupsCompleted = false
    const unpaidGamePlayers = await db.gamePlayer.findMany({
      where: {
        pushupAmount: { gt: 0 },
        pushupsCompleted: false,
      },
      include: {
        player: true,
        game: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by player
    const debtorMap = new Map<
      string,
      {
        player: {
          id: string;
          name: string;
          nickname: string | null;
          avatar: string | null;
        };
        totalDebt: number;
        unpaidGamesCount: number;
        records: Array<{
          id: string;
          gameId: string;
          playedAt: Date;
          pushupAmount: number;
        }>;
      }
    >();

    for (const gp of unpaidGamePlayers) {
      const pId = gp.playerId;
      if (!debtorMap.has(pId)) {
        debtorMap.set(pId, {
          player: {
            id: gp.player.id,
            name: gp.player.name,
            nickname: gp.player.nickname,
            avatar: gp.player.avatar,
          },
          totalDebt: 0,
          unpaidGamesCount: 0,
          records: [],
        });
      }

      const entry = debtorMap.get(pId)!;
      entry.totalDebt += gp.pushupAmount;
      entry.unpaidGamesCount += 1;
      entry.records.push({
        id: gp.id,
        gameId: gp.game.id,
        playedAt: gp.game.playedAt,
        pushupAmount: gp.pushupAmount,
      });
    }

    const debtors = Array.from(debtorMap.values()).sort(
      (a, b) => b.totalDebt - a.totalDebt
    );

    return NextResponse.json({
      totalOutstandingPushups: debtors.reduce((sum, d) => sum + d.totalDebt, 0),
      debtorsCount: debtors.length,
      debtors,
    });
  } catch (error) {
    console.error("Error fetching debts:", error);
    return NextResponse.json({ error: "Failed to fetch debts" }, { status: 500 });
  }
}

// Settle debts for a player
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerId, gamePlayerId, settleAll } = body as {
      playerId: string;
      gamePlayerId?: string;
      settleAll?: boolean;
    };

    if (!playerId) {
      return NextResponse.json({ error: "playerId is required" }, { status: 400 });
    }

    if (settleAll) {
      await db.gamePlayer.updateMany({
        where: {
          playerId,
          pushupsCompleted: false,
        },
        data: {
          pushupsCompleted: true,
        },
      });
    } else if (gamePlayerId) {
      await db.gamePlayer.update({
        where: { id: gamePlayerId },
        data: { pushupsCompleted: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error settling debt:", error);
    return NextResponse.json({ error: "Failed to settle debt" }, { status: 500 });
  }
}
