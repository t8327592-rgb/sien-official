import React from "react";
import { CheckCircle2 } from "lucide-react";

export function KeyPoints({ children, title = "重要なポイント" }: { children: React.ReactNode, title?: string }) {
  return (
    <div className="bg-white border-2 border-blue-100 rounded-3xl p-6 md:p-10 my-12 shadow-[0_8px_30px_-10px_rgba(59,130,246,0.15)] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
      <div className="flex items-center gap-2 md:gap-3 mb-6 text-blue-700">
        <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
        <h3 className="text-xl md:text-2xl font-black m-0 p-0 border-none">{title}</h3>
      </div>
      <div className="text-slate-800 font-bold md:text-[18px] space-y-4 md:space-y-5 [&>ul]:list-none [&>ul]:p-0 [&>ul>li]:flex [&>ul>li]:items-start [&>ul>li]:gap-3 md:[&>ul>li]:gap-4 [&>ul>li]:mb-4 md:[&>ul>li]:mb-5 [&>ul>li::before]:hidden [&>ol]:pl-5 [&>ol>li]:mb-3 md:[&>ol>li]:mb-4 [&>ol>li::marker]:font-bold [&>ol>li::marker]:text-blue-500">
        {children}
      </div>
    </div>
  );
}
