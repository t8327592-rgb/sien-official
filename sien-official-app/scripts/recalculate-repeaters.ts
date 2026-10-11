import type { Prisma } from "@prisma/client";
import { PrismaClient } from '@prisma/client';
import { updateAllClientOrdersToRepeater } from '../src/lib/repeater';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting all orders to isRepeater: false...');
  await prisma.order.updateMany({ data: { isRepeater: false } });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${orders.length} orders. Recalculating isRepeater...`);

  const processedEmails = new Set<string>();
  const processedTwitters = new Set<string>();
  let repeaterClientCount = 0;

  for (const order of orders) {
    if (order.clientEmail && processedEmails.has(order.clientEmail)) continue;
    if (order.twitterId && processedTwitters.has(order.twitterId)) continue;

    const orConditions: Prisma.OrderWhereInput[] = [];
    if (order.clientEmail && order.clientEmail.trim() !== "") {
      orConditions.push({ clientEmail: order.clientEmail });
    }
    if (order.twitterId && order.twitterId.trim() !== "" && order.twitterId.trim() !== "@" && order.twitterId.trim() !== "なし" && order.twitterId.trim() !== "無し") {
      orConditions.push({ twitterId: order.twitterId });
    }

    if (orConditions.length === 0) continue;

    const count = await prisma.order.count({
      where: { OR: orConditions }
    });

    if (count >= 2) {
      await updateAllClientOrdersToRepeater(order.clientEmail, order.twitterId);
      repeaterClientCount++;
      if (order.clientEmail) processedEmails.add(order.clientEmail);
      if (order.twitterId) processedTwitters.add(order.twitterId);
      console.log(`Marked as repeater: ${order.clientName} (Email: ${order.clientEmail}, Twitter: ${order.twitterId}) - Total Orders: ${count}`);
    }
  }

  console.log(`Finished. Marked ${repeaterClientCount} unique clients as repeaters.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
