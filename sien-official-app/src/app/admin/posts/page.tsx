import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ブログ・実績管理</h1>
        <Link href="/admin/posts/new" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
          新規投稿を作成
        </Link>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">現在投稿されている記事はありません。</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="p-4 border rounded-md flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${post.type === 'NEWS' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                      {post.type === 'NEWS' ? 'お知らせ' : '制作実績'}
                    </span>
                    <h3 className="font-bold text-lg">{post.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    作成日: {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${post.published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                    {post.published ? "公開中" : "下書き"}
                  </span>
                  <Link href={`/admin/posts/${post.id}`} className="text-orange-600 hover:underline text-sm font-medium">
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
