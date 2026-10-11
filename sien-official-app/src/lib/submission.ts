import { createHash, randomBytes } from "node:crypto";
import type { Prisma, SubmissionReceipt } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError, textField } from "@/lib/api-input";
import { queueNotifications } from "@/lib/notifications";

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}`;
  return JSON.stringify(value) ?? "null";
}

export function submissionIdentity(body: Record<string, unknown>, entityType: "ORDER" | "BUSINESS") {
  const key = textField(body, "idempotencyKey", true, 80);
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(key)) throw new ApiError(400, "送信情報が無効です。ページを再読み込みしてください。");
  const ignored = new Set(["idempotencyKey", "price", "basePrice", "optionPrice", "isRepeater", "options"]);
  return { entityType, requestKey: createHash("sha256").update(`${entityType}:${key}`).digest("hex"), payloadHash: createHash("sha256").update(canonical(Object.fromEntries(Object.entries(body).filter(([field]) => !ignored.has(field))))).digest("hex") };
}

function verifyReceipt(receipt: SubmissionReceipt | null, payloadHash: string) {
  if (receipt && receipt.payloadHash !== payloadHash) throw new ApiError(409, "以前の内容は受付済みです。変更後の内容を別の依頼として送る場合は、新しい依頼を作成してください。", undefined, "IDEMPOTENCY_CONFLICT");
  return receipt;
}

export async function existingSubmission(identity: ReturnType<typeof submissionIdentity>) {
  return verifyReceipt(await prisma.submissionReceipt.findUnique({ where: { requestKey: identity.requestKey } }), identity.payloadHash);
}

export async function acceptSubmission(identity: ReturnType<typeof submissionIdentity>, quote: Prisma.InputJsonValue, create: (tx: Prisma.TransactionClient) => Promise<{ id: string }>, consent?: { termsVersion: string; consentedAt: Date }) {
  return prisma.$transaction(async tx => {
    const lock = BigInt.asIntN(64, BigInt(`0x${identity.requestKey.slice(0, 16)}`));
    await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(${lock})`;
    const existing = verifyReceipt(await tx.submissionReceipt.findUnique({ where: { requestKey: identity.requestKey } }), identity.payloadHash);
    if (existing) return existing;
    const entity = await create(tx);
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()).replaceAll("-", "");
    const receipt = await tx.submissionReceipt.create({ data: { ...identity, entityId: entity.id, receiptNumber: `S-${date}-${randomBytes(8).toString("hex").toUpperCase()}`, quote, ...consent } });
    await queueNotifications(tx, identity.entityType, entity.id);
    return receipt;
  }, { maxWait: 10000, timeout: 15000 });
}

export function submissionResponse(receipt: SubmissionReceipt) {
  return { success: true, [receipt.entityType === "ORDER" ? "orderId" : "contactId"]: receipt.entityId, receiptNumber: receipt.receiptNumber, estimate: receipt.quote };
}
