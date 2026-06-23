import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pendingOrdersCount = await prisma.order.count({
    where: { status: "PENDING" },
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r text-slate-600 flex flex-col shadow-sm z-10">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="font-bold text-xl tracking-tight text-primary">Sien-Official</span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link href="/admin" className="block px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium">ダッシュボード</Link>
          <Link href="/admin/orders" className="flex items-center justify-between px-4 py-2 rounded-lg bg-orange-50 text-orange-600 font-medium">
            <span>依頼管理</span>
            {pendingOrdersCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {pendingOrdersCount}
              </span>
            )}
          </Link>
          <Link href="/admin/posts" className="block px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium">ブログ・記事管理</Link>
          <Link href="/admin/portfolio" className="block px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium">実績管理</Link>
          <Link href="/admin/plans" className="block px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium">料金プラン管理</Link>
          <Link href="/admin/finance" className="block px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium">金額・確定申告</Link>
          <Link href="/admin/settings" className="block px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium">設定</Link>
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-slate-900 hover:bg-slate-100">
            ログアウト
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
          <h2 className="font-semibold text-slate-800">管理ダッシュボード</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
              AIアシスタント待機中
            </span>
            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center font-bold text-white shadow-md">S</div>
          </div>
        </header>
        {/* Content Area */}
        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
