"use client";

import { useState } from "react";
import { TrendingUp, Eye, EyeOff } from "lucide-react";

type RevenueDataSet = {
  thisMonthRevenue: number;
  thisYearRevenue: number;
  orderCount: number;
  monthlyData: { month: string; revenue: number }[];
  maxMonthlyRevenue: number;
};

type Props = {
  thisMonthOrdersCount: number;
  createdData: RevenueDataSet;
  deliveredData: RevenueDataSet;
};

export function RevenueSummaryClient({
  thisMonthOrdersCount,
  createdData,
  deliveredData
}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [mode, setMode] = useState<"created" | "delivered">("created");

  const currentData = mode === "created" ? createdData : deliveredData;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h2 className="text-sm font-bold text-slate-800 flex flex-wrap items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-400" />
          売上サマリー
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {/* ベース切り替えトグル */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              aria-pressed={mode === "created"} onClick={() => setMode("created")}
              className={`min-h-11 px-3 py-2 text-xs font-bold rounded-md transition-colors ${mode === "created" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              受注ベース
            </button>
            <button
              aria-pressed={mode === "delivered"} onClick={() => setMode("delivered")}
              className={`min-h-11 px-3 py-2 text-xs font-bold rounded-md transition-colors ${mode === "delivered" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              納品ベース
            </button>
          </div>

          <button
            aria-pressed={isVisible} aria-label={isVisible ? "売上金額を隠す" : "売上金額を表示する"} onClick={() => setIsVisible(!isVisible)}
            className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 text-xs font-bold bg-slate-50 hover:bg-slate-100 border border-slate-100 min-h-11 px-3 py-2 rounded-lg"
          >
            {isVisible ? <><EyeOff className="w-3 h-3"/> 隠す</> : <><Eye className="w-3 h-3"/> 表示</>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        {/* 上部 KPI */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs font-bold text-slate-500">今月の売上</div>
            <div className="text-2xl font-black text-slate-900">
              {isVisible ? `¥${currentData.thisMonthRevenue.toLocaleString()}` : '¥ ***,***'}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">今年の累計</div>
            <div className="text-xl font-bold text-slate-700 mt-1">
              {isVisible ? `¥${currentData.thisYearRevenue.toLocaleString()}` : '¥ ***,***'}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">今月の新規依頼</div>
            <div className="text-lg font-bold text-slate-700">{thisMonthOrdersCount}<span className="text-xs font-normal ml-1">件</span></div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500">{mode === "created" ? "今年の受注数" : "今年の完了数"}</div>
            <div className="text-lg font-bold text-slate-700">{currentData.orderCount}<span className="text-xs font-normal ml-1">件</span></div>
          </div>
        </div>

        {/* 下部 簡易グラフ */}
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-end justify-between gap-1 h-16 px-1">
            {currentData.monthlyData.map((data, index) => {
              const heightPercent = currentData.maxMonthlyRevenue > 0 ? Math.max((data.revenue / currentData.maxMonthlyRevenue) * 100, 4) : 4;
              return (
                <div key={index} className="flex-1 flex flex-col justify-end h-full group relative cursor-default">
                  <div
                    className={`w-full rounded-sm transition-colors ${isVisible ? 'bg-slate-200 group-hover:bg-orange-400' : 'bg-slate-100'}`}
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  {/* Tooltip */}
                  {isVisible && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                      ¥{data.revenue.toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-bold mt-1 px-1">
            <span>{currentData.monthlyData[0].month}</span>
            <span>{currentData.monthlyData[currentData.monthlyData.length-1].month}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
