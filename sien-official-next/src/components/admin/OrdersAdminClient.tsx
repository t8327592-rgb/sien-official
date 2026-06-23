'use client';

import { useState } from 'react';

type Order = {
  id: string;
  name: string;
  email: string;
  category: string;
  status: string;
  message: string | null;
  createdAt: Date;
};

export default function OrdersAdminClient({ 
  orders,
  updateStatusAction 
}: { 
  orders: Order[],
  updateStatusAction: (formData: FormData) => Promise<void>
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchQuery = order.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       order.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'mix': return 'MIX依頼';
      case 'original': return 'オリジナル楽曲';
      case 'estimate': return '見積もり相談';
      default: return 'その他';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">ご依頼一覧 ({filteredOrders.length}件)</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="名前・メールで検索..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47A1FF] focus:border-[#47A1FF] outline-none text-sm w-full sm:w-64"
          />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47A1FF] focus:border-[#47A1FF] outline-none text-sm"
          >
            <option value="all">すべてのステータス</option>
            <option value="pending">未対応</option>
            <option value="in_progress">進行中</option>
            <option value="completed">完了</option>
            <option value="cancelled">キャンセル</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
              <th className="p-4 font-semibold">受付日時</th>
              <th className="p-4 font-semibold">依頼者</th>
              <th className="p-4 font-semibold">種類</th>
              <th className="p-4 font-semibold">ステータス</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{order.name}</div>
                    <div className="text-xs text-gray-500">{order.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200">
                      {getTypeLabel(order.category)}
                    </span>
                  </td>
                  <td className="p-4">
                    <form action={updateStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={order.id} />
                      <select 
                        name="status" 
                        defaultValue={order.status}
                        className={`text-xs px-2.5 py-1 rounded-md border font-semibold outline-none focus:ring-2 focus:ring-[#47A1FF] ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">未対応</option>
                        <option value="in_progress">進行中</option>
                        <option value="completed">完了</option>
                        <option value="cancelled">キャンセル</option>
                      </select>
                      <button type="submit" className="text-xs text-gray-500 hover:text-[#0071E3] font-medium bg-white border border-gray-200 rounded px-2 py-1 shadow-sm">
                        更新
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-500">
                  {searchQuery ? '検索条件に一致するご依頼が見つかりませんでした' : '現在ご依頼はありません'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
