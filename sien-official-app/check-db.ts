import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.plan.findMany();
  const options = await prisma.option.findMany();
  
  console.log("=== PLANS ===");
  console.dir(plans, { depth: null });
  
  console.log("\n=== OPTIONS ===");
  console.dir(options, { depth: null });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
