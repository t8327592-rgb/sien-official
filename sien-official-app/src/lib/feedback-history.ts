import { prisma } from "@/lib/prisma";
import { validateFeedback } from "./feedback-input";
import { FEEDBACK_ITEMS } from "./feedback";

export async function previousFeedbackText(orderId: string): Promise<string> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { clientEmail: true, createdAt: true } });
  if (!order?.clientEmail.trim()) return "";
  const previous = await prisma.orderFeedback.findFirst({
    where: { orderId: { not: orderId }, order: { clientEmail: { equals: order.clientEmail, mode: "insensitive" }, createdAt: { lt: order.createdAt } } },
    orderBy: { order: { createdAt: "desc" } }, select: { content: true },
  });
  if (!previous) return "";
  const content = validateFeedback(previous.content);
  // Only the client-facing body: no contact info, IDs or private working memo.
  return [content.summary, content.strengths, ...FEEDBACK_ITEMS.map(({ key, label }) => `${label}：${content.items[key].comment}`), ...content.priorities.map(point => `${point.title}：${point.observation} ${point.action}`)].filter(Boolean).join("\n").slice(0, 6000);
}
