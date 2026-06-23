import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rawData = `
1. [歌ってみた]Campus mode!!/初星学園 ❴ぽぷ・にゃーちふぃんど/月見ひとか/純粋なの/re;BON❵
https://www.youtube.com/watch?v=olpsRfUFdjw

2. 【二度あることは三度ある】ダーリンゲームオーバーラブ（Cover）/とうにこ【四度目はない】
https://www.youtube.com/watch?v=jaD7Q3c6Zrk

3. 【歌ってみた】天才 / SMITH(すみす)
https://www.youtube.com/watch?v=E6bS-n2nx0g

4. 【子ﾗｲｵﾝ♀が】けっかおーらい/ヴィジランテOP【描いて歌ってみた】VTuber Cover
https://www.youtube.com/watch?v=Le84jUtbRwo

5. CH4NGE（Cover）/とうにこ
https://www.youtube.com/watch?v=O48vUZACOWI

6. にわかには信じがたいものです / なとり - じょん【歌ってみた】
https://www.youtube.com/watch?v=zddRPA0cnOo

7. 【歌ってみた】それでよかった/サネル【cover】
https://www.youtube.com/watch?v=Htzr1skJHeI

8. 王様が KING 歌ってみた
https://www.youtube.com/watch?v=lw6QtqzqEGE

9. YONA YONA DANCE - 和田アキ子 / あまる (cover)【踊らにゃ損です】
https://www.youtube.com/watch?v=dgzP27CmQPo

10. 白い雪のプリンセスは Covered by 草刈七海
https://www.youtube.com/watch?v=tDUgj37HhOw

11. 【歌ってみた】プロポーズ / ウルハシスティー
https://www.youtube.com/watch?v=nLYMZoJhz9g

12. メーデー / ひらぎ - じょん【歌ってみた】
https://www.youtube.com/watch?v=TRV3N-biUhs

13. 世界の真ん中を歩く / 田中バター【歌ってみた】
https://www.youtube.com/watch?v=5m1iq4BfAjk

14. いーあるふぁんくらぶ / ぷりあま Cover【歌ってみた】
https://www.youtube.com/watch?v=voTuWFmcbeI

15. Gimme×Gimme 歌ってみた / ららしぃ×翠音
https://www.youtube.com/watch?v=-eayQvyN-AA

16. 【初投稿】 恋愛裁判/40mP 歌ってみた (Covered by 綿貫）
https://www.youtube.com/watch?v=sI1WDJfaER8

17. キラー（Cover）/とうにこ
https://www.youtube.com/watch?v=yRFFBglbLWo

18. 心做し（Cover）/とうにこ
https://www.youtube.com/watch?v=Cl_kaUnDrhQ

19. 【Ⅳ周年記念に】愛言葉Ⅳ（Cover）/とうにこ【歌ってみた】
https://www.youtube.com/watch?v=W02F3qMMJps

20. 【登録者1000人＆1100人＆1200人達成記念】マシュマロ（Cover）/とうにこ【歌ってみた】
https://www.youtube.com/watch?v=tSbcuOq1sak

21. 春を待つ（Cover）/とうにこ
https://www.youtube.com/watch?v=la79Ia_JMm4

22. 【友大】友成空/鬼ノ宴 (ワンコーラス)【歌いました】
https://www.youtube.com/watch?v=BgWGn_ckOGk

23. 【歌ってみた】Sleepwalk / なとり #Shorts
https://www.youtube.com/watch?v=Zsf55ScDegs

24. ラプラスショコラ（Cover）/とうにこ
https://www.youtube.com/watch?v=LEgP9kCQOik

25. キングスレイヤー（Cover）/とうにこ
https://www.youtube.com/watch?v=QXoPOl77iS0

26. セツナトリップ covered by 草刈七海
https://www.youtube.com/watch?v=hXpHIMTh4Ss

27. 1925 Covered by 草刈七海
https://www.youtube.com/watch?v=66SEFFnZ7bQ

28. 星夢ランデヴー - 草刈七海
https://www.youtube.com/watch?v=gFrCjNuaSFw

29. しわ Covered by草刈七海
https://www.youtube.com/watch?v=loKHpazzG8w

30. 【姉妹】再教育 歌ってみた【ひみ×れい】
https://www.youtube.com/watch?v=c63v-IGjX1E

31. 火ノ要鎮 / 平田義久 - じょん【歌ってみた】
https://www.youtube.com/watch?v=u4rAEKOKeZA

32. 【歌ってみた】ダーリンゲームオーバーラブ / ウルハシスティー
https://www.youtube.com/watch?v=ZYCwYSK0RK4

33. 【キッカイケッタイ】 夜堕まふゆが歌ってみた
https://www.youtube.com/watch?v=vER8smY-Rrw

34. ユートピア / toluc (covered by 鱏歌屋)
https://www.youtube.com/watch?v=rsu4xOXgaKw

35. 観光 - クレイジーケンバンド 【Covered by 今日山セイル】
https://www.youtube.com/watch?v=TqkH6LbYoeM

36. 【歌ってみた】ド屑 / ウルハシスティー
https://www.youtube.com/watch?v=ymdOn6swgDk

37. Loveit? / Rizu (Cover)
https://www.youtube.com/watch?v=SzHHXp3yC4g

38. 【歌ってみた】LADY CRAZY / ディーニャルルーカ , ウルハシスティー
https://www.youtube.com/watch?v=a9m-cD8ugjw

39. おばけになってもいっしょだよ / 今日山セイル
https://www.youtube.com/watch?v=NtZCTADhA_E

40. けーたいみしてよ/ MAISONdes（covered by 波月あゆみ）【歌ってみた】
https://www.youtube.com/watch?v=-m7q2IWUWcg

41. 【Original】CLIP!! / もろ羽ゆき with 歌
https://www.youtube.com/watch?v=VcD3rrDIUA8

42. グッバイユース『imaginary blue』Music Video
https://www.youtube.com/watch?v=qylofaV8O7Y

43. OK's(オーケーズ)「BOYS＆GIRLS」Music Video
https://www.youtube.com/watch?v=1_H4drHBjRQ

44. 打上花火 - DAOKO×米津玄師 / covered by しえん×波月あゆみ 【歌ってみた】
https://www.youtube.com/watch?v=dixTBmndc6g
`;

async function main() {
  // Clear existing to avoid duplicates if run multiple times
  await prisma.portfolio.deleteMany({});
  
  const blocks = rawData.trim().split('\n\n');
  const portfolios = [];

  // Reverse the array so the first item gets inserted last (has the newest createdAt)
  const reversedBlocks = [...blocks].reverse();

  for (const block of reversedBlocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    let titleLine = '';
    let urlLine = '';

    for (const line of lines) {
      if (line.startsWith('http')) {
        urlLine = line;
      } else if (line.match(/^\d+\./)) {
        titleLine = line.replace(/^\d+\.\s*/, '');
      } else if (!line.startsWith('※')) {
        // If it's a line without number but not a note
        titleLine = line;
      }
    }

    if (titleLine && urlLine) {
      const urlParams = new URL(urlLine).searchParams;
      const youtubeId = urlParams.get('v') || '';
      
      // Determine category based on title keywords
      let category = 'mix';
      if (titleLine.toLowerCase().includes('original') || 
          titleLine.includes('Music Video') || 
          titleLine.includes('オリジナル')) {
        category = 'orig';
      }

      // Try to extract client name from "Covered by XXX" or " / XXX"
      let clientName = '';
      if (titleLine.includes('Covered by')) {
        clientName = titleLine.split('Covered by')[1].replace('）', '').replace('】', '').trim();
      } else if (titleLine.includes('covered by')) {
        clientName = titleLine.split('covered by')[1].replace('）', '').replace('】', '').trim();
      } else if (titleLine.includes(' / ')) {
        clientName = titleLine.split(' / ')[1].replace('【歌ってみた】', '').replace('(Cover)', '').trim();
      } else if (titleLine.includes(' /')) {
        clientName = titleLine.split(' /')[1].replace('【歌ってみた】', '').trim();
      }

      portfolios.push({
        youtubeId,
        title: titleLine,
        clientName: clientName || 'Unknown',
        role: 'Mix',
        category,
        isHighlight: false,
      });
    }
  }

  console.log(`Seeding ${portfolios.length} works...`);

  for (const data of portfolios) {
    await prisma.portfolio.create({ data });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
