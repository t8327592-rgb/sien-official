"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import KanbanBoard from "@/components/admin/KanbanBoard";

export default function CustomersAdminPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    const res = await fetch("/api/customers");
    const data = await res.json();
    setCustomers(data);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch("/api/customers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    // fetchCustomers(); // KanbanBoardが楽観的更新をするので再フェッチは不要か、バックグラウンドで行う
  };

  if (loading) return <div className="p-8">読み込み中...</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 mb-2">依頼管理 (Kanban)</h1>
        <p className="text-gray-500 font-medium">制作フローを見失わない、ドラッグ＆ドロップ可能な案件ボードです。カードをクリックすると詳細画面が開きます。</p>
      </div>

      <div className="flex-1">
        <KanbanBoard initialData={customers} onStatusChange={handleStatusChange} />
      </div>
    </div>
  );
}
