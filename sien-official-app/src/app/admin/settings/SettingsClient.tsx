"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateSiteSetting } from "@/app/actions/settings";
import { useRouter } from "next/navigation";

type SiteSetting = {
  acceptingOrders: boolean; // 互換性のため残す
  orderStatus: string;
  announcement: string | null;
};

export function SettingsClient({ initialSetting }: { initialSetting: SiteSetting }) {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState(initialSetting.orderStatus || "AVAILABLE");
  const [announcement, setAnnouncement] = useState(initialSetting.announcement || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSiteSetting({
        orderStatus,
        announcement,
      });
      alert("設定を保存しました。");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("保存中にエラーが発生しました。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          <Settings className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold">基本設定</h2>
      </div>
      <div className="space-y-4 flex-grow">
        <div>
          <p className="text-sm font-bold text-slate-700 mb-1">受付ステータス</p>
          <select 
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
          >
            <option value="AVAILABLE">受付可能（通常どおり）</option>
            <option value="BUSY">混雑（納期が長くなる可能性あり）</option>
            <option value="UNAVAILABLE">受付不可（新規受付停止中）</option>
          </select>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-700 mb-1">サイト案内メッセージ</p>
          <textarea 
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none" 
            rows={2} 
            placeholder="トップページに表示する案内文..."
          ></textarea>
        </div>
      </div>
      <Button 
        onClick={handleSave} 
        disabled={isSaving}
        className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors disabled:opacity-50"
      >
        {isSaving ? "保存中..." : "更新する"}
      </Button>
    </section>
  );
}
