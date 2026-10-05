import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultPlayers = [
  { name: "Boo", nickname: "Shot Monarch", avatar: "/uploads/avatars/prabu.png" },
  { name: "Dewa", nickname: "Casual Shooter", avatar: "/uploads/avatars/dewa.png" },
  { name: "iMD", nickname: "Mr. Mboiss", avatar: "/uploads/avatars/mul.png" },
  { name: "JC", nickname: "Timezone Academy", avatar: "/uploads/avatars/jc.png" },
  { name: "Naufal", nickname: "Rim Shaker", avatar: "/uploads/avatars/naufal.png" },
  { name: "Rogak's Is Back", nickname: "Clutch King", avatar: "/uploads/avatars/azhar.png" },
  { name: "Surya", nickname: "The Anchor", avatar: "/uploads/avatars/surya.png" },
  { name: "Yasa", nickname: "Casual Shooter", avatar: "/uploads/avatars/yasa.png" },
  { name: "Zainul", nickname: "Sharpshooter", avatar: "/uploads/avatars/zainul.png" },
];

export async function resetGameHistoryOnly() {
  console.log("🧹 Resetting match history records only (preserving all players)...");
  const res = await prisma.game.deleteMany();
  console.log(`✅ Cleared ${res.count} game records. All player profiles remain untouched.`);
  return res;
}

export async function seedDatabase() {
  console.log("🌱 Resetting match records and initializing players...");

  // 1. Delete all past game history
  await prisma.game.deleteMany();

  // 2. Ensure default players exist without overwriting custom edits if player already exists
  for (const p of defaultPlayers) {
    const existing = await prisma.player.findFirst({
      where: { name: p.name },
    });

    if (existing) {
      await prisma.player.update({
        where: { id: existing.id },
        data: {
          nickname: existing.nickname || p.nickname,
          avatar: existing.avatar || p.avatar,
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

  console.log(`✅ All players preserved and game history wiped clean.`);
}

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
