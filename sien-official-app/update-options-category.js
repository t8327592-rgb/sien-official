const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const options = await prisma.option.findMany();
  
  for (const opt of options) {
    let category = "MIX";
    if (opt.name.includes("ボーカルディレクション") || 
        opt.name.includes("人間による仮歌歌唱") || 
        opt.name.includes("生楽器演奏追加")) {
      category = "ORIGINAL";
    }
    
    await prisma.option.update({
      where: { id: opt.id },
      data: { category }
    });
    console.log(`Updated ${opt.name} -> ${category}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
