"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AccessibleModal } from "@/components/ui/AccessibleModal";

export function NotificationRetryButton({ id, reference, kind }: { id: string; reference: string; kind: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const inFlight = useRef(false);
  const retry = async () => {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/notifications/${encodeURIComponent(id)}/retry`, { method: "POST", signal: AbortSignal.timeout(25000) });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) throw new Error(result?.error || "再試行に失敗しました。");
      setMessage(result.message); setConfirming(false); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "通信に失敗しました。配送状態を確認してください。"); }
    finally { inFlight.current = false; setBusy(false); }
  };
  return <div className="space-y-2">
    <button type="button" onClick={() => { setMessage(""); setConfirming(true); }} className="rounded-lg border px-3 py-2 text-orange-700 font-bold focus-visible:outline-2">個別に再試行</button>
    {!confirming && message && <p role="status" className="text-sm break-words">{message}</p>}
    {confirming && <AccessibleModal label="通知の再試行確認" onClose={() => { if (!busy) setConfirming(false); }}>
      <div className="bg-white rounded-xl p-5 max-w-md w-full space-y-4 break-words">
        <h2 className="text-lg font-bold">通知を1件再試行しますか？</h2><p>対象：{reference}<br />通知種別：{kind}</p>
        <p className="text-sm text-slate-600">以前の送信が相手側で受理された後に通信が切れた場合、同じ通知が届く可能性があります。送信事業者の到達状況も確認してください。</p>
        {message && <p role="alert" className="text-sm text-red-700">{message}</p>}
        <div className="flex flex-wrap gap-3 justify-end"><button disabled={busy} onClick={() => setConfirming(false)} className="border rounded-lg px-4 py-2">取消</button><button disabled={busy} onClick={() => void retry()} className="rounded-lg bg-orange-600 text-white px-4 py-2 disabled:opacity-50">{busy ? "再試行中…" : "この1件を再試行"}</button></div>
      </div>
    </AccessibleModal>}
  </div>;
}
