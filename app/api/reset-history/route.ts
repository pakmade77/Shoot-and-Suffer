import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

import { verifyAdminPin as verifyPin } from "@/lib/adminPin";

export async function POST(req: NextRequest) {
  try {
    let bodyPin: string | undefined;
    try {
      const body = await req.json();
      bodyPin = body?.adminPin;
    } catch {
      // Empty body
    }

    if (!verifyPin(req, bodyPin)) {
      return NextResponse.json(
        { error: "Invalid Admin PIN / Unauthorized" },
        { status: 401 }
      );
    }

    // Delete all games. Due to onDelete: Cascade on GamePlayer, all match records and debts are wiped clean.
    // Player profiles in Supabase are 100% PRESERVED!
    const deletedGames = await db.game.deleteMany();
    
    return NextResponse.json({
      success: true,
      message: `Match history reset successfully! ${deletedGames.count} matches cleared. All players preserved.`,
      count: deletedGames.count,
    });
  } catch (error: any) {
    console.error("Error resetting game history:", error);
    return NextResponse.json(
      { error: "Failed to reset match history: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}

