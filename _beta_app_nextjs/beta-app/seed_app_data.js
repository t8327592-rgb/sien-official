const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Plan
  const planCount = await prisma.plan.count();
  if (planCount === 0) {
    await prisma.plan.createMany({
      data: [
        {
          title: "Vocal Mix",
          price: "8,000",
          description: "メインボーカル＋ハモリの標準MIX\nノイズ除去、ピッチ補正、タイミング補正込み\nエフェクト（Reverb/Delay等）処理",
          period: "約2週間",
          revisions: "3回まで",
          isPopular: true,
          order: 1
        },
        {
          title: "Chorus Make",
          price: "3,000",
          description: "メインボーカルからハモリパートを生成\nまたはMIDIからのハモリ打ち込み",
          period: "MIXと同時進行",
          revisions: "2回まで",
          isPopular: false,
          order: 2
        },
        {
          title: "Speed Delivery",
          price: "5,000",
          description: "お急ぎ対応オプション\nデータ受領から3日以内で納品",
          period: "3日以内",
          revisions: "1回",
          isPopular: false,
          order: 3
        }
      ]
    });
    console.log("Created plans");
  }

  // Portfolio
  const portfolioCount = await prisma.portfolio.count();
  if (portfolioCount === 0) {
    await prisma.portfolio.createMany({
      data: [
        {
          title: "【歌ってみた】Campus mode!!",
          videoId: "olpsRfUFdjw",
          artist: "ぽぷ・にゃーちふぃんど等",
          tags: "アイドル,合唱",
          comment: "大人数コラボのMIXを担当させていただきました！",
          order: 1
        },
        {
          title: "【歌ってみた】天才",
          videoId: "E6bS-n2nx0g",
          artist: "SMITH(すみす)",
          tags: "ロック,ボーカルエディット",
          comment: "エッジの効いたロックなMIXに仕上げました。",
          order: 2
        }
      ]
    });
    console.log("Created portfolios");
  }

  // News
  const newsCount = await prisma.news.count();
  if (newsCount === 0) {
    await prisma.news.createMany({
      data: [
        {
          title: "現在MIXのご依頼を受付中です！",
          content: "納期は約2〜3週間となっております。お急ぎの方はご相談ください。"
        },
        {
          title: "ポートフォリオを更新しました",
          content: "新しく2件の動画を実績に追加しました。"
        }
      ]
    });
    console.log("Created news");
  }

  console.log("Seeding complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
