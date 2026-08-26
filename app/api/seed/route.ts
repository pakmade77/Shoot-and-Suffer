import { NextResponse } from "next/server";
import { seedDatabase } from "@/prisma/seed";

export async function POST() {
  try {
    await seedDatabase();
    return NextResponse.json({ success: true, message: "Database reset and seeded successfully!" });
  } catch (error) {
    console.error("Error during seed:", error);
    return NextResponse.json({ error: "Failed to reset database" }, { status: 500 });
  }
}
