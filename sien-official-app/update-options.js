const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const encodeOption = await prisma.option.findFirst({
    where: { name: "エンコード" }
  });
  if (encodeOption) {
    await prisma.option.update({
      where: { id: encodeOption.id },
      data: { priceText: "合計10,000円以上:無料 / 未満:1,000円" }
    });
    console.log("Updated encode option");
  } else {
    console.log("Encode option not found");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
