import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

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
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar pendingOrdersCount={pendingOrdersCount} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 bg-white border-b flex items-center justify-between px-4 md:px-8 shadow-sm">
          <h2 className="font-semibold text-slate-800 text-sm md:text-base truncate">管理ダッシュボード</h2>
          <div className="flex items-center gap-4 text-sm whitespace-nowrap">
            <Link href="/" target="_blank" className="flex items-center gap-1 md:gap-2 text-slate-500 hover:text-orange-600 transition-colors font-bold px-2 py-1.5 md:px-3 rounded-lg hover:bg-orange-50 text-xs md:text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-4 md:h-4"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              <span className="hidden sm:inline">公開ページを表示</span>
              <span className="sm:hidden">公開ページ</span>
            </Link>
          </div>
        </header>
        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
