"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function AdminSidebar({ pendingOrdersCount }: { pendingOrdersCount: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/admin", label: "ダッシュボード" },
    { href: "/admin/orders", label: "依頼管理", count: pendingOrdersCount },
    { href: "/admin/finance", label: "売上・経費管理" },
    { href: "/admin/business", label: "法人お問い合わせ" },
    { href: "/admin/news", label: "お知らせ管理" },
    { href: "/admin/blog", label: "ブログ管理" },
    { href: "/admin/portfolio", label: "実績管理" },
    { href: "/admin/reviews", label: "お客様の声管理" },
    { href: "/admin/plans", label: "料金プラン管理" },
    { href: "/admin/settings", label: "設定" },
  ];

  return (
    <aside className="w-full md:w-64 bg-white md:border-r border-b md:border-b-0 text-slate-600 flex flex-col md:min-h-screen shadow-sm z-50 flex-shrink-0 relative">
      <div className="h-16 flex items-center justify-between px-6 border-b bg-white relative z-50">
        <Link href="/" onClick={() => setIsOpen(false)}>
          <img src="/logo.png" alt="Sien-Official" className="h-8 w-auto object-contain" />
        </Link>
        {/* スマホ用ハンバーガーボタン */}
        <button 
          className="md:hidden p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      
      {/* PC用ナビゲーション & スマホ用ドロップダウン */}
      <nav className={`${
        isOpen ? 'flex absolute top-16 left-0 right-0 bg-white shadow-lg border-b z-40' : 'hidden'
      } md:flex flex-col flex-1 p-4 gap-2 md:relative md:top-0 md:shadow-none md:border-b-0 md:bg-transparent`}>
        {navItems.map((item) => {
          const isActive = item.href === "/admin" 
            ? pathname === "/admin" 
            : pathname?.startsWith(item.href);

          return (
            <Link 
              key={item.href} 
              href={item.href} 
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between px-4 py-3 md:py-2 rounded-lg font-medium transition-colors ${
                isActive 
                  ? "bg-orange-50 text-orange-600" 
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
        
        {/* スマホ時のみログアウトボタンをメニュー内に表示 */}
        <div className="md:hidden pt-4 mt-2 border-t border-slate-100">
          <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-slate-900 hover:bg-slate-100">
            ログアウト
          </Button>
        </div>
      </nav>

      {/* PC時のみログアウトボタンを最下部に表示 */}
      <div className="hidden md:block p-4 border-t mt-auto">
        <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-slate-900 hover:bg-slate-100">
          ログアウト
        </Button>
      </div>
    </aside>
  );
}
