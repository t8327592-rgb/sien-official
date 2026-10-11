"use client";
import { AccessibleModal } from "@/components/ui/AccessibleModal";
import { SaveQueue } from "@/lib/save-queue";
import type { Plan, Option } from "@prisma/client";
type EditablePlan = Omit<Plan, "price"> & { price: number | string | null };

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { updatePlan, createPlan, deletePlan, updatePlanOrders, updateOption, createOption, deleteOption, updateOptionOrders } from "@/app/actions/plans";
import { Button } from "@/components/ui/button";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit, Trash2 } from "lucide-react";

type RowActions = { onMove: (direction: -1 | 1) => void; canMoveUp: boolean; canMoveDown: boolean };
const rowButton = "min-h-11 min-w-11 flex items-center justify-center rounded-lg border lg:border-transparent text-slate-600 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-orange-500 disabled:opacity-30";
function ItemActions({ name, onEdit, onDelete, onMove, canMoveUp, canMoveDown }: RowActions & { name: string; onEdit: () => void; onDelete: () => void }) {
  return <div className="col-span-2 flex flex-wrap justify-end gap-1 pt-3 border-t lg:border-0 lg:pt-0 lg:shrink-0">
    <button type="button" className={rowButton} disabled={!canMoveUp} onClick={() => onMove(-1)} aria-label={`${name}を上へ移動`}>↑</button>
    <button type="button" className={rowButton} disabled={!canMoveDown} onClick={() => onMove(1)} aria-label={`${name}を下へ移動`}>↓</button>
    <button type="button" className={rowButton} onClick={onEdit} aria-label={`${name}を編集`} title="編集"><Edit size={18} /></button>
    <button type="button" className={rowButton} onClick={onDelete} aria-label={`${name}を削除`} title="削除"><Trash2 size={18} /></button>
  </div>;
}
const SortablePlanListItem = ({ p, onEdit, onDelete, ...actions }: RowActions & { p: EditablePlan; onEdit: (p: EditablePlan) => void; onDelete: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : 1 };
  return <div ref={setNodeRef} style={style} className="grid grid-cols-[minmax(0,1fr)_auto] lg:flex gap-3 lg:items-center p-4 bg-white hover:bg-slate-50 relative min-w-0">
    <button type="button" {...attributes} {...listeners} aria-label={`${p.name}をドラッグして並び替え`} className="hidden lg:flex w-8 shrink-0 justify-center text-slate-500 cursor-grab touch-none focus-visible:outline-2"><GripVertical size={18} /></button>
    <div className="col-span-2 min-w-0 lg:flex-1">
      <h3 className="font-bold text-slate-800 text-base break-words">{p.name}{!p.isActive && <span className="ml-2 text-xs font-normal text-slate-600">非公開</span>}</h3>
      <p className="text-sm text-slate-500 line-clamp-2 lg:line-clamp-1 break-words">{p.description || "説明なし"}</p>
    </div>
    <div className="lg:w-28 lg:shrink-0 lg:text-right font-bold text-slate-700"><span className="block text-xs font-normal text-slate-500 lg:hidden">料金</span>{p.price !== null && p.price !== "" ? `¥${Number(p.price).toLocaleString()}` : "要相談"}</div>
    <div className="lg:w-36 lg:shrink-0 text-right text-sm text-slate-600"><span className="block text-xs text-slate-500 lg:hidden">納期 / 修正</span><div>{p.period || "—"}</div><div className="text-xs">{p.revisions || "—"}</div></div>
    <ItemActions name={p.name} onEdit={() => onEdit(p)} onDelete={() => onDelete(p.id)} {...actions} />
  </div>;
};
const SortableOptionListItem = ({ opt, onEdit, onDelete, ...actions }: RowActions & { opt: Option; onEdit: (o: Option) => void; onDelete: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: opt.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : 1 };
  return <div ref={setNodeRef} style={style} className="grid grid-cols-[minmax(0,1fr)_auto] lg:flex gap-3 lg:items-center p-4 bg-white hover:bg-slate-50 relative min-w-0">
    <button type="button" {...attributes} {...listeners} aria-label={`${opt.name}をドラッグして並び替え`} className="hidden lg:flex w-8 shrink-0 justify-center text-slate-500 cursor-grab touch-none focus-visible:outline-2"><GripVertical size={18} /></button>
    <div className="col-span-2 min-w-0 lg:flex-1"><h3 className="font-bold text-slate-800 text-base break-words">{opt.name}{!opt.isActive && <span className="ml-2 text-xs font-normal text-slate-600">非公開</span>}</h3><p className="text-sm text-slate-500 line-clamp-2 lg:line-clamp-1 break-words">{opt.description || "説明なし"}</p></div>
    <div className="col-span-2 lg:w-36 lg:shrink-0 lg:text-right font-bold text-orange-600 break-words">{opt.priceText}</div>
    <ItemActions name={opt.name} onEdit={() => onEdit(opt)} onDelete={() => onDelete(opt.id)} {...actions} />
  </div>;
};
// --- Main Component ---

export default function PlansOptionsClient({ initialPlans, initialOptions }: { initialPlans: Plan[], initialOptions: Option[] }) {
  const [plans, setPlans] = useState<EditablePlan[]>([...initialPlans].sort((a, b) => a.orderIndex - b.orderIndex));
  const [options, setOptions] = useState([...initialOptions].sort((a, b) => a.orderIndex - b.orderIndex));

  const [activePlanTab, setActivePlanTab] = useState<"MIX" | "ORIGINAL">("MIX");
  const [activeOptionTab, setActiveOptionTab] = useState<"MIX" | "ORIGINAL">("MIX");

  const [editingPlan, setEditingPlan] = useState<EditablePlan | null>(null);
  const [editingOption, setEditingOption] = useState<Option | null>(null);
  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const [saveQueue] = useState(() => new SaveQueue(() => { toast.error("保存に失敗しました。編集内容を確認し、再度変更してください。"); setSaveStatus("idle"); }));
  useEffect(() => () => { void saveQueue.flush(); }, [saveQueue]);

  const [previousInput, setPreviousInput] = useState({ plans: initialPlans, options: initialOptions });
  if (previousInput.plans !== initialPlans || previousInput.options !== initialOptions) {
    setPreviousInput({ plans: initialPlans, options: initialOptions });
    setPlans([...initialPlans].sort((a, b) => a.orderIndex - b.orderIndex));
    setOptions([...initialOptions].sort((a, b) => a.orderIndex - b.orderIndex));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Auto Save Handlers ---
  const triggerSaveStatus = () => {
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus(prev => prev === "saved" ? "idle" : prev), 2000);
  };

  const handlePlanFieldChange = (field: keyof Plan, value: string | number | null) => {
    if (editingPlan && !submittingRef.current) setEditingPlan({ ...editingPlan, [field]: value });
  };
  const handleOptionFieldChange = (field: keyof Option, value: string) => {
    if (editingOption && !submittingRef.current) setEditingOption({ ...editingOption, [field]: value });
  };
  const closePlan = () => { if (!submittingRef.current) setEditingPlan(null); };
  const closeOption = () => { if (!submittingRef.current) setEditingOption(null); };
  const savePlan = async (publish: boolean) => {
    if (!editingPlan || submittingRef.current) return;
    submittingRef.current = true; setIsSubmitting(true);
    try {
      const input = { ...editingPlan, isActive: publish };
      const result = editingPlan.id ? await updatePlan(editingPlan.id, input) : await createPlan(input);
      if (!result.success || !result.data) throw new Error(result.error || "保存に失敗しました");
      const saved = result.data;
      setPlans(previous => [...previous.filter(plan => plan.id !== saved.id), saved]);
      setEditingPlan(null); triggerSaveStatus();
      toast.success(publish ? "プランを公開しました" : "プランを非公開で保存しました");
    } catch (error) { toast.error(error instanceof Error ? error.message : "保存に失敗しました"); }
    finally { submittingRef.current = false; setIsSubmitting(false); }
  };
  const saveOption = async (publish: boolean) => {
    if (!editingOption || submittingRef.current) return;
    submittingRef.current = true; setIsSubmitting(true);
    try {
      const input = { ...editingOption, isActive: publish };
      const result = editingOption.id ? await updateOption(editingOption.id, input) : await createOption(input);
      if (!result.success || !result.data) throw new Error(result.error || "保存に失敗しました");
      const saved = result.data;
      setOptions(previous => [...previous.filter(option => option.id !== saved.id), saved]);
      setEditingOption(null); triggerSaveStatus();
      toast.success(publish ? "オプションを公開しました" : "オプションを非公開で保存しました");
    } catch (error) { toast.error(error instanceof Error ? error.message : "保存に失敗しました"); }
    finally { submittingRef.current = false; setIsSubmitting(false); }
  };

  // --- DND Handlers ---
  const reorderPlan = (active: { id: string | number }, over: { id: string | number } | null) => {
    if (!over || active.id === over.id) return;
    const visible = plans.filter(p => p.category === activePlanTab).sort((a, b) => a.orderIndex - b.orderIndex);
    const oldIndex = visible.findIndex(p => p.id === active.id), newIndex = visible.findIndex(p => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const ordered = arrayMove(visible, oldIndex, newIndex).map((p, orderIndex) => ({ ...p, orderIndex }));
    setPlans([...ordered, ...plans.filter(p => p.category !== activePlanTab)]);
    setSaveStatus("saving");
    saveQueue.enqueue("plan-order:" + activePlanTab, async () => {
      const result = await updatePlanOrders(ordered.map(p => ({ id: p.id, orderIndex: p.orderIndex })));
      if (!result.success) throw new Error(result.error || "並び順の保存に失敗しました");
      triggerSaveStatus();
    });
  };
  const reorderOption = (active: { id: string | number }, over: { id: string | number } | null) => {
    if (!over || active.id === over.id) return;
    const visible = options.filter(p => p.category === activeOptionTab || p.category === "COMMON").sort((a, b) => a.orderIndex - b.orderIndex);
    const oldIndex = visible.findIndex(p => p.id === active.id), newIndex = visible.findIndex(p => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const ordered = arrayMove(visible, oldIndex, newIndex).map((p, orderIndex) => ({ ...p, orderIndex }));
    setOptions([...ordered, ...options.filter(p => !(p.category === activeOptionTab || p.category === "COMMON"))]);
    setSaveStatus("saving");
    saveQueue.enqueue("option-order:" + activeOptionTab, async () => {
      const result = await updateOptionOrders(ordered.map(p => ({ id: p.id, orderIndex: p.orderIndex })));
      if (!result.success) throw new Error(result.error || "並び順の保存に失敗しました");
      triggerSaveStatus();
    });
  };
  // --- Create / Delete Handlers ---
  const handleCreatePlan = () => {
    const now = new Date();
    setEditingPlan({ id: "", name: "", category: activePlanTab, price: null, description: "", period: "", revisions: "", features: null, isActive: false, orderIndex: 0, createdAt: now, updatedAt: now });
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

  const handleCreateOption = () => {
    const now = new Date();
    setEditingOption({ id: "", name: "", category: activeOptionTab, priceText: "", description: "", isActive: false, orderIndex: 0, createdAt: now, updatedAt: now });
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

  const filteredPlans = plans.filter(p => p.category === activePlanTab).sort((a,b) => a.orderIndex - b.orderIndex);
  const filteredOptions = options.filter(o => o.category === activeOptionTab || o.category === "COMMON").sort((a,b) => a.orderIndex - b.orderIndex);

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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">料金プラン</h2>
            <p className="text-slate-500 text-sm mt-1">公開ページの料金プランとして表示されます。ドラッグまたは上下ボタンで並び替えできます。</p>
          </div>
          <Button onClick={handleCreatePlan}>＋ プラン追加</Button>
        </div>

        {/* タブUI */}
        <div className="flex overflow-x-auto border-b border-slate-200 mb-6">
          <button
            className={`whitespace-nowrap px-3 sm:px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activePlanTab === 'MIX' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActivePlanTab('MIX')}
          >
            MIXプラン
          </button>
          <button
            className={`whitespace-nowrap px-3 sm:px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activePlanTab === 'ORIGINAL' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActivePlanTab('ORIGINAL')}
          >
            オリジナルプラン
          </button>
        </div>

        {/* テーブル風リスト */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* ヘッダー行 */}
          <div className="hidden lg:flex items-center p-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <div className="w-8"></div>
            <div className="flex-1 pl-2">プラン名 / 説明</div>
            <div className="w-32 text-right pr-6">料金</div>
            <div className="w-48 text-right pr-6">納期 / 修正</div>
            <div className="w-24"></div>
          </div>

          <DndContext id="admin-plans-sort" sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event: DragEndEvent) => reorderPlan(event.active, event.over)}>
            <SortableContext items={filteredPlans.map(p => p.id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-slate-100">
                {filteredPlans.length > 0 ? (
                  filteredPlans.map((p, index) => (
                    <SortablePlanListItem key={p.id} p={p} onEdit={setEditingPlan} onDelete={handleDeletePlan} canMoveUp={index > 0} canMoveDown={index < filteredPlans.length - 1} onMove={direction => reorderPlan({ id: p.id }, filteredPlans[index + direction] ? { id: filteredPlans[index + direction].id } : null)} />
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">オプション</h2>
            <p className="text-slate-500 text-sm mt-1">エンコードや特急料金などの追加オプションです。ドラッグまたは上下ボタンで並び替えできます。</p>
          </div>
          <Button onClick={handleCreateOption}>＋ オプション追加</Button>
        </div>

        {/* タブUI */}
        <div className="flex overflow-x-auto border-b border-slate-200 mb-6">
          <button
            className={`whitespace-nowrap px-3 sm:px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeOptionTab === 'MIX' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveOptionTab('MIX')}
          >
            MIXオプション
          </button>
          <button
            className={`whitespace-nowrap px-3 sm:px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeOptionTab === 'ORIGINAL' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveOptionTab('ORIGINAL')}
          >
            オリジナルオプション
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* ヘッダー行 */}
          <div className="hidden lg:flex items-center p-4 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <div className="w-8"></div>
            <div className="flex-1 pl-2">オプション名 / 説明</div>
            <div className="w-48 text-right pr-6">料金</div>
            <div className="w-24"></div>
          </div>

          <DndContext id="admin-options-sort" sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event: DragEndEvent) => reorderOption(event.active, event.over)}>
            <SortableContext items={filteredOptions.map(o => o.id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-slate-100">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt, index) => (
                    <SortableOptionListItem key={opt.id} opt={opt} onEdit={setEditingOption} onDelete={handleDeleteOption} canMoveUp={index > 0} canMoveDown={index < filteredOptions.length - 1} onMove={direction => reorderOption({ id: opt.id }, filteredOptions[index + direction] ? { id: filteredOptions[index + direction].id } : null)} />
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
        <AccessibleModal label="プランの編集" onClose={closePlan}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-lg font-bold">プランの編集 <span className="text-sm font-normal text-slate-400 ml-2">※保存するまで公開内容は変わりません</span></h3>
              <button aria-label="編集を閉じる" disabled={isSubmitting} onClick={closePlan} className="text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="plansoptionsclient-field-1" className="block text-sm font-medium text-slate-700 mb-1">カテゴリ</label>
                  <select disabled={isSubmitting} id="plansoptionsclient-field-1" value={editingPlan.category} onChange={e => handlePlanFieldChange("category", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white transition-all">
                    <option value="MIX">MIX・マスタリング</option>
                    <option value="ORIGINAL">オリジナル楽曲制作</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="plansoptionsclient-field-2" className="block text-sm font-medium text-slate-700 mb-1">プラン名</label>
                  <input disabled={isSubmitting} id="plansoptionsclient-field-2" type="text" value={editingPlan.name} onChange={e => handlePlanFieldChange("name", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label htmlFor="plansoptionsclient-field-3" className="block text-sm font-medium text-slate-700 mb-1">料金 (円・半角数字のみ・未定の場合は空欄)</label>
                <input disabled={isSubmitting} id="plansoptionsclient-field-3" type="number" value={editingPlan.price ?? ""} onChange={e => handlePlanFieldChange("price", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="plansoptionsclient-field-4" className="block text-sm font-medium text-slate-700 mb-1">目安納期</label>
                  <input disabled={isSubmitting} id="plansoptionsclient-field-4" type="text" placeholder="例: 7日〜" value={editingPlan.period || ""} onChange={e => handlePlanFieldChange("period", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                </div>
                <div className="flex-1">
                  <label htmlFor="plansoptionsclient-field-5" className="block text-sm font-medium text-slate-700 mb-1">無料修正</label>
                  <input disabled={isSubmitting} id="plansoptionsclient-field-5" type="text" placeholder="例: 5回" value={editingPlan.revisions || ""} onChange={e => handlePlanFieldChange("revisions", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label htmlFor="plansoptionsclient-field-6" className="block text-sm font-medium text-slate-700 mb-1">プラン説明文</label>
                <textarea disabled={isSubmitting} id="plansoptionsclient-field-6" rows={4} value={editingPlan.description || ""} onChange={e => handlePlanFieldChange("description", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"></textarea>
              </div>

              <div className="pt-4 flex flex-wrap justify-end gap-3 shrink-0">
                <Button type="button" variant="outline" disabled={isSubmitting} onClick={closePlan}>取消</Button>
                <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => void savePlan(false)}>{isSubmitting ? "保存中…" : editingPlan.isActive ? "非公開で保存" : "下書き保存"}</Button>
                <Button type="button" disabled={isSubmitting} onClick={() => void savePlan(true)}>公開して保存</Button>
              </div>
            </div>
          </div>
        </AccessibleModal>
      )}

      {/* オプション編集用モーダル */}
      {editingOption && (
        <AccessibleModal label="オプションの編集" onClose={closeOption}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-lg font-bold">オプションの編集 <span className="text-sm font-normal text-slate-400 ml-2">※保存するまで公開内容は変わりません</span></h3>
              <button aria-label="編集を閉じる" disabled={isSubmitting} onClick={closeOption} className="text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label htmlFor="plansoptionsclient-field-7" className="block text-sm font-medium text-slate-700 mb-1">カテゴリ</label>
                <select disabled={isSubmitting} id="plansoptionsclient-field-7" value={editingOption.category || "MIX"} onChange={e => handleOptionFieldChange("category", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white transition-all">
                  <option value="MIX">MIXオプション</option>
                  <option value="ORIGINAL">オリジナルオプション</option>
                  <option value="COMMON">共通（両方に表示）</option>
                </select>
              </div>
              <div>
                <label htmlFor="plansoptionsclient-field-8" className="block text-sm font-medium text-slate-700 mb-1">オプション名</label>
                <input disabled={isSubmitting} id="plansoptionsclient-field-8" type="text" value={editingOption.name} onChange={e => handleOptionFieldChange("name", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="plansoptionsclient-field-9" className="block text-sm font-medium text-slate-700 mb-1">料金テキスト (例: 要相談, 2,000円)</label>
                <input disabled={isSubmitting} id="plansoptionsclient-field-9" type="text" value={editingOption.priceText} onChange={e => handleOptionFieldChange("priceText", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
              </div>
              <div>
                <label htmlFor="plansoptionsclient-field-10" className="block text-sm font-medium text-slate-700 mb-1">説明文</label>
                <textarea disabled={isSubmitting} id="plansoptionsclient-field-10" rows={4} value={editingOption.description || ""} onChange={e => handleOptionFieldChange("description", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"></textarea>
              </div>

              <div className="pt-4 flex flex-wrap justify-end gap-3 shrink-0">
                <Button type="button" variant="outline" disabled={isSubmitting} onClick={closeOption}>取消</Button>
                <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => void saveOption(false)}>{isSubmitting ? "保存中…" : editingOption.isActive ? "非公開で保存" : "下書き保存"}</Button>
                <Button type="button" disabled={isSubmitting} onClick={() => void saveOption(true)}>公開して保存</Button>
              </div>
            </div>
          </div>
        </AccessibleModal>
      )}
    </div>
  );
}
