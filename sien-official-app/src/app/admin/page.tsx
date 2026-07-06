import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  ArrowRight, FileText, CheckCircle2, AlertCircle, 
  Briefcase, TrendingUp, Clock, Activity, MessageSquare, Star, 
  Calendar, Check
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

  // データベースへのクエリを並列実行
  const [
    thisMonthOrders, // 今月作成された案件
    thisYearCompletedOrders, // 今年納品された案件（売上用）
    workingOrders, // 作業中の案件
    pendingCount, // 未対応
    estimatingCount, // 見積中
    todayCompletedCount, // 今日の納品件数
    recentOrders, // 最新5件の案件
    recentContacts, // 最新のお問い合わせ
    recentReviews, // 最新のレビュー
    monthlyCompletedOrders // 過去6ヶ月の完了案件（グラフ用）
  ] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: thisMonthStart } } }),
    prisma.order.findMany({ where: { status: "COMPLETED", updatedAt: { gte: thisYearStart } } }),
    prisma.order.findMany({ where: { status: "WORKING" }, orderBy: { updatedAt: "desc" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "ESTIMATING" } }),
    prisma.order.count({ 
      where: { 
        status: "COMPLETED", 
        updatedAt: { gte: todayStart, lt: todayEnd } 
      } 
    }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
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
  const averagePrice = completedCount > 0 ? Math.round(thisYearRevenue / completedCount) : 0;

  // 今月の売上見込（作業中・見積中などの総額）※既存の仕様を維持
  const estimatedRevenue = thisMonthOrders.reduce((sum, order) => sum + (order.price || 0), 0);

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

  // 最大売上（グラフのスケール用）
  const maxMonthlyRevenue = Math.max(...monthlyData.map(d => d.revenue), 1); // 0除算防止

  // アクティビティの生成（Order, Contact, Review をマージしてソート）
  type ActivityItem = {
    id: string;
    type: 'ORDER' | 'CONTACT' | 'REVIEW' | 'COMPLETED';
    title: string;
    description: string;
    date: Date;
    link: string;
  };

  const activities: ActivityItem[] = [
    ...recentOrders.map(o => ({
      id: `order-${o.id}`,
      type: 'ORDER' as const,
      title: '新規依頼を受信',
      description: `${o.clientName}様から新しいご依頼がありました。`,
      date: o.createdAt,
      link: `/admin/orders/${o.id}`
    })),
    ...thisYearCompletedOrders.filter(o => o.updatedAt >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).map(o => ({ // 過去7日間の納品
      id: `comp-${o.id}`,
      type: 'COMPLETED' as const,
      title: '案件を納品済みに変更',
      description: `${o.clientName}様の案件を完了しました。`,
      date: o.updatedAt,
      link: `/admin/orders/${o.id}`
    })),
    ...recentContacts.map(c => ({
      id: `contact-${c.id}`,
      type: 'CONTACT' as const,
      title: 'お問い合わせを受信',
      description: `${c.companyName}様からお問い合わせがありました。`,
      date: c.createdAt,
      link: `/admin/business`
    })),
    ...recentReviews.map(r => ({
      id: `rev-${r.id}`,
      type: 'REVIEW' as const,
      title: '新しいレビューが投稿されました',
      description: `${r.name}様からのレビューが追加されました。`,
      date: r.createdAt,
      link: `/admin/reviews`
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);

  // ステータスバッジのコンポーネント
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "PENDING": return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold inline-flex items-center gap-1.5"><AlertCircle className="w-3 h-3" />未対応</span>;
      case "ESTIMATING": return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-bold inline-flex items-center gap-1.5"><Clock className="w-3 h-3" />見積中</span>;
      case "WORKING": return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-bold inline-flex items-center gap-1.5"><Activity className="w-3 h-3" />作業中</span>;
      case "COMPLETED": return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold inline-flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" />納品済</span>;
      default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-bold">{status}</span>;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">ホームダッシュボード</h1>
          <p className="text-slate-500 font-medium">現在の状況とタスクを一目で確認できます。</p>
        </div>
      </div>
      
      {/* 1. 今日やること ＆ サマリー上段 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 左側: 今日やること */}
        <div className="lg:col-span-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-1 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="bg-white/95 backdrop-blur-sm rounded-[22px] p-6 sm:p-8 h-full relative z-10 flex flex-col justify-center">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-orange-600" />
              </span>
              今すぐアクションが必要なタスク
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-red-50/50 border border-red-100 rounded-2xl p-5 text-center flex flex-col items-center justify-center transition-all hover:bg-red-50 hover:shadow-sm">
                <div className="text-sm font-bold text-red-600 mb-1 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />未対応（新規）</div>
                <div className="text-3xl font-black text-slate-900">{pendingCount}<span className="text-sm text-slate-500 ml-1 font-medium">件</span></div>
              </div>
              <div className="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-5 text-center flex flex-col items-center justify-center transition-all hover:bg-yellow-50 hover:shadow-sm">
                <div className="text-sm font-bold text-yellow-600 mb-1 flex items-center gap-1.5"><Clock className="w-4 h-4" />見積中（連絡待）</div>
                <div className="text-3xl font-black text-slate-900">{estimatingCount}<span className="text-sm text-slate-500 ml-1 font-medium">件</span></div>
              </div>
              <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 text-center flex flex-col items-center justify-center transition-all hover:bg-orange-50 hover:shadow-sm">
                <div className="text-sm font-bold text-orange-600 mb-1 flex items-center gap-1.5"><Activity className="w-4 h-4" />作業中（修正等）</div>
                <div className="text-3xl font-black text-orange-600">{workingOrders.length}<span className="text-sm text-orange-400 ml-1 font-medium">件</span></div>
              </div>
            </div>
            {pendingCount === 0 && estimatingCount === 0 ? (
              <p className="text-sm text-slate-500 mt-6 text-center">🎉 現在お急ぎの対応タスクはありません。作業に集中できます！</p>
            ) : (
              <p className="text-sm text-slate-500 mt-6 text-center">お客様をお待たせしないよう、未対応・見積中の案件からご対応ください。</p>
            )}
          </div>
        </div>

        {/* 右側: 概要カード4種（2x2グリッド） */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <h3 className="text-xs font-bold text-slate-500 mb-2 tracking-wider">今月の新規依頼</h3>
            <div className="text-2xl font-black text-slate-900">{thisMonthOrders.length}<span className="text-sm font-medium text-slate-400 ml-1">件</span></div>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <h3 className="text-xs font-bold text-slate-500 mb-2 tracking-wider">作業中の案件</h3>
            <div className="text-2xl font-black text-orange-600">{workingOrders.length}<span className="text-sm font-medium text-orange-400 ml-1">件</span></div>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <h3 className="text-xs font-bold text-slate-500 mb-2 tracking-wider">今月の売上見込</h3>
            <div className="text-xl font-black text-slate-900">¥{estimatedRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <h3 className="text-xs font-bold text-slate-500 mb-2 tracking-wider">今日の納品件数</h3>
            <div className="text-2xl font-black text-green-600">{todayCompletedCount}<span className="text-sm font-medium text-green-400 ml-1">件</span></div>
          </div>
        </div>
      </div>

      {/* 2. 納期が近い（作業中）案件 ＆ 売上サマリー */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* 作業中の案件一覧 (2カラム) */}
        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-slate-600" />
              </span>
              作業中の案件（納期確認）
            </h2>
            <Link href="/admin/orders" className="text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors">
              すべて見る <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="p-0 overflow-x-auto">
            {workingOrders.length > 0 ? (
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">依頼者</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">案件内容</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">希望納期</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ステータス</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {workingOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/admin/orders/${order.id}`} className="block">
                          <div className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{order.clientName} 様</div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-700">{order.songTitle || "曲名未定"}</div>
                        <div className="text-xs text-slate-500 mt-1">{order.serviceType} / {order.planId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-800 bg-slate-100 inline-block px-3 py-1 rounded-md">
                          {order.deadline || "指定なし"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-500">現在、作業中の案件はありません。</div>
            )}
          </div>
        </div>

        {/* 売上サマリー ＆ グラフ (1カラム) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-slate-600" />
              </span>
              売上サマリー（納品ベース）
            </h2>
          </div>
          
          <div className="p-6 space-y-6 flex-grow">
            {/* KPI */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <div className="text-xs font-bold text-slate-500 mb-1">今月売上</div>
                <div className="text-xl font-black text-slate-900">¥{thisMonthRevenue.toLocaleString()}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <div className="text-xs font-bold text-slate-500 mb-1">今年累計売上</div>
                <div className="text-xl font-black text-slate-900">¥{thisYearRevenue.toLocaleString()}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <div className="text-xs font-bold text-slate-500 mb-1">完了案件数(年)</div>
                <div className="text-xl font-black text-slate-900">{completedCount}<span className="text-xs text-slate-400 font-medium ml-1">件</span></div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <div className="text-xs font-bold text-slate-500 mb-1">平均単価</div>
                <div className="text-xl font-black text-slate-900">¥{averagePrice.toLocaleString()}</div>
              </div>
            </div>

            {/* 簡易バーグラフ */}
            <div className="pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-500 mb-6 text-center tracking-wider">過去6ヶ月の売上推移</div>
              <div className="flex items-end justify-between h-32 gap-2 px-2">
                {monthlyData.map((data, index) => {
                  const heightPercent = maxMonthlyRevenue > 0 ? (data.revenue / maxMonthlyRevenue) * 100 : 0;
                  return (
                    <div key={index} className="flex flex-col items-center gap-2 flex-1 group relative">
                      <div className="relative w-full flex justify-center h-full items-end">
                        <div 
                          className="w-full max-w-[32px] bg-gradient-to-t from-orange-400 to-amber-300 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                          style={{ height: `${Math.max(heightPercent, 2)}%` }} // 最低2%は高さを出す
                        ></div>
                        {/* ツールチップ風表示 */}
                        <div className="absolute -top-8 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          ¥{data.revenue.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400">{data.month}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 最近の案件 ＆ 最近のアクティビティ */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* 最近の案件 */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-slate-600" />
              </span>
              最近のご依頼
            </h2>
            <Link href="/admin/orders" className="text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 transition-colors">
              すべて見る <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-0 overflow-x-auto">
            {recentOrders.length > 0 ? (
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">依頼者</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">案件</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">受付日時</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ステータス</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/admin/orders/${order.id}`} className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                          {order.clientName} 様
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{order.songTitle || order.serviceType}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-500">最近の依頼はありません。</div>
            )}
          </div>
        </div>

        {/* 最近のアクティビティ（タイムライン） */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <Activity className="w-4 h-4 text-slate-600" />
              </span>
              最近のアクティビティ
            </h2>
          </div>
          <div className="p-6">
            {activities.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {activities.map((item, index) => {
                  let Icon = FileText;
                  let colorClass = "bg-blue-100 text-blue-600 border-blue-200";
                  
                  if (item.type === 'ORDER') {
                    Icon = Briefcase;
                    colorClass = "bg-orange-100 text-orange-600 border-orange-200";
                  } else if (item.type === 'COMPLETED') {
                    Icon = Check;
                    colorClass = "bg-green-100 text-green-600 border-green-200";
                  } else if (item.type === 'CONTACT') {
                    Icon = MessageSquare;
                    colorClass = "bg-purple-100 text-purple-600 border-purple-200";
                  } else if (item.type === 'REVIEW') {
                    Icon = Star;
                    colorClass = "bg-yellow-100 text-yellow-600 border-yellow-200";
                  }

                  return (
                    <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Icon */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-white ${colorClass} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      {/* Content */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                          <time className="text-[11px] font-bold text-slate-400">{formatDate(item.date)}</time>
                        </div>
                        <div className="text-slate-600 text-sm mb-3">{item.description}</div>
                        <Link href={item.link} className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-200 transition-colors">
                          詳細を見る <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-8">最近のアクティビティはありません。</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
