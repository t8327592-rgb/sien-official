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
    const entityId = url === "/api/business-contact" ? record?.contactId : record?.orderId;
    if (record?.success !== true || typeof entityId !== "string" || !entityId.trim()) throw new FormSubmissionError(UNCERTAIN_RESULT);
    return { entityId };
  } catch (error) {
    if (error instanceof FormSubmissionError) throw error;
    throw new FormSubmissionError(UNCERTAIN_RESULT);
  } finally { clearTimeout(timer); }
}
