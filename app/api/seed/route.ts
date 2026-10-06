import { NextRequest, NextResponse } from "next/server";
import { seedDatabase } from "@/prisma/seed";

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

    await seedDatabase();
    return NextResponse.json({ success: true, message: "Database reset and seeded successfully!" });
  } catch (error) {
    console.error("Error during seed:", error);
    return NextResponse.json({ error: "Failed to reset database" }, { status: 500 });
  }
}

