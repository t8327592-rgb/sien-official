"use client";
import { AccessibleModal } from "@/components/ui/AccessibleModal";
import Image from "next/image";
import { SaveQueue } from "@/lib/save-queue";

import { useState, useEffect, useMemo } from "react";
import { updatePortfolio, createPortfolio, deletePortfolio, updatePortfolioOrders, bulkDeletePortfolio, bulkUpdatePublishStatus } from "@/app/actions/portfolio";
import { Button } from "@/components/ui/button";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Search, Edit, Trash2 } from "lucide-react";

type Portfolio = {
  id: string;
  title: string;
  url: string | null;
  serviceCategory: string | null;
  tags: string | null;
  isFeatured: boolean;
  showOnMix?: boolean;
  showOnOriginal?: boolean;
  isPublished: boolean;
  orderIndex: number;
};

// --- テーブル行コンポーネント ---
const SortablePortfolioRow = ({
  item,
  isCompact,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete
}: {
  item: Portfolio;
  isCompact: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (p: Portfolio) => void;
  onDelete: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : 1 };

  const getYoutubeThumbnail = (url: string | null) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
  };
  const thumbnail = getYoutubeThumbnail(item.url);

  const paddingClass = isCompact ? "py-1.5 px-3" : "py-3 px-3";

  return (
    <div ref={setNodeRef} style={style} className={`group flex items-center ${paddingClass} hover:bg-slate-50 transition-colors bg-white relative`}>
      {/* チェックボックス */}
      <div className="w-10 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(item.id)}
          className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
        />
      </div>

      {/* ドラッグハンドル */}
      <div {...attributes} {...listeners} className="w-8 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing opacity-100 flex justify-center transition-opacity">
        <GripVertical size={16} />
      </div>

      {/* サムネイル */}
      <div className="w-16">
        <div className="w-12 h-8 bg-slate-100 rounded overflow-hidden">
          {thumbnail ? (
            <Image width={120} height={80} src={thumbnail} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px]">NoImg</div>
          )}
        </div>
      </div>

      {/* タイトルとタグ */}
      <div className="flex-1 pr-4 min-w-0">
        <div className="font-bold text-slate-800 text-sm truncate" title={item.title}>{item.title}</div>
        {!isCompact && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.tags ? item.tags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
              <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded truncate max-w-full">{t}</span>
            )) : <span className="text-[10px] text-slate-400">タグなし</span>}
          </div>
        )}
      </div>

      {/* カテゴリ */}
      <div className="w-32 text-sm text-slate-600 truncate pr-2">
        {item.serviceCategory || "-"}
      </div>

      {/* ステータスバッジ */}
      <div className="w-40 flex flex-col gap-1 items-start">
        {item.isPublished ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">公開中</span>
        ) : (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">非公開</span>
        )}
        {item.isFeatured && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">代表作</span>
        )}
      </div>

      {/* アクションボタン */}
      <div className="w-24 flex justify-end gap-1 opacity-100 transition-opacity">
        <button onClick={() => onEdit(item)} className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors" title="編集">
          <Edit size={16} />
        </button>
        <button onClick={() => onDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="削除">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

// --- メインコンポーネント ---
export default function PortfolioClient({ initialData }: { initialData: Portfolio[] }) {
  const [portfolios, setPortfolios] = useState([...initialData].sort((a, b) => a.orderIndex - b.orderIndex));
  const [editingItem, setEditingItem] = useState<Portfolio | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [saveQueue] = useState(() => new SaveQueue(() => { alert("保存に失敗しました。編集内容を確認し、再度変更してください。"); setSaveStatus("idle"); }));
  useEffect(() => () => { void saveQueue.flush(); }, [saveQueue]);

  // フィルター・UIステート
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isCompact, setIsCompact] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ページネーション
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isCompact ? 50 : 20;

  const [previousInput, setPreviousInput] = useState(initialData);
  if (previousInput !== initialData) {
    setPreviousInput(initialData);
    setPortfolios([...initialData].sort((a, b) => a.orderIndex - b.orderIndex));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- 検索・フィルター処理 ---
  const filteredPortfolios = useMemo(() => {
    return portfolios.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.tags && p.tags.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCategory = categoryFilter === "ALL" || p.serviceCategory === categoryFilter;
      const matchStatus = statusFilter === "ALL"
        ? true
        : statusFilter === "PUBLISHED" ? p.isPublished
        : statusFilter === "HIDDEN" ? !p.isPublished
        : statusFilter === "FEATURED" ? p.isFeatured
        : true;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [portfolios, searchTerm, categoryFilter, statusFilter]);

  // ページネーションで切り取り
  const paginatedPortfolios = filteredPortfolios.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredPortfolios.length / itemsPerPage);

  // --- ハンドラー ---
  const triggerSaveStatus = () => {
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus(prev => prev === "saved" ? "idle" : prev), 2000);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = portfolios.findIndex(p => p.id === active.id), newIndex = portfolios.findIndex(p => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const ordered = arrayMove(portfolios, oldIndex, newIndex).map((p, orderIndex) => ({ ...p, orderIndex }));
    setPortfolios(ordered); setSaveStatus("saving");
    saveQueue.enqueue("portfolio-order", async () => {
      const result = await updatePortfolioOrders(ordered.map(p => ({ id: p.id, orderIndex: p.orderIndex })));
      if (!result.success) throw new Error(result.error || "並び順の保存に失敗しました");
      triggerSaveStatus();
    });
  };
  const handleCreateNew = async () => {
    setSaveStatus("saving");
    const res = await createPortfolio({ serviceCategory: categoryFilter !== "ALL" ? categoryFilter : "MIX" });
    if (res.success && res.data) {
      setPortfolios(prev => [...prev, res.data as Portfolio]);
      setEditingItem(res.data as Portfolio);
      triggerSaveStatus();
      // 新規追加時はフィルターを解除して見失わないようにする
      setSearchTerm("");
      setStatusFilter("ALL");
    } else {
      alert("追加に失敗しました");
      setSaveStatus("idle");
    }
  };

  const handleFieldChange = (field: keyof Portfolio, value: Portfolio[keyof Portfolio]) => {
    if (!editingItem) return;
    const updatedItem = { ...editingItem, [field]: value };
    setEditingItem(updatedItem);
    setPortfolios(prev => prev.map(p => p.id === updatedItem.id ? updatedItem : p));

    setSaveStatus("saving");
    saveQueue.enqueue(updatedItem.id, async () => {
      const res = await updatePortfolio(updatedItem.id, updatedItem);
      if (res.success) triggerSaveStatus();
      else throw new Error("Portfolio save failed");
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当に削除しますか？")) return;
    setSaveStatus("saving");
    const res = await deletePortfolio(id);
    if (res.success) {
      setPortfolios(prev => prev.filter(p => p.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      triggerSaveStatus();
    } else {
      alert("削除に失敗しました");
    }
  };

  // --- 一括操作 ---
  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedPortfolios.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`${selectedIds.length}件の実績を本当に削除しますか？`)) return;
    setSaveStatus("saving");
    const res = await bulkDeletePortfolio(selectedIds);
    if (res.success) {
      setPortfolios(prev => prev.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      triggerSaveStatus();
    } else {
      alert("一括削除に失敗しました");
    }
  };

  const handleBulkUpdateStatus = async (isPublished: boolean) => {
    setSaveStatus("saving");
    const res = await bulkUpdatePublishStatus(selectedIds, isPublished);
    if (res.success) {
      setPortfolios(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, isPublished } : p));
      setSelectedIds([]);
      triggerSaveStatus();
    } else {
      alert("ステータスの更新に失敗しました");
    }
  };

  return (
    <div className="space-y-6">
      {/* 保存トースト */}
      <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-full shadow-lg font-bold text-sm transition-all duration-300 z-[200] ${
        saveStatus === 'saving' ? 'bg-orange-600 text-white translate-y-0 opacity-100' :
        saveStatus === 'saved' ? 'bg-green-500 text-white translate-y-0 opacity-100' :
        'translate-y-4 opacity-0 pointer-events-none'
      }`}>
        {saveStatus === 'saving' ? '保存中...' : '保存しました'}
      </div>

      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-xl font-bold text-slate-800">実績一覧</h2>
          <p className="text-sm text-slate-500 mt-1">
            全 {portfolios.length} 件 （表示中: {filteredPortfolios.length} 件）
          </p>
        </div>
        <Button onClick={handleCreateNew}>＋ 新規追加</Button>
      </div>

      {/* フィルターツールバー */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* 検索 */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="タイトルやタグで検索..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>

          {/* カテゴリ */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white cursor-pointer"
          >
            <option value="ALL">すべてのカテゴリ</option>
            <option value="MIX">MIX</option>
            <option value="ORIGINAL">オリジナル</option>
          </select>

          {/* ステータス */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white cursor-pointer"
          >
            <option value="ALL">すべてのステータス</option>
            <option value="PUBLISHED">公開中</option>
            <option value="HIDDEN">非公開</option>
            <option value="FEATURED">代表作のみ</option>
          </select>
        </div>

        {/* 右側オプション */}
        <div className="flex items-center gap-4">
          <label htmlFor="portfolioclient-field-1" className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600 select-none">
            <input id="portfolioclient-field-1"
              type="checkbox"
              checked={isCompact}
              onChange={(e) => setIsCompact(e.target.checked)}
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
            />
            コンパクト表示
          </label>
        </div>
      </div>

      {/* 一括操作バー */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 bg-orange-50 border border-orange-100 p-3 rounded-lg animate-in fade-in slide-in-from-top-2">
          <span className="font-bold text-sm text-orange-800 ml-2">{selectedIds.length} 件選択中</span>
          <div className="w-px h-4 bg-orange-200"></div>
          <button onClick={() => handleBulkUpdateStatus(true)} className="text-sm font-medium text-orange-700 hover:text-orange-900 transition-colors">公開にする</button>
          <button onClick={() => handleBulkUpdateStatus(false)} className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">非公開にする</button>
          <div className="w-px h-4 bg-orange-200"></div>
          <button onClick={handleBulkDelete} className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">一括削除</button>
          <button onClick={() => setSelectedIds([])} className="ml-auto text-sm text-slate-500 hover:text-slate-700 mr-2">キャンセル</button>
        </div>
      )}

      {/* データテーブル */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {/* ヘッダー */}
        <div className="flex items-center p-3 bg-slate-50 text-xs font-bold text-slate-500 border-b border-slate-200 select-none">
          <div className="w-10 text-center">
            <input
              type="checkbox"
              checked={paginatedPortfolios.length > 0 && selectedIds.length === paginatedPortfolios.length}
              onChange={(e) => handleToggleSelectAll(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
            />
          </div>
          <div className="w-8"></div>
          <div className="w-16">画像</div>
          <div className="flex-1 pl-2">タイトル / タグ</div>
          <div className="w-32">カテゴリ</div>
          <div className="w-40">ステータス</div>
          <div className="w-24"></div>
        </div>

        {/* リスト本体 */}
        <DndContext id="admin-portfolio-sort" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={paginatedPortfolios.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="divide-y divide-slate-100">
              {paginatedPortfolios.length > 0 ? (
                paginatedPortfolios.map(p => (
                  <SortablePortfolioRow
                    key={p.id}
                    item={p}
                    isCompact={isCompact}
                    isSelected={selectedIds.includes(p.id)}
                    onToggleSelect={handleToggleSelect}
                    onEdit={setEditingItem}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  {portfolios.length === 0 ? "実績がありません。「＋ 新規追加」から追加してください。" : "条件に一致する実績がありません。"}
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>前へ</Button>
          <span className="text-sm font-medium text-slate-600 px-4">{currentPage} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>次へ</Button>
        </div>
      )}

      {/* 編集モーダル */}
      {editingItem && (
        <AccessibleModal label="実績の編集" onClose={() => { setEditingItem(null); }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center shrink-0 bg-slate-50">
              <h3 className="text-lg font-bold">実績の編集 <span className="text-sm font-normal text-slate-400 ml-2">※自動保存されます</span></h3>
              <button aria-label="編集を閉じる" onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
            </div>
            <div className="overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <label htmlFor="portfolioclient-field-2" className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700 select-none">
                    <input id="portfolioclient-field-2"
                      type="checkbox"
                      checked={editingItem.isPublished}
                      onChange={e => handleFieldChange("isPublished", e.target.checked)}
                      className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    サイトに公開する (非公開にすると表示されません)
                  </label>
                </div>

                <div>
                  <label htmlFor="portfolioclient-field-3" className="block text-sm font-medium text-slate-700 mb-1">タイトル</label>
                  <input id="portfolioclient-field-3" type="text" value={editingItem.title} onChange={e => handleFieldChange("title", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                </div>
                <div>
                  <label htmlFor="portfolioclient-field-4" className="block text-sm font-medium text-slate-700 mb-1">YouTube URL</label>
                  <input id="portfolioclient-field-4" type="url" value={editingItem.url || ""} onChange={e => handleFieldChange("url", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="portfolioclient-field-5" className="block text-sm font-medium text-slate-700 mb-1">カテゴリ</label>
                    <select id="portfolioclient-field-5" value={editingItem.serviceCategory || "MIX"} onChange={e => handleFieldChange("serviceCategory", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all bg-white">
                      <option value="MIX">MIX</option>
                      <option value="ORIGINAL">オリジナル</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="portfolioclient-field-6" className="block text-sm font-medium text-slate-700 mb-1">タグ (カンマ区切り)</label>
                    <input id="portfolioclient-field-6" type="text" placeholder="例: ボカロ, ロック" value={editingItem.tags || ""} onChange={e => handleFieldChange("tags", e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                  </div>
                </div>

                <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-lg mt-4 border border-slate-100">
                  <div className="font-bold text-sm text-slate-700 border-b border-slate-200 pb-2 mb-1">掲載場所の設定</div>
                  <label htmlFor="portfolioclient-field-7" className="flex items-center gap-2 cursor-pointer">
                    <input id="portfolioclient-field-7" type="checkbox" checked={editingItem.isFeatured} onChange={e => handleFieldChange("isFeatured", e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 transition-all cursor-pointer" />
                    <span className="text-sm font-medium text-slate-700">TOPページへ掲載</span>
                  </label>

                  {editingItem.serviceCategory === "ORIGINAL" || editingItem.serviceCategory === "オリジナル楽曲制作" ? (
                    <label htmlFor="portfolioclient-field-8" className="flex items-center gap-2 cursor-pointer">
                      <input id="portfolioclient-field-8" type="checkbox" checked={editingItem.showOnOriginal || false} onChange={e => handleFieldChange("showOnOriginal", e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 transition-all cursor-pointer" />
                      <span className="text-sm font-medium text-slate-700">オリジナルページへ掲載</span>
                    </label>
                  ) : (
                    <label htmlFor="portfolioclient-field-9" className="flex items-center gap-2 cursor-pointer">
                      <input id="portfolioclient-field-9" type="checkbox" checked={editingItem.showOnMix || false} onChange={e => handleFieldChange("showOnMix", e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 transition-all cursor-pointer" />
                      <span className="text-sm font-medium text-slate-700">MIXページへ掲載</span>
                    </label>
                  )}
                </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" onClick={() => setEditingItem(null)} className="px-8">閉じる</Button>
              </div>
            </div>
            </div>
          </div>
        </AccessibleModal>
      )}
    </div>
  );
}
