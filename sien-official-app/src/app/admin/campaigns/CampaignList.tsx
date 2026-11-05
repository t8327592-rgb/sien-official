"use client";
import type { Campaign } from "@prisma/client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { createCampaign, deleteCampaign } from "@/app/actions/cms";
import toast from "react-hot-toast";
import { campaignDisplayStatus } from "@/lib/campaign-pricing";

export function CampaignList({ initialCampaigns, plans }: { initialCampaigns: Campaign[]; plans: { id: string; name: string; category: string }[] }) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [isAdding, setIsAdding] = useState(false);
  const [newCamp, setNewCamp] = useState({ name: "", targetPlanId: "", campaignPrice: 0, description: "" });

  const [busy, setBusy] = useState(false);
  const saving = useRef(false);

  const handleAdd = async () => {
    if (saving.current) return;
    if (!newCamp.name.trim() || !newCamp.targetPlanId.trim() || !Number.isInteger(newCamp.campaignPrice) || newCamp.campaignPrice < 0) {
      toast.error("キャンペーン名・対象プラン・0円以上の整数の価格を入力してください");
      return;
    }
    saving.current = true; setBusy(true);
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
    } catch {
      toast.error("保存できませんでした。入力内容と接続状態を確認してください。");
    } finally { saving.current = false; setBusy(false); }
  };

  const handleDelete = async (id: string) => {
    if (saving.current || !confirm("削除しますか？")) return;
    saving.current = true; setBusy(true);
    try {
      await deleteCampaign(id);
      setCampaigns(campaigns.filter(c => c.id !== id));
      toast.success("削除しました");
    } catch {
      toast.error("保存できませんでした。入力内容と接続状態を確認してください。");
    } finally { saving.current = false; setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <p className="rounded-lg border bg-white p-4 text-sm text-slate-600">ここでは対象プランごとの固定価格キャンペーンを管理します。秋のMIXセールの公開・保留設定は、この画面からは変更されません。</p>
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-orange-600">
          <button type="button" aria-expanded={isAdding} className="w-full flex justify-between items-center text-left" onClick={() => setIsAdding(!isAdding)}>＋ 新規キャンペーン追加</button>
        </h2>
        {isAdding && (
          <div className="space-y-4 pt-4 border-t mt-4">
            <input type="text" aria-label="キャンペーン名 (例: 春のVTuber応援セール)" placeholder="キャンペーン名 (例: 春のVTuber応援セール)" className="w-full border p-2 rounded" value={newCamp.name} onChange={e => setNewCamp({...newCamp, name: e.target.value})} />
            <label className="block text-sm font-bold">対象プラン<select aria-label="対象プラン" className="mt-1 w-full border p-2 rounded bg-white" value={newCamp.targetPlanId} onChange={e => setNewCamp({...newCamp, targetPlanId: e.target.value})}><option value="">対象プランを選択</option>{plans.map(plan => <option key={plan.id} value={plan.id}>{plan.name}（{plan.category}）</option>)}</select></label>
            <input type="number" aria-label="キャンペーン価格 (例: 4000)" placeholder="キャンペーン価格 (例: 4000)" className="w-full border p-2 rounded" value={newCamp.campaignPrice} onChange={e => setNewCamp({...newCamp, campaignPrice: Number(e.target.value)})} />
            <textarea aria-label="キャンペーン条件や説明" placeholder="キャンペーン条件や説明" className="w-full border p-2 rounded h-24" value={newCamp.description} onChange={e => setNewCamp({...newCamp, description: e.target.value})} />
            <div className="flex gap-4">
              <Button disabled={busy} onClick={handleAdd} className="bg-orange-500 hover:bg-orange-600">追加する</Button>
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
                  <span className={`text-xs px-2 py-1 rounded ml-2 ${campaignDisplayStatus(camp) === "開催中" ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {campaignDisplayStatus(camp)}
                  </span>
                </div>
                <div className="text-red-500 font-bold">キャンペーン価格: {camp.campaignPrice.toLocaleString()}円</div>
                <div className="text-sm text-slate-500">対象プラン: {plans.find(p => p.id === camp.targetPlanId)?.name || (camp.targetPlanId ? "対象プランが見つかりません" : "未設定（料金への反映なし）")}</div>
                <div className="text-slate-600 whitespace-pre-wrap mt-2">{camp.description}</div>
              </div>
              <div>
                <Button variant="destructive" size="sm" disabled={busy} onClick={() => handleDelete(camp.id)}>削除</Button>
              </div>
            </div>
          </div>
        ))}
        {campaigns.length === 0 && <p className="text-slate-500">登録されたキャンペーンがありません</p>}
      </div>
    </div>
  );
}
