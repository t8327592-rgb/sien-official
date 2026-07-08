import Link from "next/link";
import { ArrowRight, Clock, AlertCircle, Sparkles, CheckCircle2, ShieldCheck, Headphones, HeartHandshake, Mic2, Star, PlayCircle, Users, Music } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import AudioComparison from "@/components/summer-sale/AudioComparison";
import ReviewCard from "@/components/summer-sale/ReviewCard";
import FaqAccordion from "@/components/summer-sale/FaqAccordion";

export const metadata = {
  title: "Summer MIX Sale 2026 | Sien-Official",
  description: "10日間限定！Sien-OfficialのサマーMIXセール開催中。スタンダードプランが一律2,000円OFF。",
};

export default function SummerSalePage() {
  const faqItems = [
    { question: "初めての依頼でも大丈夫ですか？", answer: "もちろん大丈夫です！必要なデータや提出方法についても丁寧にご案内いたしますので、歌ってみたの投稿が初めての方でも安心してご依頼いただけます。" },
    { question: "スマホ録音など、録音環境に自信がないのですが大丈夫ですか？", answer: "もちろん可能です！録音環境に応じてノイズ除去などの処理を行い、できる限り自然で聴きやすい音源に仕上げます。ただし、音割れや極端な環境ノイズが含まれる場合は、録り直しをご相談させていただく場合がございます。" },
    { question: "頭出しとは何ですか？", answer: "オケ（インスト）の再生開始地点と、ボーカル録音の開始地点をピッタリ合わせることです。これがズレていると曲と歌が合わなくなってしまいます。" },
    { question: "キー変更した音源でも依頼できますか？", answer: "はい、可能です。キー変更済みのインスト音源をご提出ください。ご不明な場合は、お気軽にご相談ください。" },
    { question: "コラボ（複数人）のMIXも依頼できますか？", answer: "申し訳ございません。本セールプランはソロ（1名）での歌ってみたのみ対象となります。コラボ（複数人）でのMIXをご希望の場合は、キャンペーン対象外となりますので、通常の「歌ってみたMIXプラン」よりお申し込みください。" },
    { question: "納期の短縮は可能ですか？", answer: "スケジュール状況によっては短納期対応が可能です。お急ぎの場合は、ご依頼前にご相談ください。" },
    { question: "修正は何回まで可能ですか？どのような内容に対応していますか？", answer: "セールプラン、通常プラン共通で5回まで無料で対応いたします。「もう少し明るい雰囲気にしたい」「エコーを控えめにしたい」などの仕上がりに関するご要望に対応しております。ただし、大幅な録り直しや追加収録による再編集など、作業内容によっては、6回目以降の修正について追加料金をご相談させていただく場合がございます。" },
    { question: "支払いのタイミングはいつですか？", answer: "お見積り内容にご納得いただけましたら、お支払いをお願いしております。ご入金確認後、制作を開始いたします。" },
    { question: "ハモリデータの扱いはどうなりますか？", answer: "ハモリ生成は基本プラン内で対応可能です。ご自身で録音されたハモリデータをご提出いただくことも可能ですが、全体のバランスや仕上がりを考慮し、ご提出いただいたハモリデータではなく、こちらで生成したハモリをご提案させていただく場合がございます。" },
    { question: "完成した作品を公開する際、クレジット表記は必要ですか？", answer: "必須ではございませんが、【MIX：しえん (https://x.com/sien_mc09)】と記載していただけますと大変嬉しいです。X（旧Twitter）でメンションいただけましたら、引用ポストにてご紹介させていただきます。" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-cyan-200 selection:text-cyan-900">
      
      {/* 1. ヒーローセクション */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px]"></div>
          <div className="absolute top-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 right-10 w-full max-w-2xl h-64 bg-gradient-to-t from-cyan-100/50 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 font-bold text-sm mb-8 animate-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4" />
            10日間限定の特別キャンペーン
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 animate-in slide-in-from-bottom-6 duration-700 delay-100 leading-tight">
            サマー<br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">MIXセール</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium animate-in slide-in-from-bottom-8 duration-700 delay-200 leading-relaxed px-2">
            この夏、最高の1曲を仕上げませんか？<br className="hidden md:block" />
            スタンダードプラン（フルコーラスMIX）がお得になる期間限定セールを開催します。
          </p>

          <div className="mb-12 animate-in slide-in-from-bottom-8 duration-700 delay-300">
            <CountdownTimer targetDate="2026-07-17T23:59:59+09:00" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link 
              href="/summer-sale/order" 
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full shadow-[0_8px_25px_-5px_rgba(6,182,212,0.4)] hover:shadow-[0_12px_30px_-5px_rgba(6,182,212,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              セール価格で申し込む <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. キャンペーン説明 & スケジュール */}
      <section id="details" className="py-12 md:py-20 relative z-10 -mt-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-6 sm:p-8 md:p-12 relative overflow-hidden mb-12">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-bl-full -z-10"></div>
            
            <h2 className="text-xl md:text-3xl font-bold text-slate-900 mb-6 text-center">
              なぜこの価格なの？
            </h2>
            <div className="max-w-2xl mx-auto text-center text-slate-600 leading-relaxed font-medium mb-8 md:mb-10 text-sm md:text-base">
              <p className="mb-4">日頃からSienのMIXをご愛顧いただいている皆様、そしてこれから「歌ってみた」を始めようとしている皆様へ、日頃の感謝を込めた期間限定の特別なキャンペーンです。</p>
              <p className="text-cyan-700 font-bold bg-cyan-50 py-3 px-6 rounded-xl inline-block mb-2">
                品質や作業内容は通常プランと一切変わりません。
              </p>
              <p className="text-xs text-slate-500 mt-2">※本セールはソロ（1名）でのご依頼に限ります。コラボ案件は対象外となります。</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 relative border-t border-slate-100 pt-8 md:pt-10">
              <div className="hidden md:block absolute left-1/2 top-10 bottom-0 w-px bg-slate-100 -translate-x-1/2"></div>
              <div className="text-center pb-6 md:pb-0 border-b md:border-0 border-slate-100">
                <div className="text-xs md:text-sm font-bold text-cyan-600 mb-2">お申し込み期間</div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tighter flex items-end justify-center">
                  7/8<span className="text-lg md:text-2xl text-slate-500 ml-1 mb-0.5">18:00</span><span className="text-lg md:text-2xl text-slate-500 mx-1 mb-0.5">〜</span>7/17
                </div>
                <div className="text-xs md:text-sm text-slate-500 mt-2 font-medium">※最終日の23:59まで受付</div>
              </div>
              <div className="text-center">
                <div className="text-xs md:text-sm font-bold text-slate-400 mb-2">音源提出 ＆ お支払い期限</div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-700 tracking-tighter flex items-end justify-center">
                  7/20<span className="text-sm md:text-base text-slate-500 ml-2 font-bold mb-1">(月) 23:59まで</span>
                </div>
                <div className="text-[10px] md:text-xs text-slate-500 mt-3 font-medium bg-slate-50 inline-block px-3 py-1.5 rounded-full border border-slate-100">
                  音源が未完成でも期間内のお申し込みで枠確保が可能！
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 料金プラン & 安心バッジ */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              セール料金
            </h2>
            <p className="text-slate-600 font-medium">
              対象：スタンダードプラン（フルコーラスMIX）
            </p>
          </div>

          <div className="bg-gradient-to-b from-cyan-500 to-blue-600 rounded-3xl p-1 md:p-2 border border-transparent shadow-2xl relative overflow-hidden text-white transform hover:-translate-y-1 transition-transform duration-300 max-w-2xl mx-auto mb-8 md:mb-10">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 md:p-12 text-center border border-white/20 relative z-10">
              <h3 className="text-xl md:text-3xl font-bold mb-4">サマーセール特別割引</h3>
              <p className="text-cyan-100 text-xs sm:text-sm md:text-base mb-6 md:mb-8 font-medium">ご新規様・リピーター様 問わず一律で割引いたします！</p>
              
              <div className="mb-6 flex flex-col items-center justify-center gap-2">
                <div className="text-cyan-200 font-medium text-sm md:text-lg">お見積り合計金額から</div>
                <div className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tight flex items-baseline justify-center">
                  <span className="text-2xl sm:text-3xl md:text-4xl mr-1">-</span>2,000<span className="text-xl sm:text-2xl md:text-3xl ml-1 md:ml-2 font-bold">円 OFF</span>
                </div>
              </div>
              <div className="bg-white text-cyan-600 text-[10px] sm:text-xs md:text-sm font-bold py-2 md:py-3 px-4 md:px-6 rounded-full inline-block mb-8 md:mb-10 shadow-lg text-center leading-tight">
                ※トラック数等で基本料金が変動した場合も確実に2,000円引きとなります。
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 text-left max-w-sm mx-auto">
                <div className="text-sm font-bold text-cyan-200 mb-3 border-b border-white/10 pb-2">プランに含まれる内容</div>
                <ul className="space-y-3 text-cyan-50 text-sm font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-cyan-300" /> フルコーラスMIX</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-cyan-300" /> ピッチ・タイミング補正</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-cyan-300" /> ハモり生成</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            <div className="bg-white border border-slate-200 px-3 md:px-4 py-2 rounded-full flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold text-slate-700 shadow-sm">
              <HeartHandshake className="w-4 h-4 text-pink-500" /> 初心者歓迎
            </div>
            <div className="bg-white border border-slate-200 px-3 md:px-4 py-2 rounded-full flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold text-slate-700 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-cyan-500" /> 修正対応5回無料
            </div>
            <div className="bg-white border border-slate-200 px-3 md:px-4 py-2 rounded-full flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold text-slate-700 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> お見積り無料
            </div>
          </div>
        </div>
      </section>

      {/* 4. Before/After 試聴（最重要） */}
      <section className="py-16 md:py-20 bg-white px-2 sm:px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-4">
              実際のMIXを聴いてみてください
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-medium px-4">
              SienのMIXであなたの歌声がどのように変わるか、ぜひその耳で確かめてください。
            </p>
          </div>

          <AudioComparison 
            title="DECO*27 - モニタリング Cover by Sien-Official"
            beforeSrc="/sample1_before.mp3" 
            afterSrc="/sample1_after.mp3" 
          />

          <div className="mt-16 text-center">
            <Link 
              href="/summer-sale/order" 
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-full shadow-[0_8px_25px_-5px_rgba(6,182,212,0.4)] hover:shadow-[0_12px_30px_-5px_rgba(6,182,212,0.5)] hover:-translate-y-1 transition-all"
            >
              セール価格で申し込む <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. 実績・数字 */}
      <section className="py-20 bg-cyan-50/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              確かな実績と信頼
            </h2>
            <p className="text-slate-600 font-medium">
              多くの方にご満足いただき、リピートでのご依頼も多数いただいております。
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white rounded-3xl p-5 md:p-6 text-center shadow-sm border border-slate-100">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Music className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="text-xs md:text-sm text-slate-500 font-bold mb-1">制作実績</div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">800<span className="text-sm md:text-lg text-slate-500 ml-1">曲+</span></div>
            </div>
            
            <div className="bg-white rounded-3xl p-5 md:p-6 text-center shadow-sm border border-slate-100">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <PlayCircle className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="text-xs md:text-sm text-slate-500 font-bold mb-1">総再生回数</div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">300<span className="text-sm md:text-lg text-slate-500 ml-1">万回+</span></div>
            </div>

            <div className="bg-white rounded-3xl p-5 md:p-6 text-center shadow-sm border border-slate-100">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Users className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="text-xs md:text-sm text-slate-500 font-bold mb-1">リピーター率</div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">75<span className="text-sm md:text-lg text-slate-500 ml-1">%</span></div>
            </div>

            <div className="bg-white rounded-3xl p-5 md:p-6 text-center shadow-sm border border-slate-100">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Star className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="text-xs md:text-sm text-slate-500 font-bold mb-1">顧客満足度</div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">4.9<span className="text-sm md:text-lg text-slate-500 ml-1">/5.0</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. お客様の声 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              お客様の声
            </h2>
            <p className="text-slate-600 font-medium">
              これまでにSienのMIXをご利用いただいた方々からの嬉しいお声です。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <ReviewCard 
              name="Y" 
              comment="初めての「歌ってみた」投稿で右も左も分かりませんでしたが、録音の段階から丁寧に教えていただき本当に助かりました。完成した音源を聴いたときは感動で鳥肌が立ちました！また絶対にお願いします！" 
            />
            <ReviewCard 
              name="K" 
              comment="いつもお世話になっています。ピッチ補正の自然さと、オケとの馴染ませ方が抜群に上手いです。こちらの「もう少しここをこうしたい」という抽象的なニュアンスも汲み取ってくれて、修正対応も非常に早いです。" 
            />
            <ReviewCard 
              name="M" 
              comment="想像以上のクオリティで仕上げていただきました！特にハモりの生成が素晴らしくて、自分の声なのにとても豪華に聞こえて嬉しいです。価格以上の価値があると思います。" 
            />
          </div>
        </div>
      </section>

      {/* 7. ご依頼の流れ */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              ご依頼の流れ
            </h2>
            <p className="text-slate-600 font-medium">
              お申し込みから納品までのステップをご紹介します。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { step: 1, title: "フォーム送信", desc: "専用フォームからお申し込みください。" },
              { step: 2, title: "お見積り", desc: "24時間以内に内容確認と概算をご連絡します。" },
              { step: 3, title: "お支払い", desc: "お支払い確認後、正式に枠を確保します。" },
              { step: 4, title: "MIX制作", desc: "音源提出後、丁寧にMIX作業を進めます。" },
              { step: 5, title: "修正対応", desc: "初稿をご確認いただき、ご要望に応じて修正します。" },
              { step: 6, title: "納品", desc: "完成した音源データをWAV等でお渡しします。" },
            ].map((item, i) => (
              <div key={i} className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 relative">
                <div className="text-cyan-200 font-black text-3xl md:text-4xl absolute top-4 right-4 opacity-30">0{item.step}</div>
                <h3 className="font-bold text-slate-900 text-base md:text-lg mb-2 relative z-10">{item.title}</h3>
                <p className="text-xs md:text-sm text-slate-500 font-medium relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. よくある質問 (FAQ) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              よくある質問
            </h2>
            <p className="text-slate-600 font-medium">
              ご依頼前によくいただくご質問をまとめました。
            </p>
          </div>

          <FaqAccordion items={faqItems} />

          <div className="mt-16 text-center">
            <Link 
              href="/summer-sale/order" 
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-full shadow-[0_8px_25px_-5px_rgba(6,182,212,0.4)] hover:shadow-[0_12px_30px_-5px_rgba(6,182,212,0.5)] hover:-translate-y-1 transition-all"
            >
              セール価格で申し込む <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 9. 制作者紹介 */}
      <section className="py-20 bg-cyan-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-black shadow-lg overflow-hidden border-2 border-white/50">
              <img src="/profile.jpg" alt="しえん" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold mb-1">しえん</h2>
            <p className="text-cyan-200 text-sm font-medium tracking-widest mb-6 uppercase">MIX Engineer / Composer</p>
            
            <p className="text-cyan-50 leading-relaxed max-w-lg mx-auto mb-8 font-medium">
              「一人ひとりの声の魅力を最大限に引き出すMIX」を心掛けています。<br/>
              ボカロからJ-POP、ロック、バラードまで幅広いジャンルに対応可能です。初めての方も、まずはお気軽にご相談ください！
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <a href="https://x.com/sien_mc09" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="X (Twitter)">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.youtube.com/@sien-official" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="YouTube">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 10. 注意事項 */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-10 flex items-center gap-3 justify-center">
            <AlertCircle className="w-6 h-6 text-slate-400" />
            キャンペーン概要・注意事項
          </h2>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed font-medium">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2 border-l-4 border-cyan-500 pl-3">お申し込み方法</h3>
              <p>本キャンペーンは専用ご依頼フォームからのご依頼のみ適用となります。<br/>
              ※X(Twitter)のDM等での直接依頼は通常料金となりますのでご注意ください。</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2 border-l-4 border-cyan-500 pl-3">対象プラン</h3>
              <p>キャンペーン対象は「スタンダードプラン（フルコーラスMIX）」のみです。<br/>
              ショートサイズやオリジナル楽曲制作など、その他のプランは対象外となります。</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2 border-l-4 border-cyan-500 pl-3">追加料金・納期について</h3>
              <p>・トラック数が極端に多い場合や、特殊なエフェクト加工が多数必要な場合などは、追加料金のご相談をさせていただく場合がございます。<br/>
              ・受付順に着手いたします。通常より多くのご依頼が予想されるため、納期は状況により前後する場合がございます。お急ぎの場合は事前にご相談ください。<br/>
              ・複数曲をご希望の場合は、管理の都合上、1曲ごとにフォームの送信をお願いいたします。</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight">
            最高の1曲を一緒に創りましょう。
          </h2>
          <p className="text-cyan-100 mb-10 max-w-xl mx-auto">
            10日間限定の特別なご案内です。<br/>
            専用のご依頼フォームからお申し込みください。
          </p>
          
          <Link 
            href="/summer-sale/order" 
            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold text-lg rounded-full shadow-[0_0_40px_-10px_rgba(6,182,212,0.8)] hover:scale-105 transition-transform"
          >
            セール価格で申し込む <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}
