import { formatPublicDate } from "@/lib/public-format";
import { pageMetadata } from "@/lib/page-metadata";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ChevronsDown } from "lucide-react";
import { HeroVideoPlayer } from "@/components/ui/HeroVideoPlayer";
import { FeaturedWorksList } from "@/components/works/FeaturedWorksList";
import { getPublicReception } from "@/lib/data/site-setting";
import { getFeaturedPortfolios, getNewsPosts } from "@/lib/data/cms";
import { PublicServices } from "@/components/shared/PublicServices";
import { PublicCampaigns } from "@/components/shared/PublicCampaigns";

export const metadata = pageMetadata("/", {title: "Sien-Official | 歌ってみたMIX・オリジナル楽曲制作"});

export const revalidate = 60;

export default async function Home() {
  const [mixPortfolios, originalPortfolios, siteSetting, newsPosts] = await Promise.all([
    getFeaturedPortfolios("MIX", 4),
    getFeaturedPortfolios("ORIGINAL", 3),
    getPublicReception(),
    getNewsPosts(3)
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">

      {/* 1. ヒーローセクション（ファーストビュー） */}
      {/* 画面いっぱいに広がるよう、上部のヘッダー(h-16=4rem)の分を引いて「ちょうど画面にピッタリ」収まるサイズに計算 */}
      <section className="relative w-full md:min-h-[calc(100svh-4rem)] flex items-center justify-center overflow-hidden bg-white border-b border-orange-100">

        {/* 背景動画 */}
        <div className="absolute inset-0 opacity-100">
          <HeroVideoPlayer src="/Video%20Project%201.webm" />
        </div>

        {/* 透明感のある白っぽいフィルター（爽やかさ重視） */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] pointer-events-none"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>

        <div className="relative z-10 container px-4 pt-10 pb-12 md:pt-24 md:pb-32 mx-auto text-center flex flex-col items-center md:min-h-[calc(100svh-8rem)] justify-center">
          {/* 受付バッジ */}
          <div className={`mb-5 md:mb-8 inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-white/90 backdrop-blur-md shadow-sm border font-bold text-xs sm:text-sm tracking-wide transition-all ${
            siteSetting.orderStatus === "AVAILABLE"
              ? "border-emerald-200 text-emerald-600"
              : siteSetting.orderStatus === "BUSY"
              ? "border-amber-200 text-amber-800"
              : "border-red-200 text-red-600"
          }`}>
            {siteSetting.orderStatus === "AVAILABLE" ? (
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="animate-ping [animation-iteration-count:3] absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500"></span>
              </span>
            ) : siteSetting.orderStatus === "BUSY" ? (
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="animate-ping [animation-iteration-count:3] absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-amber-500"></span>
              </span>
            ) : (
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-500"></span>
              </span>
            )}
            {siteSetting.orderStatus === "UNAVAILABLE" ? "お知らせ：" : "受付状況："} {siteSetting.announcement || (siteSetting.orderStatus === "AVAILABLE" ? "受付中" : siteSetting.orderStatus === "BUSY" ? "混雑中（納期要相談）" : "現在満枠のため受付を停止しております")}
          </div>

          <h1 className="text-2xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-4 sm:mb-8 leading-snug sm:leading-[1.3] md:leading-[1.2] drop-shadow-xl px-4 sm:px-0">
            あなたの歌声を、<br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500 drop-shadow-md inline-block mt-1 md:mt-0">
              “一番輝く形”へ
            </span>
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-slate-800 mb-8 md:mb-10 max-w-3xl font-medium sm:font-bold leading-relaxed drop-shadow-sm px-0 sm:px-2">
            ボーカルMIXから、あなただけの完全オリジナル楽曲制作まで。<br />
            「あなたらしさ」を活かしたプロクオリティの音源を提案します。
          </p>

          <div className="flex flex-col items-center gap-4 w-full sm:w-auto px-6 sm:px-0">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Button asChild className="rounded-full h-12 sm:h-16 px-6 sm:px-10 text-sm sm:text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-xl shadow-orange-500/20 w-full sm:w-auto hover:scale-105 transition-transform border-none text-white">
                <Link href="/order?intent=CONSULTATION" className="flex items-center justify-center">
                  無料で相談・お見積もり <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 shrink-0" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full h-12 sm:h-16 px-6 sm:px-10 text-sm sm:text-lg font-bold bg-white/90 backdrop-blur-md text-slate-800 border-white/50 hover:bg-white shadow-lg w-full sm:w-auto hover:scale-105 transition-all">
                <Link href="/pricing" className="flex items-center justify-center">
                  料金・プランを見る
                </Link>
              </Button>
            </div>
            <p className="text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 drop-shadow-md text-slate-800 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-700" /> お見積り・ご相談だけでも無料です
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-20 motion-safe:animate-bounce">
          <span className="text-orange-700 text-xs font-extrabold tracking-widest uppercase mb-2 drop-shadow-sm">Scroll</span>
          <ChevronsDown className="h-6 w-6 text-orange-600 drop-shadow-sm" aria-hidden="true" />
        </div>
      </section>
      <PublicCampaigns />

      {/* 1.1. 新プラン告知バナー */}
      <section className="py-6 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
        <div className="container px-4 mx-auto max-w-lg">
          <div className="grid gap-4">
            {/* 新プランバナー */}
            <Link href="/mix#plans" className="group block relative overflow-hidden bg-white rounded-2xl shadow-sm border border-orange-200 hover:shadow-md hover:border-orange-300 transition-all p-1 sm:p-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 relative z-10">
                <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">

                  <div>
                    <div className="text-orange-700 font-bold text-xs mb-1">毎日投稿・継続活動を応援！</div>
                    <h3 className="text-slate-900 font-extrabold text-base">ショートMIX <span className="text-orange-700">まとめ依頼</span></h3>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-orange-700 group-hover:translate-x-1 transition-transform shrink-0">
                  詳細 <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 1.2. お知らせ (NEWS) */}
      {newsPosts.length > 0 && (
        <section className="py-8 md:py-12 bg-white border-b border-orange-100">
          <div className="container px-4 mx-auto max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-6 bg-orange-500 rounded-full inline-block"></span>
                お知らせ
              </h2>
              <Link href="/news" className="text-sm font-bold text-orange-700 hover:text-orange-700 flex items-center gap-1 transition-colors">
                すべて見る <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {newsPosts.map((post) => (
                <Link key={post.id} href={`/news/${post.id}`} className="group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 py-4 px-5 rounded-2xl hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-100">
                  <div className="flex items-center gap-3 shrink-0">
                    <time className="text-sm font-bold text-slate-500 font-mono tracking-tight">
                      {formatPublicDate(post.createdAt)}
                    </time>
                    {post.category && (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        post.category.includes("SALE") || post.category.includes("サマーセール") || post.category.includes("キャンペーン")
                          ? "bg-red-50 text-red-600 border-red-200 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse [animation-iteration-count:2]"
                          : post.category.includes("NEW") || post.category.includes("新プラン")
                          ? "bg-orange-50 text-orange-700 border-orange-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {post.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-slate-800 font-bold sm:text-base group-hover:text-orange-700 transition-colors line-clamp-1 flex-1">
                    {post.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 1.5. こんな方に最適 */}
      <section className="py-10 md:py-16 bg-white border-b border-orange-100">
        <div className="container px-4 mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6 md:mb-10 text-center flex items-center justify-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-orange-700" />
            こんなお悩み、ありませんか？
          </h2>
          <div className="grid sm:grid-cols-3 gap-3 sm:gap-6">
            {[
              { title: "MIX依頼が初めて", desc: "必要なデータや手順から丁寧にサポート。初心者の方でも安心してお任せいただけます。" },
              { title: "スマホ録音をプロ級に", desc: "ノイズ除去からピッチ補正まで、スマホのマイク音源でもオケに馴染む高クオリティに仕上げます。" },
              { title: "自分だけの曲が欲しい", desc: "歌ってみたの次のステップへ。あなたの声質や世界観にピッタリの完全オリジナル曲を制作します。" }
            ].map((item, i) => (
              <div key={i} className="bg-orange-50/50 rounded-2xl p-4 sm:p-6 border border-orange-100 hover:border-orange-300 transition-colors">
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. サービス内容 */}
      <div id="services" className="scroll-mt-24 bg-orange-50/50 border-b border-orange-100"><PublicServices /></div>

      {/* 3. 実績セクション */}
      <section className="py-12 md:py-24 bg-white border-b border-orange-100">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="text-center mb-6 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">制作実績</h2>
            <p className="text-slate-500">これまでに手掛けた作品の一部をご紹介します。</p>
          </div>

          <FeaturedWorksList
            mixPortfolios={mixPortfolios}
            originalPortfolios={originalPortfolios}
          />

          <div className="text-center mt-6 md:mt-12">
            <Button asChild variant="outline" className="rounded-full px-10 h-14 border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-700 hover:bg-orange-50 transition-colors font-bold text-lg">
              <Link href="/works" className="flex items-center justify-center whitespace-nowrap">
                すべての実績を見る <ArrowRight className="w-5 h-5 ml-2 shrink-0" />
              </Link>
            </Button>
          </div>
        </div>
      </section>


      {/* 5. ご依頼の流れ */}
      <section className="py-12 md:py-24 bg-orange-50/30 border-b border-slate-100">
        <div className="container px-4 mx-auto max-w-5xl">
          <div className="text-center mb-6 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">ご依頼の流れ</h2>
            <p className="text-slate-500">初めての方でも安心。お問い合わせから納品までのステップをご案内します。</p>
          </div>

          <div className="grid md:grid-cols-4 gap-3 md:gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-[2px] bg-orange-100 z-0"></div>

            {[
              { step: "01", title: "お問い合わせ", desc: "フォームよりお見積り・ご相談ください。プランのご相談だけでも歓迎です。" },
              { step: "02", title: "データ提出・お支払い", desc: "正式見積に合意した後、必要なデータの提出とお支払いをお願いいたします。" },
              { step: "03", title: "MIX・マスタリング", desc: "お預かりしたデータを丁寧にエディットし、プロクオリティに仕上げます。" },
              { step: "04", title: "ご確認・納品", desc: "完成した音源をご確認いただきます。選択したプランの規定回数内で無料修正に対応いたします。" },
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex items-start gap-4 text-left md:flex-col md:items-center md:text-center group bg-white md:bg-transparent p-4 md:p-0 rounded-2xl border border-slate-200 md:border-none">
                <div className="w-10 h-10 shrink-0 md:w-16 md:h-16 rounded-full bg-white border-2 border-orange-200 flex items-center justify-center md:mb-6 shadow-sm group-hover:border-orange-500 group-hover:scale-110 transition-all duration-300">
                  <span className="text-lg font-black text-orange-700">{item.step}</span>
                </div>
                <div><h3 className="text-base md:text-lg font-bold text-slate-900 mb-1 md:mb-3">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 最終CTA */}
      <section className="py-12 md:py-24 bg-gradient-to-br from-orange-50 to-amber-50 relative overflow-hidden">
        <div className="container px-4 mx-auto text-center relative z-10 border border-orange-200/50 bg-white/70 backdrop-blur-md rounded-3xl md:rounded-[3rem] p-5 md:p-20 shadow-xl shadow-orange-500/5 max-w-4xl">
          <p className="text-orange-700 text-xs md:text-sm font-bold tracking-widest uppercase mb-3 md:mb-4">Get Started</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold text-slate-900 mb-6 md:mb-8 leading-snug">
            最高の作品を、<br className="md:hidden" />一緒に作りましょう。
          </h2>
          <div className="text-slate-600 mb-8 md:mb-10 max-w-xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed font-bold bg-white/60 backdrop-blur-sm p-5 md:p-6 rounded-2xl border border-orange-100">
            <p className="mb-4">
              「初めてのMIX依頼で不安」<br />
              「どのプランを選べばいいかわからない」
            </p>
            <p className="text-orange-700">
              そんな方も、まずはお気軽にご相談ください。<br />
              お見積り・ご相談は無料です。
            </p>
          </div>
          <Button asChild className="rounded-full min-h-12 h-auto py-3 md:min-h-16 px-5 md:px-12 text-base md:text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/20 hover:scale-105 transition-transform border-0 max-w-full">
            <Link href="/order?intent=CONSULTATION&service=MIX" className="flex items-center justify-center whitespace-normal">
              無料で相談・お見積り <ArrowRight className="w-5 h-5 ml-2 shrink-0" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
