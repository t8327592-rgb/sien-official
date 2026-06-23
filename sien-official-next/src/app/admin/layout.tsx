import Link from 'next/link';
import { Home, ListOrdered, FolderKanban, BellRing, Settings, LogOut } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white fixed h-full shadow-xl z-20 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold tracking-wider">Sien<span className="text-[#47A1FF]">Official</span></h2>
          <p className="text-xs text-gray-400 mt-1">管理画面 / Admin Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
            <Home size={20} />
            <span className="font-medium">ダッシュボード</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
            <ListOrdered size={20} />
            <span className="font-medium">依頼管理</span>
          </Link>
          <Link href="/admin/works" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
            <FolderKanban size={20} />
            <span className="font-medium">制作実績 (Works)</span>
          </Link>
          <Link href="/admin/news" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
            <BellRing size={20} />
            <span className="font-medium">お知らせ (News)</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors" target="_blank">
            <LogOut size={20} />
            <span className="font-medium text-sm">サイト表示</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
