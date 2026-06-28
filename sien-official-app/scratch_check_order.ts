import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const order = await prisma.order.findFirst({
    where: {
      clientName: 'ポ村ころりぃ'
    }
  });
  console.log("Found Order:", order);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
