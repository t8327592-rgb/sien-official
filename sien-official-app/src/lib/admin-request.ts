// JSON errors and non-JSON failures must both reach the editor; HTTP failures do not reject fetch.
export async function adminRequest(url: string, method: string, body?: unknown) {
  let response: Response;
  try {
    response = await fetch(url, { method, headers: body === undefined ? undefined : { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  } catch { throw new Error("通信に失敗しました。保存状態を確認してから再試行してください。"); }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || data.success === false) throw new Error(typeof data?.error === "string" ? data.error : "保存できませんでした。入力内容を保持しています。");
  return data;
}
