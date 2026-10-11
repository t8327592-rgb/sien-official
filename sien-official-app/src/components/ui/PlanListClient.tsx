"use client";

import { DELIVERY_TERMS } from "@/lib/contract-terms";
import { useState } from "react";
import { PlanCard } from "./PlanCard";
import { Plan } from "@prisma/client";

export function PlanListClient({ plans }: { plans: Plan[] }) {
  const [activeTab, setActiveTab] = useState<"normal" | "express" | "bulk">("normal");

  const bulkPlans = plans.filter((p) => p.name.includes("本セット"));
  const expressPlans = plans.filter((p) => p.name.includes("納期") || p.name.includes("特急"));
  const normalPlans = plans.filter((p) => !p.name.includes("本セット") && !p.name.includes("納期") && !p.name.includes("特急"));

  const displayPlans = activeTab === "normal" ? normalPlans : activeTab === "express" ? expressPlans : bulkPlans;

  return (
    <div className="w-full">
      {/* タブ切り替えUI */}
      <div className="flex justify-center mb-10">
        <div className="grid grid-cols-3 sm:inline-flex w-full sm:w-auto bg-slate-100/80 backdrop-blur-sm p-1.5 rounded-full border border-slate-200/50 shadow-inner">
          <button
            aria-pressed={activeTab === "normal"} onClick={() => setActiveTab("normal")}
            className={`relative min-h-12 px-1 py-2.5 sm:px-8 sm:py-3 rounded-full text-xs sm:text-base font-bold transition-all duration-300 ${
              activeTab === "normal"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            基本プラン
          </button>
          <button
            aria-pressed={activeTab === "express"} onClick={() => setActiveTab("express")}
            className={`relative min-h-12 px-1 py-2.5 sm:px-8 sm:py-3 rounded-full text-xs sm:text-base font-bold transition-all duration-300 ${
              activeTab === "express"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            特急プラン
          </button>
          <button
            aria-pressed={activeTab === "bulk"} onClick={() => setActiveTab("bulk")}
            className={`relative min-h-12 px-1 py-2.5 sm:px-8 sm:py-3 rounded-full text-xs sm:text-base font-bold transition-all duration-300 ${
              activeTab === "bulk"
                ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            まとめ依頼 (お得)
            {bulkPlans.length > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />}
          </button>
        </div>
      </div>

      {/* プランカード一覧 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        {displayPlans.length === 0 ? (
          <p className="text-center text-slate-500 col-span-full">プランが見つかりませんでした。</p>
        ) : (
          displayPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isRecommended={plan.name.includes("スタンダード")}
              recommendedText={plan.name.includes("スタンダード") ? "★ 一番人気" : undefined}
            />
          ))
        )}
      </div>
      <p className="mx-auto mt-6 max-w-4xl text-sm leading-relaxed text-slate-600">{DELIVERY_TERMS}</p>
    </div>
  );
}
