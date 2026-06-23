"use client";

import { useMemo, useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { differenceInDays, isToday, isPast } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, MessageCircle, AlertCircle } from "lucide-react";

const COLUMNS = [
  "未対応",
  "見積もり送信",
  "素材待ち",
  "制作中",
  "初稿提出",
  "修正対応",
  "納品完了",
  "アーカイブ",
];

type Customer = {
  id: string;
  name: string;
  service: string;
  status: string;
  deadline?: string | null;
  price?: number | null;
  tags?: string | null;
  memo?: string | null;
  message?: string;
  createdAt: string;
};

// ==========================================
// Card Component
// ==========================================
function KanbanCard({ customer }: { customer: Customer }) {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: customer.id, data: { type: "Customer", customer } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // 納期の色分け
  let deadlineColor = "bg-green-100 text-green-700";
  let deadlineText = "設定なし";

  if (customer.deadline) {
    const d = new Date(customer.deadline);
    const days = differenceInDays(d, new Date());
    
    if (isPast(d) && !isToday(d)) {
      deadlineColor = "bg-red-500 text-white";
      deadlineText = "期限超過";
    } else if (isToday(d)) {
      deadlineColor = "bg-red-500 text-white";
      deadlineText = "今日納品";
    } else if (days <= 3) {
      deadlineColor = "bg-yellow-100 text-yellow-800 border-yellow-300";
      deadlineText = `あと${days}日`;
    } else {
      deadlineText = `${d.getMonth() + 1}/${d.getDate()} 納品`;
    }
  }

  const tags = customer.tags ? customer.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative flex flex-col gap-2 p-4 bg-white border rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-orange-300 hover:shadow-md transition-all ${
        isDragging ? "opacity-50 ring-2 ring-orange-500" : "border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-gray-800 text-sm">{customer.name}</h4>
        {customer.deadline && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${deadlineColor}`}>
            {deadlineText}
          </span>
        )}
      </div>
      
      <div className="text-xs font-bold text-gray-500 truncate" title={customer.service}>
        {customer.service}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {tags.map((t, i) => (
            <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              {t}
            </span>
          ))}
        </div>
      )}

      {(customer.price || customer.memo) && (
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 font-bold">
          {customer.price && <span>¥{customer.price.toLocaleString()}</span>}
          {customer.memo && <span className="flex items-center gap-1 text-orange-500"><MessageCircle size={12} /> メモあり</span>}
        </div>
      )}
      
      {/* 詳細へ飛ぶための明示的なボタン */}
      <button 
        type="button"
        onPointerDown={(e) => e.stopPropagation()} 
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/admin/customers/${customer.id}`);
        }}
        className="mt-2 w-full py-2 bg-gray-50 hover:bg-orange-50 text-orange-600 font-bold text-xs rounded-lg transition-colors border border-gray-100"
      >
        詳細を見る
      </button>
    </div>
  );
}

// ==========================================
// Column Component
// ==========================================
function KanbanColumn({ title, customers }: { title: string; customers: Customer[] }) {
  const { setNodeRef } = useSortable({
    id: title,
    data: { type: "Column", title },
  });

  return (
    <div className="flex flex-col flex-shrink-0 w-72 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-100/50 flex justify-between items-center">
        <h3 className="font-bold text-gray-700 text-sm">{title}</h3>
        <span className="bg-white text-gray-500 text-xs font-bold px-2 py-1 rounded-full border border-gray-200 shadow-sm">
          {customers.length}
        </span>
      </div>
      
      <div ref={setNodeRef} className="flex-1 p-3 flex flex-col gap-3 min-h-[150px] overflow-y-auto">
        <SortableContext items={customers.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {customers.map((c) => (
            <KanbanCard key={c.id} customer={c} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

// ==========================================
// Board Component
// ==========================================
export default function KanbanBoard({ initialData, onStatusChange }: { initialData: Customer[], onStatusChange: (id: string, newStatus: string) => void }) {
  const [customers, setCustomers] = useState<Customer[]>(initialData);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    setCustomers(initialData);
  }, [initialData]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "Customer") {
      setActiveCustomer(active.data.current.customer);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCustomer(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeCustomer = customers.find((c) => c.id === activeId);
    if (!activeCustomer) return;

    // もし別のカードの上にドロップされたら、そのカードのステータスを取得
    // もしカラム上にドロップされたら、そのカラム名を取得
    const overData = over.data.current;
    let newStatus = activeCustomer.status;

    if (overData?.type === "Column") {
      newStatus = overData.title;
    } else if (overData?.type === "Customer") {
      newStatus = overData.customer.status;
    }

    if (activeCustomer.status !== newStatus) {
      // 楽観的UI更新
      setCustomers((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, status: newStatus } : c))
      );
      // 親に通知
      onStatusChange(activeId, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-8 h-[calc(100vh-200px)]">
        {COLUMNS.map((col) => (
          <KanbanColumn 
            key={col} 
            title={col} 
            customers={customers.filter(c => c.status === col || (!COLUMNS.includes(c.status) && col === '未対応'))} 
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeCustomer ? <KanbanCard customer={activeCustomer} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
