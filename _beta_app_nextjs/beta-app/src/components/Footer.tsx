import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-[#313338] bg-[#1e1f22] pt-16 pb-8 relative overflow-hidden">
      {/* Decorative dots in footer */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#f59e0b]/5 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-8 mt-4">
              <Logo size="lg" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-medium">
              あなたの歌声を、より魅力的な作品へ。<br />
              ボーカルMIXからオリジナル楽曲制作まで、音に関するご相談をお待ちしております。
            </p>
          </div>
          
          <div>
            <h3 className="text-gray-800 font-bold mb-6 text-lg">Services</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/pricing" className="text-gray-500 hover:text-orange-500 text-sm font-bold transition-colors">
                  料金表・詳細
                </Link>
              </li>
              <li>
                <Link href="/works" className="text-gray-500 hover:text-orange-500 text-sm font-bold transition-colors">
                  制作実績
                </Link>
              </li>
              <li>
                <Link href="/order" className="text-gray-500 hover:text-orange-500 text-sm font-bold transition-colors">
                  ご依頼フォーム
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-800 font-bold mb-6 text-lg">Support</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/#flow" className="text-gray-500 hover:text-orange-500 text-sm font-bold transition-colors">
                  制作の流れ
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-gray-500 hover:text-orange-500 text-sm font-bold transition-colors">
                  よくある質問
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-500 hover:text-orange-500 text-sm font-bold transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-400 hover:text-orange-500 text-sm font-bold transition-colors mt-4 inline-block">
                  管理画面 (Admin)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t-2 border-orange-200/50">
          <p className="text-gray-400 font-bold text-xs">
            &copy; {new Date().getFullYear()} tonitune. All rights reserved.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="https://twitter.com/sien_mc09" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-[#1DA1F2] font-bold transition-colors text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              X (Twitter)
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-[#FF0000] font-bold transition-colors text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
