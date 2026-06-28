import React from "react";
import { CheckCircle2 } from "lucide-react";

export function KeyPoints({ children, title = "重要なポイント" }: { children: React.ReactNode, title?: string }) {
  return (
    <div className="bg-white border-2 border-blue-100 rounded-2xl p-6 my-10 shadow-[0_4px_20px_-10px_rgba(59,130,246,0.15)] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
      <div className="flex items-center gap-2 mb-4 text-blue-700">
        <CheckCircle2 className="w-6 h-6" />
        <h3 className="text-lg font-black m-0 p-0 border-none">{title}</h3>
      </div>
      <div className="text-slate-700 font-medium space-y-3 [&>ul]:list-none [&>ul]:p-0 [&>ul>li]:flex [&>ul>li]:items-start [&>ul>li]:gap-3 [&>ul>li]:mb-3 [&>ul>li::before]:hidden [&>ol]:pl-5 [&>ol>li]:mb-2 [&>ol>li::marker]:font-bold [&>ol>li::marker]:text-blue-500">
        {children}
      </div>
    </div>
  );
}
