"use client";
import Link from "next/link";
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="max-w-xl rounded-xl border bg-white p-6 space-y-4"><h1 className="text-xl font-bold text-slate-900">管理画面を読み込めませんでした</h1><p className="text-sm leading-relaxed text-slate-600">通信・保存処理に問題が発生した可能性があります。保存操作の直後の場合は、一覧で保存状態を確認してから再操作してください。</p><div className="flex flex-wrap gap-3"><button className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white" onClick={reset}>再読み込みする</button><Link href="/admin" className="rounded-lg border px-4 py-2 text-sm">ダッシュボードへ</Link></div></section>;
}
