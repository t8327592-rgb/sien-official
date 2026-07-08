import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const news = await prisma.post.create({
    data: {
      title: "【期間限定】サマーMIXセール開催のお知らせ！",
      content: "いつもSienのMIXをご愛顧いただきありがとうございます。\n\nこの度、期間限定で「サマーMIXセール」を開催することとなりました！\n\n**【キャンペーン内容】**\nスタンダードプラン（フルコーラスMIX）が、一律で **2,000円OFF** となります。\n新規のお客様もリピーター様も対象です。（※ソロでのご依頼限定となります）\n\n**【開催期間】**\n- お申し込み期間：7/8 18:00 〜 7/17 23:59まで\n- 音源提出・お支払い期限：7/20 23:59まで\n\nご依頼は[サマーセール特設ページ](/summer-sale)よりお待ちしております！\nこの機会にぜひ、あなたの歌声を最高の作品に仕上げてみませんか？",
      published: true,
      type: "NEWS",
      category: "お知らせ",
    }
  });
  console.log("News created:", news);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
