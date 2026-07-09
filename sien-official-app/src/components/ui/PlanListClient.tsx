"use client";

import { useState } from "react";
import { PlanCard, Plan } from "./PlanCard";

export function PlanListClient({ plans }: { plans: Plan[] }) {
  const [activeTab, setActiveTab] = useState<"normal" | "express" | "bulk">("normal");

  const bulkPlans = plans.filter((p) => p.name.includes("本セット"));
  const expressPlans = plans.filter((p) => p.name.includes("納期") || p.name.includes("特急"));
  const normalPlans = plans.filter((p) => !p.name.includes("本セット") && !p.name.includes("納期") && !p.name.includes("特急"));

  const displayPlans = activeTab === "normal" ? normalPlans : activeTab === "express" ? expressPlans : bulkPlans;

  return (
    <div className="w-full">
      {/* タブ切り替えUI */}
      <div className="flex justify-center mb-10 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
        <div className="inline-flex flex-nowrap bg-slate-100/80 backdrop-blur-sm p-1.5 rounded-full border border-slate-200/50 shadow-inner whitespace-nowrap min-w-max">
          <button
            onClick={() => setActiveTab("normal")}
            className={`relative px-5 py-2.5 sm:px-8 sm:py-3 rounded-full text-sm sm:text-base font-bold transition-all duration-300 ${
              activeTab === "normal"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            基本プラン
          </button>
          <button
            onClick={() => setActiveTab("express")}
            className={`relative px-5 py-2.5 sm:px-8 sm:py-3 rounded-full text-sm sm:text-base font-bold transition-all duration-300 ${
              activeTab === "express"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            特急プラン
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`relative px-5 py-2.5 sm:px-8 sm:py-3 rounded-full text-sm sm:text-base font-bold transition-all duration-300 ${
              activeTab === "bulk"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            まとめ依頼 (お得)
            {/* 赤丸のNEWバッジ */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </button>
        </div>
      </div>

      {/* プランカード一覧 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
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
    </div>
  );
}
