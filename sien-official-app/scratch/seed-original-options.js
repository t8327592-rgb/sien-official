const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 

async function main() { 
  await prisma.option.createMany({ 
    data: [ 
      { name: '生楽器演奏追加', category: 'ORIGINAL', priceText: '10,000円〜', description: 'ギター、ベース、ピアノなど専門プレイヤーによる生演奏を追加いたします。※提携クリエイターへの依頼となるため、使用楽器や内容により料金が変動いたします。（基本料金内で対応できる場合もございます）', orderIndex: 1, isActive: true }, 
      { name: '人間による仮歌歌唱', category: 'ORIGINAL', priceText: '5,000円〜', description: 'より実際の歌唱ニュアンスに近い「人間による仮歌」をご希望の場合はこちらをご利用ください。※提携クリエイターへの依頼となるため料金が変動する場合がございます。（基本料金内ではボーカロイドによる仮歌をお渡しします）', orderIndex: 2, isActive: true }, 
      { name: 'ボーカルディレクション', category: 'ORIGINAL', priceText: '5,000円', description: 'Discord等を使用し、オンラインでレコーディング時に歌唱アドバイスや方向性の確認を行います。', orderIndex: 3, isActive: true }, 
      { name: 'パラデータ納品', category: 'ORIGINAL', priceText: '5,000円', description: '各楽器パートごとの独立した音声データ（WAV形式）を納品いたします。ご自身でのリミックスや、ライブでのオケの調整用などにご利用いただけます。', orderIndex: 4, isActive: true }, 
      { name: '著作権（財産権）譲渡', category: 'ORIGINAL', priceText: '要相談', description: '楽曲の完全買取りをご希望の場合は、別途ご相談ください。', orderIndex: 5, isActive: true } 
    ] 
  }); 
  console.log('Original options seeded'); 
} 

main().catch(console.error).finally(() => prisma.$disconnect());
