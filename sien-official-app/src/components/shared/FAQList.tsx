import { HelpCircle } from "lucide-react";

export function FAQList({ faqs }: { faqs: any[] }) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="space-y-4">
      {faqs.map((faq, i) => (
        <div key={faq.id || i} className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-orange-200 transition-colors">
          <h3 className="font-bold text-slate-800 flex gap-3 mb-3">
            <span className="text-orange-600">Q.</span>
            {faq.question}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed pl-7 border-l-2 border-slate-200 whitespace-pre-wrap">
            <span className="text-slate-400 font-bold mr-2">A.</span>
            {faq.answer}
          </p>
        </div>
      ))}
    </div>
  );
}
