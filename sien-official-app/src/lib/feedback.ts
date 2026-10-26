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
  memo: string;
  comparison: "first" | "compare" | "skip";
  reviewed: boolean;
  aiQuestions: string[];
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
    memo: "", comparison: "first", reviewed: false, aiQuestions: [],
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
  if (!value.reviewed) errors.push("文章と評価を確認し、「内容を確認・修正しました」にチェックしてください。");
  if (!value.summary.trim()) errors.push("総評を入力してください。");
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

export function buildCodexFeedbackRequest(order: { clientName: string; songTitle: string | null }, content: FeedbackContent, previous: string): string {
  return [
    "$sien-feedback-pdf を使って、以下のメモを整理し、SIEN.OFFICIALの固定デザインでフィードバックPDFを作成してください。",
    "ロゴ・書体・配色・余白・見出し・評価欄は固定の描画スクリプトを使い、デザインを作り直さないでください。外部AI APIは呼び出さないでください。",
    `クライアント名：${order.clientName}`, `楽曲名：${order.songTitle || "未設定"}`, `発行日：${content.date}`,
    `比較：${content.comparison === "first" ? "今回が初回。前回比較は掲載しない" : content.comparison === "skip" ? "今回は比較しない" : "前回と比較する。確認できる変化のみ記載"}`,
    "", "【気づいたこと・順不同のメモ】", content.memo,
    ...(content.comparison === "compare" && previous ? ["", "【前回のフィードバック本文・比較用】", previous] : []),
    "", "メモにない長所・具体的な原因は作り足さず、曖昧な点は確認事項として伝えてください。PDFに依頼IDや管理用メモを掲載しないでください。",
  ].join("\n");
}
