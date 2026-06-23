import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const news = await prisma.news.findUnique({
    where: { slug: params.slug },
  });

  if (!news || !news.isVisible) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <Link href="/news" className="text-[#0071E3] font-bold hover:underline text-sm flex items-center gap-2">
            ← ニュース一覧へ戻る
          </Link>
        </div>
        
        <article className="glass-panel p-8 md:p-12 rounded-3xl">
          <header className="mb-8 border-b border-gray-200 pb-8">
            <time className="text-sm font-bold text-[#47A1FF] tracking-wider mb-3 block">
              {news.date.toISOString().split('T')[0].replace(/-/g, '.')}
            </time>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1D1D1F] leading-snug">
              {news.title}
            </h1>
          </header>
          
          <div className="prose prose-lg max-w-none text-gray-600 font-medium whitespace-pre-wrap leading-relaxed">
            {news.content}
          </div>
        </article>
      </div>
    </div>
  );
}
