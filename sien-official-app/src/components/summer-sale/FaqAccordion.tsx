"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItemProps {
  question: string;
  answer: string | React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

function FaqItem({ question, answer, isOpen, onClick }: FaqItemProps) {
  return (
    <div className="border border-slate-100 bg-white rounded-2xl overflow-hidden transition-all duration-200">
      <button
        onClick={onClick}
        className="w-full px-6 py-5 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <span className="font-bold text-slate-900 pr-4 flex gap-3">
          <span className="text-cyan-500 font-black">Q.</span>
          {question}
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-600 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="flex gap-3 text-slate-600 text-sm md:text-base leading-relaxed pt-2 border-t border-slate-50">
          <span className="text-blue-500 font-black">A.</span>
          <div>{answer}</div>
        </div>
      </div>
    </div>
  );
}

interface FaqAccordionProps {
  items: { question: string; answer: string | React.ReactNode }[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // 最初だけ開けておく

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <FaqItem
          key={index}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === index}
          onClick={() => handleClick(index)}
        />
      ))}
    </div>
  );
}
