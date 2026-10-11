import { requireAdminPage } from "@/lib/admin-page-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  await requireAdminPage();
  const posts = await prisma.post.findMany({
    where: { type: "NEWS" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">お知らせ管理</h1>
        <Link href="/admin/news/new" className="bg-orange-500 text-white px-4 py-2 rounded-md font-bold hover:bg-orange-600 transition-colors shadow-sm">
          新しいお知らせを作成
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        {posts.length === 0 ? (
          <p className="text-slate-500">現在投稿されているお知らせはありません。</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="p-4 border border-slate-100 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-orange-50/30 transition-colors gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 font-bold">
                      お知らせ
                    </span>
                    <h3 className="font-bold text-lg text-slate-800">{post.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 flex items-center gap-3">
                    <span>作成日: {new Date(post.createdAt).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}</span>
                    {post.category && <span>タグ: {post.category}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${post.published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    {post.published ? "公開中" : "下書き"}
                  </span>
                  <Link href={`/admin/news/${post.id}`} className="text-orange-600 hover:text-orange-700 text-sm font-bold bg-orange-50 px-4 py-1.5 rounded-full border border-orange-200">
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
