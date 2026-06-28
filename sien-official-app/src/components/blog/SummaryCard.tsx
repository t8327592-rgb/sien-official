import React from "react";
import { Check } from "lucide-react";

export function SummaryCard({ children, title = "今日のポイント" }: { children: React.ReactNode, title?: string }) {
  return (
    <div className="bg-orange-50 border-2 border-orange-200 rounded-3xl p-6 md:p-10 my-16 shadow-sm relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6 text-orange-800">
        <div className="bg-orange-500 text-white rounded-full p-1.5 flex items-center justify-center">
          <Check className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
        </div>
        <h3 className="text-xl md:text-2xl font-black m-0 p-0 border-none">{title}</h3>
      </div>
      <div className="text-slate-800 font-bold md:text-[18px] space-y-4 md:space-y-5 [&>ul]:list-none [&>ul]:p-0 [&>ul>li]:flex [&>ul>li]:items-start [&>ul>li]:gap-3 md:[&>ul>li]:gap-4 [&>ul>li]:mb-4 md:[&>ul>li]:mb-5 [&>ul>li::before]:hidden [&>ol]:pl-5 [&>ol>li]:mb-3 md:[&>ol>li]:mb-4 [&>ol>li::marker]:font-bold [&>ol>li::marker]:text-orange-600">
        {children}
      </div>
    </div>
  );
}
