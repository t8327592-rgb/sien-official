"use client";
import type { Service } from "@prisma/client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { createService, deleteService } from "@/app/actions/cms";
import toast from "react-hot-toast";

export function ServiceList({ initialServices }: { initialServices: Service[] }) {
  const [services, setServices] = useState(initialServices);
  const [isAdding, setIsAdding] = useState(false);
  const [newSvc, setNewSvc] = useState({ name: "", category: "MIX", description: "", orderIndex: 0 });

  const [busy, setBusy] = useState(false);
  const saving = useRef(false);

  const handleAdd = async () => {
    if (saving.current) return;
    if (!newSvc.name) {
      toast.error("サービス名を入力してください");
      return;
    }
    saving.current = true; setBusy(true);
    try {
      const res = await createService(newSvc);
      setServices([...services, res.data]);
      setIsAdding(false);
      setNewSvc({ name: "", category: "MIX", description: "", orderIndex: 0 });
      toast.success("追加しました");
    } catch {
      toast.error("保存できませんでした。入力内容と接続状態を確認してください。");
    } finally { saving.current = false; setBusy(false); }
  };

  const handleDelete = async (id: string) => {
    if (saving.current || !confirm("削除しますか？")) return;
    saving.current = true; setBusy(true);
    try {
      await deleteService(id);
      setServices(services.filter(s => s.id !== id));
      toast.success("削除しました");
    } catch {
      toast.error("保存できませんでした。入力内容と接続状態を確認してください。");
    } finally { saving.current = false; setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <h2 className="text-lg font-bold">
          <button type="button" aria-expanded={isAdding} className="w-full flex justify-between items-center text-left" onClick={() => setIsAdding(!isAdding)}>＋ 新規サービス追加</button>
        </h2>
        {isAdding && (
          <div className="space-y-4 pt-4 border-t mt-4">
            <input type="text" aria-label="サービス名 (例: ボーカルMIX)" placeholder="サービス名 (例: ボーカルMIX)" className="w-full border p-2 rounded" value={newSvc.name} onChange={e => setNewSvc({...newSvc, name: e.target.value})} />
            <textarea aria-label="サービス概要" placeholder="サービス概要" className="w-full border p-2 rounded h-24" value={newSvc.description} onChange={e => setNewSvc({...newSvc, description: e.target.value})} />
            <div className="flex gap-4">
              <select aria-label="カテゴリ" className="border p-2 rounded" value={newSvc.category} onChange={e => setNewSvc({...newSvc, category: e.target.value})}>
                <option value="MIX">MIX</option>
                <option value="ORIGINAL">オリジナル楽曲</option>
                <option value="OTHER">その他</option>
              </select>
              <Button disabled={busy} onClick={handleAdd}>追加する</Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {services.map(svc => (
          <div key={svc.id} className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="font-bold text-xl">{svc.name} <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 ml-2">{svc.category}</span></div>
                <div className="text-slate-600 whitespace-pre-wrap">{svc.description}</div>
              </div>
              <div>
                <Button variant="destructive" size="sm" disabled={busy} onClick={() => handleDelete(svc.id)}>削除</Button>
              </div>
            </div>
          </div>
        ))}
        {services.length === 0 && <p className="text-slate-500">サービスがありません</p>}
      </div>
    </div>
  );
}
