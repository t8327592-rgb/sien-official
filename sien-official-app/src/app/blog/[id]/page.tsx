import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

// 動的メタデータ生成
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  
  if (!post) {
    return { title: "記事が見つかりません | Sien-Official" };
  }
  
  return {
    title: `${post.title} | Sien-Official Blog`,
    description: post.content.replace(/[#*`_\[\]]/g, '').slice(0, 120) + "...",
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post || (!post.published && post.type !== "BLOG")) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto w-full px-4 py-12 md:py-20">
        
        {/* 戻るリンク */}
        <Link 
          href="/blog" 
          className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-10 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          ブログ一覧へ戻る
        </Link>

        <article className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          {/* サムネイル画像 */}
          {post.imageUrl && (
            <div className="w-full aspect-[21/9] md:aspect-[2.5/1] relative bg-slate-100 border-b border-slate-100">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8 md:p-14">
            {/* 記事ヘッダー情報 */}
            <header className="mb-12 text-center">
              {post.category && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-6 border border-blue-100">
                  <Tag className="w-3.5 h-3.5" />
                  {post.category}
                </div>
              )}
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-8">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.createdAt.toISOString()}>
                    {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                  </time>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Sien-Official</span>
                </div>
              </div>
            </header>

            <hr className="border-slate-100 mb-12" />

            {/* 記事本文 (Markdown) */}
            <div className="prose prose-lg md:prose-xl prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-img:rounded-2xl prose-img:shadow-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
