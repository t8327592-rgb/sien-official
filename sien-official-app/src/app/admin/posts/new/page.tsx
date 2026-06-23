export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function NewPostPage() {
  async function createPost(formData: FormData) {
    "use server";
    
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const type = formData.get("type") as string;
    const published = formData.get("published") === "true";
    
    if (!title || !content) return;

    await prisma.post.create({
      data: {
        title,
        content,
        type,
        published,
      },
    });

    redirect("/admin/posts");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">新規投稿を作成</h1>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <form action={createPost} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-1">タイトル <span className="text-red-500">*</span></label>
              <input 
                name="title" 
                type="text" 
                required 
                placeholder="例: 夏季休業のお知らせ"
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">投稿タイプ</label>
              <select name="type" className="w-full p-2 border rounded-md bg-white">
                <option value="NEWS">お知らせ</option>
                <option value="WORKS">制作実績</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">公開設定</label>
              <select name="published" className="w-full p-2 border rounded-md bg-white">
                <option value="false">下書きとして保存</option>
                <option value="true">今すぐ公開する</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">本文 (Markdown対応) <span className="text-red-500">*</span></label>
                <span className="text-xs text-muted-foreground bg-orange-50 text-orange-600 px-2 py-1 rounded">
                  ※AI記事生成アシストは準備中です
                </span>
              </div>
              <textarea 
                name="content" 
                required
                rows={12}
                placeholder="本文を入力してください..."
                className="w-full p-3 border rounded-md font-mono text-sm leading-relaxed"
              />
            </div>
          </div>
          
          <div className="pt-6 border-t flex gap-4">
            <button 
              type="submit" 
              className="bg-primary text-primary-foreground px-8 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              保存する
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
