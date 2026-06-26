// @ts-nocheck
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const OLD_DATA_PATH = "C:\\Users\\shien\\OneDrive\\デスクトップ\\Sien-Official\\_old_html_site\\temp.json";

async function main() {
  console.log("=== 旧サイトデータ移行を開始します ===");

  // 1. 旧データの読み込み
  const content = fs.readFileSync(OLD_DATA_PATH, "utf8");
  const data = JSON.parse(content);
  const oldOrders = data.orders || [];

  console.log(`旧サイトのデータ件数: ${oldOrders.length}件`);

  // 2. 現在のDBの依頼を取得
  const currentOrders = await prisma.order.findMany();
  console.log(`現在のDBのデータ件数: ${currentOrders.length}件`);

  let addedCount = 0;
  let skippedCount = 0;
  const skippedReasons = [];

  for (const old of oldOrders) {
    // 重複チェック
    const isDuplicate = currentOrders.some((cur) => {
      // 日時が完全に一致するか、メールアドレスと曲名が一致するか
      const oldDateStr = new Date(old.date).toISOString();
      const curDateStr = new Date(cur.createdAt).toISOString();
      
      const emailMatches = (cur.clientEmail === old["メールアドレス"]);
      const titleMatches = (cur.songTitle === old["曲名"] || (!cur.songTitle && !old["曲名"]));

      return (oldDateStr === curDateStr) || (emailMatches && titleMatches);
    });

    if (isDuplicate) {
      skippedCount++;
      skippedReasons.push(`スキップ: ${old["ご依頼者名"]}様 - ${old["曲名"]} (重複と判定)`);
      continue;
    }

    // ステータス変換
    let newStatus = "PENDING";
    switch (old.status) {
      case "未着手": newStatus = "PENDING"; break;
      case "作業中": newStatus = "WORKING"; break;
      case "完了": newStatus = "COMPLETED"; break;
      case "キャンセル": newStatus = "CANCELED"; break;
      default: newStatus = "PENDING";
    }

    // サービス種別の判定
    let serviceType = "original";
    if (old["プラン"] && (old["プラン"].includes("std") || old["プラン"].includes("prm") || old["プラン"].includes("mix"))) {
      serviceType = "mix";
    }

    // 価格のパース
    let price = 0;
    if (old["お支払い金額"]) {
       const p = parseInt(old["お支払い金額"].toString().replace(/[^0-9]/g, ""), 10);
       if (!isNaN(p)) price = p;
    } else if (old.price) {
       const p = parseInt(old.price.toString().replace(/[^0-9]/g, ""), 10);
       if (!isNaN(p)) price = p;
    }

    // メッセージの構築
    let message = old["ご要望・ご質問・特記事項など"] || "";
    if (old["キー変更"]) message += `\n[キー変更] ${old["キー変更"]}`;
    if (old["オプション"]) message += `\n[旧オプション] ${old["オプション"]}`;
    if (old["お支払い方法"]) message += `\n[支払方法] ${old["お支払い方法"]}`;
    if (old["参考URL(任意)"]) message += `\n[参考URL] ${old["参考URL(任意)"]}`;

    // 追加
    await prisma.order.create({
      data: {
        clientName: old["ご依頼者名"] || "名称未設定",
        clientEmail: old["メールアドレス"] || "",
        twitterId: old["TwitterID(任意)"] || "",
        contactMethod: old["希望する連絡手段"] || "未設定",
        serviceType: serviceType,
        planId: "", // プランIDは空にしておくか、ダミーを入れる
        songTitle: old["曲名"] || "",
        message: message.trim(),
        status: newStatus,
        price: price,
        createdAt: new Date(old.date),
        updatedAt: new Date(old.date),
      }
    });

    addedCount++;
    console.log(`追加: ${old["ご依頼者名"]}様 - ${old["曲名"]}`);
  }

  console.log("=== 移行完了 ===");
  console.log(`新規追加: ${addedCount}件`);
  console.log(`スキップ: ${skippedCount}件`);
  
  if (skippedCount > 0) {
    console.log("\n--- スキップ理由 ---");
    skippedReasons.slice(0, 5).forEach(r => console.log(r));
    if (skippedReasons.length > 5) console.log(`...他 ${skippedReasons.length - 5}件`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
