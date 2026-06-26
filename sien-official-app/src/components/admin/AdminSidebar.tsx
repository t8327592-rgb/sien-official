"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminSidebar({ pendingOrdersCount }: { pendingOrdersCount: number }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "ダッシュボード" },
    { href: "/admin/orders", label: "依頼管理", count: pendingOrdersCount },
    { href: "/admin/posts", label: "ブログ・記事管理" },
    { href: "/admin/portfolio", label: "実績管理" },
    { href: "/admin/reviews", label: "お客様の声管理" },
    { href: "/admin/plans", label: "料金プラン管理" },
    { href: "/admin/finance", label: "金額・確定申告" },
    { href: "/admin/settings", label: "設定" },
  ];

  return (
    <aside className="w-64 bg-white border-r text-slate-600 flex flex-col shadow-sm z-10">
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/">
          <img src="/logo.png" alt="Sien-Official" className="h-8 w-auto object-contain" />
        </Link>
      </div>
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          // exact match for dashboard, prefix match for others (e.g. /admin/orders/xxx)
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
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-slate-900 hover:bg-slate-100">
          ログアウト
        </Button>
      </div>
    </aside>
  );
}
