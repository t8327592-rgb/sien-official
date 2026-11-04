import { ApiError, apiErrorResponse, readJson, textField } from "@/lib/api-input";
import { existingSubmission, submissionIdentity, submissionResponse } from "@/lib/submission";

export async function POST(request: Request) {
  try {
    const body = await readJson(request, 128_000);
    if (Object.entries(body).some(([field, value]) => {
      if (field === "songs") return !Array.isArray(value) || value.some(song => !song || typeof song !== "object" || Array.isArray(song) || Object.values(song).some(item => typeof item !== "string"));
      if (field === "optionIds") return !Array.isArray(value) || value.some(id => typeof id !== "string");
      if (field === "optionQuantities") return !value || typeof value !== "object" || Array.isArray(value) || Object.values(value).some(quantity => typeof quantity !== "number");
      return typeof value !== "string" && typeof value !== "boolean";
    })) throw new ApiError(400, "入力形式が正しくありません。");
    const key = textField(body, "idempotencyKey", true, 36);
    if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(key)) throw new ApiError(400, "送信情報が無効です。");
    // Retry a saved submission from a tab that still has the former form open.
    const identity = submissionIdentity({ ...body, idempotencyKey: `autumn-sale-${key}` }, "ORDER");
    const receipt = await existingSubmission(identity);
    if (receipt) return Response.json(submissionResponse(receipt));
    throw new ApiError(409, "受付は通常のご依頼フォームに移動しました。");
  } catch (error) {
    return apiErrorResponse(error) ?? Response.json({ success: false, error: "受付結果を確認できませんでした。" }, { status: 503 });
  }
}
