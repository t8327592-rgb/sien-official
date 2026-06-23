import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import HeroVideo from '@/components/home/HeroVideo';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // 最新実績3件を取得（sortOrder昇順、その後createdAt降順）
  const latestWorks = await prisma.portfolio.findMany({
    orderBy: [
      { sortOrder: 'asc' },
      { createdAt: 'desc' }
    ],
    take: 3
  });

  // 最新お知らせ3件を取得
  const latestNews = await prisma.news.findMany({
    where: { isVisible: true },
    orderBy: { date: 'desc' },
    take: 3
  });

  // ダミーの実績数・累計再生数（将来的にDBやAPIから取得可能）
  const stats = {
    worksCount: "800+",
    totalViews: "5,000万回+"
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAFAFA]">
      <HeroVideo />

      {/* Main Content Overlay */}
      <div className="relative z-10 flex flex-col items-center pt-32 pb-24 px-4 min-h-screen">
        
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-16 animate-fade-in-up">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-[0_4px_30px_rgba(0,113,227,0.2)] mb-6 bg-white">
            <Image 
              src="/profile-large.png" 
              alt="しえん" 
              width={160} 
              height={160} 
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1D1D1F] mb-2 font-heading">
            しえん
          </h1>
          <p className="text-[#0071E3] text-lg md:text-xl font-bold mb-8">
            Mix & Mastering Engineer
          </p>
          
          {/* Stats */}
          <div className="flex gap-8 mb-10 text-center">
            <div className="glass-panel px-6 py-3 rounded-2xl">
              <div className="text-sm text-gray-500 font-medium mb-1">実績数</div>
              <div className="text-2xl font-bold text-[#1D1D1F]">{stats.worksCount}</div>
            </div>
            <div className="glass-panel px-6 py-3 rounded-2xl">
              <div className="text-sm text-gray-500 font-medium mb-1">累計再生数</div>
              <div className="text-2xl font-bold text-[#1D1D1F]">{stats.totalViews}</div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
            <Link 
              href="/works" 
              className="w-full sm:w-auto px-8 py-4 bg-[#0071E3] text-white rounded-full font-bold tracking-wider hover:bg-[#47A1FF] transition-all duration-300 shadow-[0_4px_20px_rgba(0,113,227,0.2)] hover:shadow-[0_8px_30px_rgba(71,161,255,0.3)] hover:-translate-y-1 text-center"
            >
              制作実績を見る
            </Link>
            <Link 
              href="/contact" 
              className="w-full sm:w-auto px-8 py-4 glass-panel text-[#1D1D1F] rounded-full font-bold tracking-wider hover:bg-gray-50 transition-all duration-300 hover:-translate-y-1 text-center"
            >
              お問い合わせ
            </Link>
          </div>
        </div>

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
          
          {/* Latest Works */}
          <div className="flex flex-col">
            <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-2">
              <h2 className="text-2xl font-bold text-[#1D1D1F]">Latest Works</h2>
              <Link href="/works" className="text-sm text-[#0071E3] font-bold hover:underline">すべて見る</Link>
            </div>
            <div className="space-y-4">
              {latestWorks.map((work) => (
                <Link href="/works" key={work.id} className="group flex gap-4 glass-panel p-3 rounded-xl modern-card">
                  <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://img.youtube.com/vi/${work.youtubeId}/mqdefault.jpg`} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex flex-col justify-center overflow-hidden">
                    <h3 className="text-[#1D1D1F] font-bold text-sm truncate group-hover:text-[#0071E3] transition-colors">{work.title}</h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">{work.category === 'mix' ? 'MIX' : work.category === 'orig' ? 'ORIGINAL' : work.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Latest News */}
          <div className="flex flex-col">
            <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-2">
              <h2 className="text-2xl font-bold text-[#1D1D1F]">News</h2>
              <Link href="/news" className="text-sm text-[#0071E3] font-bold hover:underline">すべて見る</Link>
            </div>
            <div className="space-y-4">
              {latestNews.map((news) => (
                <Link href={`/news/${news.slug}`} key={news.id} className="group flex flex-col glass-panel p-4 rounded-xl modern-card">
                  <time className="text-xs text-[#0071E3] mb-1 font-bold tracking-wider">
                    {news.date.toISOString().split('T')[0].replace(/-/g, '.')}
                  </time>
                  <h3 className="text-[#1D1D1F] text-sm font-bold line-clamp-2 group-hover:text-[#47A1FF] transition-colors">
                    {news.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* --- 仮置き Admin リンク --- */}
        <div className="fixed bottom-4 right-4 z-50">
          <Link href="/admin" className="bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold opacity-50 hover:opacity-100 transition-all flex items-center gap-2">
            ⚙ 管理画面へ
          </Link>
        </div>

      </div>
    </div>
  );
}
