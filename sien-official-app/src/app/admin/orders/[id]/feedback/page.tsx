import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin-page-auth";
import { prisma } from "@/lib/prisma";
import { emptyFeedback } from "@/lib/feedback";
import { validateFeedback } from "@/lib/feedback-input";
import { FeedbackEditor } from "@/components/admin/FeedbackEditor";
import { previousFeedbackText } from "@/lib/feedback-history";

export const dynamic = "force-dynamic";
export default async function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, select: { id: true, clientName: true, songTitle: true, feedback: true } });
  if (!order) notFound();
  const previous = await previousFeedbackText(id);
  const saved = order.feedback ? validateFeedback(order.feedback.content) : emptyFeedback();
  return <div className="max-w-5xl mx-auto space-y-6 pb-16">
    <Link href={`/admin/orders/${id}`} className="text-sm text-slate-600 hover:underline">← 依頼詳細に戻る</Link>
    <div><h1 className="text-2xl font-extrabold text-slate-800">フィードバック用メモ</h1><p className="text-sm text-slate-500 mt-2">気づいたことを書いてコピーし、Codexのチャットに貼り付けてください。文章整理と固定デザインのPDF作成はCodexで行います。</p></div>
    <FeedbackEditor order={{ id: order.id, clientName: order.clientName, songTitle: order.songTitle }} initialMemo={{ memo: saved.memo, date: saved.date, comparison: saved.comparison }} initialVersion={order.feedback?.version ?? 0} previous={previous} />
  </div>;
}
