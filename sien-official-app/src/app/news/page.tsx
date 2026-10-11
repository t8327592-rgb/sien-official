import { pageMetadata } from "@/lib/page-metadata";
import { formatPublicDate } from "@/lib/public-format";
import { getNewsPosts } from "@/lib/data/cms";
import Link from "next/link";
import { ArrowRight, Calendar, ChevronLeft } from "lucide-react";

export const metadata = pageMetadata("/news", {title: "お知らせ | Sien-Official", description: "Sien-Officialからの最新のお知らせ、アップデート情報などをご案内します。"});

export const revalidate = 60;

export default async function NewsIndexPage() {
  const posts = await getNewsPosts();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <section className="relative bg-white pt-10 pb-10 md:pt-24 md:pb-16 px-4 text-center border-b border-slate-100">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-orange-50/50 to-white opacity-90" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-orange-700 transition-colors mb-6">
            <ChevronLeft className="w-4 h-4 mr-1" /> トップページへ戻る
          </Link>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-6 text-slate-900 tracking-tight">
            お知らせ
          </h1>
          <p className="text-slate-600 text-base md:text-lg font-medium max-w-2xl mx-auto">
            最新のアップデートやスケジュール情報をお届けします。
          </p>
        </div>
      </section>

      <section className="py-10 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 font-medium">現在お知らせはありません。</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex flex-col divide-y divide-slate-100">
                {posts.map((post) => (
                  <Link key={post.id} href={`/news/${post.id}`} className="group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 p-6 hover:bg-orange-50/30 transition-colors">
                    <div className="flex items-center gap-4 shrink-0 sm:w-48">
                      <time className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 opacity-70" />
                        {formatPublicDate(post.createdAt)}
                      </time>
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      {post.category && (
                        <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          post.category.includes("SALE") || post.category.includes("サマーセール") || post.category.includes("キャンペーン")
                            ? "bg-red-50 text-red-600 border-red-200 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse"
                            : post.category.includes("NEW") || post.category.includes("新プラン")
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {post.category}
                        </span>
                      )}
                      <h2 className="text-slate-800 font-bold sm:text-lg group-hover:text-orange-700 transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                    </div>
                    <ArrowRight className="hidden sm:block w-5 h-5 text-slate-300 group-hover:text-orange-700 group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
