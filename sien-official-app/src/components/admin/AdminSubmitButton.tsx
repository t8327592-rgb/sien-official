"use client";
import { useFormStatus } from "react-dom";
import { useState } from "react";
export function AdminSubmitButton({ children, className, confirmation }: { children: React.ReactNode; className?: string; confirmation?: string }) {
  const { pending } = useFormStatus();
  const [confirming, setConfirming] = useState(false);
  if (confirmation && !confirming) return <button type="button" disabled={pending} className={className} onClick={() => setConfirming(true)}>{children}</button>;
  if (confirmation) return <div className="max-w-sm rounded-lg border border-red-200 bg-red-50 p-3"><p role="alert" className="text-sm text-red-900">{confirmation}</p><div className="mt-3 flex flex-wrap gap-3"><button type="submit" disabled={pending} className="rounded-lg bg-red-700 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">{pending ? "処理中…" : "削除を確定"}</button><button type="button" disabled={pending} className="rounded-lg border bg-white px-3 py-2 text-sm" onClick={() => setConfirming(false)}>削除をやめる</button></div></div>;
  return <button type="submit" disabled={pending} className={className}>{pending ? "処理中…" : children}</button>;
}
