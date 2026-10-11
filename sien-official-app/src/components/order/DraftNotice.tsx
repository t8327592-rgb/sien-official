export function DraftNotice({ available, onRestore, onClear }: { available: boolean; onRestore: () => void; onClear: () => void }) {
  if (!available) return null;
  return <div className="my-4 flex flex-wrap items-center gap-x-4 text-sm">
    <button type="button" onClick={onRestore} className="min-h-11 py-2 font-bold text-orange-700 underline underline-offset-4">前回の入力を復元する</button>
    <button type="button" onClick={onClear} className="min-h-11 py-2 text-slate-600 underline underline-offset-4">保存した下書きを削除</button>
  </div>;
}
