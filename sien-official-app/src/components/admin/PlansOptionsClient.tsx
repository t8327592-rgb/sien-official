"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { updatePlan, createPlan, deletePlan, updatePlanOrders, updateOption, createOption, deleteOption, updateOptionOrders } from "@/app/actions/plans";
import { Button } from "@/components/ui/button";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit, Trash2 } from "lucide-react";

// --- Sortable Components ---

const SortablePlanListItem = ({ p, onEdit, onDelete }: { p: any, onEdit: (p: any) => void, onDelete: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="group flex items-center p-4 bg-white hover:bg-slate-50 transition-colors relative">
      {/* ドラッグハンドル */}
      <div {...attributes} {...listeners} className="w-8 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
        <GripVertical size={18} />
      </div>

      {/* メイン情報 */}
      <div className="flex-1 pr-6 pl-2">
        <h3 className="font-bold text-slate-800 text-base">{p.name}</h3>
        <p className="text-sm text-slate-500 line-clamp-1">{p.description || "説明なし"}</p>
      </div>

      {/* 料金 */}
      <div className="w-32 text-right pr-6 font-bold text-slate-700">
        {p.price ? `¥${p.price.toLocaleString()}` : "要相談"}
      </div>

      {/* 納期・修正 */}
      <div className="w-48 text-right pr-6 text-sm text-slate-500 flex flex-col items-end">
        <div>{p.period || "-"}</div>
        <div className="text-xs">{p.revisions || "-"}</div>
      </div>

      {/* アクション */}
      <div className="w-24 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(p)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors" title="編集">
          <Edit size={16} />
        </button>
        <button onClick={() => onDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="削除">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const SortableOptionListItem = ({ opt, onEdit, onDelete }: { opt: any, onEdit: (o: any) => void, onDelete: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: opt.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="group flex items-center p-4 bg-white hover:bg-slate-50 transition-colors relative">
      {/* ドラッグハンドル */}
      <div {...attributes} {...listeners} className="w-8 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
        <GripVertical size={18} />
      </div>

      {/* メイン情報 */}
      <div className="flex-1 pr-6 pl-2">
        <h3 className="font-bold text-slate-800 text-base">{opt.name}</h3>
        <p className="text-sm text-slate-500 line-clamp-1">{opt.description || "説明なし"}</p>
      </div>

      {/* 料金テキスト */}
      <div className="w-48 text-right pr-6 font-bold text-orange-600">
        {opt.priceText}
      </div>

      {/* アクション */}
      <div className="w-24 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(opt)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors" title="編集">
          <Edit size={16} />
        </button>
        <button onClick={() => onDelete(opt.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="削除">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

// --- Main Component ---

export default function PlansOptionsClient({ initialPlans, initialOptions }: { initialPlans: any[], initialOptions: any[] }) {
  const [plans, setPlans] = useState(initialPlans.sort((a, b) => a.orderIndex - b.orderIndex));
  const [options, setOptions] = useState(initialOptions.sort((a, b) => a.orderIndex - b.orderIndex));

  const [activePlanTab, setActivePlanTab] = useState<"MIX" | "ORIGINAL">("MIX");

  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [editingOption, setEditingOption] = useState<any | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setPlans(initialPlans.sort((a, b) => a.orderIndex - b.orderIndex));
  }, [initialPlans]);

  useEffect(() => {
    setOptions(initialOptions.sort((a, b) => a.orderIndex - b.orderIndex));
  }, [initialOptions]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Auto Save Handlers ---
  const triggerSaveStatus = () => {
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus(prev => prev === "saved" ? "idle" : prev), 2000);
  };

  const handlePlanFieldChange = (field: string, value: any) => {
    if (!editingPlan) return;
    const updatedPlan = { ...editingPlan, [field]: value };
    setEditingPlan(updatedPlan);
    setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));

    setSaveStatus("saving");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      const res = await updatePlan(updatedPlan.id, updatedPlan);
      if (res.success) triggerSaveStatus();
      else toast.error("プランの保存に失敗しました");
    }, 800);
  };

  const handleOptionFieldChange = (field: string, value: any) => {
    if (!editingOption) return;
    const updatedOption = { ...editingOption, [field]: value };
    setEditingOption(updatedOption);
    setOptions(prev => prev.map(o => o.id === updatedOption.id ? updatedOption : o));

    setSaveStatus("saving");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      const res = await updateOption(updatedOption.id, updatedOption);
      if (res.success) triggerSaveStatus();
      else toast.error("オプションの保存に失敗しました");
    }, 800);
  };

  // --- DND Handlers ---
  const handleDragEndPlan = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPlans((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex).map((item, index) => ({ ...item, orderIndex: index }));
        setSaveStatus("saving");
        updatePlanOrders(newArray.map(p => ({ id: p.id, orderIndex: p.orderIndex })))
          .then(() => triggerSaveStatus());
        return newArray;
      });
    }
  };

  const handleDragEndOption = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOptions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex).map((item, index) => ({ ...item, orderIndex: index }));
        setSaveStatus("saving");
        updateOptionOrders(newArray.map(o => ({ id: o.id, orderIndex: o.orderIndex })))
          .then(() => triggerSaveStatus());
        return newArray;
      });
    }
  };

  // --- Create / Delete Handlers ---
  const handleCreatePlan = async () => {
    setSaveStatus("saving");
    // 現在選択中のタブのカテゴリをデフォルトにする
    const res = await createPlan({ category: activePlanTab });
    if (res.success && res.data) {
      setPlans(prev => [...prev, res.data]);
      setEditingPlan(res.data);
      triggerSaveStatus();
    } else {
      toast.error("追加に失敗しました");
      setSaveStatus("idle");
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return;
    setSaveStatus("saving");
    const res = await deletePlan(id);
    if (res.success) {
      setPlans(prev => prev.filter(p => p.id !== id));
      triggerSaveStatus();
    } else {
      toast.error("削除に失敗しました");
      setSaveStatus("idle");
    }
  };

  const handleCreateOption = async () => {
    setSaveStatus("saving");
    const res = await createOption({});
    if (res.success && res.data) {
      setOptions(prev => [...prev, res.data]);
      setEditingOption(res.data);
      triggerSaveStatus();
    } else {
      toast.error("追加に失敗しました");
      setSaveStatus("idle");
    }
  };

  const handleDeleteOption = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return;
    setSaveStatus("saving");
    const res = await deleteOption(id);
    if (res.success) {
      setOptions(prev => prev.filter(o => o.id !== id));
      triggerSaveStatus();
    } else {
      toast.error("削除に失敗しました");
      setSaveStatus("idle");
    }
  };

  const filteredPlans = plans.filter(p => p.category === activePlanTab);

  return (
    <div className="space-y-12">
      {/* 保存状態のトースト通知 */}
      <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-full shadow-lg font-bold text-sm transition-all duration-300 z-[200] ${
        saveStatus === 'saving' ? 'bg-orange-600 text-white translate-y-0 opacity-100' :
        saveStatus === 'saved' ? 'bg-green-500 text-white translate-y-0 opacity-100' :
        'translate-y-4 opacity-0 pointer-events-none'
      }`}>
        {saveStatus === 'saving' ? '保存中...' : '保存しました'}
      </div>

      {/* 料金プラン管理 */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">料金プラン</h2>
            <p className="text-slate-500 text-sm mt-1">公開ページの料金プランとして表示されます。ドラッグで並び替えできます。</p>
          </div>
          <Button onClick={handleCreatePlan}>＋ プラン追加</Button>
        </div>

        {/* タブUI */}
        <div className="flex border-b border-slate-200 mb-6">
          <button 
            className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activePlanTab === 'MIX' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActivePlanTab('MIX')}
          >
            MIXプラン
          </button>
          <button 
            className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activePlanTab === 'ORIGINAL' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActivePlanTab('ORIGINAL')}
          >
            オリジナルプラン
          </button>
        </div>

        {/* テーブル風リスト */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* ヘッダー行 */}
          <div className="flex items-center p-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <div className="w-8"></div>
            <div className="flex-1 pl-2">プラン名 / 説明</div>
            <div className="w-32 text-right pr-6">料金</div>
            <div className="w-48 text-right pr-6">納期 / 修正</div>
            <div className="w-24"></div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndPlan}>
            <SortableContext items={filteredPlans.map(p => p.id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-slate-100">
                {filteredPlans.length > 0 ? (
                  filteredPlans.map(p => (
                    <SortablePlanListItem key={p.id} p={p} onEdit={setEditingPlan} onDelete={handleDeletePlan} />
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    プランがありません。「＋ プラン追加」から追加してください。
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </section>

      {/* オプション管理 */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">オプション</h2>
            <p className="text-slate-500 text-sm mt-1">エンコードや特急料金などの追加オプションです。ドラッグで並び替えできます。</p>
          </div>
          <Button onClick={handleCreateOption}>＋ オプション追加</Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* ヘッダー行 */}
          <div className="flex items-center p-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <div className="w-8"></div>
            <div className="flex-1 pl-2">オプション名 / 説明</div>
            <div className="w-48 text-right pr-6">料金</div>
            <div className="w-24"></div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndOption}>
            <SortableContext items={options.map(o => o.id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-slate-100">
                {options.length > 0 ? (
                  options.map(opt => (
                    <SortableOptionListItem key={opt.id} opt={opt} onEdit={setEditingOption} onDelete={handleDeleteOption} />
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    オプションがありません。「＋ オプション追加」から追加してください。
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </section>

      {/* プラン編集用モーダル */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-lg font-bold">プランの編集 <span className="text-sm font-normal text-slate-400 ml-2">※自動保存されます</span></h3>
              <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">カテゴリ</label>
                  <select value={editingPlan.category} onChange={e => handlePlanFieldChange("category", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white transition-all">
                    <option value="MIX">MIX・マスタリング</option>
                    <option value="ORIGINAL">オリジナル楽曲制作</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">プラン名</label>
                  <input type="text" value={editingPlan.name} onChange={e => handlePlanFieldChange("name", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">料金 (円・半角数字のみ・未定の場合は空欄)</label>
                <input type="number" value={editingPlan.price || ""} onChange={e => handlePlanFieldChange("price", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">目安納期</label>
                  <input type="text" placeholder="例: 7日〜" value={editingPlan.period || ""} onChange={e => handlePlanFieldChange("period", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">無料修正</label>
                  <input type="text" placeholder="例: 5回" value={editingPlan.revisions || ""} onChange={e => handlePlanFieldChange("revisions", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">プラン説明文</label>
                <textarea rows={4} value={editingPlan.description || ""} onChange={e => handlePlanFieldChange("description", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"></textarea>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 shrink-0">
                <Button type="button" onClick={() => setEditingPlan(null)} className="px-8">閉じる</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* オプション編集用モーダル */}
      {editingOption && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-lg font-bold">オプションの編集 <span className="text-sm font-normal text-slate-400 ml-2">※自動保存されます</span></h3>
              <button onClick={() => setEditingOption(null)} className="text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">オプション名</label>
                <input type="text" value={editingOption.name} onChange={e => handleOptionFieldChange("name", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">料金テキスト (例: 要相談, 2,000円)</label>
                <input type="text" value={editingOption.priceText} onChange={e => handleOptionFieldChange("priceText", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">説明文</label>
                <textarea rows={4} value={editingOption.description || ""} onChange={e => handleOptionFieldChange("description", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"></textarea>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 shrink-0">
                <Button type="button" onClick={() => setEditingOption(null)} className="px-8">閉じる</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
