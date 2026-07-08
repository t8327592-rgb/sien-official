import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Tag, ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const post = await prisma.post.findUnique({
    where: { id: resolvedParams.id, type: "NEWS", published: true },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="container mx-auto max-w-3xl py-12 px-4">
        <Link href="/news" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors mb-8">
          <ChevronLeft className="w-4 h-4 mr-1" /> お知らせ一覧へ戻る
        </Link>
        
        <article className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200">
          <header className="mb-8 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-3 mb-4">
              <time className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.createdAt).toLocaleDateString('ja-JP')}
              </time>
              {post.category && (
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {post.category}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              {post.title}
            </h1>
          </header>
          
          <div className="prose prose-slate prose-orange max-w-none prose-p:leading-relaxed prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-headings:font-bold prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}
