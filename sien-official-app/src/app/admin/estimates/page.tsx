import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-page-auth";
import { prisma } from "@/lib/prisma";
import { estimateTotals, validateEstimate, yen, japanDay } from "@/lib/estimates";

export const dynamic = "force-dynamic";
export default async function EstimatesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage();
  const params = await searchParams;
  const orderId = typeof params.order === "string" ? params.order : undefined;
  const requestedPage = Number(params.page || 1), page = Number.isSafeInteger(requestedPage) ? Math.max(1, requestedPage) : 1;
  const where = orderId ? { orders: { some: { orderId } } } : {};
  const [estimates, count] = await Promise.all([
    prisma.estimate.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 30, skip: (page - 1) * 30 }),
    prisma.estimate.count({ where }),
  ]);
  const url = (page: number) => `/admin/estimates?${new URLSearchParams({ page: String(page), ...(orderId ? { order: orderId } : {}) })}`;
  return <div className="space-y-5">
    <div className="flex flex-wrap justify-between gap-3"><h1 className="text-2xl font-bold">保存済みの見積書</h1><Link className="underline" href="/admin/orders">依頼を選んで作成</Link></div>
    <p className="text-sm text-slate-600">旧版を含めて保存されています。各見積書の編集画面で最新版と改訂履歴を確認できます。</p>
    {orderId && <Link className="inline-block text-sm underline" href="/admin/estimates">すべての見積書を表示</Link>}
    {!estimates.length && <p className="rounded-xl border bg-white p-5">保存済みの見積書はありません。</p>}
    <div className="grid gap-3 md:grid-cols-2">{estimates.map(estimate => {
      const content = validateEstimate(estimate.content);
      return <article key={estimate.id} className="space-y-2 rounded-xl border bg-white p-5">
        <Link href={`/admin/estimates/${estimate.id}`} className="block break-words font-bold text-orange-700 underline">{content.number} / 第{estimate.revision}版</Link>
        <p className="break-words">{content.clientName} 様</p><p className="text-sm text-slate-500">発行日 {content.issuedOn} / 保存日 {japanDay(estimate.createdAt)}</p>
        <p className="font-bold">{yen(estimateTotals(content).total)}（税込）</p>
        <Link href={`/api/admin/estimates/${estimate.id}/pdf`} prefetch={false} className="inline-block rounded-lg border px-3 py-2 text-sm" download>この版のPDFをダウンロード</Link>
      </article>;
    })}</div>
    <nav aria-label="見積書一覧のページ" className="flex gap-4 text-sm">{page > 1 && <Link className="underline" href={url(page - 1)}>前へ</Link>}<span>{page}ページ / {count}件（旧版を含む）</span>{page * 30 < count && <Link className="underline" href={url(page + 1)}>次へ</Link>}</nav>
  </div>;
}
