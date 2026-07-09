"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminSidebar({ pendingOrdersCount }: { pendingOrdersCount: number }) {
  const pathname = usePathname();

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
    <aside className="w-full md:w-64 bg-white md:border-r border-b md:border-b-0 text-slate-600 flex flex-col md:min-h-screen shadow-sm z-10 flex-shrink-0">
      <div className="h-16 flex items-center justify-between px-6 border-b">
        <Link href="/">
          <img src="/logo.png" alt="Sien-Official" className="h-8 w-auto object-contain" />
        </Link>
      </div>
      
      {/* スマホ時は横スクロール、PC時は縦並び */}
      <nav className="flex-1 p-4 flex md:flex-col gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {navItems.map((item) => {
          const isActive = item.href === "/admin" 
            ? pathname === "/admin" 
            : pathname?.startsWith(item.href);

          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center justify-between px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive 
                  ? "bg-orange-50 text-orange-600" 
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ml-2 md:ml-0">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* PC時のみログアウトボタンを表示 */}
      <div className="hidden md:block p-4 border-t mt-auto">
        <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-slate-900 hover:bg-slate-100">
          ログアウト
        </Button>
      </div>
    </aside>
  );
}
