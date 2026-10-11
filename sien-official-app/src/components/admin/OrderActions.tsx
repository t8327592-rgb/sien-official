"use client";
import { AccessibleModal } from "@/components/ui/AccessibleModal";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

import { ORDER_STATUS_OPTIONS, normalizeOrderStatus } from "@/lib/order-status";

export function OrderActions({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(normalizeOrderStatus(currentStatus));
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("ステータスの更新に失敗しました");

      showToast("ステータスを更新しました", "success");
      router.refresh();
    } catch (error) {
      console.error(error);
      showToast("エラーが発生しました", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("削除に失敗しました");

      // 成功したら一覧へ戻る
      router.push("/admin/orders");
      router.refresh();
    } catch (error) {
      console.error(error);
      showToast("削除に失敗しました", "error");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="flex items-center gap-3 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-2 animate-in slide-in-from-bottom-5 ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <AccessibleModal label="依頼の削除確認" onClose={() => { if (!isDeleting) setShowDeleteConfirm(false); }}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertCircle className="text-red-500 w-6 h-6" />
              本当に削除しますか？
            </h3>
            <p className="text-slate-500 mb-6 leading-relaxed">
              この操作は取り消せません。データベースから完全に削除されます。
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                キャンセル
              </Button>
              <Button onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                削除する
              </Button>
            </div>
          </div>
        </AccessibleModal>
      )}

      <select aria-label="依頼のステータス"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
        disabled={isUpdating}
      >
        {ORDER_STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>

      <Button
        onClick={handleUpdateStatus}
        disabled={isUpdating || status === currentStatus}
        className="bg-orange-600 hover:bg-orange-700 text-white disabled:bg-orange-600/50"
      >
        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        更新
      </Button>

      <Button
        variant="outline"
        aria-label="依頼を削除" onClick={() => setShowDeleteConfirm(true)}
        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 ml-2"
        disabled={isUpdating || isDeleting}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
