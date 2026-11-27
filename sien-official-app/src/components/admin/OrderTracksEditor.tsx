"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OrderTrack } from "@prisma/client";
import type { BrowserRecord } from "@/lib/admin-types";
import { patchAdminOrder } from "@/lib/admin-order-client";
import { TRACK_STATUS_LABELS } from "@/lib/order-tracks";
import { formatPublicDate, formatYen } from "@/lib/public-format";

type Track = BrowserRecord<OrderTrack>;
const input = "w-full rounded-lg border border-slate-300 bg-white p-2.5 text-base";
const button = "rounded-lg bg-slate-800 px-3 py-2 text-sm font-bold text-white disabled:opacity-50";

function TrackRow({ track, disabled, onSave }: { track: Track; disabled: boolean; onSave: (status: string, url: string) => Promise<void> }) {
  const [status, setStatus] = useState(track.status);
  const [url, setUrl] = useState(track.deliveryUrl ?? "");
  const details = track.details && typeof track.details === "object" && !Array.isArray(track.details) ? track.details : {};
  const notes = [["希望納期", details.deadline], ["歌唱キー", details.vocalKey], ["活動用途", details.activityPurpose], ["ジャンル", details.genre], ["作詞", details.lyricsStatus], ["仮歌", details.vocalGuideStatus], ["ご要望", details.note]].filter(([, value]) => typeof value === "string" && value && value !== "不要");
  return <li className="space-y-3 rounded-xl border border-slate-200 p-4">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0"><h3 className="break-words font-bold text-slate-900">{track.position}. {track.songTitle}</h3><p className="mt-1 break-words text-sm text-slate-600">{track.planName} · {formatYen(track.price)}</p></div>
      {track.deliveredAt && <div className="space-y-1 text-sm sm:text-right"><span className="inline-block rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-800">{formatPublicDate(track.deliveredAt)} 納品済み</span>{track.deliveryUrl && <p><a className="text-orange-800 underline" href={track.deliveryUrl} target="_blank" rel="noreferrer">納品データを開く</a></p>}</div>}
    </div>
    {track.options && <p className="break-words text-sm text-slate-600">{track.options}</p>}
    {(track.materialsUrl || track.referenceUrl || notes.length > 0) && <details className="text-sm text-slate-700"><summary className="cursor-pointer font-semibold">素材・依頼内容</summary><div className="mt-2 space-y-1">
      {track.materialsUrl && <p><a className="text-orange-800 underline" href={track.materialsUrl} target="_blank" rel="noreferrer">素材を開く</a></p>}
      {track.referenceUrl && <p><a className="text-orange-800 underline" href={track.referenceUrl} target="_blank" rel="noreferrer">参考曲を開く</a></p>}
      {notes.map(([label, value]) => <p key={String(label)} className="whitespace-pre-wrap break-words">{String(label)} {String(value)}</p>)}
    </div></details>}
    <form className="grid items-end gap-3 sm:grid-cols-[9rem_minmax(0,1fr)_auto]" onSubmit={event => { event.preventDefault(); void onSave(status, url); }}>
      <label className="space-y-1 text-sm font-semibold"><span>進捗</span><select aria-label={`${track.position}曲目の進捗`} className={input} value={status} onChange={event => setStatus(event.target.value)} disabled={disabled}>{Object.entries(TRACK_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="space-y-1 text-sm font-semibold"><span>納品URL（任意）</span><input aria-label={`${track.position}曲目の納品URL`} className={input} type="url" maxLength={2000} value={url} onChange={event => setUrl(event.target.value)} disabled={disabled} /></label>
      <button className={button} disabled={disabled || (status === track.status && url === (track.deliveryUrl ?? ""))}>この曲を保存</button>
    </form>
  </li>;
}

export function OrderTracksEditor({ orderId, orderStatus, tracks }: { orderId: string; orderStatus: string; tracks: Track[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [refreshing, startTransition] = useTransition();
  const saving = useRef(false);
  const completed = tracks.filter(track => track.status === "COMPLETED").length;
  const canceled = ["CANCELED", "CANCELLED"].includes(orderStatus);

  async function save(action: () => Promise<unknown>) {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setMessage("");
    try { await action(); setMessage("保存しました。"); startTransition(() => router.refresh()); }
    catch (error) { setMessage(error instanceof Error ? error.message : "保存できませんでした。"); }
    finally { saving.current = false; setBusy(false); }
  }

  return <section className="space-y-4 rounded-2xl border bg-white p-4 shadow-sm sm:p-6" aria-labelledby="track-editor-heading">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 id="track-editor-heading" className="text-xl font-bold text-slate-900">依頼1件・楽曲{tracks.length}曲</h2><p className="mt-1 text-sm text-slate-600">納品済み {completed} / {tracks.length}曲</p></div>
      {!canceled && completed < tracks.length && <button className={button} disabled={busy || refreshing} onClick={() => {
        if (window.confirm(`残り${tracks.length - completed}曲をまとめて納品済みにしますか？`)) void save(() => patchAdminOrder(orderId, { status: "COMPLETED" }));
      }}>残りの曲をまとめて納品済みにする</button>}
    </div>
    <p className="text-sm text-slate-600">{canceled ? "キャンセルを解除すると曲ごとの進捗を更新できます。" : "全曲を納品済みにすると、依頼全体も納品済みになります。"}</p>
    <ul className="space-y-3">{tracks.map(track => <TrackRow key={`${track.id}-${track.version}`} track={track} disabled={busy || refreshing || canceled} onSave={(status, deliveryUrl) => save(async () => {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/tracks/${encodeURIComponent(track.id)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, deliveryUrl, version: track.version }), signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "保存できませんでした。");
    })} />)}</ul>
    {message && <p role="status" className="text-sm font-semibold text-slate-700">{message}</p>}
  </section>;
}
