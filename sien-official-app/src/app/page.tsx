import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Star, Quote, UserCircle, CheckCircle2 } from "lucide-react";
import { HeroVideoPlayer } from "@/components/ui/HeroVideoPlayer";
import { FeaturedWorksList } from "@/components/works/FeaturedWorksList";
import { getSiteSetting } from "@/app/actions/settings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [mixPortfolios, originalPortfolios, reviews, siteSetting] = await Promise.all([
    prisma.portfolio.findMany({
      where: { isFeatured: true, serviceCategory: { not: "オリジナル楽曲制作" } },
      orderBy: { orderIndex: "asc" },
      take: 4,
    }),
    prisma.portfolio.findMany({
      where: { isFeatured: true, serviceCategory: "オリジナル楽曲制作" },
      orderBy: { orderIndex: "asc" },
      take: 3,
    }),
    prisma.review.findMany({
      where: { isPublished: true },
      orderBy: { orderIndex: "asc" },
      take: 3,
    }),
    getSiteSetting()
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
      
      {/* 1. ヒーローセクション（ファーストビュー） */}
      {/* 画面いっぱいに広がるよう、上部のヘッダー(h-16=4rem)の分を引いて「ちょうど画面にピッタリ」収まるサイズに計算 */}
      <section className="relative w-full min-h-[calc(100svh-4rem)] flex items-center justify-center overflow-hidden bg-white border-b border-orange-100">
        
        {/* 背景動画 */}
        <div className="absolute inset-0 opacity-100">
          <HeroVideoPlayer src="/Video%20Project%201.mp4" />
        </div>
        
        {/* 透明感のある白っぽいフィルター（爽やかさ重視） */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] pointer-events-none"></div>
        {/* 下部を白背景に自然に繋げるグラデーション */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
        
        <div className="relative z-10 container px-4 pt-24 pb-32 mx-auto text-center flex flex-col items-center min-h-[calc(100vh-8rem)] justify-center">
          {/* 受付バッジ */}
          <div className={`mb-8 inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-white/90 backdrop-blur-md shadow-sm border font-bold text-xs sm:text-sm tracking-wide transition-all ${
            siteSetting.orderStatus === "AVAILABLE" 
              ? "border-orange-200 text-orange-600" 
              : siteSetting.orderStatus === "BUSY"
              ? "border-amber-200 text-amber-600"
              : "border-slate-200 text-slate-500"
          }`}>
            {siteSetting.orderStatus === "AVAILABLE" ? (
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-orange-500"></span>
              </span>
            ) : siteSetting.orderStatus === "BUSY" ? (
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-amber-500"></span>
              </span>
            ) : (
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-slate-400"></span>
              </span>
            )}
            {siteSetting.orderStatus === "UNAVAILABLE" ? "お知らせ：" : "受付状況："} {siteSetting.announcement || (siteSetting.orderStatus === "AVAILABLE" ? "現在スケジュール調整可能" : siteSetting.orderStatus === "BUSY" ? "現在混雑中（納期は要相談）" : "現在満枠のため受付を停止しております")}
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-4 sm:mb-8 leading-[1.3] md:leading-[1.2] drop-shadow-xl">
            あなたの歌声を、<br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500 drop-shadow-md inline-block mt-1 md:mt-0">
              “一番輝く形”へ
            </span>
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-slate-800 mb-8 md:mb-10 max-w-3xl font-bold leading-relaxed drop-shadow-lg px-2 break-keep">
            ボーカルMIXから、あなただけの完全オリジナル楽曲制作まで。<br />
            「あなたらしさ」を活かしたプロクオリティの音源を提案します。
          </p>

          <div className="flex flex-col items-center gap-4 w-full sm:w-auto px-4 sm:px-0">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button asChild className="rounded-full h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-xl shadow-orange-500/30 w-full sm:w-auto hover:scale-105 transition-transform border-none text-white">
                <Link href="/order" className="flex items-center justify-center">
                  すぐにお見積り依頼 <ArrowRight className="w-5 h-5 ml-2 shrink-0" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-bold bg-white/90 backdrop-blur-md text-slate-800 border-white/50 hover:bg-white shadow-lg w-full sm:w-auto hover:scale-105 transition-all">
                <Link href="#services" className="flex items-center justify-center">
                  サービス詳細を見る
                </Link>
              </Button>
            </div>
            <p className="text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 drop-shadow-md text-slate-800 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" /> お見積り・ご相談だけでも無料です
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-20 animate-bounce">
          <span className="text-orange-600 text-xs font-extrabold tracking-widest uppercase mb-2 drop-shadow-sm">Scroll</span>
          <div className="w-[2px] h-12 bg-gradient-to-b from-orange-500 to-transparent rounded-full shadow-sm"></div>
        </div>
      </section>

      {/* 1.5. こんな方に最適 */}
      <section className="py-16 bg-white border-b border-orange-100">
        <div className="container px-4 mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-10 text-center flex items-center justify-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-orange-500" />
            こんなお悩み、ありませんか？
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { title: "MIX依頼が初めて", desc: "必要なデータや手順から丁寧にサポート。初心者の方でも安心してお任せいただけます。" },
              { title: "スマホ録音をプロ級に", desc: "ノイズ除去からピッチ補正まで、スマホのマイク音源でもオケに馴染む高クオリティに仕上げます。" },
              { title: "自分だけの曲が欲しい", desc: "歌ってみたの次のステップへ。あなたの声質や世界観にピッタリの完全オリジナル曲を制作します。" }
            ].map((item, i) => (
              <div key={i} className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100 hover:border-orange-300 transition-colors">
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. サービス内容 */}
      <section id="services" className="py-24 bg-orange-50/50 border-b border-orange-100">
        <div className="container px-4 mx-auto text-center max-w-5xl">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">サービス内容</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto mb-16 rounded-full" />
          
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Mix Card */}
            <Link href="/mix" className="group block p-6 md:p-10 rounded-3xl md:rounded-[2rem] bg-white border border-slate-200 hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 relative text-left">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">ボーカルMIX・マスタリング</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-8">歌ってみた等のボーカルミックス。ピッチ・タイミング補正から、オケと馴染ませる魔法まで。あなたの声の魅力を最大限に引き出します。</p>
              <div className="text-orange-500 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                料金と詳細を見る <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Original Card */}
            <Link href="/original" className="group block p-6 md:p-10 rounded-3xl md:rounded-[2rem] bg-white border border-slate-200 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 relative text-left">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">オリジナル楽曲制作</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-8">あなただけの完全オリジナル楽曲制作。作詞・作曲・編曲からボーカルディレクション、納品までトータルでサポートします。</p>
              <div className="text-amber-500 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                詳細を見る <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. 実績セクション */}
      <section className="py-24 bg-white border-b border-orange-100">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">制作実績</h2>
            <p className="text-slate-500">これまでに手掛けた作品の一部をご紹介します。</p>
          </div>
          
          <FeaturedWorksList 
            mixPortfolios={mixPortfolios} 
            originalPortfolios={originalPortfolios} 
          />
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" className="rounded-full px-10 h-14 border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-colors font-bold text-lg">
              <Link href="/works" className="flex items-center justify-center whitespace-nowrap">
                すべての実績を見る <ArrowRight className="w-5 h-5 ml-2 shrink-0" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 4. お客様の声 */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">お客様の声</h2>
            <div className="w-12 h-1 bg-orange-500 mx-auto mb-6 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-orange-200 transition-colors relative">
                <Quote className="absolute top-6 right-6 w-8 h-8 text-orange-100" />
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: review.rating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 text-orange-400 fill-orange-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6 flex-1 min-h-[5rem] font-medium">
                  「{review.content}」
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${review.name}`} alt={review.name} className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 p-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      {review.name}
                      <svg className="w-3 h-3 text-[#1DA1F2]/80" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 5.96H5.078z" /></svg>
                    </div>
                    <div className="text-[10px] font-bold text-orange-500 mt-0.5">{review.serviceType}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ご依頼の流れ */}
      <section className="py-24 bg-orange-50/30 border-b border-slate-100">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">ご依頼の流れ</h2>
            <p className="text-slate-500">初めての方でも安心。お問い合わせから納品までのステップをご案内します。</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-[2px] bg-orange-100 z-0"></div>
            
            {[
              { step: "01", title: "お問い合わせ", desc: "フォームよりお見積り・ご相談ください。プランのご相談だけでも歓迎です。" },
              { step: "02", title: "データ提出・お支払い", desc: "必要なデータをご提出いただき、お支払いをお願いいたします。" },
              { step: "03", title: "MIX・マスタリング", desc: "お預かりしたデータを丁寧にエディットし、プロクオリティに仕上げます。" },
              { step: "04", title: "ご確認・納品", desc: "完成した音源をご確認いただきます。必要に応じて無料の修正にも対応いたします。" },
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center group bg-white md:bg-transparent p-6 md:p-0 rounded-2xl shadow-sm md:shadow-none border border-orange-100 md:border-none mb-4 md:mb-0">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border-2 border-orange-200 flex items-center justify-center mb-4 md:mb-6 shadow-sm group-hover:border-orange-500 group-hover:scale-110 transition-all duration-300">
                  <span className="text-lg font-black text-orange-500">{item.step}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 最終CTA */}
      <section className="py-24 bg-gradient-to-br from-orange-50 to-amber-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-5 blur-sm"></div>
        <div className="container px-4 mx-auto text-center relative z-10 border border-orange-200/50 bg-white/70 backdrop-blur-md rounded-3xl md:rounded-[3rem] p-6 md:p-20 shadow-xl shadow-orange-500/5 max-w-4xl">
          <p className="text-orange-600 text-xs md:text-sm font-bold tracking-widest uppercase mb-3 md:mb-4">Get Started</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 md:mb-8 leading-tight">
            最高の作品を、<br className="md:hidden" />一緒に作りましょう。
          </h2>
          <div className="text-slate-600 mb-8 md:mb-10 max-w-xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed font-bold bg-white/60 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-orange-100">
            <p className="mb-4">
              「初めてのMIX依頼で不安」<br />
              「どのプランを選べばいいかわからない」
            </p>
            <p className="text-orange-600">
              そんな方も、まずはお気軽にご相談ください。<br />
              お見積り・ご相談は無料です。
            </p>
          </div>
          <Button asChild className="rounded-full h-16 px-12 text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/20 hover:scale-105 transition-transform border-0">
            <Link href="/order" className="flex items-center justify-center whitespace-nowrap">
              無料で相談・お見積り <ArrowRight className="w-5 h-5 ml-2 shrink-0" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
