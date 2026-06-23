import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default function NewPlanPage() {
  async function createPlan(formData: FormData) {
    "use server";
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const features = formData.get("features") as string;
    
    if (!name) return;

    await prisma.plan.create({
      data: {
        name,
        description,
        price: priceStr ? parseInt(priceStr, 10) : null,
        features,
        isActive: true,
      },
    });

    redirect("/admin/plans");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">新規プラン追加</h1>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <form action={createPlan} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">プラン名 (必須)</label>
            <input 
              name="name" 
              type="text" 
              required 
              placeholder="例: スタンダードプラン"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">説明</label>
            <input 
              name="description" 
              type="text" 
              placeholder="例: お急ぎでない方向けの標準的なプランです。"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">基本料金 (円)</label>
            <input 
              name="price" 
              type="number" 
              placeholder="例: 10000"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">特徴・提供内容</label>
            <textarea 
              name="features" 
              rows={4}
              placeholder="例: ピッチ補正込み&#10;無料リテイク2回まで"
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div className="pt-4 flex gap-4">
            <button 
              type="submit" 
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              登録する
            </button>
            <a 
              href="/admin/plans"
              className="px-6 py-2 border rounded-md font-medium hover:bg-slate-50 transition-colors"
            >
              キャンセル
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
