"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { accountingParts } from "@/lib/admin-finance";
import { PX_HEADERS, PX_MAX_BYTES, pxDifference, pxMonthlySummary, type PxDecision, type PxEntryView, type PxHistoryView, type PxPreview, type PxValues } from "@/lib/pxstudio-shared";

const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;
const fields = ["sentOn", "songTitle", "category", "clientName", "gross", "fee", "withholding", "net", "paymentStatus"] as const;
const control = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-50";
type History = PxHistoryView & { changes: { rowNumber: number; before: unknown; after: unknown }[] };

function ValuesTable({ row, before }: { row: PxValues; before?: PxValues }) {
  return <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr><th className="p-2">項目</th>{before && <th className="p-2">更新前</th>}<th className="p-2">{before ? "更新後（CSV）" : "CSVの値"}</th></tr></thead>
    <tbody>{fields.map((field, i) => <tr key={field} className={before && row[field] !== before[field] ? "bg-amber-50" : ""}>
      <th className="whitespace-nowrap p-2 font-medium">{PX_HEADERS[i]}</th>
      {before && <td className="min-w-32 whitespace-pre-wrap break-words p-2">{typeof before[field] === "number" ? yen(before[field] as number) : before[field]}</td>}
      <td className="min-w-32 whitespace-pre-wrap break-words p-2">{typeof row[field] === "number" ? yen(row[field] as number) : row[field]}</td>
    </tr>)}</tbody></table></div>;
}

export function PxStudioClient({ entries, history }: { entries: PxEntryView[]; history: History[] }) {
  const router = useRouter();
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [source, setSource] = useState<{ csv: string; fileName: string }>();
  const [preview, setPreview] = useState<PxPreview>();
  const [decisions, setDecisions] = useState<(PxDecision | undefined)[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [year, setYear] = useState(accountingParts().year);
  const [month, setMonth] = useState("all");
  const [warningsOnly, setWarningsOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(false);
  const showMoney = (n: number) => visible ? yen(n) : "¥ ***,***";
  const years = [...new Set([accountingParts().year, ...entries.map(e => Number(e.sentOn.slice(0, 4)))])].sort((a, b) => b - a);
  const months = pxMonthlySummary(entries, year);
  const annual = months.reduce((s, m) => ({ gross: s.gross + m.gross, net: s.net + m.net }), { gross: 0, net: 0 });
  const period = months.filter(m => month === "all" || m.month === Number(month));
  const totals = period.reduce((s, m) => ({ gross: s.gross + m.gross, net: s.net + m.net, fee: s.fee + m.fee, withholding: s.withholding + m.withholding, count: s.count + m.count, warnings: s.warnings + m.warnings, difference: s.difference + m.difference }), { gross: 0, net: 0, fee: 0, withholding: 0, count: 0, warnings: 0, difference: 0 });
  const filtered = entries.filter(e => e.sentOn.startsWith(String(year)) && (month === "all" || Number(e.sentOn.slice(5, 7)) === Number(month)) && (!warningsOnly || pxDifference(e) !== 0) && `${e.songTitle} ${e.clientName}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const pageCount = Math.max(1, Math.ceil(filtered.length / 30));
  const currentPage = Math.min(page, pageCount - 1);
  const request = async (body: unknown) => {
    const response = await fetch("/api/admin/pxstudio/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(90000) });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.success) throw Error(data?.error || "処理できませんでした。取り込み履歴を確認してから再試行してください。");
    return data;
  };
  const run = async (work: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setNotice("");
    try { await work(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "通信に失敗しました。取り込み履歴を確認してください。"); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const inspect = (file: File) => run(async () => {
    setPreview(undefined); setSource(undefined); setDecisions([]); setConfirmed(false);
    if (file.size > PX_MAX_BYTES) throw Error("CSVは1MB以下のファイルを選択してください。");
    let csv: string;
    try { csv = new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer()); }
    catch { throw Error("UTF-8形式のCSVを選択してください。"); }
    const nextSource = { csv, fileName: file.name };
    const { preview: next } = await request({ action: "preview", ...nextSource }) as { preview: PxPreview };
    setSource(nextSource); setPreview(next);
    setDecisions(next.rows.map(row => row.repeated ? undefined : row.exactIds.length === 1 ? { action: "skip" } : row.candidates.length ? undefined : { action: "add" }));
    setNotice(next.alreadyImported ? "同じ内容のCSVは取り込み済みです。追加登録は行いません。" : "まだ保存していません。全明細の処理を確認してください。");
  });
  const commit = () => run(async () => {
    if (!preview || !source) return;
    const { result } = await request({ action: "commit", ...source, token: preview.token, expiresAt: preview.expiresAt, decisions, confirmed });
    setNotice(result.replayed ? "取り込み済みです。二重登録は行いませんでした。" : `保存しました。追加${result.added}件／更新${result.updated}件／登録しない${result.skipped}件。`);
    setPreview(undefined); setSource(undefined); setConfirmed(false); setPage(0); router.refresh();
  });
  const choose = (index: number, decision: PxDecision | undefined) => { setDecisions(old => old.map((d, i) => i === index ? decision : d)); setConfirmed(false); };
  const unresolved = decisions.filter(d => !d || (d.action === "update" && !d.targetId)).length;

  return <div className="min-w-0 space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-800">PXstudio売上</h1><p className="mt-2 text-sm leading-relaxed text-slate-600">CSVの送金日を基準に集計します。直接依頼の売上・入金・経費には加算しません。件数は案件数ではなく明細数です。</p></div>
      <button className={control} onClick={() => setVisible(!visible)} aria-pressed={visible}>{visible ? "金額を隠す" : "金額を表示"}</button></div>

    <section aria-label="CSV取り込み" className="space-y-4 rounded-xl border bg-white p-4 sm:p-6">
      <h2 className="text-lg font-bold">CSV取り込み</h2>
      <p className="text-sm leading-relaxed text-slate-600">PXstudioからダウンロードしたUTF-8のCSV（1MB・2,000明細以内）を選択してください。差分を確認し、保存を確定するまで登録されません。新しいCSVに載っていない過去の明細も残ります。</p>
      <label className="block text-sm font-medium">CSVファイル<input type="file" accept=".csv,text/csv" disabled={busy} className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-orange-800" onChange={e => { const file = e.currentTarget.files?.[0]; e.currentTarget.value = ""; if (file) void inspect(file); }} /></label>
      {busy && <p role="status" className="text-sm">処理しています…</p>}
      {notice && <p role="status" className="rounded-lg border bg-slate-50 p-3 text-sm">{notice}</p>}
      {preview && !preview.alreadyImported && <div className="space-y-4">
        <h3 className="font-bold">取り込み内容の確認：{source?.fileName}（{preview.rows.length}明細）</h3>
        <p className="text-sm leading-relaxed text-slate-600">CSVには案件IDがありません。同じ楽曲・依頼者でも追加料金などの別明細の可能性があります。候補がある行は処理を選択してください。日付や名称が変わった場合は「既存明細を更新」から更新先を指定できます。完全一致の行も、同一取引であることを確認してください。この確認画面の有効期限は30分です。</p>
        <p className="text-sm font-medium">追加 {decisions.filter(d => d?.action === "add").length}件／更新 {decisions.filter(d => d?.action === "update").length}件／登録しない {decisions.filter(d => d?.action === "skip").length}件／未選択 {unresolved}件</p>
        {preview.rows.some(r => r.difference !== 0) && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">金額不一致：{preview.rows.filter(r => r.difference !== 0).length}明細。制作費−手数料−源泉徴収と手取りが一致していません。保存時にはCSVの金額をそのまま保持します。</p>}
        <p className="text-xs text-slate-500">取り込み確認中は、照合に必要な金額を表示します。</p>
        <div className="max-h-[38rem] space-y-3 overflow-y-auto rounded-lg border p-3">
          {preview.rows.map((row, i) => {
            const decision = decisions[i];
            const before = decision?.targetId ? entries.find(e => e.id === decision.targetId) : undefined;
            return <article key={row.rowNumber} className="space-y-2 rounded-lg border p-3">
              <p className="break-words text-sm font-semibold">明細{row.rowNumber}：{row.sentOn}／{row.clientName}／{row.songTitle}</p>
              <p className="text-sm">制作費 {yen(row.gross)}／手取り {yen(row.net)}</p>
              <p className="text-xs text-slate-600">{row.exactIds.length ? `完全一致 ${row.exactIds.length}件` : row.candidates.length ? `同じ楽曲・依頼者の候補 ${row.candidates.length}件` : "対応候補なし（新規候補）"}{row.repeated && " ／ CSV内に同一内容の複数行あり・個別確認が必要です"}</p>
              {row.difference !== 0 && <p className="text-xs text-amber-800">金額不一致：差額 {yen(row.difference)}</p>}
              <label className="block text-xs">明細{row.rowNumber}の処理<select className={`${control} mt-1 block w-full`} value={decision?.action || ""} disabled={busy} onChange={e => choose(i, e.target.value ? { action: e.target.value as PxDecision["action"] } : undefined)}>
                <option value="">処理を選択</option><option value="add">新しい明細として追加</option><option value="skip">登録しない（既存は変更しない）</option><option value="update" disabled={!entries.length}>既存明細を更新</option>
              </select></label>
              {decision?.action === "update" && <label className="block text-xs">明細{row.rowNumber}の更新先<select className={`${control} mt-1 block w-full`} value={decision.targetId || ""} disabled={busy} onChange={e => choose(i, { action: "update", targetId: e.target.value })}>
                <option value="">更新先を選択</option>
                <optgroup label="同じ楽曲・依頼者の候補">{row.candidates.map(e => <option key={e.id} value={e.id}>{e.sentOn}／{e.clientName}／{e.songTitle}／{yen(e.gross)}（{e.id.slice(-6)}）</option>)}</optgroup>
                <optgroup label="その他の登録済み明細">{entries.filter(e => !row.candidates.some(c => c.id === e.id)).map(e => <option key={e.id} value={e.id}>{e.sentOn}／{e.clientName}／{e.songTitle}／{yen(e.gross)}（{e.id.slice(-6)}）</option>)}</optgroup>
              </select></label>}
              <details open={!!before}><summary className="cursor-pointer text-xs font-medium text-orange-800">{before ? "更新前後の差分" : "全項目を確認"}</summary><ValuesTable row={row} before={before} /></details>
            </article>;
          })}
        </div>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} /><span>全明細の追加・更新・登録しない処理、更新先、金額不一致を確認しました。金額はCSVの値で保存します。</span></label>
        <div className="flex flex-wrap gap-3"><button className="rounded-lg bg-orange-600 px-4 py-2 font-bold text-white disabled:opacity-40" disabled={busy || !confirmed || unresolved > 0} onClick={() => void commit()}>確認した内容で保存</button><button className={control} disabled={busy} onClick={() => { setPreview(undefined); setSource(undefined); setNotice("取り込みを取り消しました。保存していません。"); }}>取り消す</button></div>
      </div>}
    </section>

    <section aria-label="送金月別ダッシュボード" className="space-y-4">
      <div className="flex flex-wrap items-center gap-3"><h2 className="mr-auto text-lg font-bold">送金月別ダッシュボード</h2>
        <label className="text-sm">年 <select className={control} value={year} onChange={e => { setYear(Number(e.target.value)); setPage(0); }}>{years.map(y => <option key={y} value={y}>{y}年</option>)}</select></label>
        <label className="text-sm">月 <select className={control} value={month} onChange={e => { setMonth(e.target.value); setPage(0); }}><option value="all">年間</option>{months.map(m => <option key={m.month} value={m.month}>{m.month}月</option>)}</select></label>
      </div>
      <p className="text-xs leading-relaxed text-slate-500">登録済みCSVの収録分のみの集計です。0明細の月は、未取り込みの可能性があります。送金日は売上計上日や銀行への着金日を確定するものではありません。金額・支払いステータスはCSV記載値で、全ステータスを集計します。</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["選択期間の制作費", showMoney(totals.gross)], ["選択期間の手取り", showMoney(totals.net)], ["選択期間の手数料（CSV記載）", showMoney(totals.fee)], ["選択期間の源泉徴収（CSV記載）", showMoney(totals.withholding)], ["選択期間の明細数", `${totals.count}明細`], ["金額不一致", `${totals.warnings}明細`], [`${year}年の制作費（収録分）`, showMoney(annual.gross)], [`${year}年の手取り（収録分）`, showMoney(annual.net)]].map(([label, value]) => <div key={label} className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>)}</div>
      {totals.warnings > 0 && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">金額が一致しない明細があります。差額合計 {showMoney(totals.difference)}。手数料などへの自動補正は行っていません。</p>}
      <div className="rounded-xl border bg-white p-4"><h3 className="mb-4 font-bold">{year}年の制作費・手取りの推移</h3>{visible ? <div className="h-64 min-w-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={months.map(m => ({ name: `${m.month}月`, 制作費: m.gross, 手取り: m.net }))}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} width={65} /><Tooltip formatter={value => yen(Number(value))} /><Legend /><Bar dataKey="制作費" fill="#f97316" radius={[3, 3, 0, 0]} /><Bar dataKey="手取り" fill="#0d9488" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div> : <p className="py-16 text-center text-sm text-slate-500">「金額を表示」でグラフを表示します。</p>}</div>
      <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full whitespace-nowrap text-right text-sm"><caption className="sr-only">{year}年の月別集計</caption><thead className="bg-slate-50"><tr>{["送金月", "制作費", "手数料", "源泉徴収", "手取り", "明細数", "金額不一致"].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{months.map(m => <tr key={m.month} className="border-t"><th className="p-3">{m.month}月</th>{[m.gross, m.fee, m.withholding, m.net].map((n, i) => <td key={i} className="p-3">{showMoney(n)}</td>)}<td className="p-3">{m.count}</td><td className="p-3">{m.warnings}</td></tr>)}</tbody></table></div>
    </section>

    <section aria-label="取り込み済み明細" className="space-y-3">
      <h2 className="text-lg font-bold">取り込み済み明細</h2><p className="text-xs text-slate-500">年・月の選択に連動します。検索・金額不一致の絞り込みは、この一覧だけに適用します。</p>
      <div className="flex flex-wrap items-center gap-3"><label className="text-sm">検索 <input className={control} value={search} placeholder="楽曲名・依頼者名" onChange={e => { setSearch(e.target.value); setPage(0); }} /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={warningsOnly} onChange={e => { setWarningsOnly(e.target.checked); setPage(0); }} />金額不一致のみ</label></div>
      <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full whitespace-nowrap text-sm"><thead className="bg-slate-50"><tr>{[...PX_HEADERS, "金額差額"].map(h => <th key={h} className="p-3 text-left">{h}</th>)}</tr></thead><tbody>{filtered.slice(currentPage * 30, (currentPage + 1) * 30).map(e => <tr key={e.id} className="border-t"><td className="p-3">{e.sentOn}</td><td className="max-w-64 whitespace-normal break-words p-3">{e.songTitle}</td><td className="p-3">{e.category}</td><td className="p-3">{e.clientName}</td>{[e.gross, e.fee, e.withholding, e.net].map((n, i) => <td key={i} className="p-3 text-right">{showMoney(n)}</td>)}<td className="p-3">{e.paymentStatus}</td><td className={`p-3 text-right ${pxDifference(e) ? "text-amber-800" : "text-slate-500"}`}>{showMoney(pxDifference(e))}</td></tr>)}{!filtered.length && <tr><td colSpan={10} className="p-6 text-center text-slate-500">対象の明細はありません。</td></tr>}</tbody></table></div>
      <div className="flex items-center justify-end gap-3 text-sm"><span>{filtered.length}明細／{currentPage + 1}・{pageCount}ページ</span><button className={control} disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>前へ</button><button className={control} disabled={currentPage + 1 >= pageCount} onClick={() => setPage(currentPage + 1)}>次へ</button></div>
    </section>

    <section aria-label="取り込み履歴" className="space-y-3"><h2 className="text-lg font-bold">取り込み履歴（最新20回）</h2>
      {!history.length && <p className="text-sm text-slate-500">まだ取り込み履歴はありません。</p>}
      {history.map(h => <article key={h.id} className="rounded-xl border bg-white p-4 text-sm"><p className="break-words font-medium">{h.fileName}</p><p className="mt-1 text-xs text-slate-500">{new Date(h.importedAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</p><p className="mt-2">{h.rowCount}明細：追加{h.added}／更新{h.updated}／登録しない{h.skipped}／CSVの金額不一致{h.warningCount}</p>
        {!!h.changes.length && <details className="mt-3"><summary className="cursor-pointer text-orange-800">更新前後の履歴（最大100明細・金額を含む）</summary>{h.changes.map(c => <div key={c.rowNumber} className="mt-3 rounded border p-2"><p>明細{c.rowNumber}</p><ValuesTable row={c.after as PxValues} before={c.before as PxValues} /></div>)}</details>}
      </article>)}
    </section>
  </div>;
}
