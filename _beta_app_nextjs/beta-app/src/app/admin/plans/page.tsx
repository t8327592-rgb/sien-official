"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

type Plan = {
  id: string;
  title: string;
  price: string;
  description: string;
  period: string;
  revisions: string;
  isPopular: boolean;
  order: number;
};

export default function PlansAdminPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    const res = await fetch("/api/plans");
    const data = await res.json();
    setPlans(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const method = isAdding ? "POST" : "PUT";
    
    await fetch("/api/plans", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingPlan),
    });

    setEditingPlan(null);
    setIsAdding(false);
    fetchPlans();
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return;
    await fetch(`/api/plans?id=${id}`, { method: "DELETE" });
    fetchPlans();
    router.refresh();
  };

  if (loading) return <div className="p-8">読み込み中...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-800">料金プラン管理</h1>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingPlan({ id: "", title: "", price: "", description: "", period: "", revisions: "5回", isPopular: false, order: plans.length + 1 });
          }}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-colors"
        >
          <Plus size={20} />
          新規プラン追加
        </button>
      </div>

      {editingPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-800">
                {isAdding ? "新規プラン追加" : "プラン編集"}
              </h2>
              <button onClick={() => setEditingPlan(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">プラン名</label>
                  <input
                    type="text"
                    value={editingPlan.title}
                    onChange={(e) => setEditingPlan({...editingPlan, title: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">価格 (カンマ不要)</label>
                  <input
                    type="text"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({...editingPlan, price: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">説明</label>
                <textarea
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({...editingPlan, description: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">納期目安</label>
                  <input
                    type="text"
                    value={editingPlan.period || ""}
                    onChange={(e) => setEditingPlan({...editingPlan, period: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">表示順 (小さい順)</label>
                  <input
                    type="number"
                    value={editingPlan.order}
                    onChange={(e) => setEditingPlan({...editingPlan, order: Number(e.target.value)})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={editingPlan.isPopular}
                  onChange={(e) => setEditingPlan({...editingPlan, isPopular: e.target.checked})}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <label htmlFor="isPopular" className="font-bold text-gray-700 cursor-pointer">
                  「一番人気」バッジを表示する
                </label>
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800">
                  保存する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-white rounded-3xl p-6 border-2 relative ${plan.isPopular ? 'border-orange-400' : 'border-gray-100'}`}>
            {plan.isPopular && (
              <span className="absolute -top-3 left-6 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
            )}
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-black text-xl text-gray-800">{plan.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => { setIsAdding(false); setEditingPlan(plan); }} className="p-2 text-gray-400 hover:text-blue-500 bg-gray-50 rounded-lg">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(plan.id)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 mb-4">
              ¥{plan.price}
            </div>
            <p className="text-sm text-gray-600 font-medium">{plan.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
