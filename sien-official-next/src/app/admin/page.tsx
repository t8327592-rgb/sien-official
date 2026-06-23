import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  
  // Fetch statistics
  const pendingOrders = await prisma.order.count({ where: { status: 'pending' } });
  const totalOrders = await prisma.order.count();
  const totalWorks = await prisma.portfolio.count();
  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">ダッシュボード</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">未対応の依頼</p>
            <h3 className="text-3xl font-bold text-[#0071E3]">{pendingOrders} <span className="text-base text-gray-400 font-normal">件</span></h3>
          </div>
          <div className="w-12 h-12 bg-[#E8F0FE] text-[#47A1FF] rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">総依頼数</p>
            <h3 className="text-3xl font-bold text-gray-900">{totalOrders} <span className="text-base text-gray-400 font-normal">件</span></h3>
          </div>
          <div className="w-12 h-12 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">公開実績数</p>
            <h3 className="text-3xl font-bold text-gray-900">{totalWorks} <span className="text-base text-gray-400 font-normal">件</span></h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">最新の依頼</h3>
          <Link href="/admin/orders" className="text-sm font-medium text-[#0071E3] hover:underline">すべて見る</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4 font-semibold">名前</th>
                <th className="p-4 font-semibold">カテゴリ</th>
                <th className="p-4 font-semibold">日付</th>
                <th className="p-4 font-semibold">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{order.name}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {order.category === 'mix' && 'ボーカルMIX'}
                      {order.category === 'original' && 'オリジナル楽曲'}
                      {order.category === 'other' && 'その他'}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {order.createdAt.toLocaleDateString('ja-JP')}
                    </td>
                    <td className="p-4">
                      {order.status === 'pending' && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">未対応</span>}
                      {order.status === 'contacted' && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">対応中</span>}
                      {order.status === 'completed' && <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">完了</span>}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    現在依頼はありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
