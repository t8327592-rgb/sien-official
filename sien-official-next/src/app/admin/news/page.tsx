import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import NewsAdminClient from '@/components/admin/NewsAdminClient';
import { createNews, updateNews, deleteNews } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminNewsPage() {
  const newsList = await prisma.news.findMany({
    orderBy: { date: 'desc' }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">お知らせ管理 (News)</h1>
        <Link href="/admin" className="text-[#0071E3] hover:text-[#003B75] transition-colors">
          &larr; ダッシュボードへ戻る
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 新規追加フォーム */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">新規お知らせ追加</h2>
          <form action={createNews} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
              <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-[#47A1FF] focus:border-[#47A1FF] transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
              <input type="text" name="title" required className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-[#47A1FF] focus:border-[#47A1FF] transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
              <textarea name="content" rows={5} required className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-[#47A1FF] focus:border-[#47A1FF] transition-all"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL用)</label>
              <input type="text" name="slug" required placeholder="例: new-release-2026" className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-[#47A1FF] focus:border-[#47A1FF] transition-all" />
            </div>
            <div className="flex items-center">
              <input type="hidden" name="isVisible" value="false" />
              <input type="checkbox" name="isVisible" value="true" defaultChecked className="w-4 h-4 text-[#0071E3] border-gray-300 rounded focus:ring-[#47A1FF]" />
              <label className="ml-2 text-sm text-gray-700">公開する</label>
            </div>
            <button type="submit" className="w-full bg-[#0071E3] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#0060C0] transition-colors shadow-sm">
              追加
            </button>
          </form>
        </div>

        {/* お知らせ一覧 */}
        <div className="lg:col-span-2">
          <NewsAdminClient newsList={newsList} updateAction={updateNews} deleteAction={deleteNews} />
        </div>
      </div>
    </div>
  );
}
