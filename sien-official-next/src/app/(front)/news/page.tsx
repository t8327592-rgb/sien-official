import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'お知らせ | SIEN.OFFICIAL',
  description: 'SIEN.OFFICIALの最新情報やお知らせです。',
};

export default async function NewsPage() {
  const newsList = await prisma.news.findMany({
    where: { isVisible: true },
    orderBy: { date: 'desc' }
  });

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-24 pt-32 relative">
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#1D1D1F] font-heading tracking-widest">
            <span className="text-[#0071E3]">NEWS</span> / お知らせ
          </h1>
        </div>

        <div className="space-y-6">
          {newsList.map(news => (
            <Link href={`/news/${news.slug}`} key={news.id} className="group flex flex-col md:flex-row md:items-center gap-4 md:gap-8 glass-panel p-6 md:p-8 rounded-2xl hover:-translate-y-1 transition-all duration-300">
              <time className="text-sm font-bold text-[#47A1FF] tracking-wider w-32 flex-shrink-0">
                {news.date.toISOString().split('T')[0].replace(/-/g, '.')}
              </time>
              <h2 className="text-lg md:text-xl font-bold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors leading-snug">
                {news.title}
              </h2>
            </Link>
          ))}
          
          {newsList.length === 0 && (
            <div className="text-center py-20 text-gray-500 font-medium">
              現在、お知らせはありません。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
