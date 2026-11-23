import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin-page-auth";
import { prisma } from "@/lib/prisma";
import { validateEstimate } from "@/lib/estimates";
import { EstimateEditor } from "@/components/admin/EstimateEditor";

export const dynamic = "force-dynamic";
export default async function EstimatePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const estimate = await prisma.estimate.findUnique({ where: { id }, include: { orders: true } });
  if (!estimate) notFound();
  const history = await prisma.estimate.findMany({ where: { seriesId: estimate.seriesId }, select: { id: true, revision: true, createdAt: true }, orderBy: { revision: "desc" } });
  return <div className="mx-auto max-w-5xl space-y-5">
    <nav aria-label="見積書の改訂履歴" className="flex flex-wrap gap-3 rounded-xl border bg-white p-4 text-sm">{history.map(item => <Link key={item.id} className="underline" aria-current={item.id === id ? "page" : undefined} href={`/admin/estimates/${item.id}`}>第{item.revision}版{item.id === history[0].id ? "（最新版）" : ""}</Link>)}</nav>
    <EstimateEditor key={estimate.id} initial={validateEstimate(estimate.content)} orderIds={estimate.orders.map(link => link.orderId)} saved={{ id, revision: estimate.revision }} latestId={history[0].id} />
  </div>;
}
