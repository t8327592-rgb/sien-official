import Image from 'next/image';

export const metadata = {
  title: 'プロフィール | SIEN.OFFICIAL',
  description: 'SIEN.OFFICIALのプロフィールページです。',
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-12 lg:gap-16">
          
          {/* Profile Image - Larger */}
          <div className="flex-shrink-0 relative w-72 h-72 md:w-[400px] md:h-[400px] rounded-[2rem] md:rounded-[3rem] overflow-hidden border-4 border-white shadow-[0_12px_40px_rgba(0,0,0,0.08)] bg-white">
            <Image 
              src="/profile-large.png" 
              alt="しえん"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Profile Content */}
          <div className="flex-1 text-center md:text-left flex flex-col justify-center min-h-[400px]">
            <h1 className="text-5xl md:text-6xl font-bold text-[#1D1D1F] mb-2 font-heading tracking-tight">しえん</h1>
            <p className="text-[#0071E3] text-lg md:text-xl font-bold mb-8">Mix & Mastering Engineer</p>

            <div className="glass-panel p-6 rounded-2xl mb-8 inline-block mx-auto md:mx-0 border-l-4 border-l-[#0071E3] border-y-0 border-r-0 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="text-sm text-gray-500 font-bold mb-1">Total Works</div>
              <div className="text-4xl font-bold text-[#1D1D1F]">800<span className="text-[#0071E3]">+</span></div>
            </div>

            <div className="space-y-6 text-gray-600 leading-relaxed text-sm md:text-base font-medium mb-10 max-w-xl mx-auto md:mx-0">
              <p>
                大手クリエイター様の作品から「初めての歌ってみた」まで、これまで800件以上の制作をお手伝いしてきました。
              </p>

              <div>
                <h3 className="font-bold text-[#1D1D1F] mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]"></span>
                  主な実績（敬称略）
                </h3>
                <p className="pl-3.5">アマル / ぷりっつ / こーく-不透明- / 深淵組 / re;BON 様 ほか</p>
              </div>

              <div>
                <h3 className="font-bold text-[#1D1D1F] mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]"></span>
                  大切にしていること
                </h3>
                <p className="pl-3.5">
                  技術で飾り立てること以上に、その歌が持つ「熱量」や「魅力」がまっすぐ届くことを一番に考えています。送っていただいた音源の良さを引き出し、クリアで解像度の高い音に仕上げます。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#1D1D1F] mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]"></span>
                  ご依頼について
                </h3>
                <ul className="pl-3.5 space-y-1">
                  <li>・納期：基本7日以内（お急ぎの方もご相談ください）</li>
                  <li>・初めての方へ：何をどう伝えればいいか分からなくても大丈夫です。イメージを伺いながら、一緒に「いい音」を探していければ嬉しいです。</li>
                </ul>
              </div>

              <p className="font-bold text-[#0071E3] pt-2">
                あなたにしか歌えない一曲を、最高の形にするお手伝いをさせてください。
              </p>
            </div>

            {/* Social Links */}
            <div className="flex justify-center md:justify-start gap-4">
              <a 
                href="https://twitter.com/Sien_Official" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-14 h-14 rounded-full bg-white border border-gray-200 text-[#1D1D1F] shadow-sm hover:border-[#0071E3] hover:text-[#0071E3] hover:bg-[#E8F0FE] transition-all duration-300 group"
                aria-label="X (Twitter)"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.961h-1.91z"></path></svg>
              </a>
              <a 
                href="https://youtube.com/@Sien_Official" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-14 h-14 rounded-full bg-white border border-gray-200 text-[#1D1D1F] shadow-sm hover:border-[#0071E3] hover:text-[#0071E3] hover:bg-[#E8F0FE] transition-all duration-300"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
