import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fetchYoutubeTitle(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    });
    const text = await res.text();
    // titleタグ、または og:title を抽出
    const titleMatch = text.match(/<title>(.*?) - YouTube<\/title>/) || text.match(/<meta property="og:title" content="(.*?)">/);
    if (titleMatch && titleMatch[1]) {
      // HTMLエンティティのデコード処理 (簡易)
      let title = titleMatch[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      return title;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching title for ${url}:`, error);
    return null;
  }
}

async function main() {
  console.log('Starting title synchronization from YouTube URLs...');
  
  const portfolios = await prisma.portfolio.findMany({
    orderBy: { orderIndex: 'asc' }
  });

  for (const p of portfolios) {
    if (!p.url) continue;

    console.log(`\nProcessing [${p.orderIndex}]: ${p.url}`);
    
    // URLから動画IDを抽出して、標準的な形式のURLでfetchする
    const match = p.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (!match) {
      console.log(`-> Invalid YouTube URL format.`);
      continue;
    }

    const cleanUrl = `https://www.youtube.com/watch?v=${match[1]}`;
    const fetchedTitle = await fetchYoutubeTitle(cleanUrl);

    if (fetchedTitle && fetchedTitle !== "YouTube") {
      if (p.title !== fetchedTitle) {
        console.log(`-> Title updated: "${p.title}" => "${fetchedTitle}"`);
        await prisma.portfolio.update({
          where: { id: p.id },
          data: { title: fetchedTitle }
        });
      } else {
        console.log(`-> Title is already correct.`);
      }
    } else {
      console.log(`-> Could not fetch title.`);
    }

    // 負荷軽減のため1秒待機
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\nTitle synchronization completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
