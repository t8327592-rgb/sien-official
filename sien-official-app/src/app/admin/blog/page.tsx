import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const posts = await prisma.post.findMany({
    where: { type: "BLOG" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">ブログ記事管理</h1>
        <Link href="/admin/blog/new" className="bg-blue-600 text-white px-4 py-2 rounded-md font-bold hover:bg-blue-700 transition-colors shadow-sm">
          新しい記事を作成
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        {posts.length === 0 ? (
          <p className="text-slate-500">現在投稿されている記事はありません。</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="p-4 border border-slate-100 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-blue-50/30 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  {/* サムネイル */}
                  <div className="w-20 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0 hidden md:block relative">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold">
                        ブログ
                      </span>
                      <h3 className="font-bold text-lg text-slate-800">{post.title}</h3>
                    </div>
                    <p className="text-sm text-slate-500 flex items-center gap-3">
                      <span>作成日: {new Date(post.createdAt).toLocaleDateString()}</span>
                      {post.category && <span>タグ: {post.category}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${post.published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    {post.published ? "公開中" : "下書き"}
                  </span>
                  <Link href={`/admin/blog/${post.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-bold bg-blue-50 px-4 py-1.5 rounded-full border border-blue-200">
                    編集する
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
