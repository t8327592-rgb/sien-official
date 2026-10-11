const UNCERTAIN_RESULT = "通信エラーのため受付結果を確認できませんでした。入力内容は保持されています。同じ内容で再送すると、重複せず受付結果を確認できます。";

export class FormSubmissionError extends Error {
  public readonly retryUntil: number;
  constructor(message: string, public retryAfter = 0, public status = 0, public code = "") {
    super(message);
    this.retryUntil = retryAfter > 0 ? Date.now() + retryAfter * 1000 : 0;
  }
}

export async function submitForm(url: string, body: object) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: controller.signal });
    const result: unknown = await response.json().catch(() => null);
    const record = result && typeof result === "object" && !Array.isArray(result) ? result as Record<string, unknown> : null;
    if (!response.ok) {
      const retryAfter = Math.min(86400, Math.max(0, Number(response.headers.get("Retry-After")) || Number(record?.retryAfter) || 0));
      throw new FormSubmissionError(typeof record?.error === "string" ? record.error : UNCERTAIN_RESULT, retryAfter, response.status, record?.code === "IDEMPOTENCY_CONFLICT" ? record.code : "");
    }
    if (record?.success !== true || typeof record.receiptNumber !== "string" || !/^S-[0-9]{8}-[A-F0-9]{16}$/.test(record.receiptNumber)) throw new FormSubmissionError(UNCERTAIN_RESULT);
    const estimate = record.estimate && typeof record.estimate === "object" ? record.estimate as Record<string, unknown> : null;
    const estimatePrice = typeof estimate?.price === "number" && Number.isSafeInteger(estimate.price) && estimate.price >= 0 ? estimate.price : null;
    return { receiptNumber: record.receiptNumber, estimate: record.estimate, estimatePrice };
  } catch (error) {
    if (error instanceof FormSubmissionError) throw error;
    throw new FormSubmissionError(UNCERTAIN_RESULT);
  } finally { clearTimeout(timer); }
}
