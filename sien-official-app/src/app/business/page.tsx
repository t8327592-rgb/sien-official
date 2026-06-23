import { Metadata } from "next";
import { Building2, ShieldCheck, Clock, Headphones, Handshake, ArrowRight } from "lucide-react";
import { BusinessContactForm } from "@/components/business/BusinessContactForm";

export const metadata: Metadata = {
  title: "法人・企業様お問い合わせ | Sien-Official",
  description: "法人様・企業様向けのお問い合わせページです。ゲーム・アプリの公式楽曲制作、PR用音源、大規模なMIX・マスタリングのご相談を承ります。",
};

export default function BusinessContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* 1. ヒーローセクション */}
      <section className="bg-white pt-32 pb-24 px-4 text-center border-b border-slate-100 relative overflow-hidden">
        {/* 背景の装飾 */}
        <div className="absolute top-0 right-0 w-full max-w-2xl h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-100/50 via-transparent to-transparent opacity-80 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full max-w-2xl h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-50/50 via-transparent to-transparent opacity-80 pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold shadow-sm tracking-wide">
            <Building2 className="w-4 h-4 text-slate-500" />
            法人・企業様向けご案内
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-8 tracking-tight leading-[1.2]">
            音楽で、貴社のプロジェクトを<br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
              圧倒的に加速させる。
            </span>
          </h1>
          <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-medium max-w-3xl mx-auto mb-10">
            Sien-Officialでは、法人様・企業様からのご依頼を承っております。<br />
            ゲームやアプリの公式楽曲、PR・CM用音源から大規模なボーカルMIXまで、<br className="hidden md:block" />
            プロフェッショナルな品質と柔軟な対応でビジネスをサポートいたします。
          </p>
          
          <div className="flex justify-center">
            <a href="#contact-form" className="inline-flex items-center justify-center h-14 px-10 rounded-full bg-orange-600 text-white font-bold text-lg hover:bg-orange-500 transition-colors shadow-lg shadow-orange-500/20 hover:shadow-xl hover:-translate-y-0.5 duration-300">
              お問い合わせ・お見積りへ <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. 提供可能な業務 */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">対応可能な業務</h2>
            <div className="w-16 h-1 bg-slate-300 mx-auto rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Headphones className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">公式楽曲・オリジナル制作</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                ゲーム、アプリ、VTuber事務所様の公式楽曲などを完全オリジナルで制作。作詞・作曲からボーカルディレクションまでトータルプロデュース可能です。
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">企業PR・CM用音源制作</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                企業の魅力を伝えるPR動画やCM向けのBGM、ジングル制作。ブランドイメージに直結するハイクオリティな音源をご提供します。
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">歌ってみたMIX・マスタリング</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                所属VTuber様やアーティスト様の「歌ってみた」動画用MIXなど、単曲からのご依頼も法人窓口にて承っております。継続的なご契約やコンピ企画等もご相談可能です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Sien-Officialの強み */}
      <section className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
        {/* 背景の装飾 */}
        <div className="absolute bottom-0 left-0 w-full max-w-3xl h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-orange-50/80 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">企業様に選ばれる理由</h2>
            <div className="w-16 h-1 bg-orange-500 mx-auto rounded-full" />
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 bg-white p-8 rounded-[2rem] border border-orange-100/50 shadow-sm hover:shadow-md transition-shadow items-start relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 shrink-0 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 relative z-10">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3 text-slate-900">徹底した品質管理</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  妥協のない手作業でのピッチ・タイミング補正から、各配信プラットフォーム（YouTube, Apple Music等）の規格に合わせた最適なラウドネス調整（マスタリング）まで、商業レベルの品質を保証します。
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 bg-white p-8 rounded-[2rem] border border-orange-100/50 shadow-sm hover:shadow-md transition-shadow items-start relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 shrink-0 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 relative z-10">
                <Clock className="w-8 h-8" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3 text-slate-900">柔軟なスケジュールと納期厳守</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  タイトなスケジュールでの制作進行や、急な修正依頼にも柔軟に対応。プロジェクト全体の進行を妨げない、迅速かつ確実なレスポンスをお約束します。
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 bg-white p-8 rounded-[2rem] border border-orange-100/50 shadow-sm hover:shadow-md transition-shadow items-start relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 shrink-0 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 relative z-10">
                <Handshake className="w-8 h-8" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3 text-slate-900">法人様向けの手続きに完全対応</h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-3">
                  請求書払い、領収書の発行、秘密保持契約（NDA）や著作権譲渡に関する契約締結など、法人様が必要とする各種ビジネス手続きにもスムーズに対応可能です。
                </p>
                <div className="bg-orange-50/80 p-4 rounded-xl border border-orange-100/50 mt-4">
                  <p className="text-[13px] text-slate-700 leading-relaxed">
                    <strong className="text-orange-600">※適格請求書（インボイス）について</strong><br />
                    Sien-Officialとしてはインボイス発行事業者に未登録ですが、提携事務所である「<a href="https://pxstudio.site/" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline font-bold transition-colors">PXstudio</a>」を経由することで、適格請求書の発行および法人契約が可能です。ご希望の際はお気軽にお申し付けください。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. お問い合わせフォーム */}
      <section id="contact-form" className="py-24 bg-slate-50 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">お問い合わせ・ご相談</h2>
            <p className="text-slate-500">
              些細なご相談やお見積りのみでも歓迎いたします。<br className="hidden md:block" />
              以下のフォームよりお気軽にご連絡ください。
            </p>
          </div>
          
          <BusinessContactForm />
          
        </div>
      </section>
      
    </div>
  );
}
