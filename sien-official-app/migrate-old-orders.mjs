import fs from 'fs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function migrateOldOrders() {
  console.log('Reading temp.json...');
  const data = JSON.parse(fs.readFileSync('C:\\Users\\shien\\OneDrive\\デスクトップ\\Sien-Official\\_old_html_site\\temp.json', 'utf8'));
  const orders = data.orders || [];
  const archive = data.archive || [];
  const allOrders = [...orders, ...archive];
  
  if (allOrders.length === 0) {
    console.log('No orders found in temp.json');
    return;
  }

  console.log(`Found ${allOrders.length} orders total (${orders.length} active, ${archive.length} archived). Migrating...`);

  let count = 0;
  for (const row of allOrders) {
    try {
      // Map status
      let newStatus = 'PENDING';
      if (row.status === '未着手') newStatus = 'PENDING';
      else if (row.status === '取引終了') newStatus = 'COMPLETED';
      else if (row.status === 'キャンセル') newStatus = 'CANCELLED';
      else if (row.status === '全て入金済み') newStatus = 'WORKING';
      else newStatus = 'PENDING'; // default fallback

      // Determine serviceType roughly from plan
      let serviceType = 'mix';
      if (row['プラン'] && row['プラン'].includes('orig')) serviceType = 'original';

      await prisma.order.upsert({
        where: { id: row.id },
        update: {},
        create: {
          id: row.id,
          clientName: row['ご依頼者名'] || '名無し',
          clientEmail: row['メールアドレス'] || row['email'] || '',
          twitterId: row['TwitterID(任意)'] || row['TwitterID'] || '',
          contactMethod: row['希望する連絡手段'] || row['連絡手段'] || '',
          serviceType: serviceType,
          planId: row['プラン'] || '',
          songTitle: row['曲名'] || '',
          options: row['オプション'] || row['options'] || '',
          vocalKey: row['キー変更'] || row['歌唱キー'] || '',
          referenceUrl: row['参考URL(任意)'] || row['ref_url'] || '',
          materialsUrl: row['レコーディング済み音源'] || row['source_url'] || '',
          paymentMethod: row['お支払い方法'] || row['payment_method'] || '',
          message: row['ご要望・ご質問・特記事項など'] || row['memo'] || '',
          deadline: row['deadline'] || '',
          status: newStatus,
          createdAt: new Date(row.date),
          updatedAt: new Date(row.date)
        }
      });
      count++;
    } catch(e) {
      console.error('Skipped Order', row.id, e.message);
    }
  }
  
  console.log(`Successfully migrated ${count} orders!`);
}

migrateOldOrders().catch(console.error).finally(() => prisma.$disconnect());
