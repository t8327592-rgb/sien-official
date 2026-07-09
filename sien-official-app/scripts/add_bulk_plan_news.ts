import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const newsContent = `
いつもSien-Officialをご利用いただき、誠にありがとうございます。

この度、毎日投稿や定期的なシリーズ動画の投稿をされるクリエイター様向けに、**「ショートMIX まとめ依頼プラン」**の提供を開始いたしました。

ショート動画用のMIX（通常1本5,000円）をまとめてご依頼いただくことで、**最大30%OFF**となる大変お得なプランです。

### 📌 プラン内容

- **ショートMIX 3本セット**
  価格: 13,500円（通常より10%お得）
  
- **ショートMIX 5本セット【★一番人気】**
  価格: 20,000円（通常より20%お得）
  
- **ショートMIX 10本セット**
  価格: 35,000円（通常より30%お得）

### 💡 こんな方におすすめ
- 毎日投稿や定期投稿のストックを作りたい方
- シリーズ物の動画で、ボーカルの音質・クオリティを統一したい方
- 単発で何度も依頼する手間を省き、お得に制作を進めたい方

※スケジュールに合わせて、数本ずつの「分割納品」にも対応可能です。ご依頼時にご相談ください。

詳細やご依頼は、[歌ってみたMIX依頼ページ](/mix#plans) よりご確認いただけます。
皆様の継続的なクリエイター活動を、音質の面から全力でサポートさせていただきます。

今後ともSien-Officialをよろしくお願いいたします。
  `.trim();

  const news = await prisma.post.create({
    data: {
      title: "【新プラン】「ショートMIX まとめ依頼プラン」提供開始のお知らせ",
      content: newsContent,
      published: true,
      type: "NEWS",
      category: "お知らせ",
    }
  });

  console.log(`Created news: ${news.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
