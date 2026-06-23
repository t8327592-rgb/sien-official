import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching data from the old Sien-Official API...');
  
  try {
    const res = await fetch('https://sien-official.vercel.app/api/admin?type=public');
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    
    console.log('Data fetched successfully. Starting import to SQLite (Prisma)...');

    // 1. Works (MIX & Original)
    // Clear existing
    await prisma.portfolio.deleteMany();
    
    let worksCount = 0;
    if (data.works && Array.isArray(data.works)) {
      for (const work of data.works) {
        await prisma.portfolio.create({
          data: {
            youtubeId: work.youtubeId || '',
            title: work.title || 'Untitled',
            clientName: work.client || '',
            role: work.mix ? 'MIX' : '',
            category: 'mix',
            isHighlight: true // 昔の実績はトップに表示されていたものなので一旦Highlight扱い
          }
        });
        worksCount++;
      }
    }
    
    if (data.orig && Array.isArray(data.orig)) {
      for (const work of data.orig) {
        await prisma.portfolio.create({
          data: {
            youtubeId: work.youtubeId || '',
            title: work.title || 'Untitled',
            clientName: work.client || '',
            role: 'Original',
            category: 'orig',
            isHighlight: true
          }
        });
        worksCount++;
      }
    }
    console.log(`✅ Imported ${worksCount} portfolio items.`);

    // 2. Pricing
    await prisma.plan.deleteMany();
    let priceCount = 0;
    if (data.prices && Array.isArray(data.prices)) {
      for (let i = 0; i < data.prices.length; i++) {
        const p = data.prices[i];
        await prisma.plan.create({
          data: {
            name: p.title || 'Plan',
            price: parseInt(p.price) || 0,
            description: p.desc || '',
            features: JSON.stringify(p.features || []),
            orderIndex: i
          }
        });
        priceCount++;
      }
      console.log(`✅ Imported ${priceCount} pricing plans.`);
    }

    // 3. News
    await prisma.news.deleteMany();
    let newsCount = 0;
    if (data.newsList && Array.isArray(data.newsList)) {
      for (const n of data.newsList) {
        await prisma.news.create({
          data: {
            title: n.title || 'News',
            content: n.body || '',
            date: n.date ? new Date(n.date) : new Date(),
            isVisible: n.show !== false
          }
        });
        newsCount++;
      }
      console.log(`✅ Imported ${newsCount} news items.`);
    }

    // 4. Voices
    await prisma.voice.deleteMany();
    let voicesCount = 0;
    if (data.voices && Array.isArray(data.voices)) {
      for (const v of data.voices) {
        await prisma.voice.create({
          data: {
            client: v.client || 'Client',
            content: v.body || '',
            rating: 5,
            source: v.source || 'ココナラ'
          }
        });
        voicesCount++;
      }
      console.log(`✅ Imported ${voicesCount} customer voices.`);
    }

    console.log('🎉 All data imported successfully!');

  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
