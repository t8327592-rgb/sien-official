export function externalText(value: unknown, clientName?: string) {
  let text = typeof value === "string" ? value : "";
  if (clientName) text = text.split(clientName).join("[お客様]");
  return text.replace(/https?:\/\/[^\s<>()]+/gi, "[共有URL省略]")
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, "[メール省略]")
    .replace(/@[A-Za-z0-9_]{1,30}/g, "[SNS ID省略]")
    .replace(/(?:\+81|0)\d[\d -]{8,12}/g, "[電話番号省略]");
}
