"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, User, LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 shrink-0">
        <div className="p-6">
          <Link href="/admin" className="text-xl font-black text-gray-800 tracking-tight">
            tonitune<span className="text-orange-500">.Admin</span>
          </Link>
        </div>
        <nav className="px-4 pb-6 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <LayoutDashboard size={18} />
            ダッシュボード
          </Link>
          <Link href="/admin/portfolio" className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <LayoutDashboard size={18} />
            実績管理
          </Link>
          <Link href="/admin/customers" className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <Users size={18} />
            依頼管理
          </Link>
          <Link href="/admin/plans" className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <CreditCard size={18} />
            料金管理
          </Link>
          <Link href="/admin/news" className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <LayoutDashboard size={18} />
            お知らせ管理
          </Link>
          <Link href="/admin/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <User size={18} />
            予約状況・設定
          </Link>
        </nav>
        
        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-100 hidden md:block">
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors">
              <LogOut size={16} />
              ログアウト
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
