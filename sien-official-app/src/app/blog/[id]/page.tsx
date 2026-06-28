import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Tag, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  
  if (!post) {
    return { title: "記事が見つかりません | Sien-Official" };
  }
  
  return {
    title: `${post.title} | Sien's Blog`,
    description: post.content.replace(/[#*`_\[\]]/g, '').slice(0, 120) + "...",
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [post, allBlogPosts] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
    }),
    prisma.post.findMany({
      where: { type: "BLOG", published: true },
      select: { category: true },
    })
  ]);

  if (!post || (!post.published && post.type !== "BLOG")) {
    notFound();
  }

  const categories = Array.from(
    new Set(allBlogPosts.map(p => p.category).filter(Boolean))
  ) as string[];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      
      {/* ヒーローヘッダー（アイキャッチ） */}
      <section className="relative bg-slate-900 overflow-hidden">
        {post.imageUrl ? (
          <>
            <div className="absolute inset-0 z-0">
              <img src={post.imageUrl} alt="" className="w-full h-full object-cover opacity-40 blur-sm scale-105" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10" />
          </>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900 to-slate-900" />
        )}
        
        <div className="relative z-20 container mx-auto max-w-6xl px-4 pt-32 pb-24 md:pt-40 md:pb-32 flex flex-col items-center text-center">
          {post.category && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-sm font-bold mb-6 border border-blue-500/30 backdrop-blur-md">
              <Tag className="w-3.5 h-3.5" />
              {post.category}
            </div>
          )}
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-8 max-w-4xl drop-shadow-lg">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-300 font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.createdAt.toISOString()}>
                {new Date(post.createdAt).toLocaleDateString('ja-JP')}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Sien</span>
            </div>
          </div>
        </div>
      </section>

      {/* 記事本文＆サイドバー (2カラム) */}
      <section className="py-12 px-4 flex-1">
        <div className="container mx-auto max-w-6xl">
          
          {/* 戻るリンク */}
          <Link 
            href="/blog" 
            className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            ブログ一覧へ戻る
          </Link>

          <div className="grid lg:grid-cols-[1fr_320px] gap-8 md:gap-12 items-start">
            
            {/* メインカラム */}
            <article className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-8 md:p-14">
              <div className="prose prose-lg md:prose-xl prose-slate prose-blue max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-img:rounded-2xl prose-img:shadow-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content}
                </ReactMarkdown>
              </div>
            </article>

            {/* サイドバー */}
            <aside className="flex flex-col gap-8 sticky top-24">
              {/* プロフィール */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 mb-4 overflow-hidden border-2 border-white shadow-md relative">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sien" alt="Sien" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">Sien</h3>
                <p className="text-xs font-bold text-orange-500 mb-4 tracking-widest uppercase">Mix Engineer</p>
                <p className="text-sm text-slate-600 text-left leading-relaxed mb-6">
                  ボーカルMIX、オリジナル楽曲制作を中心に活動しています。歌ってみた初心者の方も大歓迎です！
                </p>
                <Link href="/order" className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors">
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
