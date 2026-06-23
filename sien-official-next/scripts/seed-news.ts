import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const dataPath = path.join(process.cwd(), 'latest_data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const newsList = data.newsList || [];
  const notices = data.notices || [];

  await prisma.news.deleteMany({});
  let count = 0;

  for (const news of newsList) {
    await prisma.news.create({
      data: {
        title: news.title || '無題',
        content: news.content || '',
        date: news.date ? new Date(news.date) : new Date(),
        isVisible: news.visible !== false,
      }
    });
    count++;
  }

  for (const notice of notices) {
    await prisma.news.create({
      data: {
        title: notice.title || '無題',
        content: notice.content || '',
        date: new Date(), // notices don't have explicit date, use now
        isVisible: notice.visible !== false,
      }
    });
    count++;
  }

  console.log(`Successfully imported ${count} news items.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
