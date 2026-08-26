import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultPlayers = [
  { name: "Azhar", nickname: "Clutch King", avatar: "/uploads/avatars/azhar.png" },
  { name: "Dewa", nickname: null, avatar: "/uploads/avatars/dewa.png" },
  { name: "JC", nickname: "Timezone Academy", avatar: "/uploads/avatars/jc.png" },
  { name: "Mul", nickname: "Captain", avatar: "/uploads/avatars/mul.png" },
  { name: "Naufal", nickname: "Rim Shaker", avatar: "/uploads/avatars/naufal.png" },
  { name: "Prabu", nickname: "The Tank", avatar: "/uploads/avatars/prabu.png" },
  { name: "Surya", nickname: "The Anchor", avatar: "/uploads/avatars/surya.png" },
  { name: "Yasa", nickname: null, avatar: "/uploads/avatars/yasa.png" },
  { name: "Zainul", nickname: "Sharpshooter", avatar: "/uploads/avatars/zainul.png" },
];

export async function seedDatabase() {
  console.log("🌱 Resetting match records and initializing players...");

  // 1. Clean all match records
  await prisma.gamePlayer.deleteMany({});
  await prisma.game.deleteMany({});

  // 2. Ensure all 9 players exist with their custom avatars
  for (const p of defaultPlayers) {
    const existing = await prisma.player.findFirst({
      where: { name: p.name },
    });

    if (existing) {
      await prisma.player.update({
        where: { id: existing.id },
        data: {
          nickname: p.nickname,
          avatar: p.avatar,
          active: true,
        },
      });
    } else {
      await prisma.player.create({
        data: {
          name: p.name,
          nickname: p.nickname,
          avatar: p.avatar,
          active: true,
        },
      });
    }
  }

  console.log(`✅ All 9 players reset to 0 matches with custom avatars preserved.`);
  console.log("🎉 Database reset finished successfully.");
}

// Execute if run via CLI
if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error("❌ Seed error:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
