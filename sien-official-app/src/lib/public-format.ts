export function formatYen(amount: number | null | undefined) {
  return amount == null ? "要相談" : `${amount.toLocaleString("ja-JP")}円（税込）`;
}

export function displayText(text: string | null | undefined) {
  return (text ?? "").replace(/\\n/g, "\n").replace(/2026年7月8日[（(]火[）)]/g, "2026年7月8日（水）");
}

export function formatPublicDate(date: Date | string) {
  return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(date));
}

export function formatOptionPrice(text: string) {
 const value = displayText(text).replace(/[（(]税込[）)]/g, "").trim();
 return value.includes("円") ? value + "（税込）" : value;
}
