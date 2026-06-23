import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const oldDataPath = path.join(
    process.cwd(),
    'latest_data.json'
  );

  console.log('Reading old data from:', oldDataPath);
  const fileContent = fs.readFileSync(oldDataPath, 'utf8');
  const oldData = JSON.parse(fileContent);

  const orders = oldData.orders || [];
  const archive = oldData.archive || [];
  
  const allOldOrders = [...orders, ...archive];
  console.log(`Found ${allOldOrders.length} orders in old data.`);

  // Clear existing orders to avoid duplicates
  await prisma.order.deleteMany({});

  let importedCount = 0;

  for (const old of allOldOrders) {
    // Determine status
    let status = 'pending';
    if (old.status === '未着手' || old.status === '未対応') {
      status = 'pending';
    } else if (old.status === '対応中') {
      status = 'contacted';
    } else {
      status = 'completed';
    }

    // Determine category
    let category = 'other';
    const plan = (old['プラン'] || old.プラン || old.plan || '').toLowerCase();
    if (plan.includes('orig')) {
      category = 'original';
    } else if (plan) {
      category = 'mix';
    }

    // Build message from various fields
    const messageParts = [];
    if (old['曲名']) messageParts.push(`曲名: ${old['曲名']}`);
    if (old['プラン']) messageParts.push(`プラン: ${old['プラン']}`);
    if (old['オプション'] || old.options) messageParts.push(`オプション: ${old['オプション'] || old.options}`);
    if (old['希望する連絡手段'] || old['連絡手段']) messageParts.push(`連絡手段: ${old['希望する連絡手段'] || old['連絡手段']}`);
    if (old['TwitterID(任意)'] || old['TwitterID']) messageParts.push(`Twitter: ${old['TwitterID(任意)'] || old['TwitterID']}`);
    if (old['キー変更'] || old['歌唱キー']) messageParts.push(`キー変更: ${old['キー変更'] || old['歌唱キー']}`);
    if (old['レコーディング済み音源'] || old.source_url) messageParts.push(`音源URL: ${old['レコーディング済み音源'] || old.source_url}`);
    if (old['お支払い方法'] || old.payment_method) messageParts.push(`支払方法: ${old['お支払い方法'] || old.payment_method}`);
    if (old['deadline']) messageParts.push(`希望納期: ${old['deadline']}`);
    if (old.status) messageParts.push(`【旧ステータス】: ${old.status}`);
    if (old['ご要望・ご質問・特記事項など'] || old.memo) messageParts.push(`\n【特記事項】\n${old['ご要望・ご質問・特記事項など'] || old.memo}`);

    const message = messageParts.join('\n');

    try {
      await prisma.order.create({
        data: {
          name: old['ご依頼者名'] || old.name || 'Unknown',
          email: old['メールアドレス'] || old.email || 'no-email@example.com',
          url: old['参考URL(任意)'] || old.ref_url || '',
          category,
          message,
          status,
          createdAt: old.date ? new Date(old.date) : new Date(),
        }
      });
      importedCount++;
    } catch (e) {
      console.error(`Failed to import order ${old.id}: `, e.message);
    }
  }

  console.log(`Successfully imported ${importedCount} orders!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
