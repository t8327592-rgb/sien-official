import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Tag, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { Metadata } from "next";

// コンポーネント群
import { MDXComponents } from "@/components/blog/MDXComponents";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { AuthorProfile } from "@/components/blog/AuthorProfile";
import { CallToAction } from "@/components/blog/CallToAction";

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
      select: { id: true, title: true, category: true, imageUrl: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  if (!post || (!post.published && post.type !== "BLOG")) {
    notFound();
  }

  // カテゴリー一覧
  const categories = Array.from(
    new Set(allBlogPosts.map(p => p.category).filter(Boolean))
  ) as string[];

  // 関連記事 (同じカテゴリの最新3件)
  const relatedPosts = allBlogPosts
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 3);
    
  // 読了時間の計算 (400文字で1分換算)
  const readingTime = Math.max(1, Math.ceil(post.content.length / 400));

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* ヒーローヘッダー（アイキャッチ） - 拡張版 */}
      <section className="relative bg-slate-900 overflow-hidden">
        {post.imageUrl ? (
          <>
            <div className="absolute inset-0 z-0">
              <img src={post.imageUrl} alt="" className="w-full h-full object-cover opacity-30 blur-md scale-105" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent z-10" />
          </>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 to-orange-950" />
        )}
        
        <div className="relative z-20 container mx-auto max-w-6xl px-4 pt-32 pb-24 md:pt-40 md:pb-32 flex flex-col items-center text-center">
          {post.category && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-sm font-bold mb-6 border border-orange-500/30 backdrop-blur-md">
              <Tag className="w-3.5 h-3.5" />
              {post.category}
            </div>
          )}
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-[1.3] mb-8 max-w-4xl drop-shadow-lg">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-300 font-medium bg-slate-900/50 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              <time dateTime={post.createdAt.toISOString()}>
                {new Date(post.createdAt).toLocaleDateString('ja-JP')}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>約 {readingTime} 分で読めます</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-orange-400" />
              <span>監修: Sien</span>
            </div>
          </div>
        </div>
      </section>

      {/* 記事本文＆サイドバー (2カラム) */}
      <section className="py-16 md:py-24 px-4 flex-1">
        <div className="container mx-auto max-w-7xl">
          
          {/* 戻るリンク */}
          <div className="mb-10 pl-2 md:pl-4">
            <Link 
              href="/blog" 
              className="inline-flex items-center text-[15px] font-bold text-slate-500 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              ブログ一覧へ戻る
            </Link>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-12 md:gap-16 items-start">
            
            {/* メインカラム */}
            <article className="w-full">
              <TableOfContents content={post.content} isInline={true} />
              <div className="blog-prose prose-slate prose-a:text-blue-600 hover:prose-a:text-blue-500">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeRaw, rehypeSlug]}
                  components={MDXComponents}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* 記事末尾の各種モジュール */}
              <AuthorProfile />
              
              <CallToAction />

              {/* 関連記事 */}
              {relatedPosts.length > 0 && (
                <div className="mt-16 pt-8 border-t border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-orange-500 rounded-full inline-block"></span>
                    おすすめの関連記事
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedPosts.map(rp => (
                      <Link href={`/blog/${rp.id}`} key={rp.id} className="group flex flex-col bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all">
                        <div className="aspect-[16/9] w-full bg-slate-200 overflow-hidden relative">
                          {rp.imageUrl ? (
                            <img src={rp.imageUrl} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300" />
                          )}
                          {rp.category && (
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md">
                              {rp.category}
                            </div>
                          )}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-relaxed mb-3 group-hover:text-orange-600 transition-colors">
                            {rp.title}
                          </h3>
                          <time className="text-xs text-slate-500 font-medium mt-auto">
                            {new Date(rp.createdAt).toLocaleDateString('ja-JP')}
                          </time>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* サイドバー */}
            <aside className="hidden lg:flex flex-col gap-8">
              {/* スクロール追従目次 */}
              <TableOfContents content={post.content} />

              {/* カテゴリー */}
              {categories.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-[calc(24px+400px)]">
                  <h3 className="text-base font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                    <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                    カテゴリー
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <Link 
                        key={cat} 
                        href={`/blog?category=${encodeURIComponent(cat)}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold border border-slate-100 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center gap-1"
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
