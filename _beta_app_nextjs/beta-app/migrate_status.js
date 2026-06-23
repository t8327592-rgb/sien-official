const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany();
  let updatedCount = 0;

  for (const c of customers) {
    let newStatus = c.status;
    
    // 旧ステータスからのマッピング
    // "未対応", "返信済み", "制作中", "修正中", "納品完了", "キャンセル" など
    // 新ステータス: 未対応, 見積もり送信, 素材待ち, 制作中, 初稿提出, 修正対応, 納品完了, アーカイブ
    
    if (c.status === '返信済み' || c.status === '確認待ち') newStatus = '見積もり送信';
    if (c.status === '修正中') newStatus = '修正対応';
    if (c.status === 'キャンセル') newStatus = 'アーカイブ'; // キャンセルはアーカイブ扱いへ
    
    // 納品完了、未対応、制作中 はそのまま

    if (newStatus !== c.status) {
      await prisma.customer.update({
        where: { id: c.id },
        data: { status: newStatus }
      });
      updatedCount++;
    }
  }

  console.log(`Migrated status for ${updatedCount} customers.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
