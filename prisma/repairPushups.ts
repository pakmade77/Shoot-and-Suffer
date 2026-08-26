import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Recalculating all game push-up scores...");

  const games = await prisma.game.findMany({
    include: {
      gamePlayers: true,
    },
  });

  let totalUpdated = 0;

  for (const game of games) {
    const scores = game.gamePlayers.map((gp) => gp.totalScore);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    for (const gp of game.gamePlayers) {
      const isWinner = gp.totalScore === maxScore && maxScore > 0;
      const isLoser = !isWinner;
      const pushupAmount = isLoser ? game.punishmentAmount : 0;

      await prisma.gamePlayer.update({
        where: { id: gp.id },
        data: {
          isWinner,
          isLoser,
          pushupAmount,
          pushupsCompleted: isLoser,
        },
      });

      totalUpdated++;
    }
  }

  console.log(`Successfully verified and recalculated ${totalUpdated} player match records across ${games.length} games!`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
