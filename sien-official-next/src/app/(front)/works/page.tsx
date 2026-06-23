import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import Link from 'next/link';
import WorksList from '@/components/WorksList';

export const metadata: Metadata = {
  title: '制作実績 | SIEN.OFFICIAL',
  description: 'Sien-OfficialのボーカルMIX、オリジナル楽曲などの制作実績一覧です。',
};

export default async function WorksPage() {
  const works = await prisma.portfolio.findMany({
    orderBy: [
      { sortOrder: 'asc' }, // Explicit sorting using sortOrder
      { createdAt: 'desc' } // Then order by addedAt reversed
    ],
  });

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-24 pt-32 relative">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#0071E3]/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#1D1D1F] font-heading tracking-widest">
            <span className="text-[#0071E3]">WORKS</span> / 制作実績
          </h1>
          <p className="text-gray-500 font-medium">過去に手掛けたMIX・オリジナル楽曲などの一覧です。</p>
        </div>

        <WorksList works={works} />

        {/* Call to action */}
        <div className="mt-40 text-center glass-panel p-16 rounded-3xl border border-gray-200 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0071E3]/5 to-transparent"></div>
          <h3 className="text-3xl font-bold mb-4 text-[#1D1D1F] relative z-10 tracking-wider">最高の一曲をあなたと</h3>
          <p className="text-gray-600 mb-10 relative z-10 font-medium">まずはお気軽にご相談ください。丁寧にお見積り・ヒアリングいたします。</p>
          <Link href="/contact" className="relative z-10 inline-block bg-[#0071E3] text-[#FAFAFA] font-bold px-12 py-4 rounded-full shadow-[0_4px_20px_rgba(0,113,227,0.2)] hover:shadow-[0_8px_30px_rgba(0,113,227,0.4)] hover:scale-105 transition-all text-lg">
            ご依頼はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}
