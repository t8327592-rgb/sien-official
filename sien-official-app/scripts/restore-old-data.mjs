import fs from 'fs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const OLD_DATA_PATH = "C:\\Users\\shien\\OneDrive\\デスクトップ\\Sien-Official\\_old_html_site\\temp.json";

function parseDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  } catch {
    return new Date();
  }
}

function mapStatus(oldStatus) {
  if (oldStatus === "取引終了") return "COMPLETED";
  if (oldStatus === "キャンセル") return "CANCELED";
  return "PENDING";
}

function determineServiceType(order) {
  const selected = order["ご希望の項目を選択してください"];
  if (selected === "オリジナル楽曲制作") return "ORIGINAL";
  if (selected === "Mix＆Mastering") return "MIX";
  
  const plan = order["プラン"] || "";
  if (plan.includes("orig")) return "ORIGINAL";
  return "MIX";
}

async function main() {
  if (!fs.existsSync(OLD_DATA_PATH)) {
    console.error("Old data file not found:", OLD_DATA_PATH);
    return;
  }

  const rawData = fs.readFileSync(OLD_DATA_PATH, 'utf8');
  const parsed = JSON.parse(rawData);

  const allOldOrders = [...(parsed.orders || []), ...(parsed.archive || [])];
  
  console.log(`Found ${allOldOrders.length} orders in old data.`);

  let successCount = 0;
  let skipCount = 0;

  for (const old of allOldOrders) {
    try {
      const existing = await prisma.order.findFirst({
        where: { 
          clientEmail: old["メールアドレス"] || old["email"] || "unknown@example.com",
          createdAt: parseDate(old.date)
        }
      });
      
      if (existing) {
        console.log(`Skip existing order for ${existing.clientEmail}`);
        skipCount++;
        continue;
      }

      await prisma.order.create({
        data: {
          clientName: old["ご依頼者名"] || "不明",
          clientEmail: old["メールアドレス"] || old["email"] || "unknown@example.com",
          twitterId: old["TwitterID(任意)"] || old["TwitterID"] || null,
          contactMethod: old["希望する連絡手段"] || old["連絡手段"] || "不明",
          isRepeater: false,
          serviceType: determineServiceType(old),
          planId: old["プラン"] || null,
          songTitle: old["曲名"] || null,
          options: old["オプション"] || old["options"] || null,
          vocalKey: old["キー変更"] || old["歌唱キー"] || null,
          referenceUrl: old["参考URL(任意)"] || old["ref_url"] || null,
          referenceFidelity: null,
          materialsUrl: old["レコーディング済み音源"] || old["source_url"] || null,
          paymentMethod: old["お支払い方法"] || old["payment_method"] || null,
          deadline: old["deadline"] || null,
          message: old["ご要望・ご質問・特記事項など"] || old["memo"] || null,
          activityPurpose: old["活動用途"] || null,
          status: mapStatus(old.status),
          createdAt: parseDate(old.date),
        }
      });
      successCount++;
    } catch {
      console.error("Failed to insert order:", old["ご依頼者名"], e.message);
    }
  }

  console.log(`Import finished! Success: ${successCount}, Skipped: ${skipCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
