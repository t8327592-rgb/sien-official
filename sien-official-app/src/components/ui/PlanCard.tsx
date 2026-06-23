import Link from "next/link";
import { Button } from "@/components/ui/button";

export type Plan = {
  id: string;
  name: string;
  price: number | null;
  description: string | null;
  period: string | null;
  revisions: string | null;
};

type PlanCardProps = {
  plan: Plan;
  isRecommended?: boolean;
  recommendedText?: string;
  themeColor?: "blue" | "cyan";
  recommendedUsers?: string[];
};

export function PlanCard({ plan, isRecommended = false, recommendedText = "人気 No.1", themeColor = "blue", recommendedUsers }: PlanCardProps) {
  const isBlue = themeColor === "blue";
  
  const borderColorHover = isBlue ? "hover:border-orange-300" : "hover:border-amber-300";
  const borderRecommended = isBlue ? "border-orange-400 ring-1 ring-orange-400" : "border-amber-400 ring-1 ring-amber-400";
  const shadowRecommended = isBlue ? "shadow-xl shadow-orange-900/5" : "shadow-xl shadow-amber-900/5";
  const badgeGradient = isBlue ? "from-orange-600 to-amber-500" : "from-amber-500 to-orange-400";
  
  return (
    <div className={`relative bg-white rounded-3xl p-8 border transition-all duration-300 flex flex-col h-full ${
      isRecommended ? `${borderRecommended} ${shadowRecommended}` : `border-slate-200 shadow-sm ${borderColorHover}`
    }`}>
      {isRecommended && (
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r ${badgeGradient} text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-md whitespace-nowrap`}>
          {recommendedText}
        </div>
      )}
      
      <h3 className="text-xl font-bold mb-2 text-slate-800">{plan.name}</h3>
      <div className="text-3xl font-black text-slate-900 mb-4">
        {plan.price ? `${plan.price.toLocaleString()}円` : "要相談"}
      </div>
      <p className="text-slate-600 text-sm mb-6 leading-relaxed whitespace-pre-wrap">
        {plan.description}
      </p>
      
      {recommendedUsers && recommendedUsers.length > 0 && (
        <div className="mb-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 mb-3">こんな方におすすめ</h4>
          <ul className="space-y-2">
            {recommendedUsers.map((user, i) => (
              <li key={i} className="flex items-start text-sm text-slate-700">
                <span className="text-orange-500 mr-2 shrink-0">✔</span>
                <span className="font-medium">{user}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-auto">
        <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-sm text-slate-600 space-y-3 border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">目安納期</span>
            <span className="font-bold text-slate-900">{plan.period || "-"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">無料修正</span>
            <span className="font-bold text-slate-900">{plan.revisions || "-"}</span>
          </div>
        </div>

        <Button 
          asChild 
          className="w-full rounded-full h-12 text-md font-bold shadow-md transition-all hover:scale-105" 
          variant={isRecommended ? "gradient" : "outline"}
        >
          <Link href={`/order?plan=${plan.id}`}>このプランで依頼する</Link>
        </Button>
      </div>
    </div>
  );
}
