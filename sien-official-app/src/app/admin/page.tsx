import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RevenueSummaryClient } from "@/components/admin/RevenueSummaryClient";
import { 
  ArrowRight, FileText, CheckCircle2, AlertCircle, 
  Briefcase, TrendingUp, Clock, Activity, MessageSquare, Star, 
  Check, AlertTriangle
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const now = new Date();
  
  // 今日の範囲
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  // 今月の範囲
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // 今年の範囲
  const thisYearStart = new Date(now.getFullYear(), 0, 1);
  
  // 過去6ヶ月の範囲（グラフ用）
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // 未完了のアクティブな全案件を取得し、今日締切・超過・ステータス別に振り分ける
  const activeOrders = await prisma.order.findMany({ 
    where: { status: { in: ["PENDING", "ESTIMATING", "WORKING"] } },
    orderBy: { updatedAt: "desc" }
  });

  const pendingCount = activeOrders.filter(o => o.status === "PENDING").length;
  const estimatingCount = activeOrders.filter(o => o.status === "ESTIMATING").length;
  const workingOrders = activeOrders.filter(o => o.status === "WORKING");

  let deadlineTodayCount = 0;
  let deadlineOverdueCount = 0;

  activeOrders.forEach(order => {
    if (!order.deadline) return;
    let parsedDate: Date | null = null;
    
    // "YYYY-MM-DD" or "YYYY/MM/DD" or "YYYY年MM月DD日"
    const matchYMD = order.deadline.match(/(\d{4})[-\/年](\d{1,2})[-\/月](\d{1,2})日?/);
    if (matchYMD) {
      parsedDate = new Date(parseInt(matchYMD[1]), parseInt(matchYMD[2]) - 1, parseInt(matchYMD[3]));
    } else {
      // "MM/DD" or "MM月DD日"
      const matchMD = order.deadline.match(/(\d{1,2})[-\/月](\d{1,2})日?/);
      if (matchMD) {
        parsedDate = new Date(now.getFullYear(), parseInt(matchMD[1]) - 1, parseInt(matchMD[2]));
      }
    }

    if (parsedDate && !isNaN(parsedDate.getTime())) {
      const pTime = parsedDate.getTime();
      const tStart = todayStart.getTime();
      if (pTime === tStart) {
        deadlineTodayCount++;
      } else if (pTime < tStart) {
        deadlineOverdueCount++;
      }
    }
  });

  // データベースへのクエリを並列実行
  const [
    thisMonthOrders, // 今月作成された案件
    thisYearCompletedOrders, // 今年納品された案件（売上用）
    recentOrders, // 最新の案件（履歴用）
    recentContacts, // 最新のお問い合わせ
    recentReviews, // 最新のレビュー
    monthlyCompletedOrders // 過去6ヶ月の完了案件（グラフ用）
  ] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: thisMonthStart } } }),
    prisma.order.findMany({ where: { status: "COMPLETED", updatedAt: { gte: thisYearStart } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }), // 進行中・完了問わず最新履歴
    prisma.businessContact.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.review.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.order.findMany({ 
      where: { 
        status: "COMPLETED",
        updatedAt: { gte: sixMonthsAgo } 
      },
      select: { price: true, updatedAt: true }
    })
  ]);

  // 売上の計算
  const thisMonthRevenue = thisYearCompletedOrders
    .filter(o => o.updatedAt >= thisMonthStart)
    .reduce((sum, order) => sum + (order.price || 0), 0);
    
  const thisYearRevenue = thisYearCompletedOrders.reduce((sum, order) => sum + (order.price || 0), 0);
  const completedCount = thisYearCompletedOrders.length;

  // 過去6ヶ月の売上データ生成
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = `${d.getMonth() + 1}月`;
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    
    const revenue = monthlyCompletedOrders
      .filter(o => o.updatedAt >= start && o.updatedAt <= end)
      .reduce((sum, o) => sum + (o.price || 0), 0);
      
    monthlyData.push({ month: monthName, revenue });
  }

  const maxMonthlyRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);

  // アクティビティの生成
  type ActivityItem = {
    id: string;
    type: 'ORDER' | 'CONTACT' | 'REVIEW' | 'COMPLETED';
    title: string;
    description: string;
    date: Date;
    link: string;
  };

  const activities: ActivityItem[] = [
    ...recentOrders.filter(o => o.status !== "COMPLETED").map(o => ({
      id: `order-${o.id}`,
      type: 'ORDER' as const,
      title: 'ご依頼を受信',
      description: `${o.clientName}様から「${o.songTitle || o.serviceType}」のご依頼。`,
      date: o.createdAt,
      link: `/admin/orders/${o.id}`
    })),
    ...thisYearCompletedOrders.filter(o => o.updatedAt >= new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)).map(o => ({
      id: `comp-${o.id}`,
      type: 'COMPLETED' as const,
      title: '納品完了',
      description: `${o.clientName}様の案件「${o.songTitle || o.serviceType}」を納品。`,
      date: o.updatedAt,
      link: `/admin/orders/${o.id}`
    })),
    ...recentContacts.map(c => ({
      id: `contact-${c.id}`,
      type: 'CONTACT' as const,
      title: 'お問い合わせ',
      description: `${c.companyName}様から。`,
      date: c.createdAt,
      link: `/admin/business`
    })),
    ...recentReviews.map(r => ({
      id: `rev-${r.id}`,
      type: 'REVIEW' as const,
      title: 'レビュー投稿',
      description: `${r.name}様からのレビュー。`,
      date: r.createdAt,
      link: `/admin/reviews`
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5); // 最大5件

  // 統一された色のルールバッジ
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "PENDING": return <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] sm:text-xs rounded border border-red-200 font-bold inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" />未対応</span>;
      case "ESTIMATING": return <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 text-[10px] sm:text-xs rounded border border-yellow-200 font-bold inline-flex items-center gap-1"><Clock className="w-3 h-3" />見積中</span>;
      case "WORKING": return <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] sm:text-xs rounded border border-orange-200 font-bold inline-flex items-center gap-1"><Activity className="w-3 h-3" />作業中</span>;
      case "COMPLETED": return <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] sm:text-xs rounded border border-green-200 font-bold inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />納品済</span>;
      default: return <span className="px-2 py-0.5 bg-slate-50 text-slate-600 text-[10px] sm:text-xs rounded border border-slate-200 font-bold">{status}</span>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  return (
    <div className="space-y-6 pb-12 font-sans max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">ダッシュボード</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">次のアクションを決定し、作業を進行しましょう。</p>
      </div>
      
      {/* ========================================================
          1. ファーストビュー：今日やること ＆ 売上サマリー
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ① 今日やること (最重要 / 数字を最大化) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-slate-400" />
              今日対応すべきこと
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
            {/* 未対応 (赤) */}
            <Link href="/admin/orders" className="group flex flex-col items-center justify-center p-4 rounded-xl hover:bg-slate-50 transition-colors">
              <div className={`text-5xl font-black mb-2 transition-colors ${pendingCount > 0 ? 'text-red-600 group-hover:text-red-700' : 'text-slate-300'}`}>
                {pendingCount}
              </div>
              <div className="text-xs font-bold text-slate-500 group-hover:text-slate-700 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${pendingCount > 0 ? 'bg-red-500' : 'bg-slate-300'}`}></span>
                新規未対応
              </div>
            </Link>

            {/* 見積中 (黄) */}
            <Link href="/admin/orders" className="group flex flex-col items-center justify-center p-4 rounded-xl hover:bg-slate-50 transition-colors border-l border-slate-100">
              <div className={`text-5xl font-black mb-2 transition-colors ${estimatingCount > 0 ? 'text-yellow-500 group-hover:text-yellow-600' : 'text-slate-300'}`}>
                {estimatingCount}
              </div>
              <div className="text-xs font-bold text-slate-500 group-hover:text-slate-700 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${estimatingCount > 0 ? 'bg-yellow-400' : 'bg-slate-300'}`}></span>
                見積・連絡待
              </div>
            </Link>

            {/* 期限超過・今日締切 (赤 or グレー) */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border-t sm:border-t-0 sm:border-l border-slate-100">
              <div className={`text-5xl font-black mb-2 ${deadlineOverdueCount > 0 ? 'text-red-600' : deadlineTodayCount > 0 ? 'text-orange-600' : 'text-slate-300'}`}>
                {deadlineOverdueCount > 0 ? deadlineOverdueCount : deadlineTodayCount}
              </div>
              <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                {deadlineOverdueCount > 0 ? (
                  <><AlertTriangle className="w-3 h-3 text-red-500" /> 期限超過</>
                ) : deadlineTodayCount > 0 ? (
                  <><Clock className="w-3 h-3 text-orange-500" /> 今日締切</>
                ) : (
                  <><Check className="w-3 h-3 text-slate-300" /> 期限超過なし</>
                )}
              </div>
            </div>

            {/* 作業中 (オレンジ) */}
            <Link href="/admin/orders" className="group flex flex-col items-center justify-center p-4 rounded-xl hover:bg-slate-50 transition-colors border-l border-t sm:border-t-0 border-slate-100">
              <div className={`text-5xl font-black mb-2 transition-colors ${workingOrders.length > 0 ? 'text-orange-500 group-hover:text-orange-600' : 'text-slate-300'}`}>
                {workingOrders.length}
              </div>
              <div className="text-xs font-bold text-slate-500 group-hover:text-slate-700 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${workingOrders.length > 0 ? 'bg-orange-400' : 'bg-slate-300'}`}></span>
                作業中案件
              </div>
            </Link>
          </div>
        </div>

        {/* ② 売上サマリー (金額マスキング機能付きクライアントコンポーネント) */}
        <RevenueSummaryClient
          thisMonthRevenue={thisMonthRevenue}
          thisYearRevenue={thisYearRevenue}
          thisMonthOrdersCount={thisMonthOrders.length}
          completedCount={completedCount}
          monthlyData={monthlyData}
          maxMonthlyRevenue={maxMonthlyRevenue}
        />
      </div>

      {/* ========================================================
          2. ファーストビュー：作業中案件一覧
      ======================================================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" />
            進行中の案件一覧
          </h2>
          <Link href="/admin/orders" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">
            すべて見る <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {workingOrders.length > 0 ? (
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-1/4">依頼者</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-1/3">案件名</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-1/4">納期</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-1/6">ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workingOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="block">
                        <div className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition-colors truncate">{order.clientName} 様</div>
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-sm text-slate-700 truncate font-medium">{order.songTitle || "曲名未定"}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-xs font-bold text-slate-700 bg-slate-100 inline-block px-2 py-1 rounded">
                        {order.deadline || "指定なし"}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-sm font-medium text-slate-500 bg-slate-50/50">
              現在進行中の案件はありません。
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          3. スクロール後：最近の依頼履歴 ＆ アクティビティ
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* 最近の依頼（履歴） */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              最新のご依頼履歴
            </h2>
            <Link href="/admin/orders" className="text-[10px] font-bold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors">
              一覧へ
            </Link>
          </div>
          <div className="p-0">
            {recentOrders.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <li key={order.id} className="hover:bg-slate-50 transition-colors">
                    <Link href={`/admin/orders/${order.id}`} className="px-5 py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={order.status} />
                          <span className="text-[10px] text-slate-400 font-bold">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="font-bold text-sm text-slate-900 truncate">{order.clientName} 様</div>
                        <div className="text-xs text-slate-500 truncate">{order.songTitle || order.serviceType}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">最近の依頼履歴はありません。</div>
            )}
          </div>
        </div>

        {/* 最近のアクティビティ（コンパクト化） */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-400" />
              アクティビティ
            </h2>
          </div>
          <div className="p-5">
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((item, index) => {
                  let Icon = FileText;
                  let colorClass = "bg-slate-100 text-slate-500";
                  
                  if (item.type === 'ORDER') { Icon = Briefcase; colorClass = "bg-red-100 text-red-600"; }
                  else if (item.type === 'COMPLETED') { Icon = Check; colorClass = "bg-green-100 text-green-600"; }
                  else if (item.type === 'CONTACT') { Icon = MessageSquare; colorClass = "bg-purple-100 text-purple-600"; }
                  else if (item.type === 'REVIEW') { Icon = Star; colorClass = "bg-yellow-100 text-yellow-600"; }

                  return (
                    <div key={item.id} className="flex gap-3 items-start group">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colorClass} mt-0.5`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0 border-b border-slate-50 pb-4 group-last:border-0 group-last:pb-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <p className="text-sm font-bold text-slate-900 truncate pr-2">{item.title}</p>
                          <time className="text-[10px] font-bold text-slate-400 shrink-0">{formatDate(item.date)}</time>
                        </div>
                        <p className="text-xs text-slate-600 truncate mb-1">{item.description}</p>
                        <Link href={item.link} className="text-[10px] font-bold text-orange-500 hover:underline">確認する</Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-xs text-slate-500 py-8">アクティビティはありません。</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
