"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { accountingParts } from "@/lib/admin-finance";
import { buildSalesState, salesPairHash, salesPairKey, salesSummary, type SalesData, type SalesMode, type SalesPair, type SalesPx, type SalesSource } from "@/lib/sales-dashboard";

const yen = (n: number | null) => n === null ? "未確認" : `${n.toLocaleString("ja-JP")}円`;
const field = "w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";
const button = "rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50";
const stateLabel = { PENDING: "未確認", STALE: "要再確認", DISTINCT: "別取引", DUPLICATE: "重複" };
const sourceLabel = { DIRECT: "直接依頼", PXSTUDIO: "PXstudio", ALL: "合計" };

export function SalesDashboard({ data }: { data: SalesData }) {
  const router = useRouter();
  const [mode, setMode] = useState<SalesMode>("CASH");
  const [source, setSource] = useState<SalesSource>("ALL");
  const [year, setYear] = useState(accountingParts().year);
  const [month, setMonth] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showReviewed, setShowReviewed] = useState(false);
  const [limit, setLimit] = useState(25);
  const [editing, setEditing] = useState<SalesPair | null>(null);
  const [dateEditing, setDateEditing] = useState<SalesPx | null>(null);
  const [manualDirect, setManualDirect] = useState("");
  const [manualPx, setManualPx] = useState("");
  const state = useMemo(() => buildSalesState(data, mode), [data, mode]);
  const summary = salesSummary(state.events, year, month, source);
  const years = [...new Set([accountingParts().year, ...data.direct.flatMap(d => d.date ? [Number(d.date.slice(0, 4))] : []), ...data.px.flatMap(p => [Number(p.sentOn.slice(0, 4)), ...(p.revenueOn ? [Number(p.revenueOn.slice(0, 4))] : [])])])].sort((a, b) => b - a);
  const inSource = (s: "DIRECT" | "PXSTUDIO") => source === "ALL" || source === s;
  const events = state.events.filter(e => inSource(e.source) && e.date.startsWith(String(year)) && (!month || Number(e.date.slice(5, 7)) === month)).sort((a, b) => b.date.localeCompare(a.date));
  const unknown = state.unknown.filter(e => inSource(e.source));
  const held = state.held.filter(d => inSource("DIRECT") && d.date?.startsWith(String(year)) && (!month || Number(d.date.slice(5, 7)) === month));
  const pending = state.pairs.filter(p => p.state === "PENDING" || p.state === "STALE");
  const candidates = state.pairs.filter(p => (showReviewed || p.state === "PENDING" || p.state === "STALE") && `${p.direct.clientName} ${p.direct.songTitle} ${p.px.clientName} ${p.px.songTitle} ${p.direct.id} ${p.px.id}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const manualOptions = data.direct.filter(d => mode === "CASH" ? d.kind === "RECEIPT" : d.kind === "SALE" && d.amount !== null && d.date);
  const maxBar = Math.max(1, ...summary.months.map(m => Math.abs(m.direct) + Math.abs(m.px)));
  function manualPair() {
    const d = manualOptions.find(d => d.id === manualDirect), p = data.px.find(p => p.id === manualPx);
    if (!d || !p) return;
    const existing = state.pairs.find(pair => pair.direct.id === d.id && pair.px.id === p.id);
    setEditing(existing || { mode, direct: d, px: p, currentHash: salesPairHash(mode, d, p), reasons: ["手動で指定した組み合わせ"], state: "PENDING", review: null });
  }
  const changeMode = (value: SalesMode) => { setMode(value); setEditing(null); setManualDirect(""); setLimit(25); };
  return <div className="relative mx-auto max-w-7xl space-y-6 text-slate-800">
    <header className="space-y-2"><h1 className="text-2xl font-bold">売上ダッシュボード</h1><p className="text-sm text-slate-600">直接依頼（個人・法人）とPXstudioを確認します。重複候補の未確認分は集計から保留し、重複と確認した額は直接依頼側から除外します。</p>
      <div className="flex flex-wrap gap-4 text-sm text-orange-700"><Link href="/admin/finance">直接依頼の売上・経費管理</Link><Link href="/admin/pxstudio">PXstudio CSV・元明細</Link></div>
    </header>
    <section aria-label="集計条件" className="rounded-xl border bg-white p-4 space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="売上の区分">{(["DIRECT", "PXSTUDIO", "ALL"] as const).map(s => <button key={s} type="button" aria-pressed={source === s} onClick={() => setSource(s)} className={`${button} ${source === s ? "bg-slate-900 text-white" : "bg-white"}`}>{sourceLabel[s]}</button>)}</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><label className="text-sm">集計基準<select aria-label="集計基準" className={field} value={mode} onChange={e => changeMode(e.target.value as SalesMode)}><option value="CASH">入金・送金ベース</option><option value="REVENUE">売上計上日ベース</option></select></label>
        <label className="text-sm">年<select aria-label="集計年" className={field} value={year} onChange={e => setYear(Number(e.target.value))}>{years.map(y => <option key={y} value={y}>{y}年</option>)}</select></label>
        <label className="text-sm">月<select aria-label="集計月" className={field} value={month || ""} onChange={e => setMonth(e.target.value ? Number(e.target.value) : null)}><option value="">年間</option>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}月</option>)}</select></label></div>
      <p className="text-sm text-slate-600">{mode === "CASH" ? "直接依頼は入金日（日本時間）の実受取額から返金を差し引きます。PXstudioはCSVの送金日・手取りと「送金済み」を使用します。送金日は銀行の着金日とは異なる場合があります。" : "直接依頼は登録済みの売上計上日・確定金額、PXstudioは手動確認した売上計上日・CSVの制作費を使用します。未確認の日付を送金日や案件作成日で補完しません。"}</p>
      <p className="text-xs text-slate-500">この画面の重複除外は既存の管理画面には反映されません。手数料・源泉徴収は入金・送金ベースの参考値で、経費への自動転記は行いません。</p>
    </section>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite">
      {[[`${year}年${month ? month + "月" : "通年"} ${sourceLabel[source]}（確認待ちを除く）`, yen(summary.total.total)], ["直接依頼／PXstudio", `${yen(summary.total.direct)} ／ ${yen(summary.total.px)}`], [mode === "CASH" ? "手数料／源泉徴収" : "計上済み明細数", mode === "CASH" ? `${yen(summary.total.fee)} ／ ${yen(summary.total.withholding)}` : `${summary.total.count}明細`], ["重複候補による確認待ち（選択期間）", `${held.length}明細・${yen(held.reduce((s, d) => s + (d.amount || 0), 0))}`]].map(([label, value]) => <div key={label} className="min-w-0 rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 break-words text-lg font-semibold" data-testid={label.includes("確認待ちを除く") ? "sales-total" : undefined}>{value}</p></div>)}
    </div>
    <section className="rounded-xl border bg-white p-4 space-y-4" aria-label="月別推移"><h2 className="text-lg font-semibold">{year}年の月別推移</h2><p className="text-xs text-slate-500">青：直接依頼　橙：PXstudio。返金によるマイナスは月別表で確認できます。件数は案件数ではなく入金・返金・CSV等の明細数です。</p>
      <div className="flex h-44 items-end gap-1 sm:gap-3" role="img" aria-label="月別金額グラフ。正確な金額とマイナス値は直後の月別集計表を参照してください。">{summary.months.map(m => <div key={m.month} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1"><div className="flex flex-1 items-end justify-center gap-px"><div title={`${m.month}月 直接依頼 ${yen(m.direct)}`} className="w-1/2 bg-blue-600 rounded-t" style={{ height: `${Math.abs(m.direct) / maxBar * 100}%` }} /><div title={`${m.month}月 PXstudio ${yen(m.px)}`} className="w-1/2 bg-orange-500 rounded-t" style={{ height: `${Math.abs(m.px) / maxBar * 100}%` }} /></div><span className="text-center text-[10px] whitespace-nowrap">{m.month}月</span></div>)}</div>
      <div className="relative overflow-x-auto"><table className="w-full text-sm whitespace-nowrap"><caption className="sr-only">月別集計</caption><thead><tr>{["月", "直接依頼", "PXstudio", "合計", "手数料", "源泉徴収", "明細数"].map(t => <th key={t} className="p-2 text-right first:text-left">{t}</th>)}</tr></thead><tbody>{summary.months.map(m => <tr key={m.month} className="border-t"><th className="p-2 text-left">{m.month}月</th>{[yen(m.direct), yen(m.px), yen(m.total), mode === "CASH" ? yen(m.fee) : "—", mode === "CASH" ? yen(m.withholding) : "—", m.count].map((v, i) => <td key={i} className="p-2 text-right">{v}</td>)}</tr>)}</tbody></table></div>
    </section>
    {held.length > 0 && <section className="rounded-xl border border-amber-300 bg-amber-50 p-4"><h2 className="font-semibold">重複候補の確認待ち（選択期間・{held.length}明細）</h2><p className="text-sm">以下の直接依頼は仮集計から保留しています。下の確認欄で判定すると、別取引は全額、重複は除外額を差し引いた残額が集計に戻ります。</p><ul className="mt-2 text-sm space-y-1">{held.map(d => <li key={d.id} className="break-words">{d.date} {d.clientName}／{d.songTitle}：{yen(d.amount)}</li>)}</ul></section>}
    <section className="rounded-xl border bg-white p-4 space-y-3"><h2 className="text-lg font-semibold">{mode === "CASH" ? "送金未確認" : "計上日・確定金額未確認"}（全期間・{unknown.length}明細）</h2><p className="text-sm text-slate-600">集計には含めていません。日付未確認の明細は年・月を判断できないため、全期間から別表示します。表示区分の切り替えは適用されます。</p><details><summary className="cursor-pointer">未確認明細を表示</summary><ul className="mt-3 space-y-2 text-sm">{unknown.map(e => <li key={`${e.source}:${e.id}`} className="border-t pt-2 break-words">{sourceLabel[e.source]}：{e.label}／{yen(e.amount)}<span className="block text-amber-700">{e.reason}</span></li>)}{!unknown.length && <li>未確認の明細はありません。</li>}</ul></details></section>
    <section className="rounded-xl border bg-white p-4 space-y-3"><h2 className="text-lg font-semibold">重複候補の手動確認（{mode === "CASH" ? "入金・送金" : "売上計上日"}ベース）</h2><p className="text-sm text-slate-600">全期間・両区分を照合します。氏名・楽曲名・金額・日付による候補であり、同一取引と断定するものではありません。未確認／要再確認は{pending.length}組です。基準ごとに別の判定を保存します。</p>
      <label className="block text-sm">候補を検索<input className={field} value={search} onChange={e => { setSearch(e.target.value); setLimit(25); }} placeholder="依頼者・楽曲・ID" /></label><label className="flex gap-2 text-sm"><input type="checkbox" checked={showReviewed} onChange={e => setShowReviewed(e.target.checked)} />確認済みも表示する</label>
      <div className="space-y-2">{candidates.slice(0, limit).map(p => <div key={salesPairKey(p.direct.id, p.px.id)} className="rounded-lg border p-3 text-sm space-y-1 break-words"><p><strong>{stateLabel[p.state]}</strong> · {p.reasons.join("、")}</p><p>直接依頼：{p.direct.clientName}／{p.direct.songTitle} · {p.direct.date} · {yen(p.direct.amount)}</p><p>PXstudio：{p.px.clientName}／{p.px.songTitle} · {mode === "CASH" ? p.px.sentOn : p.px.revenueOn || "計上日未確認"} · {yen(mode === "CASH" ? p.px.net : p.px.gross)}</p>{p.review && <p className="text-slate-600">前回の確認：{p.review.reason}（除外額 {yen(p.review.amount)}）</p>}<button type="button" className={button} onClick={() => setEditing(p)}>この組み合わせを確認</button></div>)}{!candidates.length && <p className="text-sm">表示対象の候補はありません。</p>}</div>
      {candidates.length > limit && <button type="button" className={button} onClick={() => setLimit(n => n + 25)}>さらに25組表示</button>}
      <details><summary className="cursor-pointer text-sm">候補にない組み合わせを指定</summary><div className="mt-3 grid gap-3"><label className="text-sm">直接依頼の{mode === "CASH" ? "入金" : "売上"}<select className={field} value={manualDirect} onChange={e => setManualDirect(e.target.value)}><option value="">選択してください</option>{manualOptions.map(d => <option key={d.id} value={d.id}>{d.date} {d.clientName}／{d.songTitle} {yen(d.amount)} · {d.id}</option>)}</select></label><label className="text-sm">PXstudio明細<select className={field} value={manualPx} onChange={e => setManualPx(e.target.value)}><option value="">選択してください</option>{data.px.map(p => <option key={p.id} value={p.id}>{p.sentOn} {p.clientName}／{p.songTitle} {yen(mode === "CASH" ? p.net : p.gross)} · {p.id}</option>)}</select></label><button className={button} type="button" disabled={!manualDirect || !manualPx} onClick={manualPair}>指定した組み合わせを確認</button></div></details>
      {editing && <ReviewForm key={`${editing.mode}:${editing.direct.id}:${editing.px.id}:${editing.review?.version || 0}`} pair={editing} close={() => setEditing(null)} saved={() => { setEditing(null); router.refresh(); }} />}
    </section>
    <section className="rounded-xl border bg-white p-4 space-y-3"><h2 className="text-lg font-semibold">PXstudioの売上計上日を確認</h2><p className="text-sm text-slate-600">元の送金日・CSV金額は変更しません。計上日の根拠を確認して日付と理由を保存します。CSV明細が更新された場合は再確認が必要です。</p><details><summary className="cursor-pointer">対象の明細を選ぶ（{data.px.length}明細）</summary><label className="mt-3 block text-sm">計上日を確認する明細<select className={field} value={dateEditing?.id || ""} onChange={e => setDateEditing(data.px.find(p => p.id === e.target.value) || null)}><option value="">選択してください</option>{data.px.map(p => <option key={p.id} value={p.id}>{p.accountingCurrent && p.revenueOn ? p.revenueOn : "未確認"}／送金 {p.sentOn} {p.clientName}／{p.songTitle} · {p.id}</option>)}</select></label></details>
      {dateEditing && <DateForm key={`${dateEditing.id}:${dateEditing.accountingVersion}`} px={dateEditing} close={() => setDateEditing(null)} saved={() => { setDateEditing(null); router.refresh(); }} />}
    </section>
    <section className="rounded-xl border bg-white p-4 space-y-3"><h2 className="text-lg font-semibold">集計対象の明細（{events.length}明細）</h2><p className="text-xs text-slate-500">重複判定による除外後の金額です。CSV金額の差額は再計算せず保持します。</p><details><summary className="cursor-pointer">選択期間の明細を表示</summary><div className="relative mt-3 overflow-x-auto"><table className="w-full text-sm"><thead><tr>{["日付", "区分・内容", "金額", "手数料", "源泉徴収"].map(t => <th className="p-2 text-left whitespace-nowrap" key={t}>{t}</th>)}</tr></thead><tbody>{events.map(e => <tr key={e.id} className="border-t"><td className="p-2 whitespace-nowrap">{e.date}</td><td className="p-2 min-w-40 break-words">{sourceLabel[e.source]}・{e.kind}<br />{e.label}</td><td className="p-2 whitespace-nowrap">{yen(e.amount)}</td><td className="p-2 whitespace-nowrap">{mode === "CASH" ? yen(e.fee) : "—"}</td><td className="p-2 whitespace-nowrap">{mode === "CASH" ? yen(e.withholding) : "—"}</td></tr>)}</tbody></table></div></details></section>
  </div>;
}

function useSave(saved: () => void) {
  const busyRef = useRef(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function save(body: Record<string, unknown>) {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/sales/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, confirmed: true }) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "保存に失敗しました。");
      saved();
    } catch (e) { setError(e instanceof Error ? e.message : "通信に失敗しました。"); }
    finally { busyRef.current = false; setBusy(false); }
  }
  return { save, busy, error };
}

function ReviewForm({ pair: p, close, saved }: { pair: SalesPair; close: () => void; saved: () => void }) {
  const [status, setStatus] = useState(p.review?.status || "PENDING"), [reason, setReason] = useState("");
  const [amount, setAmount] = useState(String(p.review?.status === "DUPLICATE" ? p.review.amount : Math.min(p.direct.amount || 0, p.mode === "CASH" ? p.px.net : p.px.gross)));
  const [fee, setFee] = useState(String(p.review?.status === "DUPLICATE" ? p.review.fee : Math.min(p.direct.fee, p.px.fee))), [withholding, setWithholding] = useState(String(p.review?.status === "DUPLICATE" ? p.review.withholding : Math.min(p.direct.withholding, p.px.withholding)));
  const [confirmed, setConfirmed] = useState(false);
  const { save, busy, error } = useSave(saved);
  return <form className="rounded-xl border-2 border-orange-300 bg-orange-50 p-4 space-y-3" aria-label="重複の確認フォーム" onSubmit={e => { e.preventDefault(); if (!confirmed) return; void save({ action: "review", mode: p.mode, directId: p.direct.id, pxEntryId: p.px.id, sourceHash: p.currentHash, version: p.review?.version || 0, status, reason, amount: status === "DUPLICATE" ? Number(amount) : 0, fee: status === "DUPLICATE" && p.mode === "CASH" ? Number(fee) : 0, withholding: status === "DUPLICATE" && p.mode === "CASH" ? Number(withholding) : 0 }); }}>
    <h3 className="font-semibold">確認結果を保存</h3><p className="text-sm break-words">直接依頼：{p.direct.clientName}／{p.direct.songTitle}（{p.direct.date}、{yen(p.direct.amount)}）<br />PXstudio：{p.px.clientName}／{p.px.songTitle}（送金 {p.px.sentOn}、{yen(p.mode === "CASH" ? p.px.net : p.px.gross)}）</p>
    <p className="text-xs break-all text-slate-500">直接依頼ID {p.direct.id} ／ PXstudio ID {p.px.id}</p>
    <label className="block text-sm">判定<select className={field} value={status} onChange={e => setStatus(e.target.value)}><option value="PENDING">未確認に戻す（直接依頼を保留）</option><option value="DISTINCT">別取引（両方を集計）</option><option value="DUPLICATE">重複（指定額を直接依頼から除外）</option></select></label>
    {status === "DUPLICATE" && <><p className="text-sm">全額除外するときも金額を確認してください。分割入金・追加料金は重複する部分だけ割り当てます。PXstudio側の金額・送金月を残します。</p><div className="grid gap-3 sm:grid-cols-3">{[["除外する金額", amount, setAmount], ...(p.mode === "CASH" ? [["除外する手数料", fee, setFee], ["除外する源泉徴収", withholding, setWithholding]] : [])].map(([label, value, setter]) => <label key={label as string} className="text-sm">{label as string}<input className={field} type="number" min="0" max="2147483647" step="1" required value={value as string} onChange={e => (setter as (v: string) => void)(e.target.value)} /></label>)}</div><p className="text-xs">直接依頼の手数料 {yen(p.direct.fee)}／源泉徴収 {yen(p.direct.withholding)}。PXstudioの手数料 {yen(p.px.fee)}／源泉徴収 {yen(p.px.withholding)}。</p></>}
    <label className="block text-sm">確認の理由<textarea className={field} required maxLength={1000} value={reason} onChange={e => setReason(e.target.value)} /></label><label className="flex items-start gap-2 text-sm"><input type="checkbox" required checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />対象の明細・判定・除外額を確認しました</label>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}<div className="flex flex-wrap gap-2"><button className={`${button} bg-white`} disabled={busy || !confirmed} type="submit">{busy ? "保存中…" : "確認結果を保存"}</button><button className={button} disabled={busy} type="button" onClick={close}>閉じる</button></div>
  </form>;
}

function DateForm({ px, close, saved }: { px: SalesPx; close: () => void; saved: () => void }) {
  const [reason, setReason] = useState(""), [confirmed, setConfirmed] = useState(false);
  const { save, busy, error } = useSave(saved);
  return <form className="rounded-xl border bg-slate-50 p-4 space-y-3" aria-label="PXstudio計上日確認フォーム" onSubmit={e => { e.preventDefault(); if (!confirmed) return; void save({ action: "px-date", pxEntryId: px.id, sourceHash: px.hash, version: px.accountingVersion, revenueOn: new FormData(e.currentTarget).get("revenueOn") || null, reason }); }}><p className="text-sm break-words">{px.clientName}／{px.songTitle} · 制作費 {yen(px.gross)} · 送金日 {px.sentOn}</p><label className="block text-sm">売上計上日（空欄で未確認に戻す）<input className={field} type="date" name="revenueOn" defaultValue={px.revenueOn || ""} /></label><label className="block text-sm">日付の根拠・確認理由<textarea className={field} maxLength={1000} required value={reason} onChange={e => setReason(e.target.value)} /></label><label className="flex items-start gap-2 text-sm"><input type="checkbox" required checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />日付と根拠を確認しました（送金日からは自動補完しません）</label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<div className="flex gap-2"><button className={button} type="submit" disabled={busy || !confirmed}>{busy ? "保存中…" : "計上日を保存"}</button><button type="button" disabled={busy} className={button} onClick={close}>閉じる</button></div></form>;
}
