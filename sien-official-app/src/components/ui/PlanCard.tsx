import { displayText } from "@/lib/public-format";
import { PriceAmount } from "@/components/ui/PriceAmount";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plan } from "@prisma/client";
import { initialDraftDescription } from "@/lib/contract-terms";

type PlanCardProps = {
  plan: Plan;
  isRecommended?: boolean;
  recommendedText?: string;
  themeColor?: "blue" | "cyan";
  recommendedUsers?: string[];
  isNew?: boolean;
};

export function PlanCard({ plan, isRecommended = false, recommendedText = "人気 No.1", themeColor = "blue", recommendedUsers, isNew = false }: PlanCardProps) {
  const isBlue = themeColor === "blue";

  const borderColorHover = isBlue ? "hover:border-orange-300" : "hover:border-amber-300";
  const borderRecommended = isBlue ? "border-orange-400 ring-1 ring-orange-400" : "border-amber-400 ring-1 ring-amber-400";
  const shadowRecommended = isBlue ? "shadow-xl shadow-orange-900/5" : "shadow-xl shadow-amber-900/5";
  const badgeGradient = isBlue ? "from-orange-500 to-amber-500" : "from-amber-500 to-orange-400";

  const isBulkPlan = plan.name.includes("本セット");

  let featuresList: string[] = [];
  if (plan.features) {
    try {
      const parsed = JSON.parse(plan.features);
      featuresList = Array.isArray(parsed) ? parsed : [];
    } catch {
      featuresList = plan.features.split('\n');
    }
  }

  return (
    <div className={`relative bg-white rounded-3xl p-5 md:p-8 border transition-all duration-300 flex flex-col h-full ${
      isRecommended ? `${borderRecommended} ${shadowRecommended}` : `border-slate-200 shadow-sm ${borderColorHover}`
    }`}>

      {isBulkPlan && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100 to-transparent rounded-tr-3xl rounded-bl-[4rem] -z-0 opacity-50 pointer-events-none"></div>
      )}

      {isRecommended && (
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r ${badgeGradient} text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-md whitespace-nowrap z-10`}>
          {recommendedText}
        </div>
      )}

      {isNew && !isRecommended && (
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-orange-700 text-white px-5 py-1.5 rounded-full text-xs font-black tracking-widest shadow-md whitespace-nowrap z-10`}>
          NEW
        </div>
      )}

      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-2 text-slate-800">{plan.name}</h3>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 flex-wrap flex items-end gap-1">
          <PriceAmount value={plan.price} />
        </div>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed whitespace-pre-wrap">
          {displayText(initialDraftDescription(plan.description))}
        </p>

        {recommendedUsers && recommendedUsers.length > 0 && (
          <div className="mb-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 mb-3">こんな方におすすめ</h4>
            <ul className="space-y-2">
              {recommendedUsers.map((user, i) => (
                <li key={i} className="flex items-start text-sm text-slate-700">
                  <span className="text-orange-700 mr-2 shrink-0">✔</span>
                  <span className="font-medium">{user}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {featuresList.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">プラン内容</h4>
            <ul className="space-y-2.5">
              {featuresList.map((feature, i) => {
                const isHighlight = feature.includes("お得") || feature.includes("OFF");
                return (
                  <li key={i} className={`flex items-start text-sm ${isHighlight ? 'text-orange-700 font-bold' : 'text-slate-700 font-medium'}`}>
                    <span className={`mr-2 shrink-0 mt-0.5 ${isHighlight ? 'text-orange-700' : 'text-orange-400/50'}`}>✓</span>
                    <span className="leading-snug">{feature}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-auto relative z-10">
        <div className="bg-slate-50 rounded-2xl p-4 mb-5 md:mb-8 text-sm text-slate-600 space-y-3 border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">初稿提出目安</span>
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
          variant={isRecommended || isBulkPlan ? "gradient" : "outline"}
        >
          <Link href={`/order?plan=${plan.id}`}>このプランで依頼する</Link>
        </Button>
      </div>
    </div>
  );
}
