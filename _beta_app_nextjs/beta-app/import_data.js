const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync('../temp.json', 'utf8'));
  const allOrders = [...(data.orders || []), ...(data.archive || [])];
  
  let importedCount = 0;

  for (const order of allOrders) {
    if (!order['ご依頼者名']) continue;

    let status = '未対応';
    if (order.status === '進行中') status = '制作中';
    if (order.status === '確認待ち') status = '返信済み';
    if (order.status === '取引終了' || order.status === 'archived') status = '納品完了';
    if (order.status === 'キャンセル') status = 'キャンセル';

    let message = `【曲名】\n${order['曲名'] || 'なし'}\n\n`;
    if (order['オプション']) message += `【オプション】\n${order['オプション']}\n\n`;
    if (order['キー変更']) message += `【キー変更】\n${order['キー変更']}\n\n`;
    if (order['参考URL(任意)']) message += `【参考URL】\n${order['参考URL(任意)']}\n\n`;
    if (order['レコーディング済み音源']) message += `【音源URL】\n${order['レコーディング済み音源']}\n\n`;
    if (order['お支払い方法']) message += `【お支払い方法】\n${order['お支払い方法']}\n\n`;
    if (order['ご要望・ご質問・特記事項など']) message += `【ご要望・ご質問・特記事項など】\n${order['ご要望・ご質問・特記事項など']}`;

    let createdAt = new Date();
    if (order.date) {
      try {
        createdAt = new Date(order.date);
      } catch (e) {}
    }

    let service = order['プラン'] || '未定';

    await prisma.customer.create({
      data: {
        name: order['ご依頼者名'],
        twitterId: order['TwitterID(任意)'] || null,
        email: order['メールアドレス'] || null,
        service: service,
        message: message.trim(),
        status: status,
        createdAt: createdAt
      }
    });
    importedCount++;
  }

  // Create Initial Profile if not exists
  const profileCount = await prisma.profile.count();
  if (profileCount === 0) {
    await prisma.profile.create({
      data: {
        name: 'Sien',
        title: 'Vocal Mixer',
        twitterId: '@sien_mix',
        text1: 'ボーカルの魅力を最大限に引き出すMIXを提供します。',
        text2: '納期厳守・高品質なサウンドメイキング。',
        text3: 'お気軽にご相談ください。',
        availability: '○ 現在受付中',
        deliveryInfo: '約2週間〜3週間'
      }
    });
    console.log('Created initial Profile.');
  }

  // Admin User if not exists
  const adminCount = await prisma.user.count();
  if (adminCount === 0) {
    // 便宜上ハッシュ化なし（デモ用）などですが、NextAuthは別途対応必要
    console.log('Ensure you have a user configured in your code if using DB for auth.');
  }

  console.log(`Successfully imported ${importedCount} customers.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
