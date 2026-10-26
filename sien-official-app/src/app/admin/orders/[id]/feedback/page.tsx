import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin-page-auth";
import { prisma } from "@/lib/prisma";
import { emptyFeedback } from "@/lib/feedback";
import { validateFeedback } from "@/lib/feedback-input";
import { FeedbackEditor } from "@/components/admin/FeedbackEditor";

export const dynamic = "force-dynamic";
export default async function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, select: { id: true, clientName: true, songTitle: true, feedback: true } });
  if (!order) notFound();
  return <div className="max-w-5xl mx-auto space-y-6 pb-16">
    <Link href={`/admin/orders/${id}`} className="text-sm text-slate-600 hover:underline">← 依頼詳細に戻る</Link>
    <div><h1 className="text-2xl font-extrabold text-slate-800">録音・歌唱フィードバック</h1><p className="text-sm text-slate-500 mt-2">評価とコメントを入力し、内容を確認してPDFを作成します。</p></div>
    <FeedbackEditor order={{ id: order.id, clientName: order.clientName, songTitle: order.songTitle }} initialContent={order.feedback ? validateFeedback(order.feedback.content) : emptyFeedback()} initialVersion={order.feedback?.version ?? 0} />
  </div>;
}
