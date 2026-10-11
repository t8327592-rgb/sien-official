import type { Prisma, NotificationJob } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { discordNotification } from "@/lib/notification-content";

export async function queueNotifications(tx: Prisma.TransactionClient, entity: "ORDER" | "BUSINESS", entityId: string) {
  const kinds = [`${entity}_ADMIN_EMAIL`];
  if (process.env.DISCORD_WEBHOOK_URL) kinds.push(`${entity}_DISCORD`);
  await tx.notificationJob.createMany({ data: kinds.map(kind => ({ kind, entityId })) });
}

async function deliver(job: NotificationJob) {
  const business = job.kind.startsWith("BUSINESS_");
  const record = business ? await prisma.businessContact.findUnique({ where: { id: job.entityId } }) : await prisma.order.findUnique({ where: { id: job.entityId } });
  if (!record) throw new Error("RECORD_NOT_FOUND");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sien-official.com";
  const adminUrl = `${baseUrl}/admin/${business ? "business" : "orders"}/${encodeURIComponent(job.entityId)}`;
  const receipt = await prisma.submissionReceipt.findUnique({ where: { entityType_entityId: { entityType: business ? "BUSINESS" : "ORDER", entityId: job.entityId } } });
  if (job.kind.endsWith("_DISCORD")) {
    const url = process.env.DISCORD_WEBHOOK_URL;
    if (!url) throw new Error("DISCORD_NOT_CONFIGURED");
    const { payload, fullText } = discordNotification(record, receipt?.quote ?? null, adminUrl);
    const target = new URL(url); target.searchParams.set("wait", "true");
    let body: string | FormData = JSON.stringify(payload);
    if (fullText) {
      const form = new FormData();
      form.set("payload_json", JSON.stringify(payload));
      form.set("files[0]", new Blob([fullText], { type: "text/plain;charset=utf-8" }), "request-details.txt");
      body = form;
    }
    const response = await fetch(target, { method: "POST", ...(fullText ? {} : { headers: { "Content-Type": "application/json" } }), body, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`DISCORD_HTTP_${response.status}`);
    return;
  }
  if (!job.kind.endsWith("_ADMIN_EMAIL")) throw new Error("UNKNOWN_NOTIFICATION_KIND");
  const to = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER;
  if (!to) throw new Error("ADMIN_EMAIL_NOT_CONFIGURED");
  const text = `新しい受付があります。\n内容は管理画面で確認してください。\n${adminUrl}`;
  await sendMail({ to, subject: "【Sien-Official】新しい受付があります", text, messageId: `<notification-${job.id}@sien-official.com>` });
}

export async function processPendingNotifications(limit = 10, budgetMs = 20000, jobId?: string) {
  const stopAt = Date.now() + Math.max(0, Math.min(budgetMs, 20000));
  let delivered = 0, failed = 0;
  for (let i = 0; i < Math.min(limit, 20); i++) {
    if (Date.now() >= stopAt) break;
    const now = new Date();
    const job = await prisma.notificationJob.findFirst({ where: { ...(jobId ? { id: jobId } : {}), attempts: { lt: 10 }, OR: [
      { status: { in: ["PENDING", "FAILED"] }, nextAttemptAt: { lte: now } },
      { status: "PROCESSING", lockedUntil: { lte: now } },
    ] }, orderBy: { nextAttemptAt: "asc" } });
    if (!job) break;
    const claimed = await prisma.notificationJob.updateMany({ where: { id: job.id, status: job.status, updatedAt: job.updatedAt, lockedUntil: job.lockedUntil }, data: { status: "PROCESSING", attempts: { increment: 1 }, lockedUntil: new Date(now.getTime() + 120000) } });
    if (!claimed.count) continue;
    // Never deliver receipt emails queued by an older deployment.
    if (job.kind.endsWith("_RECEIPT_EMAIL")) {
      await prisma.notificationJob.update({ where: { id: job.id }, data: { status: "SKIPPED", lockedUntil: null, lastError: null, sentAt: null } });
      continue;
    }
    try {
      await deliver(job);
      await prisma.notificationJob.update({ where: { id: job.id }, data: { status: "DELIVERED", lockedUntil: null, lastError: null, sentAt: new Date() } });
      delivered++;
    } catch {
      const exhausted = job.attempts + 1 >= 10;
      await prisma.notificationJob.update({ where: { id: job.id }, data: { status: exhausted ? "EXHAUSTED" : "FAILED", lockedUntil: null, lastError: "配送に失敗しました。SMTP・Discord設定と到達状況を確認してください。", nextAttemptAt: new Date(Date.now() + Math.min(3600000, 30000 * 2 ** job.attempts)) } });
      console.error("Notification delivery failed", { jobId: job.id, kind: job.kind });
      failed++;
    }
  }
  return { delivered, failed };
}
