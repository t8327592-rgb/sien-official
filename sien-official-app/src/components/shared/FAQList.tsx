import Link from "next/link";
import type { PublicFAQ } from "@/lib/data/public-faqs";

export function FAQList({ faqs }: { faqs: PublicFAQ[] }) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <details key={faq.id || i} className="rounded-2xl border border-slate-200 bg-white open:border-orange-200">
          <summary className="min-h-12 cursor-pointer p-4 font-bold text-slate-800 md:p-5">
            <span className="text-orange-700">Q.</span>
            {faq.question}
          </summary>
          <div id={`faq-${faq.id}`} className="scroll-mt-24 px-4 pb-5 md:px-5">
          <p className="text-slate-600 text-sm leading-relaxed pl-4 border-l-2 border-orange-200 whitespace-pre-wrap">
            <span className="text-slate-600 font-bold mr-2">A.</span>
            {faq.answer}
          </p>
          </div>
        </details>
      ))}
      <p className="flex flex-wrap gap-4 text-sm"><Link href="/order?intent=CONSULTATION" className="font-bold text-orange-800 underline">解決しない場合は無料相談へ</Link><Link href="/policy/guidelines" className="text-orange-800 underline">留意事項を確認する</Link></p>
    </div>
  );
}
