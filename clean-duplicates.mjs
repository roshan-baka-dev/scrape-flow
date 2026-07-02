import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const purchases = await prisma.userPurchase.findMany({
    orderBy: { date: 'asc' }
  });
  const seen = new Set();
  for (const p of purchases) {
    if (seen.has(p.stripeId)) {
      await prisma.userPurchase.delete({ where: { id: p.id } });
      console.log(`Deleted duplicate: ${p.id} with stripeId: ${p.stripeId}`);
    } else {
      seen.add(p.stripeId);
    }
  }
  console.log("Cleanup complete");
}
main().catch(console.error).finally(() => prisma.$disconnect());
