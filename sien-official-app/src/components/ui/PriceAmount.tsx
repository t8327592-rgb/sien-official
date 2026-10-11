import { formatYen } from "@/lib/public-format";

export function PriceAmount({ value }: { value: number | null }) {
  if (value === null) return <>要相談</>;
  return <span aria-label={formatYen(value)} className="inline-flex flex-wrap items-baseline justify-center gap-x-1"><span>{value.toLocaleString("ja-JP")}</span><span className="text-base font-bold text-slate-500">円<span className="ml-1 text-xs">（税込）</span></span></span>;
}
