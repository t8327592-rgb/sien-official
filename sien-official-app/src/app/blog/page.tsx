import { getBlogPosts, getBlogCategories } from "@/lib/data/cms";
import Link from "next/link";
import { ArrowRight, Calendar, Tag, Image as ImageIcon, ChevronRight } from "lucide-react";

export const metadata = {
  title: "ブログ | Sien-Official",
  description: "音楽制作のノウハウや日常、最新情報などを発信しています。",
};

export const dynamic = "force-dynamic";

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  // カテゴリ一覧を取得（BLOGのみ）
  const categories = await getBlogCategories();

  // 記事を取得（BLOGのみ）
  const posts = await getBlogPosts(category);

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const listPosts = posts.length > 1 ? posts.slice(1) : [];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* ヒーローセクション */}
      <section className="bg-white pt-24 pb-12 px-4 border-b border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-3 flex items-center gap-3">
              <span className="w-2 h-10 md:h-12 bg-blue-500 rounded-full inline-block"></span>
              Sien's Blog
            </h1>
            <p className="text-slate-500 font-medium ml-5">音楽制作のノウハウ・Tips、日常の出来事などを綴ります。</p>
          </div>
          {category && (
            <div className="text-sm font-bold bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-100 flex items-center gap-1.5 ml-5 md:ml-0">
              <Tag className="w-4 h-4" />
              {category} の記事一覧
              <Link href="/blog" className="ml-2 text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* コンテンツセクション（2カラム） */}
      <section className="py-12 px-4 flex-1">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-[1fr_320px] gap-8 md:gap-12 items-start">
            
            {/* メインカラム */}
            <main className="flex flex-col gap-8">
              {posts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-slate-500 font-medium">現在公開されている記事はありません。</p>
                </div>
              ) : (
                <>
                  {/* 最新記事ピックアップ */}
                  {featuredPost && !category && (
                    <Link href={`/blog/${featuredPost.id}`} className="group relative bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden flex flex-col md:flex-row items-stretch">
                      <div className="md:w-1/2 aspect-video md:aspect-auto relative overflow-hidden bg-slate-100">
                        {featuredPost.imageUrl ? (
                          <img src={featuredPost.imageUrl} alt={featuredPost.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                            <ImageIcon className="w-16 h-16" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">NEW</span>
                        </div>
                      </div>
                      <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                          <time className="text-sm font-bold text-slate-500 font-mono">
                            {new Date(featuredPost.createdAt).toLocaleDateString('ja-JP')}
                          </time>
                          {featuredPost.category && (
                            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                              <Tag className="w-3 h-3" />{featuredPost.category}
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-snug mb-4 group-hover:text-blue-600 transition-colors line-clamp-3">
                          {featuredPost.title}
                        </h2>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-8">
                          {featuredPost.content.replace(/[#*`_\[\]]/g, '').slice(0, 120)}...
                        </p>
                        <div className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-blue-600">
                          続きを読む <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* 記事リスト（左画像・右テキスト） */}
                  <div className="flex flex-col gap-6">
                    {listPosts.map((post) => (
                      <Link key={post.id} href={`/blog/${post.id}`} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-4 flex flex-col sm:flex-row gap-5 items-center">
                        <div className="w-full sm:w-48 aspect-video rounded-xl bg-slate-100 relative overflow-hidden shrink-0">
                          {post.imageUrl ? (
                            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <time className="text-xs font-bold text-slate-500 font-mono">
                              {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                            </time>
                            {post.category && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                                <Tag className="w-3 h-3" />{post.category}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-slate-600 text-sm line-clamp-2">
                            {post.content.replace(/[#*`_\[\]]/g, '').slice(0, 100)}...
                          </p>
                        </div>
                      </Link>
                    ))}
                    {listPosts.length === 0 && !featuredPost && (
                      <p className="text-slate-500 text-center py-10">記事がありません。</p>
                    )}
                  </div>
                </>
              )}
            </main>

            {/* サイドバー */}
            <aside className="flex flex-col gap-8 sticky top-24">
              
              {/* プロフィール */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 mb-4 overflow-hidden border-2 border-white shadow-md relative">
                  <img src="/profile.jpg" alt="Sien" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">Sien</h3>
                <p className="text-[11px] font-bold text-orange-500 mb-4 tracking-widest uppercase">Mix Engineer / Sound Creator</p>
                <p className="text-[13px] text-slate-600 text-left leading-relaxed mb-6 font-medium">
                  音楽制作歴15年。歌ってみたMIXからオリジナル楽曲制作まで幅広く対応するミックスエンジニア。初めての方でも安心してご依頼いただけるよう、丁寧なコミュニケーションを心がけています。
                </p>
                <Link href="/order" className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-[0_5px_15px_-3px_rgba(249,115,22,0.4)] hover:scale-105 transition-all duration-300">
                  ご依頼はこちら <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* カテゴリー */}
              {categories.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-base font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                    カテゴリー
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <Link 
                        key={cat} 
                        href={`/blog?category=${encodeURIComponent(cat)}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold border border-slate-100 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-1"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>

          </div>
        </div>
      </section>
    </div>
  );
}
