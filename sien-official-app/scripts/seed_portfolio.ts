import { PrismaClient } from '@prisma/client';
import ytSearch from 'yt-search';

const prisma = new PrismaClient();

const rawData = `
[歌ってみた]Campus mode!!/初星学園 ❴ぽぷ・にゃーちふぃんど/月見ひとか/純粋なの/re;BON❵
¥21,000〜¥30,000
ボーカルミックス
代表作

【二度あることは三度ある】ダーリンゲームオーバーラブ（Cover）/とうにこ【四度目はない】
¥14,000〜¥19,000
ボーカルミックス
代表作

【歌ってみた】天才 / SMITH(すみす)
¥13,000〜¥15,000
ボーカルミックス

【子ﾗｲｵﾝ♀が】けっかおーらい/ヴィジランテOP【描いて歌ってみた】VTuber Cover
¥13,000〜¥18,000
ボーカルミックス

CH4NGE（Cover）/とうにこ
¥13,000〜¥15,000
ボーカルミックス

にわかには信じがたいものです / なとり - じょん【歌ってみた】
¥10,000〜¥14,000
ボーカルミックス

【歌ってみた】それでよかった/サネル【cover】
¥10,000〜¥12,000
ボーカルミックス

王様が KING 歌ってみた
¥10,000〜¥12,000
ボーカルミックス

YONA YONA DANCE - 和田アキ子 / あまる (cover)【踊らにゃ損です】
¥10,000〜¥12,000
ボーカルミックス

白い雪のプリンセスは Covered by 草刈七海
¥10,000〜¥12,000
ボーカルミックス

【歌ってみた】プロポーズ / ウルハシスティー
¥10,000〜¥12,000
ボーカルミックス

メーデー / ひらぎ - じょん【歌ってみた】
¥10,000〜¥12,000
ボーカルミックス

世界の真ん中を歩く / 田中バター【歌ってみた】
¥10,000〜¥12,000
ボーカルミックス

いーあるふぁんくらぶ / ぷりあま Cover【歌ってみた】
¥14,000〜¥16,000
ボーカルミックス

Gimme×Gimme 歌ってみた / ららしぃ×翠音
¥14,000〜¥16,000
ボーカルミックス

【初投稿】 恋愛裁判/40mP　歌ってみた (Covered by 綿貫）
¥10,000〜¥12,000
ボーカルミックス

キラー（Cover）/とうにこ
¥10,000〜¥12,000
ボーカルミックス

心做し（Cover）/とうにこ
¥10,000〜¥12,000
ボーカルミックス

【Ⅳ周年記念に】愛言葉Ⅳ（Cover）/とうにこ【歌ってみた】
¥10,000〜¥12,000
ボーカルミックス

【登録者1000人＆1100人＆1200人達成記念】マシュマロ（Cover）/とうにこ【歌ってみた】
¥10,000〜¥12,000
ボーカルミックス

春を待つ（Cover）/とうにこ
¥10,000〜¥12,000
ボーカルミックス

【友大】友成空/鬼ノ宴 (ワンコーラス)【歌いました】
¥8,000〜¥9,000
ボーカルミックス

【歌ってみた】Sleepwalk / なとり #Shorts
¥5,000〜¥6,000
ボーカルミックス

ラプラスショコラ（Cover）/とうにこ
¥10,000〜¥12,000
ボーカルミックス

キングスレイヤー（Cover）/とうにこ
¥12,000〜¥15,000
ボーカルミックス

セツナトリップ covered by 草刈七海
¥10,000〜¥12,000
ボーカルミックス

1925 Covered by 草刈七海
¥10,000〜¥12,000
ボーカルミックス

星夢ランデヴー - 草刈七海
¥12,000〜¥15,000
ボーカルミックス

しわ Covered by草刈七海
¥10,000〜¥12,000
ボーカルミックス

【姉妹】再教育　歌ってみた【ひみ×れい】
¥14,000〜¥16,000
ボーカルミックス

火ノ要鎮 / 平田義久 - じょん【歌ってみた】
¥12,000〜¥15,000

【歌ってみた】ダーリンゲームオーバーラブ / ウルハシスティー
¥14,000〜¥19,000

【キッカイケッタイ】　夜堕まふゆが歌ってみた
¥10,000〜¥12,000
ボーカルミックス

ユートピア / toluc (covered by 鱏歌屋)
¥10,000〜¥12,000
ボーカルミックス

観光 - クレイジーケンバンド 【Covered by 今日山セイル】
¥10,000〜¥12,000
ボーカルミックス

【歌ってみた】ド屑 / ウルハシスティー
¥10,000〜¥12,000
ボーカルミックス

Loveit? / Rizu (Cover)
¥12,000〜¥15,000
ボーカルミックス

【歌ってみた】LADY CRAZY / ディーニャルルーカ , ウルハシスティー
¥14,000〜¥20,000
ボーカルミックス

おばけになってもいっしょだよ / 今日山セイル
¥12,000〜¥14,000
ボーカルミックス

けーたいみしてよ/ MAISONdes（covered by 波月あゆみ）【歌ってみた】
¥10,000〜¥12,000
ボーカルミックス

【Original】CLIP!! / もろ羽ゆき with 歌
¥17,000〜¥20,000
ボーカルミックス

グッバイユース『imaginary blue』Music Video
¥20,000〜¥30,000
ボーカルミックス

OK's(オーケーズ)「BOYS＆GIRLS」Music Video
¥20,000〜¥30,000
ボーカルミックス

打上花火 - DAOKO×米津玄師 / covered by しえん×波月あゆみ 【歌ってみた】
¥14,000〜¥16,000
ボーカルミックス

オーバーライド -Cover- しえん
¥5,000〜¥6,000
ボーカルミックス

Bunny Girl -Cover- しえん
¥5,000〜¥6,000
ボーカルミックス

少女レイ -Cover- しえん
¥8,000〜¥9,000
ボーカルミックス

いえない -Cover- しえん
¥5,000〜¥6,000
ボーカルミックス

モニタリング -Cover- しえん
¥5,000〜¥6,000
ボーカルミックス
`;

async function main() {
  console.log('Starting portfolio seed...');
  
  // 既存のPortfolioをクリア
  await prisma.portfolio.deleteMany({});
  console.log('Cleared existing portfolios.');

  const items = rawData.trim().split('\n\n');
  let orderIndex = 0;

  for (const block of items) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    const title = lines[0];
    const priceRange = lines[1];
    
    // オプション情報の解析
    let serviceCategory = "ボーカルミックス";
    let isFeatured = false;

    if (lines.length >= 3) {
      if (lines[2] === "代表作") {
        isFeatured = true;
      } else {
        serviceCategory = lines[2];
      }
    }
    if (lines.length >= 4) {
      if (lines[3] === "代表作") {
        isFeatured = true;
      }
    }

    console.log(`\nSearching YouTube for: ${title}`);
    let url = "";
    try {
      const searchResult = await ytSearch(title);
      if (searchResult && searchResult.videos.length > 0) {
        url = searchResult.videos[0].url;
        console.log(`Found: ${url}`);
      } else {
        console.log(`Not found.`);
      }
    } catch (err) {
      console.error(`Error searching ${title}:`, err);
    }

    await prisma.portfolio.create({
      data: {
        title,
        priceRange,
        serviceCategory,
        isFeatured,
        url,
        orderIndex,
      }
    });

    orderIndex++;
    
    // API制限やBANを避けるために1秒待つ
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\nPortfolio seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
