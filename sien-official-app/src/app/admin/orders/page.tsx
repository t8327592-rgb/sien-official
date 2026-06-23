import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">ご依頼管理</h1>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100 font-medium text-slate-600">
          全 {orders.length} 件
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-500">
                <th className="p-4 pl-6 whitespace-nowrap">ステータス</th>
                <th className="p-4 whitespace-nowrap">ご依頼日</th>
                <th className="p-4 whitespace-nowrap">クライアント名</th>
                <th className="p-4 whitespace-nowrap">サービス内容</th>
                <th className="p-4 whitespace-nowrap">金額</th>
                <th className="p-4 pr-6 whitespace-nowrap text-right">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    現在、ご依頼データはありません。<br/>
                    公開ページからテスト依頼を送信してみてください。
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                        order.status === 'WORKING' ? 'bg-orange-100 text-orange-700' :
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {order.status === 'PENDING' ? '未対応' : order.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        {order.clientName}
                        {order.isRepeater && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">リピーター</span>
                        )}
                      </div>
                      <div className="text-xs font-normal text-slate-500 mt-0.5">{order.clientEmail}</div>
                    </td>
                    <td className="p-4 text-slate-700">
                      {order.serviceType === "mix" ? "MIX・マスタリング" : "オリジナル楽曲制作"}
                    </td>
                    <td className="p-4 font-medium text-slate-900">
                      {order.price ? `¥${order.price.toLocaleString()}` : "未見積もり"}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <a href={`/admin/orders/${order.id}`} className="text-orange-600 font-semibold hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                        詳細を見る
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
