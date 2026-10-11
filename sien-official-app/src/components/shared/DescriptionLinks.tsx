import { displayText } from "@/lib/public-format";

export function DescriptionLinks({ text }: { text: string | null }) {
  const description = displayText(text).replace(/サンプルを見る\s*[:：]\s*(?=https?:\/\/)/g, "");
  return <>{description.split(/(https?:\/\/[^\s<>"'）)]+)/g).map((part, index) => {
    if (!/^https?:\/\//.test(part)) return part;
    try {
      const url = new URL(part);
      if (url.username || url.password) return part;
      return <a key={index} href={url.href} target="_blank" rel="noopener noreferrer" className="text-orange-800 underline underline-offset-4">サンプルを見る（外部サイト）</a>;
    } catch { return part; }
  })}</>;
}
