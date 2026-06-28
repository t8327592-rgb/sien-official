import React from "react";
import { Info, AlertTriangle, XCircle, CheckCircle, Lightbulb } from "lucide-react";

type InfoBoxProps = {
  type: "NOTE" | "IMPORTANT" | "WARNING" | "CAUTION" | "SUCCESS" | "TIP";
  children: React.ReactNode;
};

export function InfoBox({ type, children }: InfoBoxProps) {
  let bgClass = "";
  let borderClass = "";
  let iconClass = "";
  let titleClass = "";
  let Icon = Info;
  let defaultTitle = "";

  switch (type) {
    case "NOTE":
    case "IMPORTANT":
      bgClass = "bg-blue-50";
      borderClass = "border-blue-200";
      iconClass = "text-blue-500";
      titleClass = "text-blue-800";
      Icon = Info;
      defaultTitle = type === "IMPORTANT" ? "重要" : "ポイント";
      break;
    case "TIP":
      bgClass = "bg-orange-50";
      borderClass = "border-orange-200";
      iconClass = "text-orange-500";
      titleClass = "text-orange-800";
      Icon = Lightbulb;
      defaultTitle = "ヒント";
      break;
    case "WARNING":
      bgClass = "bg-yellow-50";
      borderClass = "border-yellow-300";
      iconClass = "text-yellow-600";
      titleClass = "text-yellow-800";
      Icon = AlertTriangle;
      defaultTitle = "注意";
      break;
    case "CAUTION":
      bgClass = "bg-red-50";
      borderClass = "border-red-200";
      iconClass = "text-red-500";
      titleClass = "text-red-800";
      Icon = XCircle;
      defaultTitle = "NG / 警告";
      break;
    case "SUCCESS":
      bgClass = "bg-emerald-50";
      borderClass = "border-emerald-200";
      iconClass = "text-emerald-600";
      titleClass = "text-emerald-800";
      Icon = CheckCircle;
      defaultTitle = "おすすめ";
      break;
    default:
      bgClass = "bg-slate-50";
      borderClass = "border-slate-200";
      iconClass = "text-slate-500";
      titleClass = "text-slate-800";
      Icon = Info;
      defaultTitle = "補足";
  }

  return (
    <div className={`my-10 p-6 md:p-8 rounded-2xl border-2 ${bgClass} ${borderClass} shadow-sm`}>
      <div className="flex items-center gap-2.5 mb-4">
        <Icon className={`w-6 h-6 md:w-7 md:h-7 ${iconClass}`} />
        <span className={`font-bold text-[17px] md:text-[19px] ${titleClass}`}>{defaultTitle}</span>
      </div>
      <div className="text-slate-800 text-[16px] md:text-[18px] leading-relaxed [&>p:last-child]:mb-0 [&>p:first-child]:mt-0">
        {children}
      </div>
    </div>
  );
}
