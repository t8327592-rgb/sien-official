import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <Image 
                src="/logo.png" 
                alt="SIEN.OFFICIAL" 
                width={180} 
                height={48} 
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:opacity-80"
              />
            </Link>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-sm font-medium">
              VTuberや歌い手のための、高品質なボーカルMIX・オリジナル楽曲制作を提供しています。
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com/Sien_Official" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#E8F0FE] hover:text-[#0071E3] transition-colors">
                <i className="fa-brands fa-twitter text-lg"></i>
              </a>
              <a href="https://youtube.com/@Sien_Official" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#E8F0FE] hover:text-[#0071E3] transition-colors">
                <i className="fa-brands fa-youtube text-lg"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[#1D1D1F] mb-6 tracking-widest text-sm">MENU</h4>
            <ul className="space-y-4">
              <li><Link href="/profile" className="text-sm font-bold text-gray-500 hover:text-[#0071E3] transition-colors">プロフィール</Link></li>
              <li><Link href="/works" className="text-sm font-bold text-gray-500 hover:text-[#0071E3] transition-colors">制作実績</Link></li>
              <li><Link href="/pricing" className="text-sm font-bold text-gray-500 hover:text-[#0071E3] transition-colors">料金・プラン</Link></li>
              <li><Link href="/faq" className="text-sm font-bold text-gray-500 hover:text-[#0071E3] transition-colors">よくある質問</Link></li>
              <li><Link href="/news" className="text-sm font-bold text-gray-500 hover:text-[#0071E3] transition-colors">お知らせ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#1D1D1F] mb-6 tracking-widest text-sm">LEGAL</h4>
            <ul className="space-y-4">
              <li><Link href="/legal/tokushoho" className="text-sm font-bold text-gray-500 hover:text-[#0071E3] transition-colors">特定商取引法に基づく表記</Link></li>
              <li><Link href="/legal/privacy" className="text-sm font-bold text-gray-500 hover:text-[#0071E3] transition-colors">プライバシーポリシー</Link></li>
              <li><Link href="/legal/terms" className="text-sm font-bold text-gray-500 hover:text-[#0071E3] transition-colors">利用規約</Link></li>
              <li><Link href="/contact" className="text-sm font-bold text-gray-500 hover:text-[#0071E3] transition-colors">お問い合わせ</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-gray-400 tracking-wider">
            &copy; {new Date().getFullYear()} SIEN.OFFICIAL. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
