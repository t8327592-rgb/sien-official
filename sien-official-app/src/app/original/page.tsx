import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { PlanCard } from "@/components/ui/PlanCard";
import { ArrowRight, CheckCircle2, Music, ListMusic, ListChecks, HelpCircle, PenTool, Mic2 } from "lucide-react";

export const metadata = {
  title: "オリジナル楽曲制作 | Sien-Official",
  description: "あなただけの完全オリジナル楽曲をプロのクオリティで制作します。作詞・作曲・編曲からMIXまで、VTuber・歌い手のための活動の顔になる1曲をご提供。",
};

export const dynamic = "force-dynamic";

export default async function OriginalPage() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true, category: "ORIGINAL" },
    orderBy: { orderIndex: 'asc' } // DB側で指定したorderIndexでソート
  });

  const options = await prisma.option.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: 'asc' }
  });

  const portfolios = await prisma.portfolio.findMany({
    where: { serviceCategory: "ORIGINAL" },
    orderBy: { createdAt: 'desc' },
    take: 2,
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* 1. ファーストビュー */}
      <section className="relative bg-white pt-24 pb-32 px-4 text-center overflow-hidden border-b border-slate-100 shadow-sm">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-amber-50/80 to-white opacity-90" />
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-5 blur-sm" />
        
        <div className="relative z-10 max-w-[1200px] px-4 mx-auto w-full">
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-sm font-bold shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            オリジナル楽曲制作
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-8 text-slate-900 tracking-tight leading-[1.4]">
            作曲・編曲・MIX・Masteringまで<br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
              一括対応。
            </span>
          </h1>
          <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-medium mb-10">
            ボーカルMIXで培った「歌を引き立てる音作り」のノウハウを活かし、<br className="hidden md:block" />
            VTuber・歌い手・配信者の活動を支える「活動の顔になる1曲」を形にします。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild className="rounded-full h-14 px-10 text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-500/30 w-full sm:w-auto">
              <Link href="/order" className="flex items-center justify-center">
                無料で相談する <ArrowRight className="w-5 h-5 ml-2 shrink-0" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full h-14 px-10 text-lg font-bold bg-white text-slate-700 border-slate-200 hover:bg-slate-50 w-full sm:w-auto">
              <a href="#works" className="flex items-center justify-center">
                実績を見る
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. 実績 (Works) */}
      <section id="works" className="py-24 bg-slate-50 border-b border-slate-100 text-slate-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">制作実績</h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full mb-6" />
            <p className="text-slate-500">これまでに手掛けたオリジナル楽曲の一部をご紹介します。</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* 実績 1 */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="aspect-video relative w-full">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/zTxvMNXaFoA" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">【誕生日MV】ハッピーエンドクリエイター！ - 草刈七海【オリジナル曲】</h3>
                <div className="mt-auto pt-4 flex flex-col items-start gap-2">
                  <span className="text-xs text-slate-500 font-bold">担当：作曲・編曲</span>
                  <span className="inline-block bg-amber-50 text-amber-600 text-xs px-3 py-1 rounded-full font-medium border border-amber-100">オリジナル楽曲制作</span>
                </div>
              </div>
            </div>

            {/* 実績 2 */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="aspect-video relative w-full">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/Rc531IszCes" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">【ボカデュオ2024】夜明けのアステロイド / YOFUKASHI 【オリジナル】</h3>
                <div className="mt-auto pt-4 flex flex-col items-start gap-2">
                  <span className="text-xs text-slate-500 font-bold">担当：作曲・編曲</span>
                  <span className="inline-block bg-amber-50 text-amber-600 text-xs px-3 py-1 rounded-full font-medium border border-amber-100">オリジナル楽曲制作</span>
                </div>
              </div>
            </div>

            {/* 実績 3 */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="aspect-video relative w-full">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/Ke1HAX8Z49I" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">週末を待て。『SODA』Music Video</h3>
                <div className="mt-auto pt-4 flex flex-col items-start gap-2">
                  <span className="text-xs text-slate-500 font-bold">担当：編曲・MIX・Mastering</span>
                  <span className="inline-block bg-amber-50 text-amber-600 text-xs px-3 py-1 rounded-full font-medium border border-amber-100">オリジナル楽曲制作</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. こんな方におすすめ */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-amber-50 rounded-[2.5rem] p-8 md:p-12 border border-amber-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/60 rounded-bl-[150px] -z-0"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center flex items-center justify-center gap-3">
                <ListChecks className="w-8 h-8 text-amber-500" />
                こんな方におすすめです
              </h2>
              
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <ul className="space-y-4">
                  {[
                    "周年記念のオリジナル曲を作りたい",
                    "活動のテーマソングが欲しい",
                    "ライブで披露する楽曲が欲しい",
                    "初めてなので相談しながら進めたい",
                    "イメージはあるけど言語化できない"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-slate-700 font-medium md:text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 制作できるもの */}
      <section className="py-24 bg-slate-50 border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">対応内容</h2>
          <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full mb-12" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: "作詞", icon: PenTool },
              { title: "作曲", icon: Music },
              { title: "編曲", icon: ListMusic },
              { title: "仮歌制作", icon: Mic2 },
              { title: "ボーカルMIX", icon: CheckCircle2 },
              { title: "Mastering", icon: CheckCircle2 },
              { title: "パラデータ納品", icon: CheckCircle2 },
              { title: "インスト納品", icon: CheckCircle2 },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3">
                <item.icon className="w-8 h-8 text-amber-500" />
                <span className="font-bold text-slate-800">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 制作の流れ */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">制作の流れ</h2>
            <p className="text-slate-500">ご依頼から完成までのステップをご案内します。</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {[
              { step: "01", title: "ヒアリング", desc: "作りたい楽曲のイメージや参考曲、用途についてお伺いします。" },
              { step: "02", title: "お見積もり・ご契約", desc: "決定した内容に基づき、正式なお見積もりをご提示・ご契約となります。" },
              { step: "03", title: "お支払い", desc: "指定のお支払い方法にて料金をお支払いいただきます。" },
              { step: "04", title: "ワンコーラス制作", desc: "まずはワンコーラスをご確認いただき、方向性に問題がないかチェックしていただきます。" },
              { step: "05", title: "方向性のご確認", desc: "制作したワンコーラスをもとに、楽曲のコアとなる方向性をすり合わせます。" },
              { step: "06", title: "フル尺制作", desc: "ワンコーラスでOKをいただいた後、フルコーラスの制作に進みます。" },
              { step: "07", title: "ボーカルレコーディング", desc: "ご自身（またはご手配のスタジオ）にて、ボーカルの収録を行っていただきます。" },
              { step: "08", title: "MIX・Mastering", desc: "収録いただいたボーカルデータと合わせて、全体のバランスを調整します。" },
              { step: "09", title: "納品", desc: "完成した音源データ（WAV/MP3/インスト等）を納品いたします。" },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm relative flex flex-col items-center text-center hover:border-amber-200 transition-colors">
                <div className="w-16 h-16 rounded-full bg-white border-4 border-amber-50 shadow-md flex items-center justify-center mb-4">
                  <span className="text-xl font-black text-amber-600">{item.step}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                
                {/* 矢印アイコン（各行の終わりと最後の要素以外で右側に表示） */}
                {i !== 8 && i !== 2 && i !== 5 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                )}
                {/* スマホ/タブレット用の下矢印 */}
                {i !== 8 && (
                  <div className="block lg:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 z-10 text-slate-300 bg-white rounded-full p-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 料金プラン */}
      <section className="py-24 bg-slate-50 border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">料金プラン</h2>
            <p className="text-slate-500">ご希望のサポート範囲に合わせてお選びください。</p>
          </div>
          
          {plans.length === 0 ? (
            <p className="text-center text-slate-500">現在公開されているプランはありません。</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.map((plan) => {
                let recommendedUsers: string[] = [];
                if (plan.name.includes("フルパッケージ") || plan.name.includes("スタンダード")) {
                  recommendedUsers = ["初めてオリジナル楽曲を作る方", "歌詞から相談したい方"];
                } else if (plan.name.includes("作詞持ち込み")) {
                  recommendedUsers = ["歌詞は完成している方", "費用を抑えたい方"];
                }
                
                return (
                  <PlanCard 
                    key={plan.id} 
                    plan={plan} 
                    isRecommended={plan.name.includes("フルパッケージ") || plan.name.includes("スタンダード")} 
                    recommendedText="★ 一番人気"
                    themeColor="cyan"
                    recommendedUsers={recommendedUsers.length > 0 ? recommendedUsers : undefined}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 7. オプション */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">オプション</h2>
            <p className="text-slate-500">基本プランに追加できるオプションサービスです。</p>
          </div>
          
          {options.length === 0 ? (
            <p className="text-center text-slate-500">現在公開されているオプションはありません。</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {options.filter(o => o.category === "ORIGINAL").map((opt) => (
                <div key={opt.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <h3 className="font-bold text-slate-800 leading-tight">{opt.name}</h3>
                    <div className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg shrink-0">
                      {opt.priceText.includes("円") && !opt.priceText.startsWith("+") && opt.priceText !== "要相談" && opt.priceText !== "無料" ? `+ ${opt.priceText}` : opt.priceText}
                    </div>
                  </div>
                  {opt.description && (
                    <div className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap mt-auto">
                      {opt.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 8. FAQ (よくあるご質問) */}
      <section id="faq" className="py-24 bg-slate-50 border-b border-slate-100 scroll-mt-16">
        <div className="container px-4 mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-2">
              <HelpCircle className="w-8 h-8 text-amber-500" />
              よくあるご質問
            </h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full" />
          </div>
          
          <div className="space-y-4">
            {[
              { q: "修正は何回まで可能ですか？", a: "基本的にワンコーラス段階での方向性確認における修正は、納得いただけるまで対応いたします。フル尺制作移行後の大幅な仕様変更や、完成後のメロディ・歌詞の全面変更につきましては、別途ご相談させていただく場合がございます。" },
              { q: "商用利用は可能ですか？", a: "はい、可能です。YouTube投稿、ライブ利用、収益化、各種配信サービスでの配信（Apple MusicやSpotify等）やCD・グッズ等の販売にも問題なくご利用いただけます（追加料金はかかりません）。" },
              { q: "クレジット表記は必要ですか？", a: "はい、原則として動画の概要欄やSNSでの告知時にクレジット表記（作曲・編曲・MIX：しえん 等）をお願いしております。" },
              { q: "ボーカル収録は自分で行う必要がありますか？", a: "はい。基本的にはご自身（またはご手配のスタジオ）での収録をお願いしております。録音方法について不安な点があればサポートいたしますので、ご安心ください。" },
              { q: "完成後のキー変更は可能ですか？", a: "軽微な調整（ピッチシフト等）であれば対応可能です。ボーカルの再録音を伴うような大幅な変更やオケの再構築については、追加料金をご相談させていただく場合がございます。" },
              { q: "イメージが曖昧でも依頼できますか？", a: "はい、大丈夫です！「明るい感じ」「かっこいい感じ」といった抽象的な言葉や、参考になりそうな既存曲をいくつか教えていただければ、こちらでイメージを膨らませてご提案いたします。" },
              { q: "参考曲は必要ですか？", a: "必須ではありませんが、あるとよりスムーズにイメージを共有できます。もしあれば「この曲のBメロの雰囲気が好き」など、具体的なポイントと合わせて教えていただけると助かります。" },
              { q: "著作権はどうなりますか？", a: "制作した楽曲は、YouTube投稿・ライブ利用・収益化・各種配信サービスでの配信など、自由にご利用いただけます。なお、著作権（財産権）の譲渡は原則として行っておりません。完全買い取りをご希望の場合は、別途ご相談ください。" },
              { q: "納期はどれくらいですか？", a: "内容や現在のスケジュールにより変動しますが、目安納期：30日〜60日程度を見込んでおります。お急ぎの場合は別途ご相談ください。" },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-amber-100 transition-colors">
                <h3 className="font-bold text-slate-800 flex gap-3 mb-3">
                  <span className="text-amber-600">Q.</span>
                  {item.q}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed pl-7 border-l-2 border-slate-200">
                  <span className="text-slate-400 font-bold mr-2">A.</span>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. 問い合わせ (CTA) */}
      <section className="py-24 bg-amber-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-700 to-orange-500"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-10 blur-sm"></div>
        <div className="container px-4 mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">オリジナル楽曲の<br className="md:hidden" />ご相談・お見積もりは無料です。</h2>
          <p className="text-amber-50 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
            「こんな曲作れる？」「料金はどれくらいになる？」など、<br/>まずはお気軽にご相談ください。<br/><br/>
            <span className="font-bold bg-black/20 px-4 py-2 rounded-full inline-block backdrop-blur-sm">
              「まだ依頼するか決まっていない」という方も大歓迎です。
            </span>
          </p>
          <Button asChild variant="outline" className="rounded-full h-16 text-lg font-bold shadow-2xl bg-white text-amber-600 hover:bg-amber-50 border-0 hover:scale-105 transition-transform">
            <Link href="/order" className="flex items-center justify-center px-12 whitespace-nowrap">
              無料で相談する <ArrowRight className="w-5 h-5 ml-2 shrink-0" />
            </Link>
          </Button>
          <p className="text-amber-100 text-sm mt-6 font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> 24時間以内にご返信いたします
          </p>
        </div>
      </section>

    </div>
  );
}
