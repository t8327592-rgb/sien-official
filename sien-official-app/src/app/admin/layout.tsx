import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
          <Link href="/">
            <img src="/logo.png" alt="Sien-Official" className="h-8 w-auto object-contain" />
          </Link>
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
            <Link href="/" target="_blank" className="flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors font-bold px-3 py-1.5 rounded-lg hover:bg-orange-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              公開ページを表示
            </Link>
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
