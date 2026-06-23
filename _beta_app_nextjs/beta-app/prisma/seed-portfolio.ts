import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const portfolios = [
  { title: "[歌ってみた]Campus mode!!/初星学園 ❴ぽぷ・にゃーちふぃんど/月見ひとか/純粋なの/re;BON❵", videoId: "olpsRfUFdjw" },
  { title: "【二度あることは三度ある】ダーリンゲームオーバーラブ（Cover）/とうにこ【四度目はない】", videoId: "jaD7Q3c6Zrk" },
  { title: "【歌ってみた】天才 / SMITH(すみす)", videoId: "E6bS-n2nx0g" },
  { title: "【子ﾗｲｵﾝ♀が】けっかおーらい/ヴィジランテOP【描いて歌ってみた】VTuber Cover", videoId: "Le84jUtbRwo" },
  { title: "CH4NGE（Cover）/とうにこ", videoId: "O48vUZACOWI" },
  { title: "にわかには信じがたいものです / なとり - じょん【歌ってみた】", videoId: "zddRPA0cnOo" },
  { title: "【歌ってみた】それでよかった/サネル【cover】", videoId: "Htzr1skJHeI" },
  { title: "王様が KING 歌ってみた", videoId: "lw6QtqzqEGE" },
  { title: "YONA YONA DANCE - 和田アキ子 / あまる (cover)【踊らにゃ損です】", videoId: "dgzP27CmQPo" },
  { title: "白い雪のプリンセスは Covered by 草刈七海", videoId: "tDUgj37HhOw" },
  { title: "【歌ってみた】プロポーズ / ウルハシスティー", videoId: "nLYMZoJhz9g" },
  { title: "メーデー / ひらぎ - じょん【歌ってみた】", videoId: "TRV3N-biUhs" },
  { title: "世界の真ん中を歩く / 田中バター【歌ってみた】", videoId: "5m1iq4BfAjk" },
  { title: "いーあるふぁんくらぶ / ぷりあま Cover【歌ってみた】", videoId: "voTuWFmcbeI" },
  { title: "Gimme×Gimme 歌ってみた / ららしぃ×翠音", videoId: "-eayQvyN-AA" },
  { title: "【初投稿】 恋愛裁判/40mP　歌ってみた (Covered by 綿貫）", videoId: "sI1WDJfaER8" },
  { title: "キラー（Cover）/とうにこ", videoId: "yRFFBglbLWo" },
  { title: "心做し（Cover）/とうにこ", videoId: "Cl_kaUnDrhQ" },
  { title: "【Ⅳ周年記念に】愛言葉Ⅳ（Cover）/とうにこ【歌ってみた】", videoId: "W02F3qMMJps" },
  { title: "【登録者1000人＆1100人＆1200人達成記念】マシュマロ（Cover）/とうにこ【歌ってみた】", videoId: "tSbcuOq1sak" },
  { title: "春を待つ（Cover）/とうにこ", videoId: "la79Ia_JMm4" },
  { title: "【友大】友成空/鬼ノ宴 (ワンコーラス)【歌いました】", videoId: "BgWGn_ckOGk" },
  { title: "【歌ってみた】Sleepwalk / なとり #Shorts", videoId: "Zsf55ScDegs" },
  { title: "ラプラスショコラ（Cover）/とうにこ", videoId: "LEgP9kCQOik" },
  { title: "キングスレイヤー（Cover）/とうにこ", videoId: "QXoPOl77iS0" },
  { title: "セツナトリップ covered by 草刈七海", videoId: "hXpHIMTh4Ss" },
  { title: "1925 Covered by 草刈七海", videoId: "66SEFFnZ7bQ" },
  { title: "星夢ランデヴー - 草刈七海", videoId: "gFrCjNuaSFw" },
  { title: "しわ Covered by草刈七海", videoId: "loKHpazzG8w" },
  { title: "【姉妹】再教育　歌ってみた【ひみ×れい】", videoId: "c63v-IGjX1E" },
  { title: "火ノ要鎮 / 平田義久 - じょん【歌ってみた】", videoId: "u4rAEKOKeZA" },
  { title: "【歌ってみた】ダーリンゲームオーバーラブ / ウルハシスティー", videoId: "ZYCwYSK0RK4" },
  { title: "【キッカイケッタイ】　夜堕まふゆが歌ってみた", videoId: "vER8smY-Rrw" },
  { title: "ユートピア / toluc (covered by 鱏歌屋)", videoId: "rsu4xOXgaKw" },
  { title: "観光 - クレイジーケンバンド 【Covered by 今日山セイル】", videoId: "TqkH6LbYoeM" },
  { title: "【歌ってみた】ド屑 / ウルハシスティー", videoId: "ymdOn6swgDk" },
  { title: "Loveit? / Rizu (Cover)", videoId: "SzHHXp3yC4g" },
  { title: "【歌ってみた】LADY CRAZY / ディーニャルルーカ , ウルハシスティー", videoId: "a9m-cD8ugjw" },
  { title: "おばけになってもいっしょだよ / 今日山セイル", videoId: "NtZCTADhA_E" },
  { title: "けーたいみしてよ/ MAISONdes（covered by 波月あゆみ）【歌ってみた】", videoId: "-m7q2IWUWcg" },
  { title: "【Original】CLIP!! / もろ羽ゆき with 歌", videoId: "VcD3rrDIUA8" },
  { title: "グッバイユース『imaginary blue』Music Video", videoId: "qylofaV8O7Y" },
  { title: "OK's(オーケーズ)「BOYS＆GIRLS」Music Video", videoId: "1_H4drHBjRQ" },
  { title: "打上花火 - DAOKO×米津玄師 / covered by しえん×波月あゆみ 【歌ってみた】", videoId: "dixTBmndc6g" }
];

async function main() {
  console.log("Seeding portfolios...");
  for (let i = 0; i < portfolios.length; i++) {
    const p = portfolios[i];
    await prisma.portfolio.create({
      data: {
        title: p.title,
        videoId: p.videoId,
        order: i + 1
      }
    });
  }
  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
