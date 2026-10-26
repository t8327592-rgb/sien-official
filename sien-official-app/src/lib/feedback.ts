export const FEEDBACK_RATINGS = ["未評価", "良好", "少し気になる", "優先して改善", "確認対象外"] as const;
export const FEEDBACK_ITEMS = [
  { key: "noise", label: "ノイズ", group: "recording" },
  { key: "room", label: "部屋の響き", group: "recording" },
  { key: "level", label: "録音音量・音割れ", group: "recording" },
  { key: "mic", label: "マイクとの距離・吹かれ", group: "recording" },
  { key: "pitch", label: "ピッチ", group: "vocal" },
  { key: "rhythm", label: "リズム", group: "vocal" },
  { key: "words", label: "発音・語尾", group: "vocal" },
  { key: "expression", label: "表現・抑揚", group: "vocal" },
] as const;
export type FeedbackKey = typeof FEEDBACK_ITEMS[number]["key"];
export type FeedbackRating = typeof FEEDBACK_RATINGS[number];
export function feedbackClientName(name: string): string {
  const trimmed = name.trim();
  return /(?:様|御中)$/.test(trimmed) ? trimmed : `${trimmed} 様`;
}
export type FeedbackContent = {
  date: string;
  summary: string;
  strengths: string;
  items: Record<FeedbackKey, { rating: FeedbackRating; comment: string }>;
  priorities: { title: string; observation: string; action: string }[];
  changes: string;
  closing: string;
};
export function emptyFeedback(): FeedbackContent {
  return {
    date: new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date()),
    summary: "", strengths: "",
    items: Object.fromEntries(FEEDBACK_ITEMS.map(({ key }) => [key, { rating: "未評価", comment: "" }])) as FeedbackContent["items"],
    priorities: Array.from({ length: 3 }, () => ({ title: "", observation: "", action: "" })),
    changes: "", closing: "",
  };
}

// Shared by the editor and export route: incomplete drafts can be saved, but
// an unfinished assessment must not accidentally become a client deliverable.
export function feedbackExportErrors(value: FeedbackContent): string[] {
  const errors: string[] = [];
  if (!value.summary.trim()) errors.push("総評を入力してください。");
  if (!value.strengths.trim()) errors.push("よかったところを入力してください。");
  for (const { key, label } of FEEDBACK_ITEMS) {
    const item = value.items[key];
    if (item.rating === "未評価") errors.push(`${label}の評価を選択してください。`);
    if (item.rating !== "確認対象外" && !item.comment.trim()) errors.push(`${label}のコメントを入力してください。`);
  }
  for (const [index, point] of value.priorities.entries()) {
    if ([point.title, point.observation, point.action].some(s => s.trim()) &&
      [point.title, point.observation, point.action].some(s => !s.trim())) {
      errors.push(`改善ポイント${index + 1}の見出し・所見・試し方をすべて入力してください。`);
    }
  }
  return errors;
}
