import { ApiError, textField } from "./api-input";
import { FEEDBACK_ITEMS, FEEDBACK_RATINGS, type FeedbackContent, type FeedbackRating } from "./feedback";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ApiError(400, "フィードバックの入力形式を確認してください。");
  return value as Record<string, unknown>;
}
export function validateFeedback(value: unknown): FeedbackContent {
  const body = record(value);
  const date = textField(body, "date", true, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new ApiError(400, "発行日を確認してください。");
  const inputItems = record(body.items);
  const items = Object.fromEntries(FEEDBACK_ITEMS.map(({ key }) => {
    const item = record(inputItems[key]);
    if (!FEEDBACK_RATINGS.includes(item.rating as FeedbackRating)) throw new ApiError(400, "評価の選択を確認してください。");
    return [key, { rating: item.rating, comment: textField(item, "comment", false, 600) }];
  })) as FeedbackContent["items"];
  if (!Array.isArray(body.priorities) || body.priorities.length > 3) throw new ApiError(400, "改善ポイントは３つまでです。");
  const priorities = body.priorities.map(value => {
    const point = record(value);
    return { title: textField(point, "title", false, 100), observation: textField(point, "observation", false, 600), action: textField(point, "action", false, 600) };
  });
  const comparison = body.comparison ?? (body.changes ? "compare" : "first");
  if (!["first", "compare", "skip"].includes(comparison as string)) throw new ApiError(400, "前回との比較方法を確認してください。");
  if (body.reviewed !== undefined && typeof body.reviewed !== "boolean") throw new ApiError(400, "確認状態を確認してください。");
  const aiQuestions = body.aiQuestions ?? [];
  if (!Array.isArray(aiQuestions) || aiQuestions.length > 12 || aiQuestions.some(q => typeof q !== "string" || q.length > 240)) throw new ApiError(400, "AI確認事項の形式を確認してください。");
  while (priorities.length < 3) priorities.push({ title: "", observation: "", action: "" });
  return { memo: textField(body, "memo", false, 6000), comparison: comparison as FeedbackContent["comparison"], reviewed: body.reviewed === true, aiQuestions, date, items, priorities, summary: textField(body, "summary", false, 1200), strengths: textField(body, "strengths", false, 1200), changes: textField(body, "changes", false, 1200), closing: textField(body, "closing", false, 600) };
}
export function feedbackVersion(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw new ApiError(400, "保存バージョンを確認してください。");
  return value;
}
