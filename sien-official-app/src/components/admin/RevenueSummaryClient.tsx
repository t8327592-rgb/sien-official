"use client";

import { useState } from "react";
import { TrendingUp, Eye, EyeOff } from "lucide-react";

type Props = {
  thisMonthRevenue: number;
  thisYearRevenue: number;
  thisMonthOrdersCount: number;
  completedCount: number;
  monthlyData: { month: string; revenue: number }[];
  maxMonthlyRevenue: number;
};

export function RevenueSummaryClient({
  thisMonthRevenue,
  thisYearRevenue,
  thisMonthOrdersCount,
  completedCount,
  monthlyData,
  maxMonthlyRevenue
}: Props) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-400" />
          売上サマリー
        </h2>
        <button 
          onClick={() => setIsVisible(!isVisible)}
          className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 border border-slate-100 px-2 py-1 rounded"
        >
          {isVisible ? <><EyeOff className="w-3 h-3"/> 隠す</> : <><Eye className="w-3 h-3"/> 金額を表示</>}
        </button>
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        {/* 上部 KPI */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-[10px] font-bold text-slate-500">今月の売上</div>
            <div className="text-2xl font-black text-slate-900">
              {isVisible ? `¥${thisMonthRevenue.toLocaleString()}` : '¥ ***,***'}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500">今年の累計</div>
            <div className="text-xl font-bold text-slate-700 mt-1">
              {isVisible ? `¥${thisYearRevenue.toLocaleString()}` : '¥ ***,***'}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500">今月の新規依頼</div>
            <div className="text-lg font-bold text-slate-700">{thisMonthOrdersCount}<span className="text-[10px] font-normal ml-1">件</span></div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500">今年の納品数</div>
            <div className="text-lg font-bold text-slate-700">{completedCount}<span className="text-[10px] font-normal ml-1">件</span></div>
          </div>
        </div>

        {/* 下部 簡易グラフ */}
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-end justify-between gap-1 h-16 px-1">
            {monthlyData.map((data, index) => {
              const heightPercent = maxMonthlyRevenue > 0 ? Math.max((data.revenue / maxMonthlyRevenue) * 100, 4) : 4;
              return (
                <div key={index} className="flex-1 flex flex-col justify-end h-full group relative cursor-default">
                  <div 
                    className={`w-full rounded-sm transition-colors ${isVisible ? 'bg-slate-200 group-hover:bg-orange-400' : 'bg-slate-100'}`}
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  {/* Tooltip */}
                  {isVisible && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                      ¥{data.revenue.toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1 px-1">
            <span>{monthlyData[0].month}</span>
            <span>{monthlyData[monthlyData.length-1].month}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
