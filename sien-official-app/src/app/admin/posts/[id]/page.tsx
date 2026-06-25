export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 投稿データを取得
  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  // 更新アクション
  async function updatePost(formData: FormData) {
    "use server";
    
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const type = formData.get("type") as string;
    const category = formData.get("category") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const published = formData.get("published") === "true";
    
    if (!title || !content) return;

    await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        type,
        category: category || null,
        imageUrl: imageUrl || null,
        published,
      },
    });

    redirect("/admin/posts");
  }

  // 削除アクション
  async function deletePost() {
    "use server";
    await prisma.post.delete({
      where: { id },
    });
    redirect("/admin/posts");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">投稿を編集</h1>
        <form action={deletePost}>
          <button 
            type="submit" 
            className="text-red-600 hover:text-red-800 font-medium text-sm hover:underline"
            title="完全に削除する"
          >
            この投稿を削除
          </button>
        </form>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <form action={updatePost} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-1">タイトル <span className="text-red-500">*</span></label>
              <input 
                name="title" 
                type="text" 
                required 
                defaultValue={post.title}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">投稿タイプ</label>
              <select name="type" defaultValue={post.type} className="w-full p-2 border rounded-md bg-white">
                <option value="NEWS">お知らせ</option>
                <option value="WORKS">制作実績</option>
                <option value="BLOG">ブログ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">カテゴリー (ブログ用)</label>
              <input 
                name="category" 
                type="text" 
                defaultValue={post.category || ""}
                placeholder="例: 音楽制作, 日常, チュートリアル"
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-1">サムネイル画像URL (ブログ・実績用)</label>
              <input 
                name="imageUrl" 
                type="url" 
                defaultValue={post.imageUrl || ""}
                placeholder="例: https://example.com/image.png"
                className="w-full p-2 border rounded-md"
              />
              <p className="text-xs text-slate-500 mt-1">※画像をアップロードしたURLを入力してください。</p>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-1">公開設定</label>
              <select name="published" defaultValue={post.published.toString()} className="w-full p-2 border rounded-md bg-white">
                <option value="false">下書きとして保存</option>
                <option value="true">今すぐ公開する</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">本文 (Markdown対応) <span className="text-red-500">*</span></label>
              </div>
              <textarea 
                name="content" 
                required
                rows={12}
                defaultValue={post.content}
                className="w-full p-3 border rounded-md font-mono text-sm leading-relaxed"
              />
            </div>
          </div>
          
          <div className="pt-6 border-t flex gap-4">
            <button 
              type="submit" 
              className="bg-primary text-primary-foreground px-8 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              更新する
            </button>
            <Link 
              href="/admin/posts"
              className="px-8 py-2 border rounded-md font-medium hover:bg-slate-50 transition-colors inline-block"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
