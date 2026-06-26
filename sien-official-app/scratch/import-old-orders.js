const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const tempJsonPath = 'c:/Users/shien/OneDrive/デスクトップ/Sien-Official/_old_html_site/temp.json';

function mapStatus(status) {
  if (status === '未着手' || status === '進行中') return 'PENDING';
  if (status === '全て入金済み') return 'WORKING';
  if (status === 'キャンセル') return 'CANCELED';
  if (status === '取引終了') return 'COMPLETED';
  return 'PENDING'; // default
}

async function main() {
  try {
    const rawData = fs.readFileSync(tempJsonPath, 'utf8');
    const data = JSON.parse(rawData);

    // orders と archive を結合
    const allOldOrders = [...(data.orders || []), ...(data.archive || [])];

    // 重複を排除 (IDベースでユニークに)
    const uniqueMap = new Map();
    for (const order of allOldOrders) {
      if (!uniqueMap.has(order.id)) {
        uniqueMap.set(order.id, order);
      }
    }
    const uniqueOrders = Array.from(uniqueMap.values());
    console.log(`Found ${uniqueOrders.length} unique orders in old site data.`);

    // 既存のDBのデータを取得（重複判定用）
    const existingOrders = await prisma.order.findMany();
    let importedCount = 0;
    let skippedCount = 0;

    for (const oldOrder of uniqueOrders) {
      const clientEmail = oldOrder['メールアドレス'] || oldOrder['email'] || "未設定";
      const clientName = oldOrder['ご依頼者名'] || "未設定";
      const songTitle = oldOrder['曲名'] || "未設定";
      const createdAt = new Date(oldOrder.date || Date.now());

      // 重複チェック (email と songTitle と createdAt で近いものを探す)
      const isDuplicate = existingOrders.some(existing => {
        const timeDiff = Math.abs(existing.createdAt.getTime() - createdAt.getTime());
        return existing.clientEmail === clientEmail && 
               existing.songTitle === songTitle && 
               timeDiff < 24 * 60 * 60 * 1000;
      });

      if (isDuplicate) {
        skippedCount++;
        continue;
      }

      // サービス種別の判定
      let serviceType = "mix";
      const plan = oldOrder['プラン'] || "";
      if (plan.includes('orig') || plan.includes('original')) {
        serviceType = "original";
      }

      await prisma.order.create({
        data: {
          clientName: clientName,
          clientEmail: clientEmail,
          twitterId: oldOrder['TwitterID(任意)'] || oldOrder['TwitterID'] || null,
          contactMethod: oldOrder['希望する連絡手段'] || oldOrder['連絡手段'] || null,
          serviceType: serviceType,
          planId: plan || null,
          songTitle: songTitle,
          options: oldOrder['オプション'] || oldOrder['options'] || null,
          vocalKey: oldOrder['キー変更'] || oldOrder['歌唱キー'] || null,
          referenceUrl: oldOrder['参考URL(任意)'] || oldOrder['ref_url'] || null,
          materialsUrl: oldOrder['レコーディング済み音源'] || oldOrder['source_url'] || null,
          paymentMethod: oldOrder['お支払い方法'] || oldOrder['payment_method'] || null,
          deadline: oldOrder['deadline'] || null,
          message: oldOrder['ご要望・ご質問・特記事項など'] || oldOrder['memo'] || null,
          status: mapStatus(oldOrder.status),
          createdAt: createdAt,
          updatedAt: new Date(),
        }
      });
      importedCount++;
    }

    console.log(`Import completed. Imported: ${importedCount}, Skipped (duplicates): ${skippedCount}`);
  } catch (error) {
    console.error("Error during import:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
