import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-page-auth";
import { prisma } from "@/lib/prisma";
import { notificationFilters, notificationPageUrl, NOTIFICATION_KINDS, NOTIFICATION_STATUSES, canRetryNotification } from "@/lib/admin-notifications";
import { NotificationRetryButton } from "@/components/admin/NotificationRetryButton";
import deploymentConfig from "../../../../vercel.json";

export const dynamic = "force-dynamic";
const formatDate = (value: Date | null) => value ? new Intl.DateTimeFormat("ja-JP", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Tokyo" }).format(value) : "—";
const schedule = deploymentConfig.crons.find(cron => cron.path === "/api/notifications/process")?.schedule;

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage();
  const filters = notificationFilters(await searchParams);
  if (filters.q) {
    const [orders, contacts] = await Promise.all([
      prisma.order.findMany({ where: { clientName: { contains: filters.q, mode: "insensitive" } }, select: { id: true } }),
      prisma.businessContact.findMany({ where: { OR: [{ companyName: { contains: filters.q, mode: "insensitive" } }, { contactName: { contains: filters.q, mode: "insensitive" } }] }, select: { id: true } }),
    ]);
    filters.where.entityId = { in: [...orders, ...contacts].map(record => record.id) };
  }
  const [total, failedCount] = await Promise.all([
    filters.error ? Promise.resolve(0) : prisma.notificationJob.count({ where: filters.where }),
    prisma.notificationJob.count({ where: { status: { in: ["FAILED", "EXHAUSTED"] }, kind: { notIn: ["ORDER_RECEIPT_EMAIL", "BUSINESS_RECEIPT_EMAIL"] } } }),
  ]);
  const pageSize = 25, lastPage = Math.max(1, Math.ceil(total / pageSize)), page = Math.min(filters.page, lastPage);
  const jobs = filters.error ? [] : await prisma.notificationJob.findMany({ where: filters.where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * pageSize, take: pageSize });
  const ids = jobs.map(job => job.entityId);
  const [orders, contacts] = jobs.length ? await Promise.all([
    prisma.order.findMany({ where: { id: { in: ids } }, select: { id: true, clientName: true, songTitle: true } }),
    prisma.businessContact.findMany({ where: { id: { in: ids } }, select: { id: true, companyName: true, contactName: true } }),
  ]) : [[], []];
  const references = new Map([
    ...orders.map(order => [`ORDER:${order.id}`, `${order.clientName}${order.songTitle ? ` / ${order.songTitle}` : ""}`] as const),
    ...contacts.map(contact => [`BUSINESS:${contact.id}`, `${contact.companyName} / ${contact.contactName}`] as const),
  ]);
  return <section className="space-y-6">
    <h1 className="text-2xl font-bold">受付通知の配送状況</h1>
    <p className="text-sm text-slate-600">依頼の保存と通知予約は同時に行います。10回失敗すると自動再試行を止めます。「送信処理完了」は配送サービスへの引き渡しで、受信箱への到達保証ではありません。</p>
    <div className="rounded-lg border bg-white p-4 text-sm space-y-2">
      <p>定期処理の認証設定：{process.env.CRON_SECRET ? "設定あり・公開環境の稼働未確認" : "未設定"}</p>
      <p>定期実行設定：{schedule === "0 3 * * *" ? "1日1回" : schedule || "未設定"}（設定ファイル上）。実際の実行履歴は公開先で確認してください。未設定・停止中の場合は、次の受付または手動操作まで再試行されません。</p>
      <Link href="/admin/settings" className="text-orange-700 underline">連携設定を確認</Link>
    </div>
    <Link href="/admin/notifications?status=failed" className="inline-block rounded-lg border border-red-200 bg-red-50 text-red-800 p-3 font-bold">失敗・再試行上限：{failedCount}件</Link>
    <form action="/admin/notifications" method="get" className="flex flex-wrap gap-3 items-end rounded-xl border bg-white p-4">
      <label className="space-y-1 min-w-0"><span className="block text-sm">状態</span><select name="status" defaultValue={filters.status} className="border rounded-lg p-2 max-w-full"><option value="ALL">すべて</option><option value="failed">失敗・再試行上限</option><option value="pending">送信待ち・処理中</option><option value="DELIVERED">送信処理完了</option><option value="EXHAUSTED">再試行上限のみ</option><option value="SKIPPED">送信停止（旧自動返信）</option></select></label>
      <label className="space-y-1 min-w-0"><span className="block text-sm">通知種別</span><select name="kind" defaultValue={filters.kind} className="border rounded-lg p-2 max-w-full"><option value="ALL">すべて</option>{Object.entries(NOTIFICATION_KINDS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="space-y-1 min-w-0"><span className="block text-sm">受付日・開始</span><input type="date" name="from" defaultValue={filters.from} className="border rounded-lg p-2 max-w-full" /></label>
      <label className="space-y-1 min-w-0"><span className="block text-sm">受付日・終了</span><input type="date" name="to" defaultValue={filters.to} className="border rounded-lg p-2 max-w-full" /></label>
      <label className="space-y-1 w-full sm:w-auto min-w-0"><span className="block text-sm">依頼者名・会社名</span><input name="q" defaultValue={filters.q} maxLength={254} className="border rounded-lg p-2 w-full" /></label>
      <button type="submit" className="bg-orange-600 text-white rounded-lg px-4 py-2">絞り込む</button><Link href="/admin/notifications" className="underline p-2">解除</Link>
    </form>
    {filters.error && <p role="alert" className="text-red-700">{filters.error}</p>}
    <p className="text-sm text-slate-600">{total}件中 {total ? (page - 1) * pageSize + 1 : 0}〜{Math.min(page * pageSize, total)}件・日時は日本時間</p>
    <div className="grid gap-4">
      {jobs.map(job => {
        const business = job.kind.startsWith("BUSINESS_");
        const reference = references.get(`${business ? "BUSINESS" : "ORDER"}:${job.entityId}`) || "依頼情報を確認";
        return <article key={job.id} className="bg-white border rounded-xl p-4 space-y-3 min-w-0 break-words">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold"><Link href={`/admin/${business ? "business" : "orders"}/${encodeURIComponent(job.entityId)}`} className="text-orange-700 underline">{reference}</Link></h2><span className="text-sm font-bold">{NOTIFICATION_STATUSES[job.status] || job.status}</span></div>
          <p className="text-sm">{NOTIFICATION_KINDS[job.kind] || job.kind}・試行 {job.attempts}回</p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
            <div><dt>受付日時</dt><dd>{formatDate(job.createdAt)}</dd></div><div><dt>最終処理（更新日時）</dt><dd>{formatDate(job.updatedAt)}</dd></div>
            <div><dt>次回自動再試行予定</dt><dd>{["PENDING", "FAILED"].includes(job.status) ? formatDate(job.nextAttemptAt) : "—"}</dd></div><div><dt>送信処理完了日時</dt><dd>{formatDate(job.sentAt)}</dd></div>
          </dl>
          {job.lastError && <p className="rounded bg-red-50 p-3 text-sm text-red-800">{job.lastError}</p>}
          {canRetryNotification(job) && <NotificationRetryButton id={job.id} reference={reference} kind={NOTIFICATION_KINDS[job.kind] || job.kind} />}
        </article>;
      })}
      {!jobs.length && <p className="border rounded-xl p-6 bg-white text-slate-600">該当する通知はありません。</p>}
    </div>
    <nav aria-label="通知のページ送り" className="flex flex-wrap items-center gap-4 text-sm">
      {page > 1 && <Link href={notificationPageUrl(filters, page - 1)} className="underline p-2">前の25件</Link>}<span>{page} / {lastPage}ページ</span>{page < lastPage && <Link href={notificationPageUrl(filters, page + 1)} className="underline p-2">次の25件</Link>}
    </nav>
  </section>;
}
