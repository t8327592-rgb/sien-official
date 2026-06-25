import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, Calendar, Tag, Image as ImageIcon } from "lucide-react";

export const metadata = {
  title: "ブログ | Sien-Official",
  description: "Sien-Officialのブログ記事一覧です。音楽制作のノウハウや日常、最新情報などを発信しています。",
};

// データの動的取得を強制（キャッシュ無効化）
export const dynamic = "force-dynamic";

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  // カテゴリ一覧を取得（動的に生成）
  const allBlogPosts = await prisma.post.findMany({
    where: { type: "BLOG", published: true },
    select: { category: true },
  });
  
  const categories = Array.from(
    new Set(allBlogPosts.map(p => p.category).filter(Boolean))
  ) as string[];

  // 記事を取得
  const posts = await prisma.post.findMany({
    where: { 
      type: "BLOG", 
      published: true,
      ...(category ? { category } : {})
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* ヒーローセクション */}
      <section className="relative bg-white pt-24 pb-16 px-4 text-center border-b border-slate-100">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-50/80 to-white opacity-90" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-bold shadow-sm">
            Blog
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-slate-900 tracking-tight">
            ブログ
          </h1>
          <p className="text-slate-600 text-lg font-medium max-w-2xl mx-auto">
            音楽制作のノウハウや日常、最新情報などをお届けします。
          </p>
        </div>
      </section>

      {/* コンテンツセクション */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          
          {/* カテゴリーフィルター */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10 justify-center">
              <Link 
                href="/blog" 
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${!category ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
              >
                すべて
              </Link>
              {categories.map(cat => (
                <Link 
                  key={cat}
                  href={`/blog?category=${encodeURIComponent(cat)}`} 
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${category === cat ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}

          {/* 記事一覧 */}
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 font-medium">現在公開されている記事はありません。</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link 
                  href={`/blog/${post.id}`} 
                  key={post.id}
                  className="group bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-200 transition-all flex flex-col h-full"
                >
                  {/* サムネイル */}
                  <div className="aspect-[16/9] w-full bg-slate-100 relative overflow-hidden border-b border-slate-100">
                    {post.imageUrl ? (
                      <img 
                        src={post.imageUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                    {/* カテゴリーバッジ */}
                    {post.category && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-blue-600" />
                        {post.category}
                      </div>
                    )}
                  </div>
                  
                  {/* 本文プレビュー */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3 font-medium">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={post.createdAt.toISOString()}>
                        {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                      </time>
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-900 leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    
                    <p className="text-slate-600 text-sm line-clamp-3 mb-6 mt-auto">
                      {post.content.replace(/[#*`_\[\]]/g, '').slice(0, 100)}...
                    </p>
                    
                    <div className="flex items-center text-blue-600 font-bold text-sm mt-auto pt-4 border-t border-slate-100">
                      記事を読む <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
