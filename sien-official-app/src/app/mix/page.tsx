import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { PlanCard } from "@/components/ui/PlanCard";
import { BeforeAfterPlayer } from "@/components/ui/BeforeAfterPlayer";
import { CheckCircle2, Sliders, Headphones, Sparkles, Clock, ArrowRight, HelpCircle, Play } from "lucide-react";
import { FeaturedWorksList } from "@/components/works/FeaturedWorksList";

export const metadata = {
  title: "歌ってみたMIX依頼 | Sien-Official",
  description: "あなたの歌声を最高の作品に仕上げます。ピッチ補正からマスタリングまで、プロクオリティの歌ってみたMIXをご提供します。",
};

// データの動的取得を強制（キャッシュ無効化）
export const dynamic = "force-dynamic";

export default async function MixPage() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true, category: "MIX" },
    orderBy: { orderIndex: 'asc' } // DB側で指定したorderIndexでソート
  });

  const options = await prisma.option.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: 'asc' }
  });

  const portfolios = await prisma.portfolio.findMany({
    where: { isPublished: true },
    orderBy: { orderIndex: 'asc' },
    take: 4
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* 1. 説明 (ファーストビュー) */}
      <section className="relative bg-white pt-24 pb-32 px-4 text-center overflow-hidden border-b border-slate-100 shadow-sm">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-orange-50/80 to-white opacity-90" />
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-5 blur-sm" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-sm font-bold shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
            </span>
            歌ってみたMIX
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 text-slate-900 tracking-tight leading-[1.2]">
            あなたの歌声を、<br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
              最高の作品
            </span>へ。
          </h1>
          <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-medium mb-10">
            ピッチ補正・タイミング補正からマスタリングまで。<br className="hidden md:block" />
            楽曲の魅力を最大限に引き出し、プロクオリティの音源に仕上げます。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild className="rounded-full h-14 px-10 text-lg font-bold bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-500/30 w-full sm:w-auto">
              <Link href="/order" className="flex items-center justify-center">
                無料で相談する <ArrowRight className="w-5 h-5 ml-2 shrink-0" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full h-14 px-10 text-lg font-bold bg-white text-slate-700 border-slate-200 hover:bg-slate-50 w-full sm:w-auto">
              <a href="#compare" className="flex items-center justify-center">
                Before / Afterを聴く
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. 比較 (Before/After) */}
      <section id="compare" className="py-24 px-4 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
              MIXでどれくらい変わる？
            </h2>
            <p className="text-slate-600 text-lg md:text-xl font-medium">
              MIX前の生データと、MIX・マスタリング後の完成音源を聴き比べてみてください。<br className="hidden md:block" />
              ピッチやリズムの正確さだけでなく、声の抜けやオケとの馴染み具合が劇的に変化します。
            </p>
          </div>
          
          <BeforeAfterPlayer />
        </div>
      </section>

      {/* 3. 実績 (Works) */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">制作実績</h2>
            <p className="text-slate-500">これまでに手掛けた作品の一部をご紹介します。</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portfolios.length > 0 ? portfolios.map((portfolio) => (
              <div key={portfolio.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="aspect-video relative w-full">
                  {portfolio.url && portfolio.url.includes("youtube.com/watch?v=") ? (
                    <iframe 
                      className="absolute inset-0 w-full h-full" 
                      src={`https://www.youtube.com/embed/${new URL(portfolio.url).searchParams.get("v")}`}
                      title={portfolio.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : portfolio.url && portfolio.url.includes("youtu.be/") ? (
                    <iframe 
                      className="absolute inset-0 w-full h-full" 
                      src={`https://www.youtube.com/embed/${portfolio.url.split("youtu.be/")[1]?.split("?")[0]}`}
                      title={portfolio.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                      <Play className="w-12 h-12 text-slate-300" fill="currentColor" />
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col text-left">
                  <h3 className="text-base font-bold text-slate-800 mb-2 leading-tight line-clamp-2">{portfolio.title}</h3>
                  <div className="mt-auto pt-4">
                    <span className="inline-block bg-orange-50 text-orange-600 text-[11px] px-3 py-1 rounded-full font-bold border border-orange-100">
                      {portfolio.serviceCategory || "ボーカルMIX"}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              // フォールバックダミー
              [1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="aspect-video relative w-full bg-slate-100 flex items-center justify-center">
                    <Play className="w-12 h-12 text-slate-300" fill="currentColor" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col text-left">
                    <h3 className="text-base font-bold text-slate-800 mb-2 leading-tight">【歌ってみた】サンプル実績 {item}</h3>
                    <div className="mt-auto pt-4">
                      <span className="inline-block bg-orange-50 text-orange-600 text-[11px] px-3 py-1 rounded-full font-bold border border-orange-100">ボーカルMIX</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" className="rounded-full px-10 h-14 border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-colors font-bold text-lg">
              <Link href="/works" className="flex items-center justify-center whitespace-nowrap">
                すべての実績を見る <ArrowRight className="w-5 h-5 ml-2 shrink-0" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 4. 選ばれる理由 */}
      <section className="py-24 bg-slate-50 border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">選ばれる3つの理由</h2>
            <div className="w-16 h-1 bg-orange-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Sliders, title: "1音1音の丁寧な手作業", desc: "自動補正ツールに頼らず、手作業でピッチとタイミングを細かく補正。歌のニュアンスや感情を壊さずに整えます。" },
              { icon: Sparkles, title: "ジャンルに合わせた音作り", desc: "ロックなら力強く、バラードなら艶やかに。楽曲のジャンルやあなたの声質に合わせた最適なエフェクト処理を行います。" },
              { icon: Clock, title: "迅速かつ柔軟な対応", desc: "納期厳守はもちろん、修正にも柔軟に対応。「もう少しエコーを減らしたい」などのご要望にも追加料金なし（規定回数内）で応じます。" }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full group-hover:bg-orange-100 transition-colors z-0"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 text-orange-600">
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 料金プラン */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">料金プラン</h2>
            <p className="text-slate-500">ご希望のサポート範囲に合わせてお選びください。</p>
          </div>
          
          {plans.length === 0 ? (
            <p className="text-center text-slate-500">現在公開されているプランはありません。</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  isRecommended={plan.name.includes("スタンダード")} 
                  recommendedText={plan.name.includes("スタンダード") ? "★ 一番人気" : undefined} 
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. オプション */}
      <section className="py-24 bg-slate-50 border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">オプション</h2>
            <p className="text-slate-500">基本プランに追加できるオプションサービスです。</p>
          </div>
          
          {options.length === 0 ? (
            <p className="text-center text-slate-500">現在公開されているオプションはありません。</p>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {options.filter(o => o.category === "MIX").map((opt) => (
                  <div key={opt.id} className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{opt.name}</h3>
                      {opt.description && (
                        <p className="text-slate-500 text-sm mt-1 whitespace-pre-wrap leading-relaxed">{opt.description}</p>
                      )}
                    </div>
                    <div className="text-xl font-bold text-orange-600 whitespace-nowrap bg-orange-50 px-4 py-2 rounded-lg text-center shrink-0">
                      {opt.priceText.includes("円") && !opt.priceText.startsWith("+") && opt.priceText !== "無料" ? `+ ${opt.priceText}` : opt.priceText}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 7. 準備物 */}
      <section className="py-24 bg-slate-50 border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-orange-50 rounded-[2.5rem] p-8 md:p-12 text-slate-900 relative overflow-hidden shadow-sm border border-orange-100">
            {/* 装飾 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/60 rounded-bl-[150px] blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/40 rounded-tr-[150px] blur-2xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3 text-slate-900">
                <CheckCircle2 className="w-8 h-8 text-orange-500" />
                ご依頼前にご準備いただくもの
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-xl font-bold text-orange-500 mb-3 font-mono">01.</div>
                  <h3 className="font-bold text-lg mb-2 text-slate-800">ボーカルデータ (WAV推奨)</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    頭出し（曲の開始位置から録音開始）されたデータをご用意ください。エフェクト（リバーブ等）は掛けずに書き出してください。
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-xl font-bold text-orange-500 mb-3 font-mono">02.</div>
                  <h3 className="font-bold text-lg mb-2 text-slate-800">インスト音源</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    歌ってみた本家様などが配布している公式のカラオケ音源をご用意ください（キー変更している場合は変更済みのもの）。
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sm:col-span-2 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="shrink-0 min-w-[200px]">
                    <div className="text-xl font-bold text-orange-500 mb-3 font-mono">03.</div>
                    <h3 className="font-bold text-lg mb-2 text-slate-800">参考音源・ご要望（任意）</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    「本家のような雰囲気にしたい」「ここのエコーは強めにかけてほしい」など、具体的なイメージがあればお伝えください。
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sm:col-span-2 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="shrink-0 min-w-[200px]">
                    <div className="text-xl font-bold text-orange-500 mb-3 font-mono">04.</div>
                    <h3 className="font-bold text-lg mb-2 text-slate-800">ハモリデータ（任意）</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    コーラスやハモリのデータがあればご用意ください。ご自身で録音が難しい場合は、こちらで生成することも可能です。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ご依頼の流れ */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-16">ご依頼の流れ</h2>
          
          <div className="grid md:grid-cols-5 gap-4 relative">
            {/* PC向け繋ぎ線 */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-orange-100 z-0"></div>
            
            {[
              { step: "01", title: "お問い合わせ", desc: "フォームより、楽曲データやご要望をお送りください。" },
              { step: "02", title: "お見積り", desc: "いただいた内容を確認し、お見積りと納期をご連絡します。" },
              { step: "03", title: "お支払い", desc: "お見積りにご納得いただけましたら、お支払いをお願いします。" },
              { step: "04", title: "制作・ご確認", desc: "ご入金確認後に作業を開始。完了後、仕上がりをご確認いただき必要に応じて修正を行います。" },
              { step: "05", title: "納品", desc: "すべての修正が完了し、ご納得いただけた完成データをお届けします。" }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-full border-4 border-orange-50 shadow-lg flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-1.5 rounded-full border-2 border-dashed border-orange-200"></div>
                  <span className="text-xl font-black text-orange-600">{item.step}</span>
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed px-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQ (よくあるご質問) */}
      <section id="faq" className="py-24 bg-white border-b border-slate-100 scroll-mt-16">
        <div className="container px-4 mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-2">
              <HelpCircle className="w-8 h-8 text-orange-500" />
              よくあるご質問
            </h2>
            <div className="w-16 h-1 bg-orange-500 mx-auto rounded-full" />
          </div>
          
          <div className="space-y-4">
            {[
              { q: "初めての依頼でも大丈夫ですか？", a: "もちろん大丈夫です！必要なデータや提出方法についても丁寧にご案内いたしますので、歌ってみたの投稿が初めての方でも安心してご依頼いただけます。" },
              { q: "スマホ録音など、録音環境に自信がないのですが大丈夫ですか？", a: "もちろん可能です！録音環境に応じてノイズ除去などの処理を行い、できる限り自然で聴きやすい音源に仕上げます。ただし、音割れや極端な環境ノイズが含まれる場合は、録り直しをご相談させていただく場合がございます。" },
              { q: "頭出しとは何ですか？", a: "オケ（インスト）の再生開始地点と、ボーカル録音の開始地点をピッタリ合わせることです。これがズレていると曲と歌が合わなくなってしまいます。" },
              { q: "キー変更した音源でも依頼できますか？", a: "はい、可能です。キー変更済みのインスト音源をご提出ください。ご不明な場合は、お気軽にご相談ください。" },
              { q: "コラボ（複数人）のMIXも依頼できますか？", a: "はい、対応可能です。人数やトラック数によって料金や納期が変動する場合がございますので、事前にご相談ください。" },
              { q: "納期の短縮は可能ですか？", a: "スケジュール状況によっては短納期対応が可能です。お急ぎの場合は、ご依頼前にご相談ください。" },
              { q: "修正は何回まで可能ですか？どのような内容に対応していますか？", a: "各プラン共通で5回まで無料で対応いたします。「もう少し明るい雰囲気にしたい」「エコーを控えめにしたい」などの仕上がりに関するご要望に対応しております。ただし、大幅な録り直しや追加収録による再編集など、作業内容によっては、6回目以降の修正について追加料金をご相談させていただく場合がございます。" },
              { q: "支払いのタイミングはいつですか？", a: "お見積り内容にご納得いただけましたら、お支払いをお願いしております。ご入金確認後、制作を開始いたします。" },
              { q: "ハモリデータの扱いはどうなりますか？", a: "ハモリ生成は基本プラン内で対応可能です。ご自身で録音されたハモリデータをご提出いただくことも可能ですが、全体のバランスや仕上がりを考慮し、ご提出いただいたハモリデータではなく、こちらで生成したハモリをご提案させていただく場合がございます。" },
              { q: "完成した作品を公開する際、クレジット表記は必要ですか？", a: "必須ではございませんが、【MIX：しえん (https://x.com/sien_mc09)】と記載していただけますと大変嬉しいです。X（旧Twitter）でメンションいただけましたら、引用ポストにてご紹介させていただきます。" }
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-orange-200 transition-colors">
                <h3 className="font-bold text-slate-800 flex gap-3 mb-3">
                  <span className="text-orange-600">Q.</span>
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

      {/* 11. 問い合わせ (CTA) */}
      <section className="py-24 bg-orange-600 relative overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-700 to-amber-500"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-10 blur-sm"></div>
        
        <div className="container px-4 mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
            あなたの歌声を、<br className="md:hidden" />最高の形に仕上げます。
          </h2>
          <p className="text-orange-50 mb-10 max-w-2xl mx-auto text-lg">
            「依頼が初めてで不安」「どのプランがいいかわからない」という方も、<br/>
            まずはお気軽にご相談ください。
          </p>
          <Button asChild variant="outline" className="rounded-full h-16 text-lg font-bold shadow-2xl bg-white text-orange-600 hover:bg-orange-50 border-0 hover:scale-105 transition-transform">
            <Link href="/order" className="flex items-center justify-center px-12 whitespace-nowrap">
              無料で依頼・相談する <ArrowRight className="w-5 h-5 ml-2 shrink-0" />
            </Link>
          </Button>
          <p className="text-orange-100 text-sm mt-6 font-medium">
            ※ご依頼前に「ご依頼に関する留意事項」をご確認ください。
          </p>
        </div>
      </section>

    </div>
  );
}
