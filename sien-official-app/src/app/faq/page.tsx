import { FAQList } from "@/components/shared/FAQList";
import { pageMetadata } from "@/lib/page-metadata";
import { getPublicFAQs } from "@/lib/data/public-faqs";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";

export const metadata: Metadata = pageMetadata("/faq", {title: "よくある質問 | Sien-Official", description: "Sien-Officialへのご依頼に関するよくある質問（FAQ）をご案内します。"});

export default async function FaqPage() {
  const generalFaqs = await getPublicFAQs("COMMON");

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header Section */}
      <section className="bg-white pt-10 md:pt-32 pb-10 md:pb-16 px-4 text-center border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-orange-50 text-orange-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            よくある質問 <span className="text-orange-700 font-black">FAQ</span>
          </h1>
          <p className="text-slate-600 text-lg">
            ご依頼全般に関して、お客様からよくいただくご質問とその回答をご案内いたします。
          </p>
        </div>
      </section>

      <section className="py-10 md:py-20 px-4">
        <div className="max-w-3xl mx-auto space-y-16">

          {/* ご依頼全般 */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-orange-500 rounded-full inline-block"></span>
              ご依頼全般
            </h2>
            <FAQList faqs={generalFaqs} />
          </div>

          {/* サービス別FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-slate-800 rounded-full inline-block"></span>
              サービス別のご質問
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link href="/mix#faq" className="group block bg-white p-5 md:p-8 rounded-3xl border border-slate-100 shadow-sm hover:border-orange-300 hover:shadow-md transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-orange-100 transition-colors"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">歌ってみたMIX<br/>マスタリング</h3>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                    「ボーカルデータの渡し方」「修正回数」など、MIX特有のご質問はこちらをご覧ください。
                  </p>
                  <div className="text-orange-700 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                    MIXのFAQを見る <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

              <Link href="/original#faq" className="group block bg-white p-5 md:p-8 rounded-3xl border border-slate-100 shadow-sm hover:border-amber-300 hover:shadow-md transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-amber-100 transition-colors"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">オリジナル楽曲制作</h3>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                    「著作権の扱い」「作詞の持ち込み」など、楽曲制作特有のご質問はこちらをご覧ください。
                  </p>
                  <div className="text-amber-800 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                    オリジナル楽曲のFAQを見る <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
