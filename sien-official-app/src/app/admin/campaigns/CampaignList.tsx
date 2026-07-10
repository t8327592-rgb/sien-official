"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createCampaign, updateCampaign, deleteCampaign } from "@/app/actions/cms";
import toast from "react-hot-toast";

export function CampaignList({ initialCampaigns }: { initialCampaigns: any[] }) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [isAdding, setIsAdding] = useState(false);
  const [newCamp, setNewCamp] = useState({ name: "", targetPlanId: "", campaignPrice: 0, description: "" });

  const handleAdd = async () => {
    if (!newCamp.name || newCamp.campaignPrice <= 0) {
      toast.error("キャンペーン名とキャンペーン価格を入力してください");
      return;
    }
    try {
      const res = await createCampaign({
        name: newCamp.name,
        targetPlanId: newCamp.targetPlanId || null,
        campaignPrice: Number(newCamp.campaignPrice),
        description: newCamp.description,
      });
      setCampaigns([res.data, ...campaigns]);
      setIsAdding(false);
      setNewCamp({ name: "", targetPlanId: "", campaignPrice: 0, description: "" });
      toast.success("追加しました");
    } catch (e) {
      toast.error("エラーが発生しました");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("削除しますか？")) return;
    try {
      await deleteCampaign(id);
      setCampaigns(campaigns.filter(c => c.id !== id));
      toast.success("削除しました");
    } catch (e) {
      toast.error("エラーが発生しました");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsAdding(!isAdding)}>
          <h2 className="text-lg font-bold text-orange-600">＋ 新規キャンペーン追加</h2>
        </div>
        {isAdding && (
          <div className="space-y-4 pt-4 border-t mt-4">
            <input type="text" placeholder="キャンペーン名 (例: 春のVTuber応援セール)" className="w-full border p-2 rounded" value={newCamp.name} onChange={e => setNewCamp({...newCamp, name: e.target.value})} />
            <input type="text" placeholder="対象プランID (空欄で全体)" className="w-full border p-2 rounded" value={newCamp.targetPlanId} onChange={e => setNewCamp({...newCamp, targetPlanId: e.target.value})} />
            <input type="number" placeholder="キャンペーン価格 (例: 4000)" className="w-full border p-2 rounded" value={newCamp.campaignPrice} onChange={e => setNewCamp({...newCamp, campaignPrice: Number(e.target.value)})} />
            <textarea placeholder="キャンペーン条件や説明" className="w-full border p-2 rounded h-24" value={newCamp.description} onChange={e => setNewCamp({...newCamp, description: e.target.value})} />
            <div className="flex gap-4">
              <Button onClick={handleAdd} className="bg-orange-500 hover:bg-orange-600">追加する</Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {campaigns.map(camp => (
          <div key={camp.id} className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="font-bold text-xl">{camp.name} 
                  <span className={`text-xs px-2 py-1 rounded ml-2 ${camp.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {camp.isActive ? "開催中" : "終了"}
                  </span>
                </div>
                <div className="text-red-500 font-bold">キャンペーン価格: {camp.campaignPrice.toLocaleString()}円</div>
                <div className="text-sm text-slate-500">対象プランID: {camp.targetPlanId || "指定なし (全対象など)"}</div>
                <div className="text-slate-600 whitespace-pre-wrap mt-2">{camp.description}</div>
              </div>
              <div>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(camp.id)}>削除</Button>
              </div>
            </div>
          </div>
        ))}
        {campaigns.length === 0 && <p className="text-slate-500">登録されたキャンペーンがありません</p>}
      </div>
    </div>
  );
}
