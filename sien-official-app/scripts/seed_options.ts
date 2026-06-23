import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const optionsData = [
  {
    name: "エンコード",
    priceText: "要相談",
    description: "MP4形式での納品を承ります。 ・スタンダードプラン以上：無料 ・ワンコーラスプラン / ショート動画用MIX：¥1,000 ご希望の方は、事前にお知らせいただけますようお願い申し上げます。"
  },
  {
    name: "カットアップ",
    priceText: "2,000円",
    description: "10秒あたりの金額です。 作業量に応じて料金が変動する可能性がございますので、事前にご相談ください。 ▶️ サンプル（1:40〜）：https://www.youtube.com/watch?v=ZYCwYSK0RK4"
  },
  {
    name: "ボーカルガイド作成",
    priceText: "3,000円",
    description: "MIXとガイドの両方はもちろん、ガイド制作のみのご依頼も承っております。 メイン・ユニゾン・ハモリをピアノ音源などで打ち込み、WAV形式やMIDI形式での納品が可能です。 納期は最大で7日ほどいただく場合がございますので、ご希望の際はお早めにご相談ください。"
  },
  {
    name: "ライブ用音源制作",
    priceText: "1,000円",
    description: "ライブ会場での鳴りや音圧を考慮した、ステージ歌唱専用のマスタリングを行います。"
  },
  {
    name: "アカペラ音源納品",
    priceText: "0円",
    description: "ミックス済みのボーカルのみをWAV形式で書き出します。"
  }
];

async function main() {
  console.log('Seeding options and updating plans...');

  // 1. オプションの登録
  for (const opt of optionsData) {
    const existingOpt = await prisma.option.findFirst({ where: { name: opt.name } });
    if (!existingOpt) {
      await prisma.option.create({
        data: opt
      });
      console.log(`Created option: ${opt.name}`);
    } else {
      console.log(`Option already exists: ${opt.name}`);
    }
  }

  // 2. 既存のプランに納期とリテイクをセット
  const plans = await prisma.plan.findMany();
  for (const p of plans) {
    let period = "7日〜";
    let revisions = "2回";

    if (p.name.includes("ショート")) {
      period = "3日〜";
    } else if (p.name.includes("スタンダード") || p.name.includes("コラボ")) {
      period = "14日〜";
    } else if (p.name.includes("短納期")) {
      period = "3日〜7日";
    } else if (p.name.includes("最短納期")) {
      period = "48時間以内";
    }

    if (p.name.includes("ワンコーラス")) {
      period = "7日〜";
    }

    // デフォルトで「2回」としているが、過去のやり取りで「5回まで無料」となっている
    // => Terms of Service でも「5回まで無料で修正を承ります」となっていたので、すべて「5回」にする
    revisions = "5回";

    await prisma.plan.update({
      where: { id: p.id },
      data: {
        period,
        revisions
      }
    });
    console.log(`Updated plan: ${p.name} (period: ${period}, revisions: ${revisions})`);
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
