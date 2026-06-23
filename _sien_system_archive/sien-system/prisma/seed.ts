import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 管理者ユーザーの作成
  const hashedPassword = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "管理者",
    },
  });

  // プロフィールの作成
  const profileCount = await prisma.profile.count();
  if (profileCount === 0) {
    await prisma.profile.create({
      data: {
        id: "main-profile",
        name: "しえん (sien)",
        title: "MIX ENGINEER / CREATOR",
        twitterId: "@sien_mc09",
        text1: "歌ってみたのボーカルMIXから、オリジナル楽曲の作編曲まで幅広く手掛けています。これまでの制作実績は800件以上。ロック・ポップス・ボカロ系ジャンルを特に得意としています。",
        text2: "「オケに馴染む自然なピッチ補正」や「ハモリ生成」、一人ひとりの声の魅力を引き出す緻密なボーカルエディットにこだわっています。初心者の方からプロフェッショナルまで、どんなご依頼にも全力で向き合います！",
        text3: "あなたの声の個性を最大限に引き出し、”作品”として長く愛される音を一緒に作り上げましょう！",
      }
    });
  }

  // 料金プランの作成
  const planCount = await prisma.plan.count();
  if (planCount === 0) {
    await prisma.plan.createMany({
      data: [
        {
          title: "ショート動画用MIX",
          price: "5,000",
          description: "TikTok/Reels/Shortsなど短い動画向け",
          period: "3日〜",
          revisions: "5回",
          isPopular: false,
          order: 1,
        },
        {
          title: "ワンコーラスプラン",
          price: "8,000",
          description: "1番サビ終わりまでの制作プラン。お試しに。",
          period: "7日〜",
          revisions: "5回",
          isPopular: false,
          order: 2,
        },
        {
          title: "スタンダードプラン",
          price: "10,000",
          description: "フルコーラスの基本プラン（ピッチ補正等込）",
          period: "14日〜",
          revisions: "5回",
          isPopular: true,
          order: 3,
        }
      ]
    });
  }

  console.log("Seed finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
