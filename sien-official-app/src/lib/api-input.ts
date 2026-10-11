export class ApiError extends Error {
  constructor(public status: number, message: string, public retryAfter?: number, public code?: string) { super(message); }
}

export async function readJson(request: Request, maxBytes = 24000): Promise<Record<string, unknown>> {
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "入力内容がありません。");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new ApiError(413, "入力内容が長すぎます。");
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body;
  } catch { throw new ApiError(400, "入力形式が正しくありません。"); }
}

export function textField(body: Record<string, unknown>, key: string, required = false, max = 500): string {
  const value = body[key];
  if (value === undefined || value === null) {
    if (required) throw new ApiError(400, `${key}は必須です。`);
    return "";
  }
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) {
    throw new ApiError(400, `${key}の入力を確認してください。`);
  }
  return value.trim();
}

export function emailField(body: Record<string, unknown>, key: string): string {
  const email = textField(body, key, true, 254).toLowerCase();
  if (!/^[^\s<>(),;:@]+@[^\s<>(),;:@]+\.[^\s<>(),;:@]+$/.test(email)) {
    throw new ApiError(400, "メールアドレスを確認してください。");
  }
  return email;
}

export function apiErrorResponse(error: unknown): Response | null {
  return error instanceof ApiError
    ? Response.json({ success: false, error: error.message, ...(error.code ? { code: error.code } : {}), ...(error.retryAfter ? { retryAfter: error.retryAfter } : {}) }, { status: error.status, headers: error.retryAfter ? { "Retry-After": String(error.retryAfter) } : undefined })
    : null;
}
