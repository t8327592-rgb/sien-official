const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient({});
  try {
    const orders = await prisma.order.findMany();
    console.log("Success! Orders:", orders);
  } catch (e) {
    console.error("Prisma Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
