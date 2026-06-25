const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 

async function main() { 
  // いったん「新規オプション」も含めて全削除するか、既存を保持するか
  // 既存の「新規オプション」は消す
  await prisma.option.deleteMany({});

  await prisma.option.createMany({ 
    data: [ 
      { name: 'ライブ用音源制作', category: 'MIX', priceText: '1,000円', description: 'ライブ会場での鳴りや音圧を考慮し、ステージ歌唱向けに調整した音源を制作します。', orderIndex: 1, isActive: true }, 
      { name: 'エンコード', category: 'MIX', priceText: '0円〜1,000円', description: '完成した音源と本家動画を組み合わせ、投稿用のMP4データを制作します。\n\n・お支払い金額の合計が10,000円以上：0円\n・お支払い金額の合計が10,000円未満：1,000円', orderIndex: 2, isActive: true }, 
      { name: 'アカペラ音源納品', category: 'MIX', priceText: '0円', description: 'ボーカルのみの音源データも合わせて納品します。', orderIndex: 3, isActive: true }, 
      { name: 'ボーカルガイド作成', category: 'MIX', priceText: '3,000円', description: 'MIXと併せてのご依頼はもちろん、ガイド制作のみのご依頼も可能です。メイン・ユニゾン・ハモリを打ち込み、WAV形式またはMIDI形式で納品いたします。納期は最大7日ほどいただく場合がございます。', orderIndex: 4, isActive: true }, 
      { name: 'カットアップ', category: 'MIX', priceText: '2,000円〜', description: '10秒あたりの金額です。作業量に応じて料金が変動する可能性がございますので、事前にご相談ください。\n\nサンプルを見る: https://youtu.be/jaD7Q3c6Zrk?si=Zrw6bF0RA33Mjy1h&t=97', orderIndex: 5, isActive: true } 
    ] 
  }); 
  console.log('Options seeded'); 
} 

main().catch(console.error).finally(() => prisma.$disconnect());
