"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Copy, Music, FileText, Calendar, Tag, DollarSign, ExternalLink, MessageCircle } from "lucide-react";

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    const res = await fetch("/api/customers");
    const data = await res.json();
    const target = data.find((c: any) => c.id === id);
    if (target) {
      if (target.deadline) target.deadline = new Date(target.deadline).toISOString().split('T')[0];
      setCustomer(target);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/customers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer),
    });
    setSaving(false);
    alert("保存しました！");
  };

  const handleCopyTemplate = (type: "estimate" | "delivery") => {
    let text = "";
    if (type === "estimate") {
      text = `${customer.name} 様\n\nご依頼ありがとうございます。しえんです。\nお見積もりは ￥${customer.price || '---'}、納期は ${customer.deadline || '---'} を予定しております。\n\nよろしくお願いいたします。`;
    } else if (type === "delivery") {
      text = `${customer.name} 様\n\nお世話になっております。しえんです。\nご依頼いただいておりましたMIXが完成いたしましたので、納品データを送付いたします。\n\nよろしくお願いいたします。`;
    }
    navigator.clipboard.writeText(text);
    alert("クリップボードにコピーしました！");
  };

  if (loading) return <div className="p-8">読み込み中...</div>;
  if (!customer) return <div className="p-8">案件が見つかりません。</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => router.push("/admin/customers")} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold">
          <ArrowLeft size={18} /> 一覧に戻る
        </button>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          <Save size={18} /> {saving ? "保存中..." : "変更を保存"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左: 基本情報 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-black text-gray-800 mb-2">{customer.name}</h1>
                <p className="text-gray-500 font-bold">{customer.service}</p>
              </div>
              <select 
                value={customer.status}
                onChange={(e) => setCustomer({...customer, status: e.target.value})}
                className="font-bold text-sm px-4 py-2 rounded-full border-2 bg-gray-50 outline-none"
              >
                <option value="未対応">未対応</option>
                <option value="見積もり送信">見積もり送信</option>
                <option value="素材待ち">素材待ち</option>
                <option value="制作中">制作中</option>
                <option value="初稿提出">初稿提出</option>
                <option value="修正対応">修正対応</option>
                <option value="納品完了">納品完了</option>
                <option value="アーカイブ">アーカイブ</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-600"><Calendar size={16}/>納期</label>
                <input type="date" value={customer.deadline || ""} onChange={(e) => setCustomer({...customer, deadline: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-600"><DollarSign size={16}/>料金 (円)</label>
                <input type="number" value={customer.price || ""} onChange={(e) => setCustomer({...customer, price: parseInt(e.target.value)})} className="w-full p-3 bg-gray-50 border rounded-xl" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-600"><Tag size={16}/>タグ (カンマ区切り)</label>
                <input type="text" placeholder="例: K-POP, 短納期, スマホ録音" value={customer.tags || ""} onChange={(e) => setCustomer({...customer, tags: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl" />
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-600"><FileText size={16}/>依頼詳細・ご相談内容</label>
              <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 whitespace-pre-wrap">
                {customer.message}
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-orange-600"><Music size={16}/>素材管理・納品URLなど</label>
              <textarea 
                value={customer.materials || ""} 
                onChange={(e) => setCustomer({...customer, materials: e.target.value})} 
                placeholder="ギガファイル便のURLや素材のパス等をメモしておけます"
                rows={4}
                className="w-full p-4 bg-orange-50/50 border border-orange-200 rounded-xl text-sm focus:border-orange-400 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 右: アクション＆メモ */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="font-black text-gray-800 mb-4 flex items-center gap-2">
              <MessageCircle size={18} /> 返信テンプレート
            </h3>
            <div className="space-y-3">
              <button onClick={() => handleCopyTemplate("first")} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl font-bold text-sm text-gray-700 transition-colors">
                見積もり・初回返信 <Copy size={14} className="text-gray-400" />
              </button>
              <button onClick={() => handleCopyTemplate("delivery")} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl font-bold text-sm text-gray-700 transition-colors">
                納品完了のご連絡 <Copy size={14} className="text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4 font-medium">※クリックすると、名前や料金が自動で入った文章がコピーされます。</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[300px]">
            <h3 className="font-black text-gray-800 mb-4">管理用メモ</h3>
            <textarea 
              value={customer.memo || ""} 
              onChange={(e) => setCustomer({...customer, memo: e.target.value})} 
              placeholder="お客様には見えない自分用のメモです。"
              className="flex-1 w-full p-4 bg-gray-50 border rounded-xl text-sm outline-none resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
